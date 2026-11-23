/**
 * @file Service layer for fetching, submitting, and removing book reviews from the TiDB backend.
 */

export const reviewsService = {
  async fetchReviews(bookId, nis = '') {
    try {
      const q = new URLSearchParams({
        book_id: bookId,
        t: String(Date.now()),
      });
      if (nis) {
        q.append('nis', nis);
      }
      const res = await fetch(`/api/reviews?${q.toString()}`, { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        if (data && data.ok) {
          return {
            reviews: Array.isArray(data.reviews) ? data.reviews : [],
            total: data.total || 0,
            averageRating: typeof data.average_rating === 'number' ? data.average_rating : 0.0,
            userReview: data.user_review || null,
          };
        }
      }
    } catch {
      // Offline fallback
    }
    return {
      reviews: [],
      total: 0,
      averageRating: 0.0,
      userReview: null,
    };
  },

  async submitReview({ bookId, nis, studentName, rating, reviewText }) {
    const res = await fetch('/api/reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        book_id: bookId,
        nis,
        student_name: studentName,
        rating: Number(rating),
        review_text: reviewText,
      }),
    });
    const data = await res.json();
    if (!res.ok || !data.ok) {
      throw new Error(data.message || data.error || 'Gagal menyimpan ulasan.');
    }
    return data.review;
  },

  async deleteReview({ bookId, nis }) {
    const res = await fetch('/api/reviews/delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        book_id: bookId,
        nis,
      }),
    });
    const data = await res.json();
    if (!res.ok || !data.ok) {
      throw new Error(data.message || data.error || 'Gagal menghapus ulasan.');
    }
    return true;
  },
};
