/**
 * @file Spotlight section view displaying the weekly featured book showcase.
 */

import { $, escapeHtml } from '../../utils/dom.js';
import { state } from '../../core/state.js';
import { eventBus } from '../../core/events.js';
import { resolveWeeklySpotlight } from './spotlight.service.js';

export const spotlightView = {
  container: null,

  init(container) {
    this.container = container || $('#spotlightContainer');
    this.render(this.container);

    eventBus.on('books:synced', () => this.render(this.container));
    eventBus.on('book:borrowed', () => this.render(this.container));
  },

  render(container) {
    const target = container || this.container || $('#spotlightContainer');
    if (!target) return;
    this.container = target;

    const spotlightInfo = resolveWeeklySpotlight(state.books);
    if (!spotlightInfo || !spotlightInfo.book) return;

    const spotlightBook = spotlightInfo.book;
    const isBorrowed = state.isBookBorrowed(spotlightBook.id);
    const borrowBtnText = isBorrowed ? 'Buku Sedang Anda Pinjam' : 'Pinjam Buku Ini Sekarang';
    const borrowBtnClass = isBorrowed
      ? 'bg-stone-300 text-stone-600 cursor-not-allowed'
      : 'bg-rose-900 hover:bg-rose-950 text-white shadow-md cursor-pointer';

    const hasCover = Boolean(spotlightBook.coverImg && spotlightBook.coverImg.trim());
    const ratingVal = typeof spotlightBook.rating === 'number' ? spotlightBook.rating : (Number(spotlightBook.rating) || 0.0);
    const ratingScore = ratingVal.toFixed(1);
    const reviewsCount = spotlightBook.reviews_count || spotlightBook.reviewsCount || 0;

    target.innerHTML = `
      <div class="bg-gradient-to-br from-rose-950 via-rose-900 to-amber-950 rounded-2xl p-6 sm:p-8 md:p-10 text-white shadow-xl relative overflow-hidden border border-rose-800/40">
        <div class="absolute -top-24 -right-24 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div class="grid grid-cols-1 md:grid-cols-12 gap-8 items-center relative z-10">
          ${
            hasCover
              ? `
          <div class="md:col-span-5 lg:col-span-4 flex justify-center">
            <div class="relative group cursor-pointer cursor-zoom-in" data-action="preview-spotlight-cover" data-book-id="${spotlightBook.id}" title="Klik untuk memperbesar kover">
              <div class="w-48 sm:w-56 aspect-[3/4] rounded-lg overflow-hidden shadow-2xl border-2 border-amber-200/30 transform group-hover:-translate-y-1 transition-transform duration-300">
                <img src="${escapeHtml(spotlightBook.coverImg)}" alt="${escapeHtml(spotlightBook.title)}" class="w-full h-full object-cover" />
              </div>
              ${
                ratingVal > 0
                  ? `
              <div class="absolute -bottom-3 -right-3 bg-amber-500 text-slate-950 text-xs font-bold px-3 py-1 rounded-full shadow-md uppercase tracking-wider flex items-center gap-1">
                <svg class="w-3.5 h-3.5 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                <span>${ratingScore}</span>
              </div>
              `
                  : ''
              }
            </div>
          </div>
          `
              : ''
          }

          <div class="${hasCover ? 'md:col-span-7 lg:col-span-8' : 'md:col-span-12'} flex flex-col justify-center">
            <div class="flex flex-wrap items-center gap-2 mb-3">
              <span class="bg-amber-400/20 text-amber-200 border border-amber-400/30 text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider">
                ${escapeHtml(spotlightInfo.reasonBadge)}
              </span>
              <span class="text-rose-200 text-xs">${spotlightInfo.weekLabel}</span>
              <span class="text-stone-400 text-xs">&bull;</span>
              <span class="text-rose-200 text-xs">${escapeHtml(spotlightBook.category)}</span>
            </div>

            <h2 class="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight mb-2 text-white">
              ${escapeHtml(spotlightBook.title)}
            </h2>
            <p class="text-amber-200/90 text-sm sm:text-base font-medium mb-1">
              Karya ${escapeHtml(spotlightBook.author)} &middot; Tahun ${spotlightBook.year}
            </p>
            <p class="text-amber-300/80 text-xs font-medium mb-4">
              ${spotlightInfo.reasonDetail}
            </p>

            <p class="text-rose-100/90 text-xs sm:text-sm leading-relaxed mb-6 max-w-2xl">
              ${escapeHtml(spotlightBook.synopsis)}
            </p>

            <div class="grid grid-cols-3 gap-4 py-4 mb-6 border-y border-rose-800/60 text-xs">
              <div>
                <span class="text-rose-300 block text-[11px]">Ketersediaan</span>
                <span class="font-bold text-white text-sm">${spotlightBook.stock} Eksemplar</span>
              </div>
              <div>
                <span class="text-rose-300 block text-[11px]">Lokasi Fisik</span>
                <span class="font-bold text-white text-sm">${escapeHtml(spotlightBook.shelf)}</span>
              </div>
              <div>
                <span class="text-rose-300 block text-[11px]">Ulasan Pembaca</span>
                <span class="font-bold text-white text-sm">${reviewsCount} Siswa</span>
              </div>
            </div>

            <div class="flex flex-wrap items-center gap-3">
              <button type="button"
                class="px-5 py-2.5 rounded-lg text-sm font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-amber-400 ${borrowBtnClass}"
                data-action="open-detail"
                data-book-id="${spotlightBook.id}">
                ${borrowBtnText}
              </button>
              <button type="button"
                class="px-4 py-2.5 rounded-lg text-sm font-medium text-white hover:bg-white/10 transition-colors border border-white/20 focus:outline-none focus:ring-2 focus:ring-white/40 cursor-pointer"
                data-action="open-detail"
                data-book-id="${spotlightBook.id}">
                Lihat Sinopsis Lengkap
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  },
};
