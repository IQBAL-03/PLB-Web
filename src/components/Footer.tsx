'use client';

import React from 'react';
import Link from 'next/link';

export default function Footer() {
  return (
    <>
      {/* Information Banner */}
      <section id="informasi" className="py-14 bg-stone-900 text-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-2xl">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block mb-2">
              Layanan Perpustakaan
            </span>
            <h2 className="font-serif text-2xl sm:text-4xl font-bold mb-4 text-white">
              Mulai Petualangan Literasimu di Perpustakaan Sekolah
            </h2>
            <p className="text-sm text-stone-300 leading-relaxed mb-6">
              Kunjungi ruang baca perpustakaan di Gedung Literasi Lantai 2. Tersedia ruang baca ber-AC, koleksi referensi akademik lengkap, serta fasilitas komputer pencarian buku.
            </p>
            <div className="grid grid-cols-2 gap-4 text-xs text-stone-300 mb-6 py-4 border-y border-stone-800">
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
              className="inline-block px-6 py-3 rounded-lg bg-rose-900 hover:bg-rose-950 text-white font-semibold text-sm transition-colors shadow-lg cursor-pointer"
            >
              Jelajahi Koleksi Buku
            </Link>
          </div>
        </div>
      </section>

      {/* Footer Details */}
      <footer id="footer" className="bg-stone-950 text-stone-400 text-xs border-t border-stone-800 py-12">
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
              <p className="leading-relaxed mb-2">
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
    </>
  );
}
