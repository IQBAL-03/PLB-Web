/**
 * @file Catalog controller managing filter interactions, search, and catalog render updates.
 */

import { $, $$ } from '../../utils/dom.js';
import { state } from '../../core/state.js';
import { eventBus } from '../../core/events.js';
import { catalogView } from './catalog.view.js';
import { imagePreviewModal } from '../modal/image-preview.modal.js';

export const catalogController = {
  init() {
    this.render();
    this.bindEvents();

    eventBus.on('catalog:filter-changed', () => this.updateCatalogGrid());
    eventBus.on('book:borrowed', () => this.render());
    eventBus.on('books:synced', () => this.render());
  },

  render() {
    const categoryChipsContainer = $('#categoryChips');
    if (categoryChipsContainer) {
      catalogView.renderCategoryPills(state.categories, state.activeCategory, categoryChipsContainer);
    }

    this.updateCatalogGrid();
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
        btn.blur();
        const cat = btn.dataset.heroFilter;
        state.setCategory(cat);
        const target = $('#katalog');
        if (target) target.scrollIntoView({ behavior: 'smooth' });
      });
    });

    // Delegate book clicks: open book detail & borrow modal
    document.addEventListener('click', (e) => {
      // 1. If clicking the detail / borrow action button
      const detailBtn = e.target.closest('[data-action="open-detail"]');
      if (detailBtn) {
        const bookId = detailBtn.dataset.bookId;
        if (bookId) state.setSelectedBook(bookId);
        return;
      }

      // 2. If clicking spotlight book cover
      const spotlightCover = e.target.closest('[data-action="preview-spotlight-cover"]');
      if (spotlightCover) {
        const bookId = spotlightCover.dataset.bookId;
        if (bookId) state.setSelectedBook(bookId);
        return;
      }

      // 3. If clicking anywhere on a book card in catalog
      const card = e.target.closest('article[data-book-id]');
      if (card) {
        const bookId = card.dataset.bookId;
        if (bookId) state.setSelectedBook(bookId);
      }
    });
  },
};
