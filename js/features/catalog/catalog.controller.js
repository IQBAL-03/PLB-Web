/**
 * @file Catalog controller managing filter interactions, search, and catalog render updates.
 */

import { $, $$ } from '../../utils/dom.js';
import { state } from '../../core/state.js';
import { eventBus } from '../../core/events.js';
import { catalogView } from './catalog.view.js';

export const catalogController = {
  init() {
    this.render();
    this.bindEvents();

    eventBus.on('catalog:filter-changed', () => this.updateCatalogGrid());
    eventBus.on('book:borrowed', () => this.render());
  },

  render() {
    const categoryChipsContainer = $('#categoryChips');
    if (categoryChipsContainer) {
      catalogView.renderCategoryPills(state.categories, state.activeCategory, categoryChipsContainer);
    }

    const popularGrid = $('#popularBooksGrid');
    if (popularGrid) {
      const popularBooks = state.books.filter((b) => b.isPopular);
      catalogView.renderGrid(popularGrid, popularBooks, (id) => state.isBookBorrowed(id));
    }

    this.updateCatalogGrid();

    const comingSoonGrid = $('#comingSoonGrid');
    if (comingSoonGrid) {
      const comingSoonBooks = state.books.filter((b) => b.isComingSoon);
      catalogView.renderGrid(comingSoonGrid, comingSoonBooks, (id) => state.isBookBorrowed(id));
    }
  },

  updateCatalogGrid() {
    const catalogGrid = $('#catalogBooksGrid');
    if (catalogGrid) {
      const filtered = state.getFilteredBooks();
      catalogView.renderGrid(catalogGrid, filtered, (id) => state.isBookBorrowed(id));
    }

    const categoryChipsContainer = $('#categoryChips');
    if (categoryChipsContainer) {
      catalogView.renderCategoryPills(state.categories, state.activeCategory, categoryChipsContainer);
    }

    const activeLabel = $('#activeFilterLabel');
    if (activeLabel) {
      const count = state.getFilteredBooks().length;
      activeLabel.textContent = `${state.activeCategory} (${count} buku)`;
    }
  },

  bindEvents() {
    const categoryChipsContainer = $('#categoryChips');
    if (categoryChipsContainer) {
      categoryChipsContainer.addEventListener('click', (e) => {
        const btn = e.target.closest('button[data-category]');
        if (btn) {
          state.setCategory(btn.dataset.category);
        }
      });
    }

    const heroSearchInput = $('#heroSearchInput');
    const heroSearchBtn = $('#heroSearchBtn');
    const runSearch = () => {
      const val = heroSearchInput ? heroSearchInput.value : '';
      state.setSearchQuery(val);
      const target = $('#katalog');
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
      }
    };

    if (heroSearchBtn) heroSearchBtn.addEventListener('click', runSearch);
    if (heroSearchInput) {
      heroSearchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') runSearch();
      });
    }

    // Hero quick filter buttons
    $$('[data-hero-filter]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const cat = btn.dataset.heroFilter;
        state.setCategory(cat);
        const target = $('#katalog');
        if (target) target.scrollIntoView({ behavior: 'smooth' });
      });
    });

    // Delegate book clicks to open modal
    document.addEventListener('click', (e) => {
      const targetBtn = e.target.closest('[data-action="open-detail"]');
      if (targetBtn) {
        const bookId = targetBtn.dataset.bookId;
        if (bookId) state.setSelectedBook(bookId);
      }
    });
  },
};
