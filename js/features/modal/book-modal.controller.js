/**
 * @file Modal controller handling book detail displays, series volume changes, and borrow workflow.
 */

import { $ } from '../../utils/dom.js';
import { state } from '../../core/state.js';
import { eventBus } from '../../core/events.js';
import { showToast } from '../../utils/toast.js';
import { bookModalView } from './book-modal.view.js';
import { imagePreviewModal } from './image-preview.modal.js';

export const bookModalController = {
  init() {
    this.bindEvents();
    eventBus.on('modal:book-selected', (book) => {
      if (book) {
        bookModalView.renderContent(book, state.isBookBorrowed(book.id), 1);
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

    // Handle volume chip button clicks
    document.addEventListener('click', (e) => {
      const volBtn = e.target.closest('.volume-chip-btn');
      if (volBtn) {
        const volumeNum = volBtn.dataset.volume;
        if (volumeNum && state.selectedBook) {
          bookModalView.updateActiveVolume(state.selectedBook, volumeNum);
        }
      }

      // Handle cover preview click inside detail modal
      const coverBtn = e.target.closest('#openCoverPreviewBtn');
      if (coverBtn) {
        const coverImg = $('#bookModalCoverImg');
        const currentBook = state.selectedBook;
        if (coverImg && coverImg.src) {
          const volumeLabel = $('#activeVolumeLabel');
          const title = currentBook
            ? currentBook.hasVolumes && volumeLabel
              ? `${currentBook.title} (${volumeLabel.textContent})`
              : currentBook.title
            : 'Sampul Buku';
          imagePreviewModal.open(coverImg.src, title);
        }
      }
    });

    // Borrow form submission
    document.addEventListener('submit', (e) => {
      if (e.target && e.target.id === 'borrowForm') {
        e.preventDefault();
        const nisInput = $('#borrowerNis');
        const nameInput = $('#borrowerName');
        const volumeInput = $('#selectedVolumeInput');

        const nis = nisInput ? nisInput.value.trim() : '';
        const name = nameInput ? nameInput.value.trim() : '';
        const selectedVol = volumeInput ? volumeInput.value : '';

        if (!nis || !name) {
          showToast('NIS dan Nama Peminjam wajib diisi.', 'warning');
          return;
        }

        const currentBook = state.selectedBook;
        if (!currentBook) return;

        state.borrowBook(currentBook.id);
        bookModalView.close();

        const volSuffix = currentBook.hasVolumes && selectedVol ? ` (Volume ${selectedVol})` : '';
        showToast(`Buku "${currentBook.title}${volSuffix}" berhasil dipinjam atas nama ${name}. Harap kembalikan dalam 7 hari kerja.`, 'success', 5000);
      }
    });
  },
};
