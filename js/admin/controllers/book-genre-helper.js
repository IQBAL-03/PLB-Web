/**
 * @file Helper for managing book genre tags (up to 10 genres) in the admin catalog modal.
 */

import { $, escapeHtml } from '../../utils/dom.js';
import { showToast } from '../../utils/toast.js';

let currentGenres = [];

export const bookGenreHelper = {
  render() {
    const container = $('#bookGenreChipsContainer');
    const label = $('#genreCountLabel');
    if (label) {
      label.textContent = `${currentGenres.length} / 10 genre`;
    }

    if (!container) return;
    if (currentGenres.length === 0) {
      container.innerHTML = '<span class="text-[11px] text-stone-400 italic">Belum ada genre ditambahkan.</span>';
      return;
    }

    container.innerHTML = currentGenres
      .map(
        (g, idx) => `
        <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-stone-100 text-stone-800 border border-stone-300 shadow-2xs group">
          <span>${escapeHtml(g)}</span>
          <button type="button" data-remove-genre="${idx}" class="text-stone-400 hover:text-rose-700 hover:bg-rose-50 rounded-full w-4 h-4 flex items-center justify-center text-[10px] font-bold cursor-pointer transition-colors" title="Hapus genre">&times;</button>
        </span>
      `
      )
      .join('');
  },

  add(name) {
    const val = (name || '').trim();
    if (!val) return false;

    if (currentGenres.length >= 10) {
      showToast('Maksimal 10 genre yang dapat ditambahkan pada satu buku.', 'warning');
      return false;
    }

    const exists = currentGenres.some((g) => g.toLowerCase() === val.toLowerCase());
    if (exists) {
      showToast(`Genre "${val}" sudah ada dalam daftar.`, 'info');
      return false;
    }

    currentGenres.push(val);
    this.render();
    return true;
  },

  remove(idx) {
    if (idx >= 0 && idx < currentGenres.length) {
      currentGenres.splice(idx, 1);
      this.render();
    }
  },

  getGenres() {
    return [...currentGenres];
  },

  setGenres(genres) {
    currentGenres = Array.isArray(genres) ? genres.slice(0, 10) : [];
    this.render();
  },

  bind() {
    document.addEventListener('click', (e) => {
      // Add genre button click
      if (e.target.closest('#addGenreBtn')) {
        const input = $('#bookGenreInput');
        if (input) {
          if (this.add(input.value)) {
            input.value = '';
            input.focus();
          }
        }
        return;
      }

      // Remove genre button click
      const removeBtn = e.target.closest('[data-remove-genre]');
      if (removeBtn) {
        const idx = Number(removeBtn.dataset.removeGenre);
        this.remove(idx);
      }
    });

    // Enter key press in genre input
    document.addEventListener('keydown', (e) => {
      if (e.target.id === 'bookGenreInput' && e.key === 'Enter') {
        e.preventDefault();
        if (this.add(e.target.value)) {
          e.target.value = '';
        }
      }
    });
  },
};
