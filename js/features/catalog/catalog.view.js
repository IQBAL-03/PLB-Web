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

    const hasCover = Boolean(book.coverImg && book.coverImg.trim());
    const coverSection = hasCover
      ? `
        <div class="relative aspect-[3/4] bg-stone-100 overflow-hidden cursor-zoom-in group/cover">
          <img src="${escapeHtml(book.coverImg)}" alt="Sampul buku ${escapeHtml(book.title)}"
            class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy" />
          <div class="absolute inset-0 bg-stone-950/30 opacity-0 group-hover/cover:opacity-100 transition-opacity flex items-center justify-center">
            <span class="bg-stone-900/85 text-white text-[11px] font-semibold px-2.5 py-1 rounded-full shadow-md backdrop-blur-xs flex items-center gap-1">
              <svg class="w-3.5 h-3.5 text-amber-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7"/></svg>
              <span>Perbesar Foto</span>
            </span>
          </div>
          <div class="absolute top-2.5 left-2.5">
            <span class="inline-block text-[11px] font-semibold px-2 py-0.5 rounded-full border ${badgeColor}">
              ${escapeHtml(book.badge || book.category)}
            </span>
          </div>
          <div class="absolute bottom-2.5 right-2.5 bg-stone-900/80 backdrop-blur-xs text-white text-[11px] px-2 py-0.5 rounded-md font-medium">
            Skor ${book.rating}
          </div>
        </div>
      `
      : `
        <div class="relative aspect-[3/4] bg-stone-50 overflow-hidden flex flex-col items-center justify-center p-4 border-b border-stone-100">
          <div class="w-12 h-16 rounded border-2 border-dashed border-stone-300 flex items-center justify-center text-stone-400 mb-2">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>
          </div>
          <span class="text-[11px] font-medium text-stone-400 text-center">Belum Ada Sampul</span>
          <div class="absolute top-2.5 left-2.5">
            <span class="inline-block text-[11px] font-semibold px-2 py-0.5 rounded-full border ${badgeColor}">
              ${escapeHtml(book.badge || book.category)}
            </span>
          </div>
          <div class="absolute bottom-2.5 right-2.5 bg-stone-900/80 backdrop-blur-xs text-white text-[11px] px-2 py-0.5 rounded-md font-medium">
            Skor ${book.rating}
          </div>
        </div>
      `;

    return `
      <article class="bg-white rounded-xl border border-stone-200 overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 flex flex-col h-full group cursor-pointer" data-book-id="${book.id}">
        ${coverSection}

        <div class="p-4 flex flex-col flex-grow justify-between">
          <div>
            <div class="flex items-center gap-1.5 mb-1.5 flex-wrap">
              <span class="text-[10px] font-bold text-rose-800 uppercase tracking-wider">${escapeHtml(book.category)}</span>
              <span class="text-stone-300 text-[10px]">&bull;</span>
              <span class="text-[10px] font-semibold ${book.language === 'Bahasa Inggris' ? 'text-indigo-900 bg-indigo-50 border border-indigo-200' : 'text-stone-700 bg-stone-100 border border-stone-200'} px-1.5 py-0.5 rounded">
                ${escapeHtml(book.language || 'Bahasa Indonesia')}
              </span>
              ${book.hasVolumes ? '<span class="text-[10px] font-semibold text-amber-900 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded">7 Vol</span>' : ''}
            </div>
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
