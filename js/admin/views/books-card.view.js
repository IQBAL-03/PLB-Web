/**
 * @file Card grid renderer for administrative book management.
 */

import { escapeHtml } from '../../utils/dom.js';

export const booksCardView = {
  render(books) {
    if (!books || books.length === 0) {
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

        const volumeCount = (b.volumes && b.volumes.length) || (b.hasVolumes ? 'Serial' : null);
        const volumeBadge = volumeCount
          ? `<div class="absolute bottom-2.5 right-2.5 bg-amber-900/90 text-amber-100 text-[10px] font-bold px-2 py-0.5 rounded shadow-xs">${typeof volumeCount === 'number' ? `${volumeCount} Vol` : volumeCount}</div>`
          : '';

        return `
          <div class="bg-white rounded-2xl border border-stone-200 shadow-xs hover:shadow-md transition-all overflow-hidden flex flex-col justify-between group">
            <div>
              <!-- Cover Image Area with Zoomable Modal Trigger -->
              <div class="aspect-[3/4] bg-stone-100/70 p-3 flex items-center justify-center relative overflow-hidden border-b border-stone-100 cursor-zoom-in group/cover"
                data-action="preview-cover"
                data-cover-src="${b.coverImg || 'img/placeholder-book.svg'}"
                data-book-title="${escapeHtml(b.title)} - Karya ${escapeHtml(b.author)}">
                <img src="${b.coverImg || 'img/placeholder-book.svg'}" alt="${escapeHtml(b.title)}"
                  class="max-h-full max-w-full w-auto h-auto object-contain rounded shadow-xs group-hover:scale-102 transition-transform duration-200"
                  onerror="this.src='img/placeholder-book.svg'"
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
                ${volumeBadge}
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

                ${
                  b.genres && b.genres.length > 0
                    ? `
                  <div class="flex flex-wrap gap-1 pt-0.5">
                    ${b.genres.slice(0, 3).map((g) => `<span class="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-stone-100 text-stone-700 border border-stone-200">${escapeHtml(g)}</span>`).join('')}
                    ${b.genres.length > 3 ? `<span class="text-[10px] font-semibold text-stone-400 self-center">+${b.genres.length - 3}</span>` : ''}
                  </div>
                `
                    : ''
                }

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
