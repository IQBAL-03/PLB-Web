/**
 * @file Card grid view and CRUD modal for book collection and cover management in the admin panel.
 */

import { escapeHtml } from '../../utils/dom.js';

export const booksView = {
  render(container, books, categories) {
    if (!container) return;

    container.innerHTML = `
      <div class="space-y-6">
        <!-- Header & Top Actions -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-stone-200 shadow-xs">
          <div>
            <h1 class="font-serif text-2xl sm:text-3xl font-bold text-stone-900 mb-1">Katalog Koleksi &amp; Sampul Buku</h1>
            <p class="text-xs sm:text-sm text-stone-500">Kelola master buku dalam bentuk kartu visual, ubah foto sampul, bahasa, dan jumlah stok.</p>
          </div>
          <button type="button" id="openAddBookBtn" class="px-4 py-2.5 rounded-lg bg-rose-900 hover:bg-rose-950 text-white text-xs sm:text-sm font-semibold transition-colors cursor-pointer shadow-xs self-start sm:self-auto">
            + Tambah Koleksi Buku
          </button>
        </div>

        <!-- Filter & Search Bar -->
        <div class="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 class="font-serif text-lg font-bold text-stone-900">Daftar Kartu Koleksi Buku</h2>
            <span id="booksCountLabel" class="text-xs text-stone-500">Total ${books.length} judul terdaftar</span>
          </div>

          <div class="flex flex-wrap items-center gap-2">
            <input type="text" id="bookSearchInput" placeholder="Cari judul, pengarang, kode ID..."
              class="text-xs px-3.5 py-2 rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-rose-800 w-full sm:w-60 bg-stone-50/50" />
            <select id="bookCategorySelect" class="text-xs px-3 py-2 rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-rose-800 bg-stone-50">
              <option value="Semua">Semua Kategori</option>
              ${categories.filter((c) => c !== 'Semua Koleksi').map((c) => `<option value="${escapeHtml(c)}">${escapeHtml(c)}</option>`).join('')}
            </select>
          </div>
        </div>

        <!-- Book Cards Grid -->
        <div id="booksCardGrid" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 sm:gap-6">
          ${this.renderCards(books)}
        </div>
      </div>

      <!-- Add / Edit Book Modal Dialog with Cover Selector -->
      <div id="bookModalDialog" class="fixed inset-0 z-50 hidden" role="dialog" aria-modal="true" aria-labelledby="bookModalTitle">
        <div class="fixed inset-0 bg-stone-950/70 backdrop-blur-xs" data-close-book-modal="true"></div>
        <div class="fixed inset-0 z-10 overflow-y-auto flex items-center justify-center p-4">
          <div class="relative bg-white rounded-2xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-stone-200 max-h-[90vh] overflow-y-auto">
            <button type="button" id="closeBookModalBtn" class="absolute top-4 right-4 p-2 text-stone-400 hover:text-stone-800 text-2xl font-bold leading-none cursor-pointer">&times;</button>
            <h3 id="bookModalTitle" class="font-serif text-xl font-bold text-stone-900 mb-1">Tambah Buku &amp; Sampul Baru</h3>
            <p class="text-xs text-stone-500 mb-5">Lengkapi identitas katalog, nomor rak fisik, serta tautan foto kover buku.</p>

            <form id="bookForm" class="space-y-4">
              <input type="hidden" id="bookFormOriginalId" value="" />

              <!-- Cover Image Input & Live Preview -->
              <div class="bg-stone-50 p-4 rounded-xl border border-stone-200 flex flex-col sm:flex-row items-center gap-4">
                <div class="w-24 aspect-[3/4] bg-stone-200 rounded-lg overflow-hidden border border-stone-300 shrink-0 flex items-center justify-center">
                  <img id="bookModalCoverPreview" src="cover-sementara/look-back.png" alt="Pratinjau Sampul" class="w-full h-full object-contain" />
                </div>
                <div class="w-full">
                  <label for="bookCoverInput" class="block text-xs font-bold text-stone-700 uppercase mb-1">Path / URL Sampul Kover</label>
                  <input type="text" id="bookCoverInput" value="cover-sementara/look-back.png" required
                    class="w-full text-xs font-mono px-3 py-2 rounded-lg border border-stone-300 focus:ring-2 focus:ring-rose-800 focus:outline-none bg-white"
                    placeholder="cover-sementara/look-back.png" />
                  <p class="text-[11px] text-stone-500 mt-1">Gunakan berkas dari <code>cover-sementara/</code> atau URL gambar eksternal.</p>
                </div>
              </div>

              <div class="grid grid-cols-3 gap-3">
                <div>
                  <label for="bookIdInput" class="block text-xs font-bold text-stone-700 uppercase mb-1">ID Buku</label>
                  <input type="text" id="bookIdInput" required class="w-full text-xs sm:text-sm px-3.5 py-2 rounded-lg border border-stone-300 focus:ring-2 focus:ring-rose-800 focus:outline-none" placeholder="M004" />
                </div>
                <div class="col-span-2">
                  <label for="bookTitleInput" class="block text-xs font-bold text-stone-700 uppercase mb-1">Judul Buku</label>
                  <input type="text" id="bookTitleInput" required class="w-full text-xs sm:text-sm px-3.5 py-2 rounded-lg border border-stone-300 focus:ring-2 focus:ring-rose-800 focus:outline-none" placeholder="Judul buku" />
                </div>
              </div>

              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label for="bookAuthorInput" class="block text-xs font-bold text-stone-700 uppercase mb-1">Pengarang</label>
                  <input type="text" id="bookAuthorInput" required class="w-full text-xs sm:text-sm px-3.5 py-2 rounded-lg border border-stone-300 focus:ring-2 focus:ring-rose-800 focus:outline-none" placeholder="Nama penulis" />
                </div>
                <div>
                  <label for="bookCategoryInput" class="block text-xs font-bold text-stone-700 uppercase mb-1">Kategori</label>
                  <select id="bookCategoryInput" class="w-full text-xs sm:text-sm px-3.5 py-2 rounded-lg border border-stone-300 focus:ring-2 focus:ring-rose-800 focus:outline-none bg-stone-50">
                    <option value="Komik & Manga">Komik &amp; Manga</option>
                    <option value="Fiksi & Sastra">Fiksi &amp; Sastra</option>
                    <option value="Sains & Teknologi">Sains &amp; Teknologi</option>
                    <option value="Sejarah & Biografi">Sejarah &amp; Biografi</option>
                    <option value="Pengembangan Diri">Pengembangan Diri</option>
                    <option value="Buku Referensi">Buku Referensi</option>
                  </select>
                </div>
              </div>

              <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label for="bookLanguageInput" class="block text-xs font-bold text-stone-700 uppercase mb-1">Bahasa</label>
                  <select id="bookLanguageInput" class="w-full text-xs sm:text-sm px-3.5 py-2 rounded-lg border border-stone-300 focus:ring-2 focus:ring-rose-800 focus:outline-none bg-stone-50">
                    <option value="Bahasa Indonesia">Bahasa Indonesia</option>
                    <option value="Bahasa Inggris">Bahasa Inggris</option>
                  </select>
                </div>
                <div>
                  <label for="bookPriceInput" class="block text-xs font-bold text-stone-700 uppercase mb-1">Harga (Rp)</label>
                  <input type="number" id="bookPriceInput" min="0" step="1000" class="w-full text-xs sm:text-sm px-3.5 py-2 rounded-lg border border-stone-300 focus:ring-2 focus:ring-rose-800 focus:outline-none" placeholder="85000" />
                </div>
                <div>
                  <label for="bookStockInput" class="block text-xs font-bold text-stone-700 uppercase mb-1">Jumlah Stok</label>
                  <input type="number" id="bookStockInput" min="0" required class="w-full text-xs sm:text-sm px-3.5 py-2 rounded-lg border border-stone-300 focus:ring-2 focus:ring-rose-800 focus:outline-none" placeholder="5" />
                </div>
                <div>
                  <label for="bookShelfInput" class="block text-xs font-bold text-stone-700 uppercase mb-1">Nomor Rak</label>
                  <input type="text" id="bookShelfInput" required class="w-full text-xs sm:text-sm px-3.5 py-2 rounded-lg border border-stone-300 focus:ring-2 focus:ring-rose-800 focus:outline-none" placeholder="Rak M-01" />
                </div>
              </div>

              <div>
                <label for="bookSynopsisInput" class="block text-xs font-bold text-stone-700 uppercase mb-1">Sinopsis Ringkas</label>
                <textarea id="bookSynopsisInput" rows="2" class="w-full text-xs sm:text-sm px-3.5 py-2 rounded-lg border border-stone-300 focus:ring-2 focus:ring-rose-800 focus:outline-none" placeholder="Deskripsi buku..."></textarea>
              </div>

              <button type="submit" class="w-full bg-rose-900 hover:bg-rose-950 text-white font-semibold text-xs sm:text-sm py-2.5 px-4 rounded-lg transition-colors cursor-pointer shadow-xs">
                Simpan Informasi &amp; Sampul Buku
              </button>
            </form>
          </div>
        </div>
      </div>
    `;
  },

  renderCards(books) {
    if (books.length === 0) {
      return `
        <div class="col-span-full py-12 text-center bg-white rounded-2xl border border-dashed border-stone-300 p-8">
          <p class="font-serif text-base font-bold text-stone-700 mb-1">Tidak Ada Koleksi Buku Ditemukan</p>
          <p class="text-xs text-stone-500">Coba gunakan kata kunci pencarian atau kategori lain.</p>
        </div>
      `;
    }

    return books
      .map((b) => {
        const langBadge =
          b.language === 'Bahasa Inggris'
            ? '<span class="text-[10px] font-bold text-indigo-900 bg-indigo-50 border border-indigo-200 px-1.5 py-0.5 rounded">Inggris</span>'
            : '<span class="text-[10px] font-bold text-stone-700 bg-stone-100 border border-stone-200 px-1.5 py-0.5 rounded">Indonesia</span>';

        return `
          <div class="bg-white rounded-2xl border border-stone-200 shadow-xs hover:shadow-md transition-all overflow-hidden flex flex-col justify-between group">
            <div>
              <!-- Cover Image Area with Zoomable Modal Trigger -->
              <div class="aspect-[3/4] bg-stone-100/70 p-3 flex items-center justify-center relative overflow-hidden border-b border-stone-100 cursor-zoom-in group/cover"
                data-action="preview-cover"
                data-cover-src="${b.coverImg || 'cover-sementara/look-back.png'}"
                data-book-title="${escapeHtml(b.title)} - Karya ${escapeHtml(b.author)}">
                <img src="${b.coverImg || 'cover-sementara/look-back.png'}" alt="${escapeHtml(b.title)}"
                  class="max-h-full max-w-full w-auto h-auto object-contain rounded shadow-xs group-hover:scale-102 transition-transform duration-200"
                  loading="lazy" />
                <div class="absolute inset-0 bg-stone-950/35 opacity-0 group-hover/cover:opacity-100 transition-opacity flex items-center justify-center">
                  <span class="bg-stone-900/85 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-md backdrop-blur-xs flex items-center gap-1">
                    <svg class="w-3.5 h-3.5 text-amber-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7"/></svg>
                    <span>Perbesar Foto</span>
                  </span>
                </div>
                <div class="absolute top-2.5 left-2.5">
                  <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-900 border border-rose-200 shadow-xs">
                    ${escapeHtml(b.category)}
                  </span>
                </div>
                <div class="absolute top-2.5 right-2.5">
                  ${langBadge}
                </div>
                ${b.hasVolumes ? '<div class="absolute bottom-2.5 right-2.5 bg-stone-900/85 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-xs">7 Vol</div>' : ''}
              </div>

              <!-- Card Content -->
              <div class="p-4 space-y-2">
                <div class="flex items-center justify-between text-[11px] text-stone-400 font-mono">
                  <span>ID: ${escapeHtml(b.id)}</span>
                  <span>${escapeHtml(b.shelf)}</span>
                </div>
                <h3 class="font-serif font-bold text-stone-900 text-sm leading-snug line-clamp-1 group-hover:text-rose-900 transition-colors">
                  ${escapeHtml(b.title)}
                </h3>
                <p class="text-xs text-stone-500 line-clamp-1 font-medium">${escapeHtml(b.author)}</p>

                <div class="flex items-center justify-between pt-2 border-t border-stone-100 text-xs">
                  <span class="text-stone-500 text-[11px]">Harga Pasar:</span>
                  <span class="font-bold font-mono text-stone-900">${b.price ? new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(b.price) : '-'}</span>
                </div>

                <div class="flex items-center justify-between text-xs">
                  <span class="text-stone-500 text-[11px]">Sisa Fisik:</span>
                  <span class="font-bold ${b.stock > 0 ? 'text-emerald-800' : 'text-rose-800'}">${b.stock} Eksemplar</span>
                </div>

                <div class="text-[10px] text-stone-400 font-mono truncate" title="${escapeHtml(b.coverImg || '')}">
                  File: ${escapeHtml(b.coverImg || '-')}
                </div>
              </div>
            </div>

            <!-- Card Actions -->
            <div class="p-3 bg-stone-50/70 border-t border-stone-100 flex items-center justify-between gap-2">
              <button type="button" data-book-action="edit" data-id="${b.id}"
                class="flex-1 py-1.5 px-3 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-800 font-semibold text-xs border border-stone-300 transition-colors cursor-pointer text-center">
                Edit Sampul &amp; Data
              </button>
              <button type="button" data-book-action="delete" data-id="${b.id}"
                class="py-1.5 px-3 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-800 font-semibold text-xs border border-rose-200 transition-colors cursor-pointer text-center">
                Hapus
              </button>
            </div>
          </div>
        `;
      })
      .join('');
  },
};
