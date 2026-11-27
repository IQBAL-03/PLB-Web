'use client';

import React from 'react';
import Link from 'next/link';
import { Clock, BookOpen, MapPin, Monitor, Wind, Users } from 'lucide-react';

export default function LibraryProfileSection() {
  return (
    <section id="profil" className="py-10 sm:py-14 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Container matching the rich maroon gradient of the Spotlight card */}
      <div className="bg-gradient-to-br from-rose-950 via-rose-900 to-amber-950 rounded-2xl sm:rounded-3xl p-6 sm:p-10 lg:p-12 text-white shadow-xl relative overflow-hidden border border-rose-800/40">
        {/* Ambient atmospheric glow */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-3xl relative z-10">
          <div className="inline-flex items-center gap-2 mb-3">
            <span className="text-[10px] sm:text-xs font-bold text-amber-300 bg-amber-400/20 border border-amber-300/30 px-3 py-1 rounded-full uppercase tracking-wider backdrop-blur-xs flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-amber-300" />
              <span>Layanan &amp; Profil Perpustakaan</span>
            </span>
            <span className="text-xs text-rose-200/80 font-medium">Gedung Literasi Lt. 2</span>
          </div>

          <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-extrabold mb-4 text-white tracking-tight leading-tight">
            Mulai Petualangan Literasimu di Perpustakaan Sekolah
          </h2>

          <p className="text-xs sm:text-sm text-stone-200 leading-relaxed mb-6">
            Kunjungi ruang baca perpustakaan di Gedung Literasi Lantai 2. Tersedia ruang baca ber-AC, koleksi referensi akademik PPLG lengkap, serial manga edukatif, serta fasilitas komputer pencarian buku mandiri (OPAC).
          </p>

          {/* Operational Hours and Loan Rules Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-stone-200 mb-6 py-4 border-y border-rose-800/60">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-white/10 border border-white/15 flex items-center justify-center shrink-0 text-amber-300">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <span className="text-rose-300 block font-medium">Jam Layanan Siswa</span>
                <span className="text-white font-bold text-sm">Senin - Jumat: 07.30 - 15.30 WIB</span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-white/10 border border-white/15 flex items-center justify-center shrink-0 text-amber-300">
                <BookOpen className="w-4 h-4" />
              </div>
              <div>
                <span className="text-rose-300 block font-medium">Batas Maksimal Pinjam</span>
                <span className="text-white font-bold text-sm">2 Buku / Siswa (7 Hari Kerja)</span>
              </div>
            </div>
          </div>

          {/* Clean Facility Badges */}
          <div className="flex flex-wrap items-center gap-2 mb-8 text-xs text-rose-200/90 font-medium">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/10">
              <Monitor className="w-3.5 h-3.5 text-amber-300" />
              <span>OPAC Kiosk Digital</span>
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/10">
              <Wind className="w-3.5 h-3.5 text-amber-300" />
              <span>Ruang Ber-AC PPLG</span>
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/10">
              <Users className="w-3.5 h-3.5 text-amber-300" />
              <span>Area Diskusi PLB</span>
            </span>
          </div>

          <Link
            href="#katalog"
            className="inline-block px-6 py-3 rounded-lg bg-rose-900 hover:bg-rose-950 text-white font-semibold text-xs sm:text-sm transition-colors shadow-md border border-rose-700/80 cursor-pointer focus:outline-none focus:ring-2 focus:ring-amber-400"
          >
            Jelajahi Koleksi Buku
          </Link>
        </div>
      </div>
    </section>
  );
}
