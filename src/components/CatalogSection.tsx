'use client';

import React from 'react';
import { Book, BookCategory } from '@/types/book';

interface CatalogSectionProps {
  books: Book[];
  categories: BookCategory[];
  activeCategory: string;
  searchQuery: string;
  borrowedBookIds: Set<string>;
  onSelectCategory: (category: BookCategory) => void;
  onSelectBook: (book: Book) => void;
  onPreviewCover?: (coverImg: string, title: string) => void;
}

export default function CatalogSection({
  books,
  categories,
  activeCategory,
  searchQuery,
  borrowedBookIds,
  onSelectCategory,
  onSelectBook,
  onPreviewCover,
}: CatalogSectionProps) {
  // Filter books by category and search query
  const filteredBooks = books.filter((book) => {
    const matchesCategory =
      activeCategory === 'Semua Koleksi' || book.category === activeCategory;

    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      book.title.toLowerCase().includes(q) ||
      book.author.toLowerCase().includes(q) ||
      (book.genres && book.genres.some((g) => g.toLowerCase().includes(q))) ||
      book.synopsis.toLowerCase().includes(q);

    return matchesCategory && matchesSearch;
  });

  return (
    <section id="katalog" className="py-12 sm:py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header section */}
      <div className="mb-8">
        <span className="text-xs font-bold text-rose-900 uppercase tracking-wider block mb-1">
          Koleksi Terpadu
        </span>
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-stone-200">
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900">
            Katalog Buku Sekolah
          </h2>
          <div className="flex items-center gap-2">
            {searchQuery && (
              <span className="text-xs font-medium text-stone-500">
                Pencarian: &ldquo;{searchQuery}&rdquo;
              </span>
            )}
            <span className="text-xs sm:text-sm font-semibold text-stone-600 bg-stone-100 px-3 py-1 rounded-full self-start sm:self-auto">
              {activeCategory} ({filteredBooks.length} Buku)
            </span>
          </div>
        </div>
      </div>

      {/* Category filter pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-6 scrollbar-none">
        {categories.map((cat) => {
          const isActive = cat === activeCategory;
          const activeClass = isActive
            ? 'bg-rose-900 text-white font-semibold shadow-sm'
            : 'bg-stone-100 hover:bg-stone-200 text-stone-700 font-medium';
          return (
            <button
              key={cat}
              type="button"
              onClick={() => onSelectCategory(cat)}
              className={`px-4 py-2 rounded-full text-xs sm:text-sm transition-all cursor-pointer whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-rose-800 ${activeClass}`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Books grid */}
      {filteredBooks.length === 0 ? (
        <div className="min-h-[300px] flex flex-col items-center justify-center p-8 bg-white rounded-2xl border border-stone-200 text-center">
          <div className="w-12 h-12 rounded-full bg-stone-100 flex items-center justify-center text-stone-400 mb-3">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <h3 className="font-serif font-bold text-base text-stone-800 mb-1">
            Tidak ada buku ditemukan
          </h3>
          <p className="text-xs text-stone-500 max-w-sm">
            Coba gunakan kata kunci lain atau pilih kategori &ldquo;Semua Koleksi&rdquo; untuk melihat seluruh katalog.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 sm:gap-5 min-h-[520px]">
          {filteredBooks.map((book) => {
            const isBorrowed = borrowedBookIds.has(book.id);
            const isOutOfStock = book.stock <= 0;
            const ratingVal = typeof book.rating === 'number' ? book.rating : Number(book.rating) || 0;
            const ratingScore = ratingVal.toFixed(1);

            return (
              <div
                key={book.id}
                className="bg-white rounded-xl border border-stone-200 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <div>
                  {/* Cover image container */}
                  <div
                    onClick={() => onPreviewCover && onPreviewCover(book.coverImg, book.title)}
                    className="relative aspect-[3/4] bg-stone-100 overflow-hidden cursor-zoom-in group/cover"
                    title="Klik untuk memperbesar foto sampul"
                  >
                    <img
                      src={book.coverImg || '/img/placeholder-book.svg'}
                      alt={`Sampul buku ${book.title}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 pointer-events-none"
                      loading="lazy"
                    />

                    {/* Zoom overlay on hover */}
                    <div className="absolute inset-0 bg-stone-950/25 opacity-0 group-hover/cover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                      <span className="bg-stone-900/85 text-white text-[11px] font-semibold px-2.5 py-1 rounded-full shadow-md backdrop-blur-xs flex items-center gap-1">
                        <svg className="w-3.5 h-3.5 text-amber-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
                        </svg>
                        <span>Perbesar</span>
                      </span>
                    </div>

                    {/* Badge top-left */}
                    <div className="absolute top-2.5 left-2.5 pointer-events-none">
                      <span className="inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full border bg-rose-100 text-rose-950 border-rose-200">
                        {book.badge || book.category}
                      </span>
                    </div>

                    {/* Star rating overlay bottom-right */}
                    <div className="absolute bottom-2.5 right-2.5 bg-stone-900/85 backdrop-blur-xs text-white text-[11px] px-2 py-0.5 rounded-md font-semibold flex items-center gap-1 pointer-events-none">
                      <svg
                        className={`w-3 h-3 ${ratingVal > 0 ? 'text-amber-400' : 'text-stone-400'} fill-current`}
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      <span>{ratingScore}</span>
                    </div>
                  </div>

                  {/* Book Card Info */}
                  <div className="p-3 sm:p-4">
                    <div className="flex items-center gap-1 text-[10px] text-stone-500 mb-1">
                      <span>{book.language}</span>
                      {book.hasVolumes && (
                        <span className="bg-amber-100 text-amber-900 px-1.5 py-0.2 rounded font-semibold">
                          {book.volumes?.length || 0} Vol
                        </span>
                      )}
                    </div>

                    <h3
                      onClick={() => onSelectBook(book)}
                      className="font-serif font-bold text-xs sm:text-sm text-stone-900 group-hover:text-rose-900 transition-colors line-clamp-1 cursor-pointer"
                      title={book.title}
                    >
                      {book.title}
                    </h3>

                    <p className="text-[11px] text-stone-500 mb-2 truncate">
                      {book.author} &bull; {book.year}
                    </p>

                    <div className="flex items-center gap-1 mb-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <svg
                          key={star}
                          className={`w-3 h-3 ${
                            ratingVal >= star ? 'text-amber-500' : 'text-stone-300'
                          } fill-current shrink-0`}
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                      <span className="text-[10px] text-stone-500 ml-1">
                        ({book.reviewsCount || 0})
                      </span>
                    </div>

                    <p className="text-[11px] text-stone-600 line-clamp-2 leading-relaxed mb-3">
                      {book.synopsis}
                    </p>
                  </div>
                </div>

                {/* Footer action button */}
                <div className="p-3 sm:p-4 pt-0 border-t border-stone-100 flex items-center justify-between gap-2 mt-auto">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-stone-400">Status</span>
                    <span className="text-[11px] font-semibold text-stone-700">
                      {isBorrowed ? 'Dipinjam' : `Tersedia: ${book.stock}`}
                    </span>
                  </div>

                  <button
                    type="button"
                    disabled={isBorrowed || isOutOfStock}
                    onClick={() => onSelectBook(book)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                      isBorrowed || isOutOfStock
                        ? 'bg-stone-200 text-stone-500 cursor-not-allowed'
                        : 'bg-rose-900 hover:bg-rose-950 text-white shadow-xs cursor-pointer'
                    }`}
                  >
                    {isBorrowed ? 'Sudah Dipinjam' : isOutOfStock ? 'Habis' : 'Pinjam'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
