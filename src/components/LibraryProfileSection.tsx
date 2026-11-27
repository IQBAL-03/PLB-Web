'use client';

import React from 'react';
import Link from 'next/link';

export default function LibraryProfileSection() {
  return (
    <section id="profil" className="py-10 sm:py-14 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Container with the exact dark stone-900 styling from the original service banner */}
      <div className="bg-stone-900 text-white rounded-2xl sm:rounded-3xl p-6 sm:p-10 lg:p-12 border border-stone-800 shadow-xl relative overflow-hidden">
        <div className="max-w-2xl relative z-10">
          <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block mb-2">
            Layanan Perpustakaan
          </span>

          <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 text-white leading-tight">
            Mulai Petualangan Literasimu di Perpustakaan Sekolah
          </h2>

          <p className="text-xs sm:text-sm text-stone-300 leading-relaxed mb-6">
            Kunjungi ruang baca perpustakaan di Gedung Literasi Lantai 2. Tersedia ruang baca ber-AC, koleksi referensi akademik lengkap, serta fasilitas komputer pencarian buku.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-stone-300 mb-6 py-4 border-y border-stone-800">
            <div>
              <span className="text-stone-400 block font-medium">Jam Layanan Siswa</span>
              <span className="text-white font-bold text-sm">Senin - Jumat: 07.30 - 15.30 WIB</span>
            </div>
            <div>
              <span className="text-stone-400 block font-medium">Batas Maksimal Pinjam</span>
              <span className="text-white font-bold text-sm">2 Buku / Siswa (7 Hari Kerja)</span>
            </div>
          </div>

          <Link
            href="#katalog"
            className="inline-block px-6 py-3 rounded-lg bg-rose-900 hover:bg-rose-950 text-white font-semibold text-xs sm:text-sm transition-colors shadow-lg cursor-pointer"
          >
            Jelajahi Koleksi Buku
          </Link>
        </div>
      </div>
    </section>
  );
}
