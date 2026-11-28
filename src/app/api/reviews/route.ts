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

// DELETE /api/reviews - Remove a review & recalculate book rating
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const body = await req.json().catch(() => ({}));
    const id = (searchParams.get('id') || body.id || '').trim();
    const bookId = (searchParams.get('bookId') || body.bookId || '').trim();
    const nis = (searchParams.get('nis') || body.nis || '').trim();

    if (!id && (!bookId || !nis)) {
      return NextResponse.json(
        { success: false, error: 'ID ulasan atau kombinasi bookId & nis wajib disertakan' },
        { status: 400 }
      );
    }

    let resolvedBookId = bookId;

    if (isTiDBConfigured()) {
      if (!resolvedBookId && id) {
        const rows = await queryTiDB<any>('SELECT book_id FROM book_reviews WHERE id = ? LIMIT 1', [id]);
        if (rows && rows.length > 0) {
          resolvedBookId = String(rows[0].book_id || '');
        }
      }

      if (id) {
        await queryTiDB('DELETE FROM book_reviews WHERE id = ?', [id]);
      } else {
        await queryTiDB('DELETE FROM book_reviews WHERE book_id = ? AND nis = ?', [bookId, nis]);
      }

      if (resolvedBookId) {
        const stats = await queryTiDB<any>(
          'SELECT COALESCE(ROUND(AVG(rating), 1), 0) as avg_rating, COUNT(*) as cnt FROM book_reviews WHERE book_id = ?',
          [resolvedBookId]
        );
        const cnt = stats && stats[0] ? Number(stats[0].cnt) || 0 : 0;
        const avg = cnt > 0 && stats && stats[0] ? Number(stats[0].avg_rating) || 0 : 0;
        await queryTiDB('UPDATE books SET rating = ?, reviews_count = ? WHERE id = ?', [
          avg,
          cnt,
          resolvedBookId,
        ]);
      }
    }

    if (!resolvedBookId && id) {
      const target = memoryDb.reviews.find((r) => r.id === id);
      if (target) resolvedBookId = target.bookId;
    }

    memoryDb.reviews = memoryDb.reviews.filter((r) => {
      if (id) return r.id !== id;
      return !(r.bookId === bookId && r.nis === nis);
    });

    if (resolvedBookId) {
      const book = memoryDb.books.find((b) => b.id === resolvedBookId);
      if (book) {
        const remaining = memoryDb.reviews.filter((r) => r.bookId === resolvedBookId);
        const avg =
          remaining.length > 0
            ? Number((remaining.reduce((sum, r) => sum + r.rating, 0) / remaining.length).toFixed(1))
            : 0;
        book.rating = avg;
        book.reviewsCount = remaining.length;
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Komentar berhasil dihapus dan rating buku diperbarui.',
    });
  } catch (error: any) {
    console.error('Error deleting review:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Gagal menghapus komentar' },
      { status: 500 }
    );
  }
}
