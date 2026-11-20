/**
 * @file Reactive application state for SISPERPUS.
 */

import { books, categories } from '../data/library-data.js';
import { eventBus } from './events.js';

class State {
  constructor() {
    this.books = [...books];
    this.categories = [...categories];
    this.activeCategory = 'Semua Koleksi';
    this.searchQuery = '';
    this.selectedBook = null;
    this.borrowedBookIds = new Set(JSON.parse(localStorage.getItem('sisperpus_borrowed') || '[]'));
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
