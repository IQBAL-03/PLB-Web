/**
 * @file Service for computing the dynamic weekly spotlight book based on borrows and rating.
 */

/**
 * Calculates current ISO week number and year.
 * @param {Date} [date] Target date.
 * @returns {{ year: number, weekNo: number }}
 */
export function getISOWeekInfo(date = new Date()) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
  return {
    year: d.getUTCFullYear(),
    weekNo,
  };
}

/**
 * Aggregates borrow transaction counts per book from local circulation storage.
 * @returns {Record<string, number>}
 */
export function getBorrowCountsByBook() {
  const counts = {};
  try {
    const raw = localStorage.getItem('sisperpus_admin_transactions');
    if (raw) {
      const txs = JSON.parse(raw);
      if (Array.isArray(txs)) {
        txs.forEach((tx) => {
          if (tx.bookId) {
            counts[tx.bookId] = (counts[tx.bookId] || 0) + 1;
          }
          if (tx.bookTitle) {
            counts[tx.bookTitle] = (counts[tx.bookTitle] || 0) + 1;
          }
        });
      }
    }
  } catch {
    // Fail silently on private storage restrictions
  }
  return counts;
}

/**
 * Resolves the spotlight book for the current week.
 * Priority: Most borrowed book -> Fallback to highest rating if new -> Rotates every week.
 * @param {Array<object>} books
 * @returns {{ book: object, reasonBadge: string, reasonDetail: string, weekLabel: string, source: string } | null}
 */
export function resolveWeeklySpotlight(books = []) {
  if (!books || books.length === 0) return null;

  const { year, weekNo } = getISOWeekInfo();
  const borrowCounts = getBorrowCountsByBook();

  // Combine book metadata with local borrow statistics
  const candidates = books.map((b) => {
    const countById = borrowCounts[b.id] || 0;
    const countByTitle = borrowCounts[b.title] || 0;
    const totalBorrows = Math.max(countById, countByTitle);
    return {
      book: b,
      borrowCount: totalBorrows,
      rating: Number(b.rating) || 0,
    };
  });

  // 1. If any book has recorded borrow transactions, pick the one with most borrows
  const borrowedCandidates = candidates.filter((item) => item.borrowCount > 0);
  if (borrowedCandidates.length > 0) {
    borrowedCandidates.sort((a, b) => {
      if (b.borrowCount !== a.borrowCount) {
        return b.borrowCount - a.borrowCount;
      }
      return b.rating - a.rating;
    });

    // The highest borrow count wins unconditionally
    const maxBorrows = borrowedCandidates[0].borrowCount;
    const topBorrowed = borrowedCandidates.filter((item) => item.borrowCount === maxBorrows);

    // If there is a tie for the top borrow count, rotate weekly among the tied books
    const chosenIndex = weekNo % topBorrowed.length;
    const chosen = topBorrowed[chosenIndex];

    return {
      book: chosen.book,
      reasonBadge: 'Terbanyak Dipinjam Pekan Ini',
      reasonDetail: `Dipinjam ${chosen.borrowCount} kali oleh siswa`,
      weekLabel: `Pekan ke-${weekNo} &middot; Tahun ${year}`,
      source: 'borrow_count',
    };
  }

  // 2. Fallback when fresh / no borrows: pick strictly by highest rating
  const sortedByRating = [...candidates].sort((a, b) => b.rating - a.rating);
  const highestRating = sortedByRating[0].rating;

  // Find all books tied for the highest rating
  const topRated = sortedByRating.filter((item) => item.rating === highestRating);

  // If tied for highest rating, rotate weekly among them; otherwise the highest rating wins
  const chosenIndex = weekNo % topRated.length;
  const chosen = topRated[chosenIndex];

  return {
    book: chosen.book,
    reasonBadge: 'Rating Tertinggi Pekan Ini',
    reasonDetail: `Skor ${chosen.book.rating} &middot; Koleksi Pilihan Kurator`,
    weekLabel: `Pekan ke-${weekNo} &middot; Tahun ${year}`,
    source: 'rating',
  };
}
