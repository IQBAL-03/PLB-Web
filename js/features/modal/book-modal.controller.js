/**
 * @file Modal controller handling book detail displays, close actions, and borrow workflow.
 */

import { $ } from '../../utils/dom.js';
import { state } from '../../core/state.js';
import { eventBus } from '../../core/events.js';
import { showToast } from '../../utils/toast.js';
import { bookModalView } from './book-modal.view.js';

export const bookModalController = {
  init() {
    this.bindEvents();
    eventBus.on('modal:book-selected', (book) => {
      if (book) {
        bookModalView.renderContent(book, state.isBookBorrowed(book.id));
        bookModalView.open();
      }
    });
  },

  bindEvents() {
    const modal = bookModalView.modal;
    if (!modal) return;

    // Close button
    const closeBtn = $('#closeBookModalBtn');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => bookModalView.close());
    }

    // Backdrop click
    const backdrop = $('#bookModalBackdrop');
    if (backdrop) {
      backdrop.addEventListener('click', () => bookModalView.close());
    }

    // Escape key
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
        bookModalView.close();
      }
    });

    // Borrow form submission
    document.addEventListener('submit', (e) => {
      if (e.target && e.target.id === 'borrowForm') {
        e.preventDefault();
        const nisInput = $('#borrowerNis');
        const nameInput = $('#borrowerName');

        const nis = nisInput ? nisInput.value.trim() : '';
        const name = nameInput ? nameInput.value.trim() : '';

        if (!nis || !name) {
          showToast('NIS dan Nama Peminjam wajib diisi.', 'warning');
          return;
        }

        const currentBook = state.selectedBook;
        if (!currentBook) return;

        state.borrowBook(currentBook.id);
        bookModalView.close();
        showToast(`Buku "${currentBook.title}" berhasil dipinjam atas nama ${name}. Harap kembalikan dalam 7 hari kerja.`, 'success', 5000);
      }
    });
  },
};
