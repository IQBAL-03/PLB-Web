'use client';

import React from 'react';
import Link from 'next/link';
import { MapPin, Mail, Clock, BookOpen } from 'lucide-react';

export default function Footer() {
  return (
    <footer id="footer" className="bg-stone-950 text-stone-400 text-xs border-t border-stone-800/80 pt-12 pb-10 mt-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-10 pb-10 border-b border-stone-800/80">
          
          {/* Brand Info (Col 1: 4 cols) */}
          <div className="md:col-span-4 flex flex-col">
            <Link href="#beranda" className="flex items-center gap-3 mb-3.5 group w-fit">
              <div className="w-9 h-9 rounded-xl bg-rose-900 text-white flex items-center justify-center font-serif font-black text-lg shadow-xs group-hover:bg-rose-800 transition-colors">
                S
              </div>
              <div className="flex flex-col">
                <span className="font-serif font-bold text-lg text-white tracking-tight leading-none group-hover:text-stone-200 transition-colors">
                  SISPERPUS
                </span>
                <span className="text-[10px] text-stone-400 font-medium tracking-wider uppercase mt-0.5">
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
            <h3 className="text-white font-semibold text-xs uppercase tracking-wider mb-4 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-stone-400" />
              <span>Layanan Siswa</span>
            </h3>
            <ul className="space-y-2.5 text-stone-400">
              <li>
                <Link href="#katalog" className="hover:text-white transition-colors block">
                  Pencarian Buku Mandiri
                </Link>
              </li>
              <li>
                <Link href="#sorotan" className="hover:text-white transition-colors block">
                  Buku Pilihan Pekan Ini
                </Link>
              </li>
              <li>
                <Link href="#panduan" className="hover:text-white transition-colors block">
                  Tata Cara Peminjaman
                </Link>
              </li>
              <li>
                <Link href="#profil" className="hover:text-white transition-colors block">
                  Jam Layanan Perpustakaan
                </Link>
              </li>
              <li className="pt-1.5">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 border border-stone-800 hover:border-stone-700 text-stone-300 hover:text-white text-xs font-medium transition-all shadow-2xs"
                >
                  <span>Portal Petugas &bull; Login</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Ketentuan Perpustakaan (Col 3: 2 cols) */}
          <div className="md:col-span-2">
            <h3 className="text-white font-semibold text-xs uppercase tracking-wider mb-4">
              Ketentuan
            </h3>
            <ul className="space-y-2 text-stone-400 text-xs">
              <li className="flex items-start gap-1.5">
                <span className="text-stone-500 mt-0.5">&bull;</span>
                <span>Wajib membawa NIS / Kartu Siswa</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-stone-500 mt-0.5">&bull;</span>
                <span>Peminjaman maksimal 7 hari kerja</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-stone-500 mt-0.5">&bull;</span>
                <span>Denda terlambat Rp 1.000 / hari</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-stone-500 mt-0.5">&bull;</span>
                <span>Menjaga kebersihan &amp; keutuhan buku</span>
              </li>
            </ul>
          </div>

          {/* Lokasi & Kontak (Col 4: 3 cols) */}
          <div className="md:col-span-3">
            <h3 className="text-white font-semibold text-xs uppercase tracking-wider mb-4 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-stone-400" />
              <span>Lokasi &amp; Kontak</span>
            </h3>
            <div className="space-y-2.5 text-stone-400 text-xs">
              <p className="flex items-start gap-2 text-stone-300">
                <MapPin className="w-3.5 h-3.5 text-stone-500 shrink-0 mt-0.5" />
                <span>Gedung Literasi Lt. 2, Kampus SMK Terpadu</span>
              </p>
              <p className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-stone-500 shrink-0" />
                <span className="hover:text-white transition-colors cursor-pointer">perpustakaan@sekolah.sch.id</span>
              </p>
              <div className="flex items-start gap-2 text-[11px] text-stone-400 pt-1">
                <Clock className="w-3.5 h-3.5 text-stone-500 shrink-0 mt-0.5" />
                <span>Senin &ndash; Kamis: 07.00 &ndash; 15.00 WIB<br />Jumat: 07.00 &ndash; 13.15 WIB</span>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Centered Copyright Bar */}
        <div className="pt-8 flex flex-col items-center justify-center text-center text-xs">
          <p className="text-stone-400 font-medium tracking-wide">
            &copy; 2026 SISPERPUS &bull; Sistem Informasi Perpustakaan Sekolah. Hak Cipta Dilindungi.
          </p>
        </div>
      </div>
    </footer>
  );
}
