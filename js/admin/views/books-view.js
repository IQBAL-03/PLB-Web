/**
 * @file Card grid view and CRUD modal for book collection and cover management in the admin panel.
 */

import { escapeHtml } from '../../utils/dom.js';
import { booksCardView } from './books-card.view.js';

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
          <div class="relative bg-white rounded-2xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-stone-200 max-h-[90vh] overflow-y-auto">
            <button type="button" id="closeBookModalBtn" class="absolute top-4 right-4 p-2 text-stone-400 hover:text-stone-800 text-2xl font-bold leading-none cursor-pointer">&times;</button>
            <h3 id="bookModalTitle" class="font-serif text-xl font-bold text-stone-900 mb-1">Tambah Buku &amp; Sampul Baru</h3>
            <p class="text-xs text-stone-500 mb-5">Lengkapi identitas katalog, nomor rak fisik, serta tautan foto kover buku.</p>

            <form id="bookForm" class="space-y-4">
              <input type="hidden" id="bookFormOriginalId" value="" />

              <!-- Cover Image Input & Live Preview -->
              <div class="bg-stone-50 p-4 rounded-xl border border-stone-200 flex flex-col sm:flex-row items-center gap-4">
                <div class="w-24 aspect-[3/4] bg-stone-200 rounded-lg overflow-hidden border border-stone-300 shrink-0 flex items-center justify-center relative">
                  <img id="bookModalCoverPreview" src="img/placeholder-book.svg" alt="Pratinjau Sampul" class="w-full h-full object-contain" onerror="this.src='img/placeholder-book.svg'" />
                  <div id="bookModalCoverUploading" class="absolute inset-0 bg-stone-900/70 hidden flex flex-col items-center justify-center text-white text-[10px] font-bold p-1 text-center">
                    <svg class="animate-spin w-4 h-4 mb-1 text-amber-300" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path></svg>
                    <span>Mengunggah...</span>
                  </div>
                </div>
                <div class="w-full space-y-2">
                  <span class="block text-xs font-bold text-stone-700 uppercase">Foto Sampul Buku</span>
                  <input type="hidden" id="bookCoverInput" value="" />
                  <input type="hidden" id="bookCloudinaryIdInput" value="" />
                  <input type="file" id="bookCoverFileInput" accept="image/png,image/jpeg,image/webp" class="hidden" />
                  <div class="flex flex-wrap items-center gap-2">
                    <button type="button" id="triggerCoverUploadBtn" class="px-3.5 py-2 rounded-lg bg-stone-800 hover:bg-stone-900 text-white font-semibold text-xs transition-colors cursor-pointer shadow-xs flex items-center gap-1.5">
                      <svg class="w-3.5 h-3.5 text-amber-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/></svg>
                      <span>Pilih Foto Sampul (Maks 2MB)</span>
                    </button>
                    <span id="bookCoverFileName" class="text-xs text-stone-600 truncate max-w-[200px]">Format: PNG, JPG, WEBP</span>
                  </div>
                  <p class="text-[11px] text-stone-500">Hanya foto yang disimpan di cloud (Cloudinary), seluruh data katalog lainnya disimpan di basis data TiDB.</p>
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

              <!-- Genre Tagging System (Maksimal 10) -->
              <div class="border border-stone-200 rounded-xl p-3.5 bg-stone-50/80 space-y-2">
                <div class="flex items-center justify-between">
                  <label for="bookGenreInput" class="block text-xs font-bold text-stone-700 uppercase">Genre Buku (Maksimal 10)</label>
                  <span id="genreCountLabel" class="text-[11px] font-semibold text-stone-500">0 / 10 genre</span>
                </div>
                <div class="flex items-center gap-2">
                  <input type="text" id="bookGenreInput" placeholder="Ketik genre lalu tekan Enter atau Tambah..."
                    class="flex-1 text-xs sm:text-sm px-3.5 py-2 rounded-lg border border-stone-300 focus:ring-2 focus:ring-rose-800 focus:outline-none bg-white" />
                  <button type="button" id="addGenreBtn" class="px-3.5 py-2 rounded-lg bg-stone-800 hover:bg-stone-900 text-white text-xs font-semibold transition-colors cursor-pointer shrink-0 shadow-2xs">
                    + Tambah
                  </button>
                </div>
                <div id="bookGenreChipsContainer" class="flex flex-wrap gap-1.5 min-h-[28px] pt-1">
                  <!-- Genre chips rendered here -->
                </div>
              </div>

              <div class="grid grid-cols-2 sm:grid-cols-5 gap-3">
                <div>
                  <label for="bookLanguageInput" class="block text-xs font-bold text-stone-700 uppercase mb-1">Bahasa</label>
                  <select id="bookLanguageInput" class="w-full text-xs sm:text-sm px-3.5 py-2 rounded-lg border border-stone-300 focus:ring-2 focus:ring-rose-800 focus:outline-none bg-stone-50">
                    <option value="Bahasa Indonesia">Bahasa Indonesia</option>
                    <option value="Bahasa Inggris">Bahasa Inggris</option>
                  </select>
                </div>
                <div>
                  <label for="bookYearInput" class="block text-xs font-bold text-stone-700 uppercase mb-1">Tahun Terbit</label>
                  <input type="text" id="bookYearInput" maxlength="10" class="w-full text-xs sm:text-sm px-3.5 py-2 rounded-lg border border-stone-300 focus:ring-2 focus:ring-rose-800 focus:outline-none" placeholder="-" />
                </div>
                <div>
                  <label for="bookPriceInput" class="block text-xs font-bold text-stone-700 uppercase mb-1">Harga (Rp)</label>
                  <input type="number" id="bookPriceInput" min="0" step="1000" class="w-full text-xs sm:text-sm px-3.5 py-2 rounded-lg border border-stone-300 focus:ring-2 focus:ring-rose-800 focus:outline-none" placeholder="85000" />
                </div>
                <div>
                  <label for="bookStockInput" class="block text-xs font-bold text-stone-700 uppercase mb-1">Jumlah Stok</label>
                  <input type="number" id="bookStockInput" min="0" required class="w-full text-xs sm:text-sm px-3.5 py-2 rounded-lg border border-stone-300 focus:ring-2 focus:ring-rose-800 focus:outline-none" placeholder="5" />
                </div>
                <div class="col-span-2 sm:col-span-1">
                  <label for="bookShelfInput" class="block text-xs font-bold text-stone-700 uppercase mb-1">Nomor Rak</label>
                  <input type="text" id="bookShelfInput" required class="w-full text-xs sm:text-sm px-3.5 py-2 rounded-lg border border-stone-300 focus:ring-2 focus:ring-rose-800 focus:outline-none" placeholder="Rak M-01" />
                </div>
              </div>

              <div>
                <label for="bookSynopsisInput" class="block text-xs font-bold text-stone-700 uppercase mb-1">Sinopsis Ringkas</label>
                <textarea id="bookSynopsisInput" rows="2" class="w-full text-xs sm:text-sm px-3.5 py-2 rounded-lg border border-stone-300 focus:ring-2 focus:ring-rose-800 focus:outline-none" placeholder="Deskripsi buku..."></textarea>
              </div>

              <!-- Multi-Volume / Series Section -->
              <div class="border border-stone-200 rounded-xl p-3.5 bg-stone-50/80 space-y-3">
                <div class="flex items-center justify-between">
                  <label class="flex items-center gap-2 cursor-pointer select-none">
                    <input type="checkbox" id="bookHasVolumesCheckbox" class="w-4 h-4 rounded text-rose-900 focus:ring-rose-800 border-stone-300" />
                    <span class="text-xs font-bold text-stone-800 uppercase">Buku Ini Memiliki Seri / Multi-Volume</span>
                  </label>
                  <button type="button" id="addNewVolumeItemBtn" class="hidden px-2.5 py-1 rounded-lg bg-stone-800 hover:bg-stone-900 text-white text-[11px] font-semibold transition-colors cursor-pointer flex items-center gap-1 shadow-2xs">
                    <span>+ Tambah Volume</span>
                  </button>
                </div>

                <div id="bookVolumesSection" class="hidden space-y-3 pt-3 border-t border-stone-200">
                  <p class="text-xs text-stone-500">Tambahkan daftar volume atau nomor seri lanjutan untuk buku ini. Anda dapat mengunggah foto sampul khusus dan menulis sinopsis berbeda pada setiap volume.</p>
                  <div id="bookVolumesList" class="space-y-4 max-h-[520px] overflow-y-auto pr-1">
                    <!-- Dynamic volume item rows -->
                  </div>
                </div>
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
    return booksCardView.render(books);
  },
};
