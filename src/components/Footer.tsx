'use client';

import React from 'react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer id="footer" className="bg-stone-950 text-stone-400 text-xs border-t border-stone-800 py-12 mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-8 border-b border-stone-800">
          <div className="md:col-span-1">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-8 h-8 rounded bg-rose-900 text-amber-200 flex items-center justify-center font-serif font-bold text-base">
                S
              </div>
              <span className="font-serif font-bold text-base text-white">SISPERPUS</span>
            </div>
            <p className="text-[11px] leading-relaxed text-stone-400">
              Sistem Informasi Perpustakaan Sekolah Digital. Mewujudkan budaya literasi aktif bagi siswa, guru, dan tenaga kependidikan.
            </p>
          </div>

          <div>
            <h3 className="text-white font-semibold text-xs uppercase tracking-wider mb-3">
              Layanan Siswa
            </h3>
            <ul className="space-y-2">
              <li>
                <Link href="#katalog" className="hover:text-white transition-colors">
                  Pencarian Buku Mandiri
                </Link>
              </li>
              <li>
                <Link href="#sorotan" className="hover:text-white transition-colors">
                  Buku Pilihan Pekan Ini
                </Link>
              </li>
              <li>
                <Link href="#panduan" className="hover:text-white transition-colors">
                  Tata Cara Peminjaman
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-white transition-colors text-amber-200/90 font-medium">
                  Portal Petugas &bull; Login
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold text-xs uppercase tracking-wider mb-3">
              Ketentuan Perpustakaan
            </h3>
            <ul className="space-y-2">
              <li>Wajib membawa NIS / Kartu Siswa</li>
              <li>Peminjaman maksimal 7 hari kerja</li>
              <li>Denda keterlambatan Rp 1.000 / hari</li>
              <li>Menjaga kebersihan &amp; keutuhan buku</li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold text-xs uppercase tracking-wider mb-3">
              Lokasi &amp; Kontak
            </h3>
            <p className="leading-relaxed mb-2 text-stone-300">
              Gedung Literasi Lt. 2, Kampus SMK Terpadu
            </p>
            <p className="text-stone-400">
              Email: perpustakaan@sekolah.sch.id
            </p>
            <p className="text-stone-400 mt-1">
              Akses daring mandiri terbuka untuk seluruh siswa dan staf pengajar.
            </p>
          </div>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px]">
          <p>&copy; 2026 SISPERPUS &bull; Sistem Informasi Perpustakaan Sekolah. Hak Cipta Dilindungi.</p>
          <p className="text-stone-500">
            Praktik Lintas Bidang (PLB) Informatika &bull; SMK Kelas 12 PPLG
          </p>
        </div>
      </div>
    </footer>
  );
}
