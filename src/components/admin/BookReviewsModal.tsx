'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { BookReview } from '@/types/review';

interface BookReviewsModalProps {
  bookId: string | null;
  bookTitle: string;
  onClose: () => void;
  onMutated: () => Promise<void> | void;
}

export default function BookReviewsModal({
  bookId,
  bookTitle,
  onClose,
  onMutated,
}: BookReviewsModalProps) {
  const [reviews, setReviews] = useState<BookReview[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadReviews = useCallback(async () => {
    if (!bookId) return;
    setIsLoading(true);
    setErrorMsg('');
    try {
      const res = await fetch(`/api/reviews?bookId=${encodeURIComponent(bookId)}`, {
        cache: 'no-store',
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Gagal memuat komentar buku.');
      }
      setReviews(Array.isArray(json.data) ? json.data : []);
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal memuat komentar dari server.');
    } finally {
      setIsLoading(false);
    }
  }, [bookId]);

  useEffect(() => {
    if (!bookId) return;
    loadReviews();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [bookId, loadReviews, onClose]);

  if (!bookId) return null;

  const handleDelete = async (review: BookReview) => {
    const label = review.nis ? `${review.studentName} (NIS: ${review.nis})` : review.studentName;
    if (!window.confirm(`Hapus komentar dari ${label} pada buku ini?`)) return;

    setDeletingId(review.id);
    try {
      const res = await fetch(
        `/api/reviews?id=${encodeURIComponent(review.id)}&bookId=${encodeURIComponent(bookId)}`,
        {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: review.id, bookId, nis: review.nis }),
        }
      );
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Gagal menghapus komentar.');
      }
      await loadReviews();
      await onMutated();
    } catch (err: any) {
      alert(err.message || 'Gagal menghapus komentar.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="adminReviewsModalTitle"
    >
      <div className="fixed inset-0 bg-stone-950/60 backdrop-blur-xs" onClick={onClose} />
      <div className="relative z-10 bg-white rounded-2xl max-w-lg w-full p-5 sm:p-6 shadow-2xl border border-stone-200 space-y-4 max-h-[85vh] flex flex-col">
        <div className="flex items-start justify-between border-b border-stone-200 pb-3 gap-3">
          <div className="min-w-0">
            <h3
              id="adminReviewsModalTitle"
              className="font-serif text-lg font-bold text-stone-900"
            >
              Moderasi Komentar &amp; Ulasan
            </h3>
            <p className="text-xs text-stone-500 truncate">
              {bookId} &middot; {bookTitle}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup modal moderasi komentar"
            className="min-w-[36px] min-h-[36px] flex items-center justify-center rounded-lg text-stone-500 hover:text-stone-900 hover:bg-stone-100 text-xl font-bold leading-none cursor-pointer"
          >
            &times;
          </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 text-xs">
          {isLoading ? (
            <div className="space-y-2.5 py-2">
              {[1, 2, 3].map((n) => (
                <div
                  key={n}
                  className="h-20 rounded-xl bg-stone-100 animate-pulse border border-stone-200"
                />
              ))}
            </div>
          ) : errorMsg ? (
            <div className="py-6 px-4 text-center rounded-xl bg-rose-50 border border-rose-200 text-rose-800 space-y-2">
              <p className="font-semibold">{errorMsg}</p>
              <button
                type="button"
                onClick={loadReviews}
                className="px-3 py-1.5 rounded-lg bg-rose-900 text-white font-semibold cursor-pointer hover:bg-rose-950"
              >
                Coba Lagi
              </button>
            </div>
          ) : reviews.length === 0 ? (
            <div className="py-10 text-center text-stone-500 bg-stone-50 rounded-xl border border-dashed border-stone-200">
              Belum ada komentar atau ulasan pada buku ini.
            </div>
          ) : (
            reviews.map((rev) => (
              <div
                key={rev.id}
                className="p-3.5 rounded-xl border border-stone-200 bg-stone-50/70 flex items-start justify-between gap-3"
              >
                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold text-stone-900">{rev.studentName || 'Siswa'}</span>
                    {rev.nis && (
                      <span className="text-[10px] font-mono text-stone-600 bg-white px-1.5 py-0.5 rounded border border-stone-200">
                        NIS: {rev.nis}
                      </span>
                    )}
                    <span className="text-[10px] font-bold text-amber-900 bg-amber-100 px-1.5 py-0.5 rounded">
                      Rating {Number(rev.rating) || 0}/5
                    </span>
                  </div>
                  <p className="text-stone-700 leading-relaxed break-words">{rev.reviewText}</p>
                  {rev.createdAt && (
                    <p className="text-[10px] text-stone-400">
                      {String(rev.createdAt).slice(0, 16).replace('T', ' ')}
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  disabled={deletingId === rev.id}
                  onClick={() => handleDelete(rev)}
                  className="shrink-0 min-h-[34px] py-1 px-3 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-800 font-semibold text-[11px] border border-rose-200 transition-colors cursor-pointer disabled:opacity-50"
                >
                  {deletingId === rev.id ? '...' : 'Hapus'}
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
