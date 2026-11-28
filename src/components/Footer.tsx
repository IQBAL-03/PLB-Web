'use client';

import React from 'react';
import Link from 'next/link';
import { MapPin, Mail, Clock, ArrowRight, BookOpen } from 'lucide-react';

export default function Footer() {
  return (
    <footer id="footer" className="bg-gradient-to-b from-stone-950 via-[#18070d] to-stone-950 text-stone-300 text-xs border-t border-rose-900/30 pt-14 pb-10 mt-14 relative overflow-hidden">
      {/* Subtle ambient glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-24 bg-rose-900/10 blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-10 pb-10 border-b border-rose-900/30">
          
          {/* Brand Info (Col 1: 4 cols) */}
          <div className="md:col-span-4 flex flex-col">
            <Link href="#beranda" className="flex items-center gap-3 mb-3.5 group w-fit">
              <div className="w-9 h-9 rounded-xl bg-rose-900 text-amber-300 flex items-center justify-center font-serif font-black text-lg shadow-sm border border-rose-700/60 group-hover:bg-rose-800 transition-colors">
                S
              </div>
              <div className="flex flex-col">
                <span className="font-serif font-bold text-lg text-white tracking-tight leading-none group-hover:text-amber-300 transition-colors">
                  SISPERPUS
                </span>
                <span className="text-[10px] text-amber-300/90 font-medium tracking-wider uppercase mt-0.5">
                  Perpustakaan Sekolah
                </span>
              </div>
            </Link>
            <p className="text-xs leading-relaxed text-stone-400 max-w-sm">
              Sistem Informasi Perpustakaan Sekolah Digital. Mewujudkan ekosistem literasi mandiri, terbuka, dan terstruktur bagi seluruh siswa, guru, serta tenaga pendidik.
            </p>
          </div>

          {/* Layanan Siswa (Col 2: 3 cols) */}
          <div className="md:col-span-3">
            <h3 className="text-amber-300 font-bold text-xs uppercase tracking-wider mb-4 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5" />
              <span>Layanan Siswa</span>
            </h3>
            <ul className="space-y-2.5 text-stone-300">
              <li>
                <Link href="#katalog" className="hover:text-amber-300 transition-colors flex items-center gap-1.5 group">
                  <ArrowRight className="w-3 h-3 text-rose-400 group-hover:translate-x-0.5 transition-transform" />
                  <span>Pencarian Buku Mandiri</span>
                </Link>
              </li>
              <li>
                <Link href="#sorotan" className="hover:text-amber-300 transition-colors flex items-center gap-1.5 group">
                  <ArrowRight className="w-3 h-3 text-rose-400 group-hover:translate-x-0.5 transition-transform" />
                  <span>Buku Pilihan Pekan Ini</span>
                </Link>
              </li>
              <li>
                <Link href="#panduan" className="hover:text-amber-300 transition-colors flex items-center gap-1.5 group">
                  <ArrowRight className="w-3 h-3 text-rose-400 group-hover:translate-x-0.5 transition-transform" />
                  <span>Tata Cara Peminjaman</span>
                </Link>
              </li>
              <li>
                <Link href="#profil" className="hover:text-amber-300 transition-colors flex items-center gap-1.5 group">
                  <ArrowRight className="w-3 h-3 text-rose-400 group-hover:translate-x-0.5 transition-transform" />
                  <span>Jam Layanan Perpustakaan</span>
                </Link>
              </li>
              <li className="pt-1.5">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-400/15 hover:bg-amber-400/25 border border-amber-400/30 text-amber-300 text-xs font-bold transition-all shadow-2xs"
                >
                  <span>Portal Petugas &bull; Login</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Ketentuan Perpustakaan (Col 3: 2 cols) */}
          <div className="md:col-span-2">
            <h3 className="text-amber-300 font-bold text-xs uppercase tracking-wider mb-4">
              Ketentuan
            </h3>
            <ul className="space-y-2 text-stone-400 text-xs">
              <li className="flex items-start gap-1.5">
                <span className="text-amber-400 mt-0.5">&bull;</span>
                <span>Wajib membawa NIS / Kartu Siswa</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-amber-400 mt-0.5">&bull;</span>
                <span>Peminjaman maksimal 7 hari kerja</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-amber-400 mt-0.5">&bull;</span>
                <span>Denda terlambat Rp 1.000 / hari</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-amber-400 mt-0.5">&bull;</span>
                <span>Menjaga kebersihan &amp; keutuhan buku</span>
              </li>
            </ul>
          </div>

          {/* Lokasi & Kontak (Col 4: 3 cols) */}
          <div className="md:col-span-3">
            <h3 className="text-amber-300 font-bold text-xs uppercase tracking-wider mb-4 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5" />
              <span>Lokasi &amp; Kontak</span>
            </h3>
            <div className="space-y-2.5 text-stone-400 text-xs">
              <p className="flex items-start gap-2 text-stone-300">
                <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                <span>Gedung Literasi Lt. 2, Kampus SMK Terpadu</span>
              </p>
              <p className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                <span className="hover:text-amber-300 transition-colors cursor-pointer">perpustakaan@sekolah.sch.id</span>
              </p>
              <div className="flex items-start gap-2 text-[11px] text-stone-400 pt-1">
                <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                <span>Senin &ndash; Kamis: 07.00 &ndash; 15.00 WIB<br />Jumat: 07.00 &ndash; 13.15 WIB</span>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Centered Copyright Bar */}
        <div className="pt-8 flex flex-col items-center justify-center text-center text-xs">
          <p className="text-stone-300 font-medium tracking-wide">
            &copy; 2026 SISPERPUS &bull; Sistem Informasi Perpustakaan Sekolah. Hak Cipta Dilindungi.
          </p>
        </div>
      </div>
    </footer>
  );
}
