/**
 * @file Modal view for book details and school library borrow form.
 */

import { $, escapeHtml } from '../../utils/dom.js';

export const bookModalView = {
  get modal() {
    return $('#bookDetailModal');
  },

  get content() {
    return $('#bookModalContent');
  },

  renderContent(book, isBorrowed) {
    if (!this.content || !book) return;

    const borrowBadge = isBorrowed
      ? '<span class="inline-block bg-blue-100 text-blue-900 border border-blue-200 text-xs px-2.5 py-0.5 rounded-full font-semibold">Sedang Anda Pinjam</span>'
      : book.stock > 0
      ? '<span class="inline-block bg-emerald-100 text-emerald-900 border border-emerald-200 text-xs px-2.5 py-0.5 rounded-full font-semibold">Tersedia untuk Dipinjam</span>'
      : '<span class="inline-block bg-rose-100 text-rose-900 border border-rose-200 text-xs px-2.5 py-0.5 rounded-full font-semibold">Stok Sedang Habis</span>';

    this.content.innerHTML = `
      <div class="grid grid-cols-1 sm:grid-cols-12 gap-6 items-start">
        <div class="sm:col-span-5 flex flex-col items-center">
          <div class="w-full max-w-[200px] aspect-[3/4] rounded-lg overflow-hidden shadow-lg border border-stone-200 bg-stone-100">
            <img src="${book.coverImg}" alt="${escapeHtml(book.title)}" class="w-full h-full object-cover" />
          </div>
          <div class="mt-3 text-center">
            <p class="text-xs font-semibold text-stone-500 uppercase tracking-wider">Lokasi Rak</p>
            <p class="text-sm font-bold text-stone-900">${escapeHtml(book.shelf)}</p>
          </div>
        </div>

        <div class="sm:col-span-7 flex flex-col">
          <div class="mb-2">
            ${borrowBadge}
          </div>
          <h2 class="font-serif text-xl sm:text-2xl font-bold text-stone-900 leading-tight mb-1">
            ${escapeHtml(book.title)}
          </h2>
          <p class="text-sm text-stone-600 font-medium mb-3">
            Penulis: <span class="text-stone-900 font-semibold">${escapeHtml(book.author)}</span> &middot; Tahun ${book.year}
          </p>

          <div class="bg-stone-50 rounded-lg p-3 border border-stone-200 mb-4 text-xs grid grid-cols-2 gap-2">
            <div>
              <span class="text-stone-500 block">Kategori</span>
              <span class="font-semibold text-stone-800">${escapeHtml(book.category)}</span>
            </div>
            <div>
              <span class="text-stone-500 block">Sisa Stok Fisik</span>
              <span class="font-semibold text-stone-800">${book.stock} Eksemplar</span>
            </div>
          </div>

          <div class="mb-5">
            <h3 class="text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">Sinopsis Buku</h3>
            <p class="text-xs sm:text-sm text-stone-600 leading-relaxed">${escapeHtml(book.synopsis)}</p>
          </div>

          ${
            book.isComingSoon
              ? `
            <div class="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-900">
              Buku ini merupakan pengadaan baru perpustakaan dan direncanakan tersedia pada <strong>${escapeHtml(book.arrivalDate)}</strong>.
            </div>
          `
              : isBorrowed
              ? `
            <div class="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-900 mb-3">
              Buku ini sudah tercatat dalam daftar peminjaman aktif Anda. Harap kembalikan tepat waktu dalam 7 hari kerja.
            </div>
          `
              : book.stock > 0
              ? `
            <form id="borrowForm" class="border-t border-stone-200 pt-4 flex flex-col gap-3">
              <div>
                <label for="borrowerNis" class="block text-xs font-semibold text-stone-700 mb-1">Nomor Induk Siswa (NIS) / NIP Guru</label>
                <input type="text" id="borrowerNis" class="w-full text-xs sm:text-sm px-3 py-2 rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-rose-800 focus:border-rose-800" placeholder="Contoh: 202610482" required />
              </div>
              <div>
                <label for="borrowerName" class="block text-xs font-semibold text-stone-700 mb-1">Nama Lengkap Peminjam</label>
                <input type="text" id="borrowerName" class="w-full text-xs sm:text-sm px-3 py-2 rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-rose-800 focus:border-rose-800" placeholder="Nama siswa / guru peminjam" required />
              </div>
              <button type="submit"
                class="w-full bg-rose-900 hover:bg-rose-950 text-white font-semibold text-xs sm:text-sm py-2.5 px-4 rounded-lg transition-colors cursor-pointer shadow-sm">
                Konfirmasi Peminjaman Buku (7 Hari)
              </button>
            </form>
          `
              : `
            <div class="bg-rose-50 border border-rose-200 rounded-lg p-3 text-xs text-rose-900">
              Seluruh eksemplar buku ini sedang dipinjam oleh siswa lain. Silakan periksa kembali beberapa hari ke depan.
            </div>
          `
          }
        </div>
      </div>
    `;
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
