'use client';

import React from 'react';

interface HeroSectionProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onCategoryFilter: (category: string) => void;
}

const quickFilters = [
  'Komik & Manga',
  'Fiksi & Sastra',
  'Sains & Astronomi',
  'Sejarah Tokoh',
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

  return (
    <section id="beranda" className="pt-8 sm:pt-12 pb-12 sm:pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-10 lg:p-12 shadow-sm border border-stone-200 relative overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left Column: Heading, Search & Fast Filters */}
            <div className="lg:col-span-7 flex flex-col">
              <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-extrabold text-stone-900 tracking-tight leading-tight mb-4">
                Temukan Cerita &amp; Ilmu Favoritmu
              </h1>
              <p className="text-stone-600 text-sm sm:text-base leading-relaxed mb-8 max-w-xl">
                Jelajahi ribuan koleksi buku sastra, sains, ensiklopedia, dan buku pelajaran sekolah. Pinjam buku dengan mudah menggunakan Nomor Induk Siswa.
              </p>

              <form
                onSubmit={handleSearchSubmit}
                className="bg-stone-50 border border-stone-300 rounded-xl p-2 sm:p-2.5 flex flex-col sm:flex-row items-stretch sm:items-center gap-2 shadow-xs mb-6"
              >
                <div className="flex items-center gap-2.5 flex-grow px-3 py-1">
                  <svg
                    className="w-5 h-5 text-stone-400 shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                    placeholder="Cari judul buku, pengarang, atau topik..."
                    className="w-full text-xs sm:text-sm bg-transparent border-none text-stone-900 placeholder-stone-400 focus:outline-none"
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
                  className="px-5 py-2.5 rounded-lg bg-rose-900 hover:bg-rose-950 text-white font-semibold text-xs sm:text-sm transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-rose-800 shrink-0"
                >
                  Cari Buku
                </button>
              </form>

              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="text-stone-500 font-medium">Pilihan Cepat:</span>
                {quickFilters.map((category) => (
                  <button
                    key={category}
                    type="button"
                    onClick={() => {
                      onCategoryFilter(category);
                      const catElem = document.getElementById('katalog');
                      if (catElem) catElem.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="px-3 py-1 rounded-full bg-stone-100 hover:bg-rose-900 hover:text-white text-stone-700 font-medium transition-colors cursor-pointer focus:outline-none"
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            {/* Right Column: 3 Aesthetic Tilted Books */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="relative w-full max-w-sm flex items-center justify-center p-4">
                <div className="w-36 sm:w-44 aspect-[3/4] rounded-lg overflow-hidden shadow-md transform -rotate-6 translate-y-3 border-2 border-white relative">
                  <img
                    src="https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=400&q=80"
                    alt="Buku Novel Klasik"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="w-40 sm:w-48 aspect-[3/4] rounded-lg overflow-hidden shadow-2xl transform z-10 border-2 border-white -mx-8 relative">
                  <img
                    src="https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=400&q=80"
                    alt="Buku Sastra Pilihan"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="w-36 sm:w-44 aspect-[3/4] rounded-lg overflow-hidden shadow-md transform rotate-6 translate-y-3 border-2 border-white relative">
                  <img
                    src="https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&w=400&q=80"
                    alt="Buku Inspirasi Pelajar"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
