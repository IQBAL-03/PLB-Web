/**
 * @file Modal view for book details, series volume selector, and school library borrow form.
 */

import { $, escapeHtml } from '../../utils/dom.js';

export const bookModalView = {
  get modal() {
    return $('#bookDetailModal');
  },

  get content() {
    return $('#bookModalContent');
  },

  renderStarsSnippet(rating) {
    const num = Math.round(Number(rating) || 0);
    let s = '';
    for (let i = 1; i <= 5; i++) {
      const c = num > 0 && i <= num ? 'text-amber-500' : 'text-stone-300';
      s += `<svg class="w-3.5 h-3.5 ${c} fill-current shrink-0" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>`;
    }
    return s;
  },

  renderContent(book, isBorrowed, selectedVolumeNum = 1) {
    if (!this.content || !book) return;

    let activeCover = book.coverImg || 'img/placeholder-book.svg';
    let activeVolume = null;

    if (book.hasVolumes && book.volumes && book.volumes.length > 0) {
      activeVolume = book.volumes.find((v) => v.volumeNumber === Number(selectedVolumeNum)) || book.volumes[0];
      if (activeVolume && activeVolume.coverImg) {
        activeCover = activeVolume.coverImg;
      } else if (!book.coverImg) {
        activeCover = 'img/placeholder-book.svg';
      }
    }

    const currentStock = activeVolume ? activeVolume.stock : book.stock;
    const isOutOfStock = currentStock <= 0 && !book.isComingSoon;

    const borrowBadge = isBorrowed
      ? '<span class="inline-block bg-blue-100 text-blue-900 border border-blue-200 text-xs px-2.5 py-0.5 rounded-full font-semibold">Sedang Anda Pinjam</span>'
      : !isOutOfStock ? '<span class="inline-block bg-emerald-100 text-emerald-900 border border-emerald-200 text-xs px-2.5 py-0.5 rounded-full font-semibold">Tersedia untuk Dipinjam</span>' : '<span class="inline-block bg-rose-100 text-rose-900 border border-rose-200 text-xs px-2.5 py-0.5 rounded-full font-semibold">Stok Sedang Habis</span>';

    const languageBadge = book.language === 'Bahasa Inggris'
      ? '<span class="inline-block bg-indigo-50 text-indigo-900 border border-indigo-200 text-xs px-2 py-0.5 rounded font-semibold">Bahasa Inggris (English Edition)</span>'
      : '<span class="inline-block bg-stone-100 text-stone-800 border border-stone-200 text-xs px-2 py-0.5 rounded font-semibold">Bahasa Indonesia</span>';

    this.content.innerHTML = `
      <div class="grid grid-cols-1 sm:grid-cols-12 gap-6 items-start">
        <div class="sm:col-span-5 flex flex-col items-center">
          <button type="button" id="openCoverPreviewBtn"
            class="group relative w-full max-w-[210px] rounded-xl overflow-hidden shadow-md border border-stone-200 bg-stone-100 hover:ring-2 hover:ring-rose-800 transition-all cursor-zoom-in flex items-center justify-center p-2 focus:outline-none"
            title="Klik untuk melihat sampul ukuran asli"
            aria-label="Klik untuk melihat gambar sampul ukuran asli">
            <img id="bookModalCoverImg" src="${activeCover}" alt="${escapeHtml(book.title)}" class="max-h-[290px] w-auto h-auto max-w-full object-contain rounded transition-transform duration-200 group-hover:scale-102" />
            ${activeVolume ? `<div class="absolute top-2 right-2 bg-stone-900/85 text-white text-[11px] font-bold px-2 py-0.5 rounded shadow-xs" id="volumeCoverBadge">Vol. ${activeVolume.volumeNumber}</div>` : ''}
            <div class="absolute inset-x-0 bottom-0 bg-stone-950/75 backdrop-blur-xs py-1 px-2 text-center text-[10px] text-white font-medium opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
              <svg class="w-3.5 h-3.5 text-amber-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7"/></svg>
              <span>Lihat Ukuran Asli</span>
            </div>
          </button>
          <div class="mt-3.5 text-center">
            <p class="text-[11px] font-semibold text-stone-400 uppercase tracking-wider">Lokasi Rak</p>
            <p class="text-xs sm:text-sm font-bold text-stone-800">${escapeHtml(book.shelf)}</p>
          </div>
        </div>

        <div class="sm:col-span-7 flex flex-col">
          <div class="flex items-center gap-2 mb-2 flex-wrap">
            ${borrowBadge}
            ${languageBadge}
          </div>

          ${
            book.genres && book.genres.length > 0
              ? `
            <div class="flex flex-wrap gap-1 mb-2">
              ${book.genres.map((g) => `<span class="inline-block bg-stone-100 text-stone-700 border border-stone-200 text-[11px] px-2.5 py-0.5 rounded-full font-medium">${escapeHtml(g)}</span>`).join('')}
            </div>
          `
              : ''
          }

          <h2 class="font-serif text-xl sm:text-2xl font-bold text-stone-900 leading-tight mb-1">
            ${escapeHtml(book.title)}
          </h2>
          <p class="text-xs sm:text-sm text-stone-600 font-medium mb-1.5">
            Karya <span class="text-stone-900 font-semibold">${escapeHtml(book.author)}</span> &middot; Tahun ${book.year}
          </p>
          <div class="flex items-center gap-2 mb-3 text-xs">
            <div class="flex items-center gap-0.5 text-amber-500" aria-hidden="true">
              ${this.renderStarsSnippet(book.rating || 0)}
            </div>
            <span class="font-bold text-stone-800 text-xs">${(Number(book.rating) || 0).toFixed(1)} / 5</span>
            <span class="text-stone-500 text-xs">(${book.reviews_count || book.reviewsCount || 0} ulasan)</span>
          </div>

          <div class="bg-stone-50 rounded-xl p-3 border border-stone-200 mb-4 text-xs grid grid-cols-3 gap-2">
            <div>
              <span class="text-stone-500 block">Kategori</span>
              <span class="font-semibold text-stone-800">${escapeHtml(book.category)}</span>
            </div>
            <div>
              <span class="text-stone-500 block">Edisi Bahasa</span>
              <span class="font-semibold text-stone-800">${escapeHtml(book.language || 'Bahasa Indonesia')}</span>
            </div>
            <div>
              <span class="text-stone-500 block">Sisa Stok</span>
              <span id="volumeStockDisplay" class="font-bold ${currentStock > 0 ? 'text-emerald-800' : 'text-rose-800'}">${currentStock} Eksemplar</span>
            </div>
          </div>

          ${
            book.hasVolumes && book.volumes
              ? `
            <div class="mb-4 bg-amber-50/70 border border-amber-200/80 rounded-xl p-3.5">
              <div class="flex items-center justify-between mb-2">
                <span class="text-xs font-bold text-stone-800 uppercase tracking-wider">Pilih Volume Manga:</span>
                <span id="activeVolumeLabel" class="text-xs font-bold text-rose-900">${escapeHtml(activeVolume.volumeTitle)}</span>
              </div>
              <div class="flex flex-wrap gap-1.5 mb-2" id="volumeButtonContainer">
                ${book.volumes
                  .map(
                    (v) => `
                  <button type="button"
                    class="volume-chip-btn px-2.5 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
                      v.volumeNumber === activeVolume.volumeNumber
                        ? 'bg-rose-900 text-white shadow-xs'
                        : 'bg-white text-stone-700 border border-stone-300 hover:bg-stone-100'
                    }"
                    data-volume="${v.volumeNumber}">
                    Vol ${v.volumeNumber}
                  </button>
                `
                  )
                  .join('')}
              </div>
              <p id="volumeDesc" class="text-xs text-stone-600 italic leading-relaxed">
                ${escapeHtml(activeVolume.description || '')}
              </p>
            </div>
          `
              : ''
          }

          <div class="mb-4">
            <h3 class="text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">Sinopsis</h3>
            <p id="bookModalMainSynopsis" class="text-xs sm:text-sm text-stone-600 leading-relaxed">${escapeHtml((activeVolume && activeVolume.description) || book.synopsis)}</p>
          </div>

          ${
            book.isComingSoon
              ? `
            <div class="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-900">
              Buku ini merupakan pengadaan baru perpustakaan dan direncanakan tersedia pada <strong>${escapeHtml(book.arrivalDate)}</strong>.
            </div>
          `
              : isBorrowed
              ? `
            <div class="bg-blue-50 border border-blue-200 rounded-xl p-3 text-xs text-blue-900">
              Buku ini sudah tercatat dalam daftar peminjaman aktif Anda. Harap kembalikan tepat waktu dalam 7 hari kerja.
            </div>
          `
              : currentStock > 0
              ? `
            <form id="borrowForm" class="border-t border-stone-200 pt-3 flex flex-col gap-2.5">
              <input type="hidden" id="selectedVolumeInput" value="${activeVolume ? activeVolume.volumeNumber : ''}" />
              <div>
                <div class="flex items-center justify-between mb-1">
                  <label for="borrowerNis" class="text-xs font-semibold text-stone-700">Nomor Induk Siswa (NIS)</label>
                  <span class="text-[10px] text-stone-400">Wajib Terdaftar &amp; Terverifikasi</span>
                </div>
                <input type="text" id="borrowerNis" class="w-full text-xs sm:text-sm px-3 py-2 rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-rose-800 focus:border-rose-800" placeholder="Ketik NIS Anda (Contoh: 20261001)" required />
                <div id="nisVerificationStatus" class="mt-1.5 text-xs hidden"></div>
              </div>
              <div>
                <label for="borrowerName" class="block text-xs font-semibold text-stone-700 mb-1">Nama Lengkap Siswa</label>
                <input type="text" id="borrowerName" class="w-full text-xs sm:text-sm px-3 py-2 rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-rose-800 focus:border-rose-800" placeholder="Nama otomatis terisi saat NIS valid" required />
              </div>
              <div class="text-[11px] text-stone-500 bg-stone-50 p-2.5 rounded-lg border border-stone-200">
                <span class="font-semibold text-stone-700">Ketentuan Peminjaman:</span> Hanya siswa terdaftar dengan status <strong>Aktif</strong> (diverifikasi admin) yang dapat meminjam buku. Batas maksimal peminjaman 2 buku selama 7 hari kerja.
              </div>
              <button type="submit" id="confirmBorrowBtn"
                class="w-full bg-rose-900 hover:bg-rose-950 text-white font-semibold text-xs sm:text-sm py-2.5 px-4 rounded-lg transition-colors cursor-pointer shadow-sm">
                Konfirmasi Peminjaman ${activeVolume ? `(Volume ${activeVolume.volumeNumber})` : ''} (7 Hari)
              </button>
            </form>
          `
              : `
            <div class="bg-rose-50 border border-rose-200 rounded-xl p-3 text-xs text-rose-900">
              Eksemplar untuk buku/volume ini sedang dipinjam seluruhnya. Silakan pilih volume lain atau periksa kembali nanti.
            </div>
          `
          }
        </div>
      </div>
      <div id="bookReviewsMountPoint"></div>
    `;
  },

  updateActiveVolume(book, volumeNumber) {
    if (!book || !book.hasVolumes || !book.volumes) return;
    const vol = book.volumes.find((v) => v.volumeNumber === Number(volumeNumber));
    if (!vol) return;

    const coverImg = $('#bookModalCoverImg');
    if (coverImg) {
      coverImg.src = vol.coverImg || book.coverImg || 'img/placeholder-book.svg';
    }

    const volumeCoverBadge = $('#volumeCoverBadge');
    if (volumeCoverBadge) {
      volumeCoverBadge.textContent = `Vol. ${vol.volumeNumber}`;
    }

    const volumeDesc = $('#volumeDesc');
    if (volumeDesc) {
      volumeDesc.textContent = vol.description || '';
    }

    const mainSynopsis = $('#bookModalMainSynopsis');
    if (mainSynopsis) {
      mainSynopsis.textContent = vol.description || book.synopsis || '';
    }

    const activeVolumeLabel = $('#activeVolumeLabel');
    if (activeVolumeLabel) activeVolumeLabel.textContent = vol.volumeTitle;

    const volumeStockDisplay = $('#volumeStockDisplay');
    if (volumeStockDisplay) {
      volumeStockDisplay.textContent = `${vol.stock} Eksemplar`;
      volumeStockDisplay.className = `font-bold ${vol.stock > 0 ? 'text-emerald-800' : 'text-rose-800'}`;
    }

    const selectedVolumeInput = $('#selectedVolumeInput');
    if (selectedVolumeInput) selectedVolumeInput.value = vol.volumeNumber;

    const confirmBorrowBtn = $('#confirmBorrowBtn');
    if (confirmBorrowBtn) confirmBorrowBtn.textContent = `Konfirmasi Peminjaman (Volume ${vol.volumeNumber}) (7 Hari)`;

    // Update active styles on buttons
    document.querySelectorAll('.volume-chip-btn').forEach((btn) => {
      const isSelected = Number(btn.dataset.volume) === Number(vol.volumeNumber);
      if (isSelected) {
        btn.className = 'volume-chip-btn px-2.5 py-1 rounded-md text-xs font-bold transition-all cursor-pointer bg-rose-900 text-white shadow-xs';
      } else {
        btn.className = 'volume-chip-btn px-2.5 py-1 rounded-md text-xs font-bold transition-all cursor-pointer bg-white text-stone-700 border border-stone-300 hover:bg-stone-100';
      }
    });
  },

  open() {
    if (!this.modal) return;
    this.modal.classList.remove('hidden');
    this.modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('overflow-hidden');
  },

  close() {
    if (!this.modal) return;
    this.modal.classList.add('hidden');
    this.modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('overflow-hidden');
  },
};
