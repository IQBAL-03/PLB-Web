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

  // Combine book metadata with backend & local borrow statistics
  const candidates = books.map((b) => {
    const apiBorrows = Number(b.borrow_count ?? b.borrowCount ?? 0) || 0;
    const countById = borrowCounts[b.id] || 0;
    const countByTitle = borrowCounts[b.title] || 0;
    const totalBorrows = Math.max(apiBorrows, countById, countByTitle);
    return {
      book: b,
      borrowCount: totalBorrows,
      rating: Number(b.rating) || 0,
    };
  });

  // When rating is 0 across all books, do not show spotlight notification banner
  const sortedByRating = [...candidates].sort((a, b) => b.rating - a.rating);
  const highestRating = sortedByRating[0] ? sortedByRating[0].rating : 0;
  if (highestRating <= 0) {
    return null;
  }

  // 1. Filter by highest rating, 2. Tie-break by most borrowed, 3. Rotate weekly if still tied
  const topRated = sortedByRating.filter((item) => item.rating === highestRating);
  const highestBorrow = Math.max(...topRated.map((item) => item.borrowCount));
  const topCandidates = topRated.filter((item) => item.borrowCount === highestBorrow);
  const chosen = topCandidates[weekNo % topCandidates.length];

  const detailSuffix = chosen.borrowCount > 0
    ? `Dipinjam ${chosen.borrowCount} Kali`
    : 'Penilaian Pembaca Teratas';

  return {
    book: chosen.book,
    reasonBadge: 'Rating Tertinggi Pekan Ini',
    reasonDetail: `Skor ${chosen.rating.toFixed(1)} / 5 &middot; ${detailSuffix}`,
    weekLabel: `Pekan ke-${weekNo} &middot; Tahun ${year}`,
    source: 'rating',
  };
}
