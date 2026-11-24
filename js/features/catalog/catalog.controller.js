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
    eventBus.on('catalog:filter-changed', () => this.updateCatalogGrid());
    eventBus.on('book:borrowed', () => this.render());
    eventBus.on('books:synced', () => this.render());

    this.render();
    this.bindEvents();
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
    if (!catalogGrid) return;

    if (state.isLoading) {
      catalogView.renderSkeletons(catalogGrid, 6);
      const activeLabel = $('#activeFilterLabel');
      if (activeLabel) activeLabel.textContent = 'Memuat koleksi...';
      return;
    }

    const filtered = state.getFilteredBooks();
    catalogView.renderGrid(catalogGrid, filtered, (id) => state.isBookBorrowed(id));

    const categoryChipsContainer = $('#categoryChips');
    if (categoryChipsContainer) {
      catalogView.renderCategoryPills(state.categories, state.activeCategory, categoryChipsContainer);
    }

    const activeLabel = $('#activeFilterLabel');
    if (activeLabel) {
      const count = filtered.length;
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

    // Delegate book clicks: photo preview vs detail / borrow modal
    document.addEventListener('click', (e) => {
      // 1. If clicking book cover photo (catalog card or spotlight) -> open image modal only
      const coverTrigger = e.target.closest('[data-action="preview-cover"], [data-action="preview-spotlight-cover"]');
      if (coverTrigger) {
        const bookId = coverTrigger.dataset.bookId;
        const book = state.books.find((b) => b.id === bookId);
        if (book && book.coverImg && book.coverImg.trim()) {
          if (book.hasVolumes && Array.isArray(book.volumes) && book.volumes.length > 0) {
            const items = book.volumes.map((v) => ({
              src: v.coverImg || book.coverImg || 'img/cover-fallback.svg',
              title: `${book.title} - ${v.volumeTitle || `Volume ${v.volumeNumber}`}`,
              volumeNumber: v.volumeNumber,
            }));
            imagePreviewModal.open(items, 0);
          } else {
            const caption = `${book.title} - Karya ${book.author}`;
            imagePreviewModal.open(book.coverImg, caption);
          }
        }
        return;
      }

      // 2. If clicking the detail / borrow action button
      const detailBtn = e.target.closest('[data-action="open-detail"]');
      if (detailBtn) {
        const bookId = detailBtn.dataset.bookId;
        if (bookId) state.setSelectedBook(bookId);
        return;
      }

      // 3. If clicking anywhere on a book card in catalog (outside cover photo)
      const card = e.target.closest('article[data-book-id]');
      if (card) {
        const bookId = card.dataset.bookId;
        if (bookId) state.setSelectedBook(bookId);
      }
    });
  },
};
