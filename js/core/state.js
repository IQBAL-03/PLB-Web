/**
 * @file Reactive application state for SISPERPUS.
 */

import { books, categories } from '../data/library-data.js';
import { eventBus } from './events.js';
import { CANONICAL_COVERS } from '../utils/image-fallback.js';

class State {
  constructor() {
    let initialBooks = [];
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

    this.books = initialBooks.map((b) => {
      let cover = b.coverImg;
      const canonical = CANONICAL_COVERS[b.id];
      if (canonical && (!cover || cover.includes('eajdrhns4jrkwea8nksv'))) {
        cover = canonical;
      }
      return {
        ...b,
        coverImg: cover,
        reviewsCount: b.reviews_count || b.reviewsCount || 0,
        reviews_count: b.reviews_count || b.reviewsCount || 0,
      };
    });

    this.isLoading = true;
    this.isSyncing = false;
    this.categories = [...categories];
    this.activeCategory = 'Semua Koleksi';
    this.searchQuery = '';
    this.selectedBook = null;
    this.borrowedBookIds = new Set(JSON.parse(localStorage.getItem('sisperpus_borrowed') || '[]'));
    this.initialSyncPromise = this.syncBooks();
    this.setupAutoSync();
  }

  setupAutoSync() {
    let lastVersion = null;

    const checkUpdates = async (seedOnly = false) => {
      try {
        let versionHash = null;

        try {
          const resVer = await fetch(`/api/sync/version?t=${Date.now()}`, { cache: 'no-store' });
          if (resVer.ok) {
            const dataVer = await resVer.json();
            if (dataVer && dataVer.ok && dataVer.hash) {
              versionHash = dataVer.hash;
            }
          }
        } catch {
          // Version endpoint fallback
        }

        if (versionHash) {
          if (seedOnly && lastVersion === null) {
            lastVersion = versionHash;
            return;
          }
          if (lastVersion === null || lastVersion !== versionHash) {
            lastVersion = versionHash;
            await this.syncBooks();
          }
          return;
        }

        const resBooks = await fetch(`/api/books?t=${Date.now()}`, { cache: 'no-store' });
        if (resBooks.ok) {
          const data = await resBooks.json();
          if (data && data.ok && Array.isArray(data.books)) {
            const fallbackHash = data.books.map((b) => `${b.id}:${b.updatedAt || ''}:${b.stock}:${b.rating || 0}:${b.reviews_count || 0}`).join('|');
            if (seedOnly && lastVersion === null) {
              lastVersion = fallbackHash;
              return;
            }
            if (lastVersion === null || lastVersion !== fallbackHash) {
              lastVersion = fallbackHash;
              await this.syncBooks();
            }
          }
        }
      } catch {
        // Network fallback
      }
    };

    this.initialSyncPromise.finally(() => checkUpdates(true));

    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
          checkUpdates(false);
        }
      });
    }
    if (typeof window !== 'undefined') {
      window.addEventListener('focus', () => checkUpdates(false));
    }

    setInterval(() => {
      if (typeof document === 'undefined' || document.visibilityState === 'visible') {
        checkUpdates(false);
      }
    }, 3000);
  }

  async syncBooks() {
    if (this.isSyncing) return;
    this.isSyncing = true;
    const wasLoading = this.isLoading;
    const startTime = Date.now();
    try {
      const res = await fetch(`/api/books?t=${Date.now()}`, { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        if (data && data.ok && Array.isArray(data.books) && data.books.length > 0) {
          const newBooks = data.books.map((b) => {
            let cover = b.coverImg;
            const canonical = CANONICAL_COVERS[b.id];
            if (canonical && (!cover || cover.includes('eajdrhns4jrkwea8nksv'))) {
              cover = canonical;
            }
            return {
              ...b,
              coverImg: cover,
              reviewsCount: b.reviews_count || b.reviewsCount || 0,
              reviews_count: b.reviews_count || b.reviewsCount || 0,
            };
          });

          if (wasLoading) {
            const elapsed = Date.now() - startTime;
            if (elapsed < 350) {
              await new Promise((resolve) => setTimeout(resolve, 350 - elapsed));
            }
          }

          const hasChanged = JSON.stringify(this.books) !== JSON.stringify(newBooks);
          this.books = newBooks;
          this.isLoading = false;
          try {
            localStorage.setItem('sisperpus_admin_books', JSON.stringify(this.books));
          } catch {
            // Storage quota fallback
          }

          if (wasLoading || hasChanged) {
            eventBus.emit('catalog:filter-changed', {
              category: this.activeCategory,
              query: this.searchQuery,
            });
            eventBus.emit('books:synced', this.books);
          }
          return;
        }
      }
    } catch {
      // Offline fallback
    } finally {
      this.isSyncing = false;
    }

    if (this.books.length === 0) {
      this.books = [...books];
    }
    this.isLoading = false;
    eventBus.emit('catalog:filter-changed', {
      category: this.activeCategory,
      query: this.searchQuery,
    });
    eventBus.emit('books:synced', this.books);
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
