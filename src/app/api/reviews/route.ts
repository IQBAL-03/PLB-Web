import { NextRequest, NextResponse } from 'next/server';
import { isTiDBConfigured, queryTiDB, memoryDb } from '@/lib/db';
import { BookReview } from '@/types/review';

// GET /api/reviews?bookId=... - Get reviews for a book
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const bookId = searchParams.get('bookId');

    if (isTiDBConfigured()) {
      let sql = 'SELECT * FROM book_reviews';
      const params: any[] = [];
      if (bookId) {
        sql += ' WHERE book_id = ?';
        params.push(bookId);
      }
      sql += ' ORDER BY created_at DESC';

      const rows = await queryTiDB<any>(sql, params);
      if (rows) {
        const reviews: BookReview[] = rows.map((r) => ({
          id: r.id,
          bookId: r.book_id,
          nis: r.nis,
          studentName: r.student_name,
          rating: Number(r.rating) || 5,
          reviewText: r.review_text,
          createdAt: r.created_at,
        }));
        return NextResponse.json({ success: true, source: 'tidb', data: reviews });
      }
    }

    // In-memory fallback
    let filtered = memoryDb.reviews;
    if (bookId) {
      filtered = filtered.filter((r) => r.bookId === bookId);
    }

    return NextResponse.json({ success: true, source: 'memory', data: filtered });
  } catch (error: any) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Gagal memuat ulasan' },
      { status: 500 }
    );
  }
}

// POST /api/reviews - Submit a review & auto-recalculate book rating
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { bookId, nis = '', studentName, rating = 5, reviewText } = body;

    if (!bookId || !studentName || !reviewText) {
      return NextResponse.json(
        { success: false, error: 'Data ulasan tidak lengkap (bookId, nama, dan ulasan wajib diisi)' },
        { status: 400 }
      );
    }

    const reviewId = `rev-${Date.now()}`;
    const cleanRating = Math.min(5, Math.max(1, Number(rating) || 5));
    const nowIso = new Date().toISOString();

    const newReview: BookReview = {
      id: reviewId,
      bookId,
      nis,
      studentName,
      rating: cleanRating,
      reviewText,
      createdAt: nowIso,
    };

    if (isTiDBConfigured()) {
      // Insert review
      await queryTiDB(
        `INSERT INTO book_reviews (id, book_id, nis, student_name, rating, review_text)
         VALUES (?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE rating = VALUES(rating), review_text = VALUES(review_text), updated_at = NOW()`,
        [newReview.id, newReview.bookId, newReview.nis || `guest-${Date.now()}`, newReview.studentName, newReview.rating, newReview.reviewText]
      );

      // Recalculate book average rating
      const stats = await queryTiDB<any>(
        'SELECT AVG(rating) as avg_rating, COUNT(*) as cnt FROM book_reviews WHERE book_id = ?',
        [bookId]
      );

      if (stats && stats.length > 0) {
        const avg = Number(stats[0].avg_rating) || cleanRating;
        const count = Number(stats[0].cnt) || 1;
        await queryTiDB(
          'UPDATE books SET rating = ?, reviews_count = ? WHERE id = ?',
          [Number(avg.toFixed(1)), count, bookId]
        );
      }
    }

    // In-memory sync
    memoryDb.reviews.unshift(newReview);
    const book = memoryDb.books.find((b) => b.id === bookId);
    if (book) {
      const allForBook = memoryDb.reviews.filter((r) => r.bookId === bookId);
      const avg = allForBook.reduce((acc, r) => acc + r.rating, 0) / allForBook.length;
      book.rating = Number(avg.toFixed(1));
      book.reviewsCount = allForBook.length;
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Ulasan dan penilaian berhasil dikirim!',
        data: newReview,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error submitting review:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Gagal mengirimkan ulasan' },
      { status: 500 }
    );
  }
}
