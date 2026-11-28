'use client';

import React from 'react';
import { BookOpen, UserCheck, MapPin, Clock, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function BorrowingGuideSection() {
  const steps = [
    {
      step: '01',
      title: 'Pilih Koleksi Buku',
      desc: 'Jelajahi ribuan buku dan seri manga di katalog. Klik pada kartu buku untuk memeriksa sisa stok atau memilih nomor volume yang diinginkan.',
      icon: BookOpen,
    },
    {
      step: '02',
      title: 'Masukkan NIS Siswa',
      desc: 'Ketik Nomor Induk Siswa Anda. Sistem otomatis memvalidasi kartu anggota yang aktif dan memastikan tidak ada denda tertunggak.',
      icon: UserCheck,
    },
    {
      step: '03',
      title: 'Ambil Fisik di Lt. 2',
      desc: 'Datang ke meja sirkulasi perpustakaan di Gedung Literasi Lantai 2. Tunjukkan NIS ke petugas pustakawan untuk serah terima buku fisik.',
      icon: MapPin,
    },
    {
      step: '04',
      title: '7 Hari & Bebas Denda',
      desc: 'Maksimal waktu pinjam adalah 7 hari kerja (maksimal 2 buku). Kembalikan tepat waktu agar tetap bebas denda Rp 1.000 / hari.',
      icon: Clock,
    },
  ];

  return (
    <section id="panduan" className="py-8 sm:py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Outer Solid Container */}
      <div className="bg-white rounded-3xl p-6 sm:p-10 border-2 border-stone-200 shadow-md relative overflow-hidden">
        {/* Section Header: Clean without 'Panduan Siswa' badge */}
        <div className="mb-8 pb-5 border-b-2 border-stone-100 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h2 className="font-serif text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
              Tata Cara Peminjaman Buku
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 mt-1 max-w-xl font-medium">
              Alur peminjaman buku sekolah digital yang mudah dan cepat untuk seluruh siswa
            </p>
          </div>
          <div className="flex items-center self-start sm:self-auto">
            <span className="text-xs font-bold text-stone-800 bg-amber-100 border border-amber-300 px-3.5 py-1.5 rounded-full flex items-center gap-1.5 shadow-2xs">
              <CheckCircle2 className="w-4 h-4 text-rose-900" />
              <span>4 Langkah Peminjaman</span>
            </span>
          </div>
        </div>

        {/* 4 Steps Grid: Polos, Solid Default (Tidak Fading), dengan Efek Hover Halus */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {steps.map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={item.step}
                className="group bg-stone-50/60 rounded-2xl p-6 border-2 border-stone-200/90 shadow-xs hover:shadow-lg hover:-translate-y-1.5 hover:border-rose-900/40 hover:bg-white transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  {/* Step Top Bar: Solid Crisp Number and Icon */}
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-900 group-hover:scale-125 transition-transform duration-300" />
                      <span className="font-serif font-black text-3xl text-rose-900 tracking-tight">
                        {item.step}
                      </span>
                    </div>

                    <div className="w-11 h-11 rounded-xl bg-rose-900 text-amber-200 shadow-xs flex items-center justify-center font-bold group-hover:scale-105 group-hover:bg-rose-950 transition-all duration-300">
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>

                  {/* Title (Polos tanpa badge kuning) */}
                  <h3 className="font-serif font-bold text-base sm:text-lg text-stone-900 mb-2">
                    {item.title}
                  </h3>

                  {/* Description: Solid & Jelas */}
                  <p className="text-xs sm:text-[13px] text-stone-600 leading-relaxed font-normal">
                    {item.desc}
                  </p>
                </div>

                {/* Footer Indicator: Interaktif saat di-hover */}
                <div className="mt-6 pt-3.5 border-t border-stone-200 flex items-center justify-between text-xs font-semibold text-stone-500">
                  <span>Langkah {item.step} dari 04</span>
                  {index < steps.length - 1 && (
                    <ArrowRight className="w-4 h-4 text-rose-800 group-hover:translate-x-1.5 group-hover:text-rose-950 transition-all duration-300" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
