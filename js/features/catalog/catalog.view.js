/**
 * @file Catalog view rendering for books, category filter chips, and grid cards.
 */

import { escapeHtml } from '../../utils/dom.js';

export const catalogView = {
  renderCategoryPills(categories, activeCategory, container) {
    if (!container) return;
    container.innerHTML = categories
      .map((cat) => {
        const isActive = cat === activeCategory;
        const activeClass = isActive
          ? 'bg-rose-900 text-white font-semibold shadow-sm'
          : 'bg-stone-100 hover:bg-stone-200 text-stone-700 font-medium';
        return `
          <button type="button"
            class="px-4 py-2 rounded-full text-xs sm:text-sm transition-all cursor-pointer whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-rose-800 ${activeClass}"
            data-category="${escapeHtml(cat)}">
            ${escapeHtml(cat)}
          </button>
        `;
      })
      .join('');
  },

  renderBookCard(book, isBorrowed = false) {
    const isOutOfStock = book.stock <= 0 && !book.isComingSoon;
    const badgeColor = book.isComingSoon
      ? 'bg-amber-100 text-amber-900 border-amber-200'
      : isBorrowed
      ? 'bg-blue-100 text-blue-900 border-blue-200'
      : 'bg-rose-100 text-rose-950 border-rose-200';

    const stockText = book.isComingSoon
      ? `Rilis: ${book.arrivalDate || 'Segera'}`
      : isBorrowed
      ? 'Sedang Dipinjam'
      : `Tersedia: ${book.stock} Eks`;

    const buttonText = book.isComingSoon
      ? 'Detail Info'
      : isBorrowed
      ? 'Sudah Dipinjam'
      : 'Pinjam Buku';

    const buttonDisabled = isBorrowed || (isOutOfStock && !book.isComingSoon);
    const buttonClass = buttonDisabled
      ? 'bg-stone-200 text-stone-500 cursor-not-allowed'
      : 'bg-rose-900 hover:bg-rose-950 text-white shadow-sm cursor-pointer';

    return `
      <article class="bg-white rounded-xl border border-stone-200 overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 flex flex-col h-full group" data-book-id="${book.id}">
        <div class="relative aspect-[3/4] bg-stone-100 overflow-hidden">
          <img src="${book.coverImg}" alt="Sampul buku ${escapeHtml(book.title)}"
            class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy" />
          <div class="absolute top-2.5 left-2.5">
            <span class="inline-block text-[11px] font-semibold px-2 py-0.5 rounded-full border ${badgeColor}">
              ${escapeHtml(book.badge || book.category)}
            </span>
          </div>
          <div class="absolute bottom-2.5 right-2.5 bg-stone-900/80 backdrop-blur-xs text-white text-[11px] px-2 py-0.5 rounded-md font-medium">
            Skor ${book.rating}
          </div>
        </div>

        <div class="p-4 flex flex-col flex-grow justify-between">
          <div>
            <p class="text-[11px] font-medium text-rose-800 uppercase tracking-wider mb-1">${escapeHtml(book.category)}</p>
            <h3 class="font-serif font-bold text-stone-900 text-sm sm:text-base leading-snug line-clamp-1 mb-1 group-hover:text-rose-900 transition-colors">
              ${escapeHtml(book.title)}
            </h3>
            <p class="text-xs text-stone-500 line-clamp-1 mb-2 font-medium">${escapeHtml(book.author)}</p>
            <p class="text-[11px] text-stone-600 line-clamp-2 mb-3 leading-relaxed">${escapeHtml(book.synopsis)}</p>
          </div>

          <div class="pt-3 border-t border-stone-100 flex items-center justify-between gap-2 mt-auto">
            <div class="text-[11px] font-medium text-stone-600">
              <span class="block text-stone-400 text-[10px]">Status</span>
              ${stockText}
            </div>
            <button type="button"
              class="px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors focus:ring-2 focus:ring-rose-800 focus:outline-none ${buttonClass}"
              data-action="open-detail"
              data-book-id="${book.id}"
              ${buttonDisabled ? 'disabled' : ''}>
              ${buttonText}
            </button>
          </div>
        </div>
      </article>
    `;
  },

  renderGrid(container, bookList, isBorrowedFn) {
    if (!container) return;
    if (bookList.length === 0) {
      container.innerHTML = `
        <div class="col-span-full py-16 text-center bg-white rounded-xl border border-dashed border-stone-300 p-8">
          <p class="font-serif text-lg font-bold text-stone-800 mb-1">Buku Tidak Ditemukan</p>
          <p class="text-xs sm:text-sm text-stone-500 max-w-md mx-auto">
            Tidak ada koleksi buku yang cocok dengan kata kunci atau kategori yang Anda pilih. Silakan ganti filter atau periksa ejaan.
          </p>
        </div>
      `;
      return;
    }

    container.innerHTML = bookList
      .map((b) => this.renderBookCard(b, isBorrowedFn ? isBorrowedFn(b.id) : false))
      .join('');
  },
};
