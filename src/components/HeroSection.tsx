'use client';

import React from 'react';
import { Search, BookOpen } from 'lucide-react';

interface HeroSectionProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onCategoryFilter: (category: string) => void;
}

const quickFilters = [
  'Komik & Manga',
  'Fiksi & Sastra',
  'Sains & Teknologi',
  'Sejarah & Biografi',
  'Pengembangan Diri',
];

export default function HeroSection({
  searchQuery,
  onSearchChange,
  onCategoryFilter,
}: HeroSectionProps) {
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const catalogElem = document.getElementById('katalog');
    if (catalogElem) {
      catalogElem.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleBookClick = () => {
    const catalogElem = document.getElementById('katalog');
    if (catalogElem) {
      catalogElem.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="beranda" className="pt-8 sm:pt-12 pb-10 sm:pb-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl p-6 sm:p-10 lg:p-12 shadow-sm border border-stone-200/90 relative overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center relative z-10">
            
            {/* Left Column: Heading, OPAC Search & Fast Filters */}
            <div className="lg:col-span-7 flex flex-col">
              <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-extrabold text-stone-900 tracking-tight leading-tight mb-4">
                Temukan Cerita &amp; Ilmu Favoritmu
              </h1>

              <p className="text-stone-600 text-sm sm:text-base leading-relaxed mb-7 max-w-xl">
                Jelajahi ribuan koleksi sastra, sains, ensiklopedia akademik, dan serial manga edukatif. Pinjam buku dengan mudah dan cepat menggunakan Nomor Induk Siswa (NIS).
              </p>

              {/* Modern OPAC Search Bar */}
              <form
                onSubmit={handleSearchSubmit}
                className="bg-stone-50 hover:bg-white focus-within:bg-white border-2 border-stone-300 focus-within:border-rose-900 rounded-2xl p-2 sm:p-2.5 flex flex-col sm:flex-row items-stretch sm:items-center gap-2 shadow-xs transition-all mb-6"
              >
                <div className="flex items-center gap-3 flex-grow px-3 py-1">
                  <Search className="w-5 h-5 text-stone-400 shrink-0" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                    placeholder="Cari judul buku, pengarang, manga, atau topik..."
                    className="w-full text-xs sm:text-sm bg-transparent border-none text-stone-900 placeholder-stone-400 focus:outline-none font-medium"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => onSearchChange('')}
                      className="text-stone-400 hover:text-stone-700 text-xs font-bold px-1.5 py-0.5 rounded-full hover:bg-stone-200"
                    >
                      &times;
                    </button>
                  )}
                </div>
                <button
                  type="submit"
                  className="px-6 py-3 rounded-xl bg-rose-900 hover:bg-rose-950 text-white font-bold text-xs sm:text-sm transition-all shadow-md focus:outline-none focus:ring-2 focus:ring-rose-800 shrink-0 cursor-pointer flex items-center justify-center gap-2"
                >
                  <Search className="w-4 h-4 text-amber-300" />
                  <span>Cari Buku</span>
                </button>
              </form>

              {/* Quick Filter Pills */}
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="text-stone-500 font-semibold flex items-center gap-1">
                  <BookOpen className="w-3.5 h-3.5 text-stone-400" />
                  <span>Pilihan Cepat:</span>
                </span>
                {quickFilters.map((category) => (
                  <button
                    key={category}
                    type="button"
                    onClick={() => {
                      onCategoryFilter(category);
                      const catElem = document.getElementById('katalog');
                      if (catElem) catElem.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="px-3.5 py-1.5 rounded-full bg-stone-100 hover:bg-rose-900 hover:text-white text-stone-700 font-semibold transition-all cursor-pointer border border-stone-200/80 shadow-2xs hover:shadow-xs active:scale-95"
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            {/* Right Column: 3D Aesthetic Real Books Showcase */}
            <div className="lg:col-span-5 flex justify-center py-4 lg:py-0">
              <div className="relative w-full max-w-md flex items-center justify-center">

                {/* Left Book: Look Back (3D Tilted) */}
                <div
                  onClick={handleBookClick}
                  className="w-32 sm:w-40 aspect-[3/4] rounded-xl overflow-hidden shadow-xl transform -rotate-12 translate-y-4 hover:-translate-y-2 hover:-rotate-6 transition-all duration-300 border-2 border-white cursor-pointer relative bg-stone-900 group"
                  title="Klik untuk melihat di katalog: Look Back"
                >
                  <img
                    src="https://res.cloudinary.com/tla0kvyw/image/upload/v1795280539/sisperpus/covers/cz2u1ghpk1jwmw1f3raz.png"
                    alt="Sampul Look Back"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
                    <span className="text-[10px] font-bold text-white leading-tight">Look Back</span>
                  </div>
                </div>

                {/* Center Main Book: Seporsi Mie Ayam Sebelum Mati (Standing Tall & Prominent) */}
                <div
                  onClick={handleBookClick}
                  className="w-40 sm:w-48 aspect-[3/4] rounded-xl overflow-hidden shadow-2xl transform z-10 hover:-translate-y-3 hover:scale-105 transition-all duration-300 border-2 border-white -mx-6 relative bg-stone-900 cursor-pointer group"
                  title="Klik untuk melihat di katalog: Seporsi Mie Ayam Sebelum Mati"
                >
                  <img
                    src="https://res.cloudinary.com/tla0kvyw/image/upload/v1795421943/sisperpus/covers/inej87lksstjuvr8u97c.jpg"
                    alt="Sampul Seporsi Mie Ayam Sebelum Mati"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                  
                  {/* Rating badge on cover */}
                  <div className="absolute top-2 right-2 bg-stone-900/85 backdrop-blur-xs text-amber-400 font-bold text-[10px] px-2 py-0.5 rounded shadow-sm">
                    ★ 5.0
                  </div>

                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-2.5">
                    <span className="text-[10px] font-bold text-amber-300">Fiksi &amp; Sastra</span>
                    <span className="text-xs font-bold text-white leading-tight">Seporsi Mie Ayam...</span>
                  </div>
                </div>

                {/* Right Book: Girl's Last Tour (3D Tilted Right) */}
                <div
                  onClick={handleBookClick}
                  className="w-32 sm:w-40 aspect-[3/4] rounded-xl overflow-hidden shadow-xl transform rotate-12 translate-y-4 hover:-translate-y-2 hover:rotate-6 transition-all duration-300 border-2 border-white cursor-pointer relative bg-stone-900 group"
                  title="Klik untuk melihat di katalog: Girl's Last Tour"
                >
                  <img
                    src="https://res.cloudinary.com/tla0kvyw/image/upload/v1795618570/sisperpus/covers/q4zacx2i0axolglffjyu.avif"
                    alt="Sampul Girl's Last Tour"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
                    <span className="text-[10px] font-bold text-white leading-tight">Girl&apos;s Last Tour</span>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
