/**
 * @file Unified administrative state manager with CRUD operations and persistence.
 */

import { books as catalogBooks } from '../data/library-data.js';
import { initialTransactions, initialMembers, BOOK_PRICES } from './admin-data.js';

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
        const hasLegacy = parsed.some((b) => b.coverImg && b.coverImg.includes('cover-sementara'));
        if (hasLegacy || parsed.length > 3) {
          localStorage.removeItem(this.storagePrefix + key);
          return JSON.parse(JSON.stringify(fallback));
        }
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

  // --- Transactions ---
  getTransactions(filter = 'Semua', query = '') {
    const q = query.toLowerCase().trim();
    return this.transactions.filter((t) => {
      const matchFilter = filter === 'Semua' || t.status === filter;
      const matchQuery =
        !q ||
        t.studentName.toLowerCase().includes(q) ||
        t.nis.toLowerCase().includes(q) ||
        t.bookTitle.toLowerCase().includes(q) ||
        t.id.toLowerCase().includes(q);
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

  // --- Members CRUD ---
  getMembers(query = '') {
    const q = query.toLowerCase().trim();
    return this.members.filter((m) => {
      return !q || m.name.toLowerCase().includes(q) || m.nis.toLowerCase().includes(q) || m.classRoom.toLowerCase().includes(q);
    });
  }

  addMember(member) {
    this.members.unshift(member);
    this.save('members', this.members);
  }

  updateMember(nis, updated) {
    const idx = this.members.findIndex((m) => m.nis === nis);
    if (idx !== -1) {
      this.members[idx] = { ...this.members[idx], ...updated };
      this.save('members', this.members);
      return this.members[idx];
    }
    return null;
  }

  deleteMember(nis) {
    this.members = this.members.filter((m) => m.nis !== nis);
    this.save('members', this.members);
  }

  // --- Books CRUD ---
  getBooks(query = '', category = 'Semua') {
    const q = query.toLowerCase().trim();
    return this.books.filter((b) => {
      const matchCat = category === 'Semua' || b.category === category;
      const matchQuery =
        !q ||
        b.title.toLowerCase().includes(q) ||
        b.author.toLowerCase().includes(q) ||
        b.shelf.toLowerCase().includes(q) ||
        b.id.toLowerCase().includes(q);
      return matchCat && matchQuery;
    });
  }

  async syncBooksFromAPI() {
    try {
      const res = await fetch('/api/books');
      if (res.ok) {
        const data = await res.json();
        if (data && data.ok && Array.isArray(data.books) && data.books.length > 0) {
          this.books = data.books;
          this.save('books', this.books);
          return true;
        }
      }
    } catch {
      // Offline fallback
    }
    return false;
  }

  async addBook(book) {
    this.books.unshift(book);
    this.save('books', this.books);
    try {
      await fetch('/api/books', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(book),
      });
    } catch {
      // Keep local state
    }
  }

  async updateBook(id, updated) {
    const idx = this.books.findIndex((b) => b.id === id);
    if (idx !== -1) {
      this.books[idx] = { ...this.books[idx], ...updated };
      this.save('books', this.books);
      try {
        await fetch(`/api/books/update?id=${encodeURIComponent(id)}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(this.books[idx]),
        });
      } catch {
        // Keep local state
      }
      return this.books[idx];
    }
    return null;
  }

  async deleteBook(id) {
    this.books = this.books.filter((b) => b.id !== id);
    this.save('books', this.books);
    try {
      await fetch(`/api/books/delete?id=${encodeURIComponent(id)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
    } catch {
      // Keep local state
    }
  }

  // --- Reports by Date Range ---
  getReportData(startDate, endDate) {
    const start = startDate ? new Date(startDate) : new Date('2020-01-01');
    const end = endDate ? new Date(endDate + 'T23:59:59') : new Date('2030-12-31');

    const filtered = this.transactions.filter((t) => {
      const loan = new Date(t.loanDate);
      return loan >= start && loan <= end;
    });

    const enrichedTransactions = filtered.map((t) => ({
      ...t,
      price: t.price || BOOK_PRICES[t.bookId] || 85000,
    }));

    const activeCount = enrichedTransactions.filter((t) => t.status === 'Dipinjam' || t.status === 'Terlambat').length;
    const returnedCount = enrichedTransactions.filter((t) => t.status === 'Kembali').length;
    const totalFines = enrichedTransactions.reduce((acc, t) => acc + (t.fine || 0), 0);
    const unpaidFines = enrichedTransactions.filter((t) => !t.finePaid).reduce((acc, t) => acc + (t.fine || 0), 0);
    const totalBookValue = enrichedTransactions.reduce((acc, t) => acc + (t.price || 0), 0);

    return {
      startDate,
      endDate,
      transactions: enrichedTransactions,
      totalCount: enrichedTransactions.length,
      activeCount,
      returnedCount,
      totalFines,
      unpaidFines,
      totalBookValue,
    };
  }

  // --- Overall Dashboard KPIs ---
  getMetrics() {
    const totalStock = this.books.reduce((acc, b) => acc + (Number(b.stock) || 0), 0);
    const activeLoans = this.transactions.filter((t) => t.status === 'Dipinjam' || t.status === 'Terlambat').length;
    const completedLoans = this.transactions.filter((t) => t.status === 'Kembali').length;
    const unpaidList = this.transactions.filter((t) => !t.finePaid && t.fine > 0);
    const unpaidAmount = unpaidList.reduce((acc, t) => acc + t.fine, 0);

    return {
      totalBookStock: totalStock,
      totalBookTitles: this.books.length,
      activeLoansCount: activeLoans,
      completedLoansCount: completedLoans,
      unpaidFinesAmount: unpaidAmount,
      unpaidFinesCount: unpaidList.length,
    };
  }
}

export const adminState = new AdminStateManager();
