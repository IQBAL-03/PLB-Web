'use client';

import React from 'react';
import Link from 'next/link';
import {
  Library,
  BookOpen,
  Clock,
  MapPin,
  ShieldCheck,
  Users,
  Wind,
  Award,
  Layers,
  ArrowRight,
} from 'lucide-react';

export default function LibraryProfileSection() {
  const stats = [
    { label: 'Koleksi Bahan Pustaka', value: '5.000+', sub: 'Judul Referensi & Sastra', icon: BookOpen },
    { label: 'Kapasitas Ruang Baca', value: '80+', sub: 'Kursi Baca Berpendingin', icon: Users },
    { label: 'Zona Belajar', value: '2 Lantai', sub: 'Zona Hening & Zona Diskusi', icon: Layers },
    { label: 'Status Perpustakaan', value: 'Terakreditasi A', sub: 'Standar Nasional Sekolah', icon: Award },
  ];

  const collections = [
    {
      title: 'Buku Pelajaran & Kurikulum',
      desc: 'Buku teks utama mata pelajaran umum serta kejuruan untuk penunjang belajar harian siswa.',
    },
    {
      title: 'Karya Sastra & Fiksi Populer',
      desc: 'Novel klasik Indonesia, sastra dunia, komik edukatif, dan antologi cerita pendek pilihan.',
    },
    {
      title: 'Referensi Umum & Ensiklopedia',
      desc: 'Kamus bahasa lengkap, buku sains populer, biografi tokoh nasional, serta ensiklopedia tematik.',
    },
    {
      title: 'Karya Tulis & Proyek Siswa',
      desc: 'Dokumentasi laporan projek karya ilmiah siswa, modul pembelajaran mandiri, dan arsip literasi.',
    },
  ];

  const facilities = [
    {
      title: 'Ruang Baca Hening Ber-AC',
      desc: 'Suasana tenang dengan pendingin udara dan pencahayaan optimal untuk membaca mandiri serta fokus belajar.',
      icon: Wind,
    },
    {
      title: 'Area Diskusi & Meja Kelompok',
      desc: 'Dilengkapi meja bundar dan papan catatan untuk kerja kelompok, bedah buku, dan klub literasi.',
      icon: Users,
    },
    {
      title: 'Meja Layanan Sirkulasi',
      desc: 'Layanan peminjaman, pengembalian fisik, serta pendampingan pencarian bahan pustaka oleh pustakawan.',
      icon: Library,
    },
  ];

  return (
    <section id="profil" className="py-8 sm:py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Outer Dark Stone Container */}
      <div className="bg-stone-900 text-white rounded-3xl p-6 sm:p-10 lg:p-12 border border-stone-800 shadow-xl relative overflow-hidden">
        
        {/* Ambient atmospheric gradients */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-rose-900/20 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />

        {/* Header Section: Real School Library Profile */}
        <div className="relative z-10 border-b border-stone-800 pb-8 mb-8">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <Library className="w-4 h-4 text-amber-400" />
              <span>Profil Perpustakaan Sekolah</span>
            </span>
            <span className="text-xs text-stone-500">•</span>
            <span className="text-xs text-stone-400 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-stone-400" />
              <span>Gedung Literasi Lt. 2</span>
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-8">
              <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-white tracking-tight leading-tight">
                Pusat Sumber Belajar, Riset Mandiri &amp; Pengembangan Karakter Siswa
              </h2>
              <p className="text-xs sm:text-sm text-stone-300 mt-3 leading-relaxed max-w-3xl">
                Perpustakaan sekolah didirikan sebagai sarana vital pendidikan dalam menumbuhkan kecintaan membaca, memperluas wawasan keilmuan, dan memfasilitasi kebutuhan riset akademik seluruh siswa serta bapak/ibu guru. Menghadirkan lingkungan belajar yang kondusif, nyaman, dan kaya akan bahan bacaan bermutu.
              </p>
            </div>

            <div className="lg:col-span-4 lg:text-right flex flex-col lg:items-end justify-between self-stretch">
              <div className="bg-stone-800/80 border border-stone-700/80 rounded-2xl p-4 text-left w-full max-w-sm mb-4">
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block mb-1">
                  Visi Perpustakaan
                </span>
                <p className="text-xs text-stone-200 italic leading-relaxed">
                  &ldquo;Menjadi jantung peradaban ilmu sekolah yang unggul, inspiratif, dan menumbuhkan karakter pembelajar sepanjang hayat.&rdquo;
                </p>
              </div>

              <Link
                href="#katalog"
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-rose-900 hover:bg-rose-950 text-white font-semibold text-xs sm:text-sm transition-all shadow-md group w-full sm:w-auto"
              >
                <BookOpen className="w-4 h-4" />
                <span>Cek Katalog Koleksi</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>

        {/* 4 Quick Stat Pills */}
        <div className="relative z-10 grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8">
          {stats.map((s) => {
            const Icon = s.icon;
            return (
              <div
                key={s.label}
                className="bg-stone-800/60 border border-stone-800 rounded-2xl p-4 flex items-center gap-3.5"
              >
                <div className="w-10 h-10 rounded-xl bg-stone-900 border border-stone-700 text-amber-400 flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-serif font-black text-lg sm:text-xl text-white tracking-tight">
                    {s.value}
                  </div>
                  <div className="text-[11px] font-semibold text-stone-300">
                    {s.label}
                  </div>
                  <div className="text-[10px] text-stone-400">
                    {s.sub}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* 3 Pillars Bento Layout: Koleksi Pustaka, Fasilitas Ruang, & Layanan Operasional */}
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Card 1: Koleksi & Sumber Belajar (5 Cols) */}
          <div className="lg:col-span-5 bg-stone-800/50 border border-stone-800/90 rounded-2xl p-5 sm:p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-rose-950 border border-rose-900 text-rose-300 flex items-center justify-center">
                  <BookOpen className="w-4 h-4" />
                </div>
                <h3 className="font-serif font-bold text-base sm:text-lg text-white">
                  Koleksi Bahan Pustaka
                </h3>
              </div>
              <p className="text-xs text-stone-300 leading-relaxed mb-4">
                Dikelola secara rapi sesuai klasifikasi baku untuk memudahkan penelusuran bahan bacaan dan tugas sekolah:
              </p>

              <div className="space-y-3">
                {collections.map((c) => (
                  <div key={c.title} className="pb-2.5 border-b border-stone-800 last:border-0 last:pb-0">
                    <h4 className="text-xs font-bold text-amber-400 mb-0.5">
                      {c.title}
                    </h4>
                    <p className="text-[11px] text-stone-300 leading-relaxed">
                      {c.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-stone-800 text-[11px] text-stone-400 flex items-center justify-between">
              <span>Klasifikasi Desimal Dewey (DDC)</span>
              <span className="text-amber-400 font-semibold">Tersusun Teratur</span>
            </div>
          </div>

          {/* Card 2: Fasilitas Fisik Perpustakaan (4 Cols) */}
          <div className="lg:col-span-4 bg-stone-800/50 border border-stone-800/90 rounded-2xl p-5 sm:p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-amber-950/80 border border-amber-900/80 text-amber-300 flex items-center justify-center">
                  <Layers className="w-4 h-4" />
                </div>
                <h3 className="font-serif font-bold text-base sm:text-lg text-white">
                  Fasilitas &amp; Zona Ruang
                </h3>
              </div>
              <p className="text-xs text-stone-300 leading-relaxed mb-4">
                Ruang perpustakaan dirancang representatif guna mendukung kenyamanan membaca dan aktivitas diskusi:
              </p>

              <div className="space-y-4">
                {facilities.map((f) => {
                  const Icon = f.icon;
                  return (
                    <div key={f.title} className="flex gap-3">
                      <div className="w-7 h-7 rounded-md bg-stone-900 border border-stone-700 text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-white mb-0.5">
                          {f.title}
                        </h4>
                        <p className="text-[11px] text-stone-300 leading-relaxed">
                          {f.desc}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-stone-800 text-[11px] text-stone-400">
              Kapasitas terdistribusi di Gedung Literasi Lt. 2
            </div>
          </div>

          {/* Card 3: Jam Layanan & Ketentuan Kunjungan (3 Cols) */}
          <div className="lg:col-span-3 bg-stone-800/50 border border-stone-800/90 rounded-2xl p-5 sm:p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-stone-900 border border-stone-700 text-stone-300 flex items-center justify-center">
                  <Clock className="w-4 h-4" />
                </div>
                <h3 className="font-serif font-bold text-base sm:text-lg text-white">
                  Layanan &amp; Waktu
                </h3>
              </div>

              {/* Jadwal Buka */}
              <div className="bg-stone-900/90 rounded-xl p-3.5 border border-stone-800 mb-4">
                <div className="text-[10px] font-bold text-amber-400 uppercase tracking-wider mb-2">
                  Jam Buka Operasional
                </div>
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between text-stone-200">
                    <span>Senin – Kamis</span>
                    <span className="font-bold text-white">07.30 – 15.30</span>
                  </div>
                  <div className="flex justify-between text-stone-200">
                    <span>Jumat</span>
                    <span className="font-bold text-white">07.30 – 14.30</span>
                  </div>
                  <div className="flex justify-between text-stone-400 text-[11px] pt-1 border-t border-stone-800">
                    <span>Sabtu, Minggu &amp; Libur</span>
                    <span className="text-rose-400 font-semibold">Tutup</span>
                  </div>
                </div>
              </div>

              {/* Ketentuan Ringkas */}
              <div className="space-y-2.5">
                <div className="flex items-start gap-2 text-xs text-stone-300">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Wajib menjaga keheningan &amp; ketertiban ruang baca.</span>
                </div>
                <div className="flex items-start gap-2 text-xs text-stone-300">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Maksimal peminjaman 2 buku selama 7 hari kerja.</span>
                </div>
                <div className="flex items-start gap-2 text-xs text-stone-300">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Bawa kartu pelajar / sebutkan NIS saat ke sirkulasi.</span>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-stone-800 text-[10px] text-stone-400">
              Pustakawan siap mendampingi kebutuhan literasi Anda.
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}