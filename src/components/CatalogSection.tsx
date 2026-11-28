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
          <div>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900">
              Katalog Buku Sekolah
            </h2>
            <p className="text-xs sm:text-sm text-stone-500 mt-1">
              Klik pada kartu buku untuk melihat detail lengkap, memberi rating, atau meminjam
            </p>
          </div>
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
            const reviewsCount = book.reviewsCount || 0;

            return (
              <div
                key={book.id}
                onClick={() => onSelectBook(book)}
                className="bg-white rounded-2xl p-2.5 sm:p-3 border border-stone-200/90 shadow-xs hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between group cursor-pointer"
                title={`Klik untuk melihat detail & ulasan "${book.title}"`}
              >
                <div>
                  {/* Cover image container */}
                  <div className="relative aspect-[3/4] bg-stone-100 rounded-xl overflow-hidden shadow-xs mb-3">
                    <img
                      src={book.coverImg || '/img/placeholder-book.svg'}
                      alt={`Sampul buku ${book.title}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />

                    {/* Magnifying Glass Zoom Icon on top-right */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onPreviewCover) {
                          onPreviewCover(book.coverImg || '/img/placeholder-book.svg', book.title);
                        }
                      }}
                      className="absolute top-2 right-2 w-7 h-7 rounded-full bg-stone-900/75 hover:bg-stone-950 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md backdrop-blur-xs cursor-pointer z-10"
                      title="Perbesar foto sampul"
                      aria-label="Perbesar foto sampul"
                    >
                      <svg className="w-3.5 h-3.5 text-amber-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
                      </svg>
                    </button>

                    {/* Badge Rekomendasi (Top-left, matching reference yellow circle/pill tag) */}
                    {book.badge ? (
                      <div className="absolute top-2 left-2 pointer-events-none z-10">
                        <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-400 text-stone-950 shadow-md">
                          {book.badge}
                        </span>
                      </div>
                    ) : null}

                    {/* Volume badge on cover if multi-volume */}
                    {book.hasVolumes && (
                      <div className="absolute bottom-2 left-2 pointer-events-none z-10">
                        <span className="inline-block text-[9px] font-extrabold px-1.5 py-0.5 rounded-md bg-stone-900/85 text-amber-300 shadow-md backdrop-blur-xs">
                          {book.volumes?.length || 0} Vol
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Book Info: Simplified & Clean like reference image */}
                  <div>
                    {/* Title */}
                    <h3
                      className="font-serif font-bold text-xs sm:text-sm text-stone-900 group-hover:text-rose-900 transition-colors line-clamp-1 leading-snug"
                      title={book.title}
                    >
                      {book.title}
                    </h3>

                    {/* 5-Star Rating Row (Directly under title, matching reference) */}
                    <div className="flex items-center gap-1.5 my-1">
                      <div className="flex items-center gap-0.5 text-amber-400">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <svg
                            key={star}
                            className={`w-3 h-3 ${
                              star <= Math.round(ratingVal)
                                ? 'fill-amber-400 text-amber-400'
                                : 'fill-stone-200 text-stone-200'
                            }`}
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                      <span className="text-[11px] font-bold text-stone-800">
                        {ratingScore}
                      </span>
                      {reviewsCount > 0 && (
                        <span className="text-[10px] text-stone-400">
                          ({reviewsCount})
                        </span>
                      )}
                    </div>

                    {/* Author, Year & Language Meta */}
                    <div className="text-[11px] text-stone-500 truncate mb-3">
                      <span>{book.author}</span>
                      <span className="mx-1">•</span>
                      <span>{book.year}</span>
                      <span className="mx-1">•</span>
                      <span className="text-stone-400">{book.language}</span>
                    </div>
                  </div>
                </div>

                {/* Footer action button & status */}
                <div className="pt-2.5 border-t border-stone-100 flex items-center justify-between gap-2 mt-auto">
                  <div className="flex flex-col">
                    <span className="text-[9px] text-stone-400 uppercase tracking-wider leading-tight">Status</span>
                    <span className="text-[11px] font-bold text-stone-700">
                      {isBorrowed ? 'Dipinjam' : `Tersedia: ${book.stock}`}
                    </span>
                  </div>

                  <button
                    type="button"
                    disabled={isBorrowed || isOutOfStock}
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectBook(book);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      isBorrowed || isOutOfStock
                        ? 'bg-stone-200 text-stone-500 cursor-not-allowed'
                        : 'bg-rose-900 hover:bg-rose-950 text-white shadow-xs cursor-pointer active:scale-95'
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
