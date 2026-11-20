/**
 * @file Modal dialog controller for uncropped high-resolution book cover image preview.
 */

import { $ } from '../../utils/dom.js';

export const imagePreviewModal = {
  get modal() {
    return $('#imagePreviewModal');
  },

  get img() {
    return $('#imagePreviewImg');
  },

  get caption() {
    return $('#imagePreviewCaption');
  },

  init() {
    const closeBtn = $('#closeImagePreviewBtn');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.close());
    }

    const backdrop = $('#imagePreviewBackdrop');
    if (backdrop) {
      backdrop.addEventListener('click', () => this.close());
    }

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.modal && !this.modal.classList.contains('hidden')) {
        this.close();
      }
    });
  },

  open(imageSrc, titleText) {
    if (!this.modal || !this.img) return;
    this.img.src = imageSrc;
    if (this.caption) {
      this.caption.textContent = titleText || 'Pratinjau Sampul Buku';
    }
    this.modal.classList.remove('hidden');
    this.modal.setAttribute('aria-hidden', 'false');
  },

  close() {
    if (!this.modal) return;
    this.modal.classList.add('hidden');
    this.modal.setAttribute('aria-hidden', 'true');
    if (this.img) {
      this.img.src = '';
    }
  },
};
