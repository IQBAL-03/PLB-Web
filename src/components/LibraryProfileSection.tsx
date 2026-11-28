'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function LibraryProfileSection() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      kicker: 'GEDUNG LITERASI LT. 2',
      title: 'PERPUSTAKAAN SEKOLAH',
      desc: 'Ruang temu gagasan dan pusat literasi yang nyaman bagi seluruh siswa dan bapak/ibu guru. Menyediakan ribuan koleksi buku fisik berkualitas, ruang baca tenang ber-AC, serta suasana belajar yang inspiratif.',
      btnText: 'JELAJAHI KOLEKSI',
      btnHref: '#katalog',
      badge: 'Profil',
      badgeColor: 'bg-amber-600',
      image: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=1200&q=80',
      alt: 'Gedung dan Ruang Baca Perpustakaan Sekolah',
    },
    {
      kicker: 'LAYANAN SIRKULASI & WAKTU',
      title: 'JAM LAYANAN OPERASIONAL',
      desc: 'Buka setiap hari sekolah, Senin – Kamis pukul 07.30 – 15.30 WIB dan Jumat pukul 07.30 – 14.30 WIB. Pustakawan siap melayani peminjaman buku mandiri serta konsultasi literasi akademik.',
      btnText: 'TATA CARA PINJAM',
      btnHref: '#panduan',
      badge: 'Layanan',
      badgeColor: 'bg-rose-700',
      image: 'https://images.unsplash.com/photo-1568667256549-094345857637?auto=format&fit=crop&w=1200&q=80',
      alt: 'Meja Sirkulasi Perpustakaan',
    },
    {
      kicker: 'FASILITAS & ZONA RUANG',
      title: 'RUANG BACA & DISKUSI',
      desc: 'Dilengkapi area baca hening berpendingin udara, meja bundar diskusi kelompok, Wi-Fi sekolah, serta terminal pencarian katalog mandiri untuk kemudahan penelusuran bahan pustaka.',
      btnText: 'LIHAT KATALOG',
      btnHref: '#katalog',
      badge: 'Fasilitas',
      badgeColor: 'bg-emerald-700',
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
      {/* Outer Card with Side Accent Bar matching the reference style */}
      <div className="relative bg-white rounded-3xl shadow-xl overflow-hidden border border-stone-200">
        
        {/* Left vertical decorative accent bar */}
        <div className="absolute left-0 top-0 bottom-0 w-3 bg-rose-900 z-20 hidden md:block" />

        <div className="grid grid-cols-1 md:grid-cols-12 min-h-[460px] lg:min-h-[500px]">
          
          {/* Left Column: High-Impact Library Photo */}
          <div className="md:col-span-7 relative bg-stone-100 overflow-hidden md:pl-3">
            {/* Background Image with smooth transition */}
            <img
              src={active.image}
              alt={active.alt}
              className="w-full h-64 md:h-full object-cover transition-all duration-700 hover:scale-105"
            />
            {/* Subtle Gradient Shadow */}
            <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-black/40 via-transparent to-transparent pointer-events-none" />
            
            {/* Location Tag Overlay */}
            <div className="absolute bottom-4 left-6 md:left-9 bg-stone-900/80 backdrop-blur-xs text-white text-[11px] font-medium px-3 py-1.5 rounded-full border border-white/20 shadow-md">
              📍 Gedung Literasi Lt. 2 • Perpustakaan Sekolah
            </div>
          </div>

          {/* Right Column: Deep Solid Maroon Card */}
          <div className="md:col-span-5 bg-rose-900 text-white p-7 sm:p-10 lg:p-12 flex flex-col justify-between relative overflow-hidden">
            
            {/* Top-Right Circular Sticker Badge */}
            <div className="absolute top-6 right-6">
              <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full ${active.badgeColor} text-white flex items-center justify-center font-serif italic text-sm sm:text-base font-bold shadow-lg transform -rotate-12 select-none border-2 border-white/40`}>
                {active.badge}
              </div>
            </div>

            {/* Content Top */}
            <div className="pr-12 md:pr-14">
              <span className="text-xs font-bold tracking-widest uppercase text-amber-300 block mb-3">
                {active.kicker}
              </span>

              <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight uppercase leading-tight mb-4">
                {active.title}
              </h2>

              <p className="text-xs sm:text-sm text-stone-100 leading-relaxed font-normal mb-8 max-w-md opacity-95">
                {active.desc}
              </p>

              <div>
                <Link
                  href={active.btnHref}
                  className="inline-block border-2 border-white text-white hover:bg-white hover:text-rose-950 font-bold uppercase tracking-wider text-xs px-6 py-3 transition-colors duration-200 cursor-pointer shadow-xs"
                >
                  {active.btnText}
                </Link>
              </div>
            </div>

            {/* Content Bottom: Pagination Arrows & Indicators */}
            <div className="flex items-center gap-3 pt-8 mt-4 border-t border-rose-800/80">
              <button
                onClick={prevSlide}
                aria-label="Slide sebelumnya"
                className="w-9 h-9 rounded-full border border-white/60 text-white flex items-center justify-center hover:bg-white hover:text-rose-900 transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={nextSlide}
                aria-label="Slide berikutnya"
                className="w-9 h-9 rounded-full border border-white/60 text-white flex items-center justify-center hover:bg-white hover:text-rose-900 transition-colors cursor-pointer"
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
                      i === currentSlide ? 'w-6 bg-white' : 'w-2 bg-white/40 hover:bg-white/70'
                    }`}
                  />
                ))}
              </div>

              <span className="text-[11px] text-white/70 ml-auto font-medium">
                0{currentSlide + 1} / 0{slides.length}
              </span>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
}