import { Book } from '@/types/book';

export interface ISOWeekInfo {
  year: number;
  weekNo: number;
}

export interface SpotlightResult {
  book: Book;
  reasonBadge: string;
  reasonDetail: string;
  weekLabel: string;
  source: 'rating' | 'borrow';
}

export function getISOWeekInfo(date: Date = new Date()): ISOWeekInfo {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return {
    year: d.getUTCFullYear(),
    weekNo,
  };
}

export function resolveWeeklySpotlight(books: Book[] = []): SpotlightResult | null {
  if (!books || books.length === 0) return null;

  const { year, weekNo } = getISOWeekInfo();

  const candidates = books.map((b) => ({
    book: b,
    borrowCount: Number(b.borrowCount || 0),
    rating: Number(b.rating || 0),
  }));

  const sortedByRating = [...candidates].sort((a, b) => b.rating - a.rating);
  const highestRating = sortedByRating[0]?.rating ?? 0;

  if (highestRating <= 0) {
    return null;
  }

  // 1. Highest rating
  const topRated = sortedByRating.filter((item) => item.rating === highestRating);
  // 2. Highest borrow count
  const highestBorrow = Math.max(...topRated.map((item) => item.borrowCount));
  const topCandidates = topRated.filter((item) => item.borrowCount === highestBorrow);
  // 3. Weekly deterministic rotation if tied
  const chosen = topCandidates[weekNo % topCandidates.length];

  const detailSuffix =
    chosen.borrowCount > 0
      ? `Dipinjam ${chosen.borrowCount} Kali`
      : 'Penilaian Pembaca Teratas';

  return {
    book: chosen.book,
    reasonBadge: 'RATING TERTINGGI PEKAN INI',
    reasonDetail: `Skor ${chosen.rating.toFixed(1)} / 5 • ${detailSuffix}`,
    weekLabel: `Pekan ke-${weekNo} • Tahun ${year}`,
    source: 'rating',
  };
}
