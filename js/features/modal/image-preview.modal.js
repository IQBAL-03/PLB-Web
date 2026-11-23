/**
 * @file Modal dialog controller for uncropped high-resolution book cover image preview with multi-volume carousel.
 */

import { $ } from '../../utils/dom.js';

export const imagePreviewModal = {
  items: [],
  currentIndex: 0,

  get modal() {
    return $('#imagePreviewModal');
  },

  get img() {
    return $('#imagePreviewImg');
  },

  get caption() {
    return $('#imagePreviewCaption');
  },

  get counter() {
    return $('#imagePreviewCounter');
  },

  get prevBtn() {
    return $('#prevImagePreviewBtn');
  },

  get nextBtn() {
    return $('#nextImagePreviewBtn');
  },

  init() {
    const closeBtn = $('#closeImagePreviewBtn');
    if (closeBtn) closeBtn.addEventListener('click', () => this.close());

    const backdrop = $('#imagePreviewBackdrop');
    if (backdrop) backdrop.addEventListener('click', () => this.close());

    const wrapper = $('#imagePreviewWrapper');
    if (wrapper) {
      wrapper.addEventListener('click', (e) => {
        if (e.target === wrapper) this.close();
      });
    }

    if (this.prevBtn) this.prevBtn.addEventListener('click', () => this.prev());
    if (this.nextBtn) this.nextBtn.addEventListener('click', () => this.next());

    window.addEventListener('keydown', (e) => {
      if (!this.modal || this.modal.classList.contains('hidden')) return;
      if (e.key === 'Escape') this.close();
      if (e.key === 'ArrowLeft') this.prev();
      if (e.key === 'ArrowRight') this.next();
    });
  },

  open(itemsOrSrc, titleOrIndex = 0) {
    if (!this.modal || !this.img) return;

    if (typeof itemsOrSrc === 'string') {
      const captionText = typeof titleOrIndex === 'string' ? titleOrIndex : 'Pratinjau Sampul Buku';
      this.items = [{ src: itemsOrSrc, title: captionText }];
      this.currentIndex = 0;
    } else if (Array.isArray(itemsOrSrc) && itemsOrSrc.length > 0) {
      this.items = itemsOrSrc;
      const idx = typeof titleOrIndex === 'number' && titleOrIndex >= 0 && titleOrIndex < itemsOrSrc.length ? titleOrIndex : 0;
      this.currentIndex = idx;
    } else {
      return;
    }

    this.renderCurrent();
    this.modal.classList.remove('hidden');
    this.modal.setAttribute('aria-hidden', 'false');
  },

  renderCurrent() {
    if (!this.items || this.items.length === 0) return;
    const item = this.items[this.currentIndex];
    if (!item) return;

    this.img.src = item.src || 'img/cover-fallback.svg';

    if (this.caption) {
      this.caption.textContent = item.title || '';
    }

    const hasMultiple = this.items.length > 1;
    if (this.prevBtn) this.prevBtn.classList.toggle('hidden', !hasMultiple);
    if (this.nextBtn) this.nextBtn.classList.toggle('hidden', !hasMultiple);

    if (this.counter) {
      if (hasMultiple) {
        this.counter.textContent = `Volume ${this.currentIndex + 1} dari ${this.items.length}`;
        this.counter.classList.remove('hidden');
      } else {
        this.counter.classList.add('hidden');
      }
    }
  },

  prev() {
    if (this.items.length <= 1) return;
    this.currentIndex = (this.currentIndex - 1 + this.items.length) % this.items.length;
    this.renderCurrent();
  },

  next() {
    if (this.items.length <= 1) return;
    this.currentIndex = (this.currentIndex + 1) % this.items.length;
    this.renderCurrent();
  },

  close() {
    if (!this.modal) return;
    this.modal.classList.add('hidden');
    this.modal.setAttribute('aria-hidden', 'true');
    if (this.img) this.img.src = '';
    this.items = [];
    this.currentIndex = 0;
  },
};

