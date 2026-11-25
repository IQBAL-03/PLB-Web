/**
 * @file Unified administrative state manager with CRUD operations and persistence.
 */

import { books as catalogBooks } from '../data/library-data.js';
import { initialTransactions, initialMembers } from './admin-data.js';
import { adminAnalytics } from './admin-analytics.js';
import { adminSyncService } from './admin-sync.service.js';

class AdminStateManager {
  constructor() {
    this.storagePrefix = 'sisperpus_admin_';
    this.transactions = this.load('transactions', initialTransactions);
    this.members = this.load('members', initialMembers);
    this.books = this.load('books', catalogBooks);
  }

  load(key, fallback) {
    try {
      const saved = localStorage.getItem(this.storagePrefix + key);
      if (!saved) return JSON.parse(JSON.stringify(fallback));
      const parsed = JSON.parse(saved);
      if (key === 'books' && Array.isArray(parsed)) {
        const hasLegacy = parsed.some((b) => b.coverImg && (b.coverImg.includes('cover-sementara') || b.coverImg.includes('eajdrhns4jrkwea8nksv')));
        const hasLegacyRatings = parsed.some((b) => (b.rating === 4.9 || b.rating === 5) && (!b.reviews_count && !b.reviewsCount));
        if (hasLegacy || hasLegacyRatings) {
          localStorage.removeItem(this.storagePrefix + key);
          return JSON.parse(JSON.stringify(fallback));
        }
        const seen = new Set();
        return parsed
          .filter((b) => {
            if (!b || !b.id) return false;
            const k = String(b.id).toLowerCase();
            if (seen.has(k)) return false;
            seen.add(k);
            return true;
          })
          .map((b) => ({ ...b, reviewsCount: b.reviews_count || b.reviewsCount || 0 }));
      }
      if (key === 'members' && Array.isArray(parsed) && parsed.length === 0 && fallback.length > 0) {
        return JSON.parse(JSON.stringify(fallback));
      }
      return parsed;
    } catch {
      return JSON.parse(JSON.stringify(fallback));
    }
  }

  save(key, data) {
    try {
      localStorage.setItem(this.storagePrefix + key, JSON.stringify(data));
    } catch {
      // Storage quota or private browsing fallback
    }
  }

  // Transactions
  getTransactions(filter = 'Semua', query = '') {
    const q = query.toLowerCase().trim();
    const todayStr = new Date().toISOString().split('T')[0];
    return this.transactions.filter((t) => {
      const isOverdue = t.status === 'Terlambat' || (t.status === 'Dipinjam' && t.dueDate && String(t.dueDate).slice(0, 10) < todayStr);
      const matchFilter = filter === 'Semua' || (filter === 'Terlambat' ? isOverdue : t.status === filter);
      const matchQuery = !q || t.studentName.toLowerCase().includes(q) || t.nis.toLowerCase().includes(q) || t.bookTitle.toLowerCase().includes(q) || t.id.toLowerCase().includes(q);
      return matchFilter && matchQuery;
    });
  }

  addTransaction(tx) {
    this.transactions.unshift(tx);
    this.save('transactions', this.transactions);
  }

  async returnTransaction(id, condition = 'normal', customFine = 0) {
    const tx = this.transactions.find((t) => t.id === id);
    if (tx) {
      tx.status = 'Kembali';
      tx.returnDate = new Date().toISOString().split('T')[0];
      tx.fine = Number(customFine) || 0;
      tx.finePaid = tx.fine <= 0;
      this.save('transactions', this.transactions);
      try {
        const res = await fetch('/api/transactions/return', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id, condition, fine: tx.fine }),
        });
        if (res.ok) {
          const data = await res.json();
          if (typeof data.fine === 'number') {
            tx.fine = data.fine;
            tx.finePaid = data.fine <= 0;
            this.save('transactions', this.transactions);
          }
        }
      } catch {
        // Offline fallback
      }
    }
    return tx;
  }

  payFine(id) {
    const tx = this.transactions.find((t) => t.id === id);
    if (tx) {
      tx.finePaid = true;
      this.save('transactions', this.transactions);
      fetch(`/api/transactions/pay-fine?id=${encodeURIComponent(id)}`, { method: 'POST' }).catch(() => {});
    }
    return tx;
  }

  // Members
  getMembers(query = '') {
    const q = query.toLowerCase().trim();
    return this.members.filter((m) => {
      return !q || m.name.toLowerCase().includes(q) || m.nis.toLowerCase().includes(q) || m.classRoom.toLowerCase().includes(q);
    });
  }

  async syncMembersFromAPI() {
    const members = await adminSyncService.fetchMembers();
    if (members) {
      this.members = members;
      this.save('members', this.members);
      return true;
    }
    return false;
  }

  async syncTransactionsFromAPI() {
    const txs = await adminSyncService.fetchTransactions();
    if (txs) {
      this.transactions = txs;
      this.save('transactions', this.transactions);
      return true;
    }
    return false;
  }

  addMember(member) {
    this.members.unshift(member);
    this.save('members', this.members);
    fetch('/api/members', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nis: member.nis, name: member.name, class_room: member.classRoom, status: member.status || 'Aktif' }),
    }).catch(() => {});
  }

  updateMember(nis, updated) {
    const idx = this.members.findIndex((m) => m.nis === nis);
    if (idx !== -1) {
      this.members[idx] = { ...this.members[idx], ...updated };
      this.save('members', this.members);
      if (updated.status) {
        fetch('/api/members/status', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ nis, status: updated.status }),
        }).catch(() => {});
      }
      return this.members[idx];
    }
    return null;
  }

  deleteMember(nis) {
    this.members = this.members.filter((m) => m.nis !== nis);
    this.save('members', this.members);
    fetch(`/api/members/delete?nis=${encodeURIComponent(nis)}`, { method: 'POST' }).catch(() => {});
  }

  // Books
  getBooks(query = '', category = 'Semua') {
    const q = query.toLowerCase().trim();
    return this.books.filter((b) => {
      const matchCat = category === 'Semua' || b.category === category;
      const matchQuery = !q || b.title.toLowerCase().includes(q) || b.author.toLowerCase().includes(q) || b.shelf.toLowerCase().includes(q) || b.id.toLowerCase().includes(q);
      return matchCat && matchQuery;
    });
  }

  async syncBooksFromAPI() {
    const books = await adminSyncService.fetchBooks();
    if (books && (JSON.stringify(this.books) !== JSON.stringify(books) || this.books.length === 0)) {
      this.books = books;
      this.save('books', this.books);
      return true;
    }
    return false;
  }

  async addBook(book) {
    if (this.books.some((b) => String(b.id).toLowerCase() === String(book.id).toLowerCase())) {
      throw new Error(`ID buku "${book.id}" sudah digunakan. Silakan gunakan ID lain.`);
    }
    const res = await fetch('/api/books', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(book),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.error || data.message || `Gagal menambahkan buku (HTTP ${res.status}).`);
    }
    await this.syncBooksFromAPI();
  }

  async updateBook(id, updated) {
    const res = await fetch(`/api/books/update?id=${encodeURIComponent(id)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updated),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.error || data.message || `Gagal memperbarui buku (HTTP ${res.status}).`);
    }
    await this.syncBooksFromAPI();
    return this.books.find((b) => b.id === id);
  }

  async deleteBook(id) {
    try {
      const res = await fetch(`/api/books/delete?id=${encodeURIComponent(id)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      if (res.ok) {
        await this.syncBooksFromAPI();
        return;
      }
    } catch {
      // Keep local state
    }
    this.books = this.books.filter((b) => b.id !== id);
    this.save('books', this.books);
  }

  // Reports and dashboard analytics
  getReportData(startDate, endDate) {
    return adminAnalytics.getReportData(this.transactions, startDate, endDate);
  }

  getMetrics() {
    return adminAnalytics.getMetrics(this.books, this.transactions);
  }
}

export const adminState = new AdminStateManager();
