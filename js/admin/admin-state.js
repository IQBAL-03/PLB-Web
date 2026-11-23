/**
 * @file Unified administrative state manager with CRUD operations and persistence.
 */

import { books as catalogBooks } from '../data/library-data.js';
import { initialTransactions, initialMembers } from './admin-data.js';
import { adminAnalytics } from './admin-analytics.js';

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
        const hasOldChapters = parsed.some((b) => b.id === 'M003' && b.volumes && b.volumes.some((v) => v.volumeTitle && v.volumeTitle.includes('72-84')));
        const hasLegacyRatings = parsed.some((b) => (b.rating === 4.9 || b.rating === 5) && (!b.reviews_count && !b.reviewsCount));
        if (hasLegacy || hasOldChapters || hasLegacyRatings) {
          localStorage.removeItem(this.storagePrefix + key);
          return JSON.parse(JSON.stringify(fallback));
        }
        return parsed.map((b) => ({ ...b, reviewsCount: b.reviews_count || b.reviewsCount || 0 }));
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
    return this.transactions.filter((t) => {
      const matchFilter = filter === 'Semua' || t.status === filter;
      const matchQuery = !q || t.studentName.toLowerCase().includes(q) || t.nis.toLowerCase().includes(q) || t.bookTitle.toLowerCase().includes(q) || t.id.toLowerCase().includes(q);
      return matchFilter && matchQuery;
    });
  }

  addTransaction(tx) {
    this.transactions.unshift(tx);
    this.save('transactions', this.transactions);
  }

  returnTransaction(id) {
    const tx = this.transactions.find((t) => t.id === id);
    if (tx) {
      tx.status = 'Kembali';
      tx.returnDate = new Date().toISOString().split('T')[0];
      this.save('transactions', this.transactions);
      fetch(`/api/transactions/return?id=${encodeURIComponent(id)}`, { method: 'POST' }).catch(() => {});
    }
    return tx;
  }

  payFine(id) {
    const tx = this.transactions.find((t) => t.id === id);
    if (tx) {
      tx.finePaid = true;
      this.save('transactions', this.transactions);
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
    try {
      const res = await fetch(`/api/members?t=${Date.now()}`, { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        if (data && data.ok && Array.isArray(data.members) && data.members.length > 0) {
          this.members = data.members.map((m) => ({
            nis: m.nis,
            name: m.name,
            classRoom: m.class_room || m.classRoom,
            activeLoans: m.active_loans ?? m.activeLoans ?? 0,
            status: m.status,
          }));
          this.save('members', this.members);
          return true;
        }
      }
    } catch {
      // Offline fallback
    }
    return false;
  }

  async syncTransactionsFromAPI() {
    try {
      const res = await fetch(`/api/transactions?t=${Date.now()}`, { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        if (data && data.ok && Array.isArray(data.transactions)) {
          this.transactions = data.transactions.map((t) => ({
            id: t.id,
            studentName: t.student_name || t.studentName,
            nis: t.nis,
            bookId: t.book_id || t.bookId,
            bookTitle: t.book_title || t.bookTitle,
            loanDate: t.loan_date || t.loanDate,
            dueDate: t.due_date || t.dueDate,
            returnDate: t.return_date || t.returnDate,
            status: t.status,
            fine: t.fine || 0,
            finePaid: t.fine_paid ?? t.finePaid ?? true,
          }));
          this.save('transactions', this.transactions);
          return true;
        }
      }
    } catch {
      // Offline fallback
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
    try {
      const res = await fetch(`/api/books?t=${Date.now()}`, { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        if (data && data.ok && Array.isArray(data.books) && data.books.length > 0) {
          const hasChanged = JSON.stringify(this.books) !== JSON.stringify(data.books);
          if (hasChanged || this.books.length === 0) {
            this.books = data.books;
            this.save('books', this.books);
            return true;
          }
        }
      }
    } catch {
      // Offline fallback
    }
    return false;
  }

  async addBook(book) {
    try {
      const res = await fetch('/api/books', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(book),
      });
      if (res.ok) {
        await this.syncBooksFromAPI();
        return;
      }
    } catch {
      // Keep local state
    }
    this.books.unshift(book);
    this.save('books', this.books);
  }

  async updateBook(id, updated) {
    try {
      const res = await fetch(`/api/books/update?id=${encodeURIComponent(id)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      });
      if (res.ok) {
        await this.syncBooksFromAPI();
        return this.books.find((b) => b.id === id);
      }
    } catch {
      // Keep local state
    }
    const idx = this.books.findIndex((b) => b.id === id);
    if (idx !== -1) {
      this.books[idx] = { ...this.books[idx], ...updated };
      this.save('books', this.books);
      return this.books[idx];
    }
    return null;
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
