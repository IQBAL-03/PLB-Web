/**
 * @file View rendering for book ratings, interactive star selector, and student review cards.
 */

import { escapeHtml } from '../../utils/dom.js';

export const reviewsView = {
  renderStars(rating, sizeClass = 'w-4 h-4') {
    const roundRating = Math.round(Number(rating) || 0);
    let starsHtml = '';
    for (let i = 1; i <= 5; i++) {
      const isFilled = roundRating > 0 && i <= roundRating;
      const color = isFilled ? 'text-amber-500' : 'text-stone-300';
      starsHtml += `
        <svg class="${sizeClass} ${color} fill-current shrink-0" viewBox="0 0 20 20" aria-hidden="true">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
        </svg>
      `;
    }
    return `<div class="flex items-center gap-0.5">${starsHtml}</div>`;
  },

  renderInteractiveStarSelector(selectedVal = 5) {
    let buttons = '';
    for (let i = 1; i <= 5; i++) {
      const isFilled = i <= selectedVal;
      const color = isFilled ? 'text-amber-500' : 'text-stone-300';
      buttons += `
        <button type="button" class="star-rating-btn p-1 hover:scale-110 transition-transform cursor-pointer focus:outline-none"
          data-star-val="${i}" aria-label="Beri ${i} bintang">
          <svg class="w-6 h-6 ${color} fill-current pointer-events-none" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
          </svg>
        </button>
      `;
    }
    return `
      <div class="flex items-center gap-1">
        ${buttons}
        <input type="hidden" id="reviewRatingInput" value="${selectedVal}" />
        <span id="starRatingLabel" class="text-xs font-bold text-amber-700 ml-2">${selectedVal} dari 5 Bintang</span>
      </div>
    `;
  },

  renderForm(book, userReview = null, initialNis = '') {
    const isEdit = Boolean(userReview);
    const ratingVal = userReview ? userReview.rating : 5;
    const reviewText = userReview ? userReview.review_text : '';
    const nisVal = userReview ? userReview.nis : initialNis;
    const nameVal = userReview ? userReview.student_name : '';

    return `
      <div class="bg-stone-50/80 rounded-xl p-4 border border-stone-200">
        <div class="flex items-center justify-between pb-2 mb-3 border-b border-stone-200">
          <h4 class="font-serif font-bold text-xs uppercase tracking-wider text-stone-800">
            ${isEdit ? 'Ubah Penilaian & Ulasan Anda' : 'Tulis Penilaian & Ulasan Siswa'}
          </h4>
          ${
            isEdit
              ? '<span class="text-[10px] font-bold text-amber-800 bg-amber-100 border border-amber-200 px-2 py-0.5 rounded-full">Mode Edit Ulasan</span>'
              : ''
          }
        </div>

        <form id="reviewSubmissionForm" class="space-y-3">
          <input type="hidden" id="reviewBookId" value="${escapeHtml(book.id)}" />

          <!-- Star Rating Picker -->
          <div>
            <label class="block text-xs font-semibold text-stone-700 mb-1">Skor Bintang Anda</label>
            ${this.renderInteractiveStarSelector(ratingVal)}
          </div>

          <!-- NIS & Student Name -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div>
              <label for="reviewNisInput" class="block text-xs font-semibold text-stone-700 mb-1">Nomor Induk Siswa (NIS)</label>
              <input type="text" id="reviewNisInput" required
                value="${escapeHtml(nisVal)}"
                placeholder="Contoh: 20261001"
                class="w-full text-xs sm:text-sm px-3 py-2 rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-rose-800 bg-white" />
            </div>
            <div>
              <label for="reviewNameInput" class="block text-xs font-semibold text-stone-700 mb-1">Nama Siswa</label>
              <input type="text" id="reviewNameInput"
                value="${escapeHtml(nameVal)}"
                placeholder="Nama otomatis terisi"
                class="w-full text-xs sm:text-sm px-3 py-2 rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-rose-800 bg-white" />
            </div>
          </div>

          <!-- Review Comment Textarea -->
          <div>
            <label for="reviewCommentInput" class="block text-xs font-semibold text-stone-700 mb-1">Komentar / Ulasan Buku</label>
            <textarea id="reviewCommentInput" rows="3" required
              placeholder="Tuliskan pendapat atau kesan Anda mengenai buku ini (minimal 3 karakter)..."
              class="w-full text-xs sm:text-sm px-3 py-2 rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-rose-800 bg-white">${escapeHtml(reviewText)}</textarea>
          </div>

          <!-- Action Buttons -->
          <div class="flex items-center justify-between pt-1">
            <div id="reviewStatusMsg" class="text-xs font-medium text-stone-500"></div>
            <div class="flex items-center gap-2 ml-auto">
              ${
                isEdit
                  ? `
                <button type="button" id="btnDeleteMyReview"
                  class="px-3.5 py-2 rounded-lg text-xs font-semibold text-rose-800 hover:bg-rose-100 border border-rose-300 transition-colors cursor-pointer">
                  Hapus Ulasan
                </button>
              `
                  : ''
              }
              <button type="submit" id="btnSubmitReview"
                class="px-4 py-2 rounded-lg text-xs font-bold text-white bg-rose-900 hover:bg-rose-950 transition-colors shadow-xs cursor-pointer">
                ${isEdit ? 'Simpan Perubahan Ulasan' : 'Kirim Ulasan & Rating'}
              </button>
            </div>
          </div>
        </form>
      </div>
    `;
  },

  renderReviewsList(reviews = []) {
    if (!reviews || reviews.length === 0) {
      return `
        <div class="py-8 text-center bg-stone-50/60 rounded-xl border border-dashed border-stone-300 p-4">
          <p class="font-serif font-bold text-stone-700 text-sm mb-1">Belum Ada Ulasan untuk Buku Ini</p>
          <p class="text-xs text-stone-500 max-w-sm mx-auto">
            Jadilah siswa pertama yang memberikan penilaian bintang dan ulasan untuk koleksi bacaan ini.
          </p>
        </div>
      `;
    }

    const items = reviews
      .map((r) => {
        const initial = r.student_name ? r.student_name.charAt(0).toUpperCase() : 'S';
        const formattedDate = r.created_at ? r.created_at.replace('T', ' ').substring(0, 16) : 'Baru saja';

        return `
          <div class="p-3 bg-white rounded-xl border border-stone-200 text-xs shadow-2xs space-y-1.5">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <div class="w-7 h-7 rounded-full bg-rose-100 text-rose-900 font-bold flex items-center justify-center text-xs">
                  ${escapeHtml(initial)}
                </div>
                <div>
                  <span class="font-bold text-stone-900 block leading-tight">${escapeHtml(r.student_name)}</span>
                  <span class="text-[10px] text-stone-400 font-mono">NIS ${escapeHtml(r.nis)}</span>
                </div>
              </div>
              <div class="text-right">
                ${this.renderStars(r.rating, 'w-3 h-3')}
                <span class="text-[10px] text-stone-400 block mt-0.5">${escapeHtml(formattedDate)}</span>
              </div>
            </div>
            <p class="text-stone-700 text-xs leading-relaxed pl-9 whitespace-pre-wrap">${escapeHtml(r.review_text)}</p>
          </div>
        `;
      })
      .join('');

    return `<div class="space-y-2.5 max-h-64 overflow-y-auto pr-1">${items}</div>`;
  },

  renderSection(book, reviewsData = { reviews: [], total: 0, averageRating: 0.0, userReview: null }, initialNis = '') {
    const avgVal = typeof reviewsData.averageRating === 'number' ? reviewsData.averageRating : (typeof book.rating === 'number' ? book.rating : 0.0);
    const avgScore = avgVal.toFixed(1);
    const totalCount = reviewsData.total ?? book.reviews_count ?? book.reviewsCount ?? 0;

    return `
      <div class="mt-6 border-t border-stone-200 pt-5 space-y-4" id="bookReviewsSectionContainer">
        <!-- Review Header & Summary -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-100">
          <div>
            <h3 class="font-serif font-bold text-base sm:text-lg text-stone-900">Ulasan &amp; Rating Pembaca</h3>
            <p class="text-xs text-stone-500">Penilaian langsung dari siswa perpustakaan</p>
          </div>
          <div class="flex items-center gap-3 bg-amber-50/80 border border-amber-200/90 rounded-xl px-3.5 py-2 shrink-0">
            <div class="font-serif font-black text-2xl text-amber-900">${avgScore}</div>
            <div>
              ${this.renderStars(avgScore, 'w-3.5 h-3.5')}
              <span class="text-[11px] font-semibold text-amber-900/90 block mt-0.5">
                ${totalCount > 0 ? `Berdasarkan ${totalCount} ulasan siswa` : 'Belum ada penilaian siswa'}
              </span>
            </div>
          </div>
        </div>

        <!-- Submission Form Area -->
        <div id="reviewFormContainer">
          ${this.renderForm(book, reviewsData.userReview, initialNis)}
        </div>

        <!-- Reviews List Area -->
        <div class="space-y-2 pt-2">
          <div class="flex items-center justify-between">
            <h4 class="font-serif font-bold text-xs uppercase tracking-wider text-stone-700">
              Daftar Ulasan Siswa (${totalCount})
            </h4>
          </div>
          <div id="reviewsListContainer">
            ${this.renderReviewsList(reviewsData.reviews)}
          </div>
        </div>
      </div>
    `;
  },
};
