'use client';

import React from 'react';
import { Book } from '@/types/book';
import { SpotlightResult } from '@/lib/spotlight';

interface SpotlightSectionProps {
  spotlight: SpotlightResult | null;
  onSelectBook: (book: Book) => void;
  onPreviewCover?: (coverImg: string, title: string) => void;
}

export default function SpotlightSection({
  spotlight,
  onSelectBook,
  onPreviewCover,
}: SpotlightSectionProps) {
  if (!spotlight || !spotlight.book) {
    return null;
  }

  const { book, reasonBadge, reasonDetail, weekLabel } = spotlight;
  const ratingScore = (Number(book.rating) || 0).toFixed(1);
  const reviewsCount = book.reviewsCount || 0;

  return (
    <section id="sorotan" className="py-10 sm:py-14 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="bg-gradient-to-br from-rose-950 via-rose-900 to-amber-950 rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-10 text-white shadow-xl relative overflow-hidden border border-rose-800/40">
        {/* Glow ambient background circle */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center relative z-10">
          {/* Cover book */}
          <div className="md:col-span-5 lg:col-span-4 flex justify-center">
            <div
              onClick={() => onPreviewCover && onPreviewCover(book.coverImg, book.title)}
              className="relative group cursor-pointer cursor-zoom-in"
              title="Klik untuk memperbesar sampul buku"
            >
              <div className="w-48 sm:w-56 aspect-[3/4] rounded-xl overflow-hidden shadow-2xl border-2 border-amber-200/30 transform group-hover:-translate-y-1 transition-transform duration-300 relative bg-stone-900">
                <img
                  src={book.coverImg || '/img/placeholder-book.svg'}
                  alt={`Sampul buku ${book.title}`}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-stone-950/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="bg-stone-900/85 text-white text-xs font-semibold px-3 py-1.5 rounded-full shadow-md backdrop-blur-xs flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5 text-amber-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
                    </svg>
                    <span>Perbesar Kover</span>
                  </span>
                </div>
              </div>

              {/* Gold star rating badge on bottom-right of cover */}
              <div className="absolute -bottom-3 -right-3 bg-amber-500 text-stone-950 px-3 py-1 rounded-full font-extrabold text-xs shadow-lg flex items-center gap-1 border-2 border-white">
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span>{ratingScore}</span>
              </div>
            </div>
          </div>

          {/* Book details */}
          <div className="md:col-span-7 lg:col-span-8 flex flex-col justify-center">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="bg-amber-500/20 text-amber-200 border border-amber-200/30 text-[10px] sm:text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider backdrop-blur-xs">
                {reasonBadge}
              </span>
              <span className="text-rose-200 text-xs font-medium">{weekLabel} • {book.category}</span>
            </div>

            <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight mb-2 text-white">
              {book.title}
            </h2>

            <p className="text-amber-100 font-medium text-sm sm:text-base mb-1">
              Karya {book.author} &bull; Tahun {book.year}
            </p>

            <div className="text-amber-300 text-xs sm:text-sm font-semibold mb-4">
              {reasonDetail}
            </div>

            <p className="text-stone-200 text-xs sm:text-sm leading-relaxed mb-6 max-w-2xl line-clamp-4 whitespace-pre-line">
              {book.synopsis}
            </p>

            <div className="grid grid-cols-3 gap-4 py-4 mb-6 border-y border-rose-800/60 text-xs">
              <div>
                <span className="text-rose-300 block font-medium">Ketersediaan</span>
                <span className="font-bold text-white text-sm">{book.stock} Eksemplar</span>
              </div>
              <div>
                <span className="text-rose-300 block font-medium">Lokasi Fisik</span>
                <span className="font-bold text-white text-sm">{book.shelf || 'Rak Utama'}</span>
              </div>
              <div>
                <span className="text-rose-300 block font-medium">Ulasan Pembaca</span>
                <span className="font-bold text-white text-sm">{reviewsCount} Siswa</span>
              </div>
            </div>

            <div>
              <button
                type="button"
                onClick={() => onSelectBook(book)}
                className="px-6 py-3 rounded-lg bg-rose-900 hover:bg-rose-950 text-white font-semibold text-sm transition-colors shadow-md cursor-pointer border border-rose-700 focus:outline-none focus:ring-2 focus:ring-amber-400"
              >
                Pinjam Buku Ini Sekarang
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
