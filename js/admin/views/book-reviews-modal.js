/**
 * @file Admin modal for viewing and deleting reader reviews on a specific book.
 */

import { escapeHtml } from '../../utils/dom.js';
import { showToast } from '../../utils/toast.js';

export const bookReviewsModal = {
  async open(bookId, bookTitle, onMutated) {
    const existing = document.getElementById('bookReviewsAdminModal');
    if (existing) existing.remove();

    const wrapper = document.createElement('div');
    wrapper.id = 'bookReviewsAdminModal';
    wrapper.className = 'fixed inset-0 z-50 flex items-center justify-center p-4';
    wrapper.innerHTML = `
      <div class="fixed inset-0 bg-stone-950/60 backdrop-blur-xs" data-close-reviews="1"></div>
      <div class="relative z-10 bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-stone-200 space-y-4 max-h-[85vh] flex flex-col">
        <div class="flex items-start justify-between border-b border-stone-200 pb-3">
          <div>
            <h3 class="font-serif text-lg font-bold text-stone-900">Moderasi Komentar &amp; Ulasan</h3>
            <p class="text-xs text-stone-500">${escapeHtml(bookId)} &middot; ${escapeHtml(bookTitle || '')}</p>
          </div>
          <button type="button" data-close-reviews="1" class="text-stone-400 hover:text-stone-800 text-xl font-bold leading-none cursor-pointer">&times;</button>
        </div>
        <div id="adminReviewsListContainer" class="flex-1 overflow-y-auto space-y-2.5 pr-1 text-xs">
          <div class="py-8 text-center text-stone-400">Memuat daftar komentar...</div>
        </div>
      </div>
    `;
    document.body.appendChild(wrapper);

    const closeModal = () => wrapper.remove();
    wrapper.addEventListener('click', (e) => {
      if (e.target.dataset.closeReviews) closeModal();
    });

    const loadList = async () => {
      const container = document.getElementById('adminReviewsListContainer');
      if (!container) return;
      try {
        const res = await fetch(`/api/reviews?book_id=${encodeURIComponent(bookId)}&t=${Date.now()}`, { cache: 'no-store' });
        const data = await res.json();
        const reviews = (data && data.ok && Array.isArray(data.reviews)) ? data.reviews : [];
        if (reviews.length === 0) {
          container.innerHTML = '<div class="py-8 text-center text-stone-500 bg-stone-50 rounded-xl border border-dashed border-stone-200">Belum ada komentar atau ulasan pada buku ini.</div>';
          return;
        }
        container.innerHTML = reviews.map((r) => `
          <div class="p-3 rounded-xl border border-stone-200 bg-stone-50/70 flex items-start justify-between gap-3">
            <div class="space-y-1 min-w-0">
              <div class="flex flex-wrap items-center gap-2">
                <span class="font-bold text-stone-900">${escapeHtml(r.student_name || 'Siswa')}</span>
                <span class="text-[10px] font-mono text-stone-500 bg-white px-1.5 py-0.5 rounded border border-stone-200">NIS: ${escapeHtml(r.nis)}</span>
                <span class="text-[10px] font-bold text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded">Rating ${Number(r.rating) || 0}/5</span>
              </div>
              <p class="text-stone-700 leading-relaxed break-words">${escapeHtml(r.review_text || '')}</p>
              <p class="text-[10px] text-stone-400">${escapeHtml(String(r.created_at || '').slice(0, 16))}</p>
            </div>
            <button type="button" data-delete-review-nis="${escapeHtml(r.nis)}"
              class="shrink-0 py-1 px-2.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-800 font-semibold text-[11px] border border-rose-200 transition-colors cursor-pointer">
              Hapus
            </button>
          </div>
        `).join('');

        container.querySelectorAll('[data-delete-review-nis]').forEach((btn) => {
          btn.addEventListener('click', async () => {
            const nis = btn.dataset.deleteReviewNis;
            if (!window.confirm(`Hapus komentar dari NIS ${nis} pada buku ini?`)) return;
            btn.disabled = true;
            btn.textContent = '...';
            try {
              const delRes = await fetch('/api/reviews/delete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ book_id: bookId, nis }),
              });
              const delData = await delRes.json().catch(() => ({}));
              if (!delRes.ok || !delData.ok) {
                throw new Error(delData.error || 'Gagal menghapus komentar.');
              }
              showToast('Komentar berhasil dihapus.', 'success');
              await loadList();
              if (onMutated) await onMutated();
            } catch (err) {
              showToast(err.message || 'Gagal menghapus komentar.', 'error');
              btn.disabled = false;
              btn.textContent = 'Hapus';
            }
          });
        });
      } catch {
        container.innerHTML = '<div class="py-8 text-center text-rose-700">Gagal memuat komentar dari server.</div>';
      }
    };

    await loadList();
  },
};
