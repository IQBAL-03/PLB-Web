/**
 * @file Reactive application state for SISPERPUS.
 */

import { books, categories } from '../data/library-data.js';
import { eventBus } from './events.js';

class State {
  constructor() {
    // Purge any stale local drafts that contain outdated volume chapters
    try {
      const saved = localStorage.getItem('sisperpus_admin_books');
      if (saved && saved.includes('72-84')) {
        localStorage.removeItem('sisperpus_admin_books');
      }
    } catch {
      // Storage access fallback
    }

    let initialBooks = [...books];
    try {
      const saved = localStorage.getItem('sisperpus_admin_books');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          initialBooks = parsed;
        }
      }
    } catch {
      // Storage access fallback
    }

    this.books = initialBooks.map((b) => ({
      ...b,
      reviewsCount: 0,
      reviews_count: 0,
    }));
    this.categories = [...categories];
    this.activeCategory = 'Semua Koleksi';
    this.searchQuery = '';
    this.selectedBook = null;
    this.borrowedBookIds = new Set(JSON.parse(localStorage.getItem('sisperpus_borrowed') || '[]'));
    this.syncBooks();
    this.setupAutoSync();
  }

  setupAutoSync() {
    let lastVersion = null;

    const checkGolangVersion = async () => {
      try {
        const res = await fetch(`/api/sync/version?t=${Date.now()}`, { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          if (data && data.ok && data.hash) {
            if (lastVersion !== null && lastVersion !== data.hash) {
              lastVersion = data.hash;
              const hasActiveModal = document.querySelector('#borrowModalDialog:not(.hidden), #bookModalDialog:not(.hidden)');
              if (!hasActiveModal) {
                window.location.reload();
                return;
              }
              await this.syncBooks();
              return;
            }
            lastVersion = data.hash;
          }
        }
      } catch {
        // Fallback to direct book sync
      }
    };

    checkGolangVersion();

    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
          checkGolangVersion();
        }
      });
    }
    if (typeof window !== 'undefined') {
      window.addEventListener('focus', () => checkGolangVersion());
    }

    // High-frequency Golang version check every 4 seconds
    setInterval(() => {
      if (typeof document === 'undefined' || document.visibilityState === 'visible') {
        checkGolangVersion();
      }
    }, 4000);
  }

  async syncBooks() {
    try {
      const res = await fetch(`/api/books?t=${Date.now()}`, { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        if (data && data.ok && Array.isArray(data.books) && data.books.length > 0) {
          const newBooks = data.books.map((b) => ({
            ...b,
            reviewsCount: 0,
            reviews_count: 0,
          }));

          const hasChanged = JSON.stringify(this.books) !== JSON.stringify(newBooks);
          if (hasChanged || this.books.length === 0) {
            this.books = newBooks;
            try {
              localStorage.setItem('sisperpus_admin_books', JSON.stringify(this.books));
            } catch {
              // Storage quota fallback
            }
            eventBus.emit('catalog:filter-changed', {
              category: this.activeCategory,
              query: this.searchQuery,
            });
            eventBus.emit('books:synced', this.books);
          }
        }
      }
    } catch {
      // Offline fallback
    }
  }

  setCategory(category) {
    if (this.activeCategory === category) return;
    this.activeCategory = category;
    eventBus.emit('catalog:filter-changed', {
      category: this.activeCategory,
      query: this.searchQuery,
    });
  }

  setSearchQuery(query) {
    this.searchQuery = (query || '').trim().toLowerCase();
    eventBus.emit('catalog:filter-changed', {
      category: this.activeCategory,
      query: this.searchQuery,
    });
  }

  setSelectedBook(bookId) {
    this.selectedBook = this.books.find((b) => b.id === bookId) || null;
    eventBus.emit('modal:book-selected', this.selectedBook);
  }

  borrowBook(bookId) {
    this.borrowedBookIds.add(bookId);
    localStorage.setItem('sisperpus_borrowed', JSON.stringify([...this.borrowedBookIds]));
    eventBus.emit('book:borrowed', { bookId });
  }

  isBookBorrowed(bookId) {
    return this.borrowedBookIds.has(bookId);
  }

  getFilteredBooks() {
    return this.books.filter((book) => {
      const matchCategory =
        this.activeCategory === 'Semua Koleksi' || book.category === this.activeCategory;
      const matchQuery =
        !this.searchQuery ||
        book.title.toLowerCase().includes(this.searchQuery) ||
        book.author.toLowerCase().includes(this.searchQuery) ||
        book.category.toLowerCase().includes(this.searchQuery);
      return matchCategory && matchQuery;
    });
  }
}

export const state = new State();
