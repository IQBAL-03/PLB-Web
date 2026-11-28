'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Clock } from 'lucide-react';

export default function LibraryProfileSection() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      title: 'PERPUSTAKAAN SEKOLAH',
      desc: 'Ruang temu gagasan dan pusat literasi yang nyaman bagi seluruh siswa dan guru. Menyediakan ribuan koleksi buku fisik berkualitas, ruang baca tenang ber-AC, serta suasana belajar yang inspiratif.',
      btnText: 'JELAJAHI KOLEKSI',
      btnHref: '#katalog',
      image: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=1200&q=80',
      alt: 'Gedung dan Ruang Baca Perpustakaan Sekolah',
      isScheduleSlide: false,
    },
    {
      title: 'JAM LAYANAN OPERASIONAL',
      desc: 'Layanan sirkulasi peminjaman, pengembalian buku fisik, dan konsultasi literasi akademik di Gedung Literasi Lt. 2 buka setiap hari sekolah dengan jadwal:',
      btnText: 'TATA CARA PINJAM',
      btnHref: '#panduan',
      image: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=1200&q=80',
      alt: 'Meja Sirkulasi Perpustakaan',
      isScheduleSlide: true,
    },
    {
      title: 'RUANG BACA & DISKUSI',
      desc: 'Dilengkapi area baca hening berpendingin udara, meja bundar diskusi kelompok, Wi-Fi sekolah, serta terminal pencarian katalog mandiri untuk kemudahan riset materi pelajaran.',
      btnText: 'LIHAT KATALOG',
      btnHref: '#katalog',
      image: 'https://images.unsplash.com/photo-1541123437800-1bb1317badc2?auto=format&fit=crop&w=1200&q=80',
      alt: 'Ruang Diskusi dan Belajar Mandiri',
      isScheduleSlide: false,
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
    <section id="profil" className="py-6 sm:py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Outer Card with Sleek Border & Proportional Radius */}
      <div className="relative rounded-3xl shadow-xl overflow-hidden border border-rose-900/30">
        <div className="grid grid-cols-1 md:grid-cols-12 min-h-[360px] md:h-[370px] lg:h-[380px]">
          
          {/* Left Column: Proportional Library Photo */}
          <div className="md:col-span-6 lg:col-span-7 relative bg-stone-900 overflow-hidden h-52 sm:h-60 md:h-full">
            <img
              src={active.image}
              alt={active.alt}
              className="absolute inset-0 w-full h-full object-cover transition-all duration-700 hover:scale-105"
            />
            {/* Subtle Gradient Shadow for depth */}
            <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-black/35 via-transparent to-transparent pointer-events-none" />
          </div>

          {/* Right Column: Balanced Deep Maroon Gradient without excessive empty space */}
          <div className="md:col-span-6 lg:col-span-5 bg-gradient-to-br from-rose-950 via-rose-900 to-amber-950 text-white p-6 sm:p-7 lg:p-8 flex flex-col justify-between relative overflow-hidden border-t md:border-t-0 md:border-l border-rose-800/40">
            
            {/* Ambient glow accent matching Card Sorotan */}
            <div className="absolute -top-16 -right-16 w-56 h-56 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

            {/* Content Top: Direct to Title & Info */}
            <div className="relative z-10 pt-1">
              <h2 className="font-serif text-xl sm:text-2xl lg:text-3xl font-black text-white tracking-tight uppercase leading-snug mb-2.5">
                {active.title}
              </h2>

              <p className={`text-xs sm:text-[13px] text-stone-200 leading-relaxed font-normal max-w-md ${
                active.isScheduleSlide ? 'mb-3' : 'mb-6 sm:mb-8'
              }`}>
                {active.desc}
              </p>

              {/* Exact Operating Hours Highlight (Khusus Slide 2) */}
              {active.isScheduleSlide && (
                <div className="bg-black/35 backdrop-blur-xs rounded-xl p-3 border border-amber-400/25 mb-4 max-w-md">
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-amber-300 uppercase tracking-wider mb-2">
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                    <span>Jadwal Buka Perpustakaan</span>
                  </div>
                  <div className="space-y-1.5 text-xs">
                    <div className="flex items-center justify-between text-stone-200 border-b border-white/10 pb-1.5">
                      <span className="font-medium text-stone-300">Senin – Kamis</span>
                      <span className="font-bold text-amber-200">07.00 – 15.00 WIB</span>
                    </div>
                    <div className="flex items-center justify-between text-stone-200 pt-0.5">
                      <span className="font-medium text-stone-300">Jumat</span>
                      <span className="font-bold text-amber-200">07.00 – 13.15 WIB</span>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <Link
                  href={active.btnHref}
                  className="inline-block border border-white/90 text-white hover:bg-white hover:text-rose-950 font-bold uppercase tracking-wider text-xs px-5 py-2.5 rounded-lg transition-colors duration-200 cursor-pointer shadow-xs"
                >
                  {active.btnText}
                </Link>
              </div>
            </div>

            {/* Content Bottom: Pagination Arrows & Indicators */}
            <div className="relative z-10 flex items-center gap-2.5 pt-4 mt-3 border-t border-rose-800/50">
              <button
                onClick={prevSlide}
                aria-label="Slide sebelumnya"
                className="w-8 h-8 rounded-full border border-white/40 text-white flex items-center justify-center hover:bg-white hover:text-rose-950 transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={nextSlide}
                aria-label="Slide berikutnya"
                className="w-8 h-8 rounded-full border border-white/40 text-white flex items-center justify-center hover:bg-white hover:text-rose-950 transition-colors cursor-pointer"
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