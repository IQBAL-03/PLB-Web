'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function LibraryProfileSection() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      title: 'PERPUSTAKAAN SEKOLAH',
      desc: 'Ruang temu gagasan dan pusat literasi yang nyaman bagi seluruh siswa dan bapak/ibu guru. Menyediakan ribuan koleksi buku fisik berkualitas, ruang baca tenang ber-AC, serta suasana belajar yang inspiratif.',
      btnText: 'JELAJAHI KOLEKSI',
      btnHref: '#katalog',
      image: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=1200&q=80',
      alt: 'Gedung dan Ruang Baca Perpustakaan Sekolah',
    },
    {
      title: 'JAM LAYANAN OPERASIONAL',
      desc: 'Buka setiap hari sekolah, Senin – Kamis pukul 07.30 – 15.30 WIB dan Jumat pukul 07.30 – 14.30 WIB. Pustakawan siap melayani peminjaman buku mandiri serta konsultasi literasi akademik.',
      btnText: 'TATA CARA PINJAM',
      btnHref: '#panduan',
      image: 'https://images.unsplash.com/photo-1568667256549-094345857637?auto=format&fit=crop&w=1200&q=80',
      alt: 'Meja Sirkulasi Perpustakaan',
    },
    {
      title: 'RUANG BACA & DISKUSI',
      desc: 'Dilengkapi area baca hening berpendingin udara, meja bundar diskusi kelompok, Wi-Fi sekolah, serta terminal pencarian katalog mandiri untuk kemudahan penelusuran bahan pustaka.',
      btnText: 'LIHAT KATALOG',
      btnHref: '#katalog',
      image: 'https://images.unsplash.com/photo-1541123437800-1bb1317badc2?auto=format&fit=crop&w=1200&q=80',
      alt: 'Ruang Diskusi dan Belajar Mandiri',
    },
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const active = slides[currentSlide];

  return (
    <section id="profil" className="py-8 sm:py-14 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Outer Card with Matching Border & Radius */}
      <div className="relative rounded-3xl shadow-xl overflow-hidden border border-rose-900/30">
        <div className="grid grid-cols-1 md:grid-cols-12 min-h-[460px] lg:min-h-[480px]">
          
          {/* Left Column: High-Impact Library Photo (Clean, No Overlay Text) */}
          <div className="md:col-span-7 relative bg-stone-900 overflow-hidden">
            <img
              src={active.image}
              alt={active.alt}
              className="w-full h-64 md:h-full object-cover transition-all duration-700 hover:scale-105"
            />
            {/* Subtle Gradient Shadow for depth */}
            <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-black/30 via-transparent to-transparent pointer-events-none" />
          </div>

          {/* Right Column: Matched Deep Maroon-Amber Gradient (Selaras dengan Card Sorotan) */}
          <div className="md:col-span-5 bg-gradient-to-br from-rose-950 via-rose-900 to-amber-950 text-white p-7 sm:p-10 lg:p-12 flex flex-col justify-between relative overflow-hidden border-t md:border-t-0 md:border-l border-rose-800/40">
            
            {/* Ambient glow accent matching Card Sorotan */}
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

            {/* Content Top: Direct to Title (No badge, no kicker) */}
            <div className="relative z-10 pt-2">
              <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight uppercase leading-tight mb-4">
                {active.title}
              </h2>

              <p className="text-xs sm:text-sm text-stone-200 leading-relaxed font-normal mb-8 max-w-md">
                {active.desc}
              </p>

              <div>
                <Link
                  href={active.btnHref}
                  className="inline-block border-2 border-white/90 text-white hover:bg-white hover:text-rose-950 font-bold uppercase tracking-wider text-xs px-6 py-3 rounded-lg transition-colors duration-200 cursor-pointer shadow-sm"
                >
                  {active.btnText}
                </Link>
              </div>
            </div>

            {/* Content Bottom: Pagination Arrows & Indicators */}
            <div className="relative z-10 flex items-center gap-3 pt-8 mt-4 border-t border-rose-800/50">
              <button
                onClick={prevSlide}
                aria-label="Slide sebelumnya"
                className="w-9 h-9 rounded-full border border-white/40 text-white flex items-center justify-center hover:bg-white hover:text-rose-950 transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={nextSlide}
                aria-label="Slide berikutnya"
                className="w-9 h-9 rounded-full border border-white/40 text-white flex items-center justify-center hover:bg-white hover:text-rose-950 transition-colors cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-1.5 ml-3">
                {slides.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentSlide(i)}
                    aria-label={`Buka slide ${i + 1}`}
                    className={`h-1.5 rounded-full transition-all cursor-pointer ${
                      i === currentSlide ? 'w-6 bg-amber-400' : 'w-2 bg-white/40 hover:bg-white/70'
                    }`}
                  />
                ))}
              </div>

              <span className="text-[11px] text-stone-300 ml-auto font-medium">
                0{currentSlide + 1} / 0{slides.length}
              </span>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
}