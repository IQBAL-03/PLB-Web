/**
 * @file Unified book catalog aggregator for SISPERPUS.
 * Composes general literature and manga collections into active categories.
 */

import { generalBooks } from './general-books-data.js';
import { mangaBooks } from './manga-data.js';

export const categories = [
  'Semua Koleksi',
  'Komik & Manga',
  'Fiksi & Sastra',
  'Sains & Teknologi',
  'Sejarah & Biografi',
  'Pengembangan Diri',
  'Buku Referensi',
];

export const books = [
  ...mangaBooks,
  ...generalBooks,
];
