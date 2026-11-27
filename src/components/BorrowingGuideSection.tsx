'use client';

import React from 'react';
import { BookOpen, UserCheck, MapPin, Clock, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function BorrowingGuideSection() {
  const steps = [
    {
      step: '01',
      title: 'Pilih Koleksi Buku',
      desc: 'Jelajahi buku dan manga di katalog. Klik langsung pada kartu buku untuk melihat informasi stok atau memilih nomor volume.',
      icon: BookOpen,
      badge: 'Katalog Mandiri',
    },
    {
      step: '02',
      title: 'Masukkan NIS Siswa',
      desc: 'Masukkan Nomor Induk Siswa yang terdaftar. Sistem akan memverifikasi status kartu anggota dan memastikan bebas dari tunggakan.',
      icon: UserCheck,
      badge: 'Verifikasi Otomatis',
    },
    {
      step: '03',
      title: 'Ambil Fisik di Lt. 2',
      desc: 'Kunjungi meja sirkulasi perpustakaan di Gedung Literasi Lantai 2. Tunjukkan NIS kepada petugas untuk serah terima buku fisik.',
      icon: MapPin,
      badge: 'Meja Sirkulasi',
    },
    {
      step: '04',
      title: '7 Hari & Bebas Denda',
      desc: 'Batas peminjaman maksimal 7 hari kerja (maksimal 2 buku). Kembalikan tepat waktu untuk menghindari denda Rp 1.000 / hari.',
      icon: Clock,
      badge: 'Batas Waktu',
    },
  ];

  return (
    <section id="panduan" className="py-10 sm:py-14 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Outer Container */}
      <div className="bg-gradient-to-b from-stone-50 via-white to-stone-50/70 rounded-3xl p-6 sm:p-10 border border-stone-200/90 shadow-sm relative overflow-hidden">
        {/* Section Header */}
        <div className="relative z-10 mb-8 sm:mb-10">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[11px] sm:text-xs font-bold text-rose-900 bg-rose-50 border border-rose-200 px-3 py-1 rounded-full uppercase tracking-wider">
              Panduan Siswa
            </span>
            <span className="text-xs text-stone-500 font-medium">Layanan Perpustakaan</span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-stone-200/80">
            <div>
              <h2 className="font-serif text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
                Tata Cara Peminjaman Buku
              </h2>
              <p className="text-xs sm:text-sm text-stone-600 mt-1 max-w-xl">
                Alur peminjaman buku sekolah digital untuk siswa dan guru
              </p>
            </div>
            <div className="flex items-center gap-2 self-start sm:self-auto">
              <span className="text-xs font-semibold text-rose-900 bg-rose-50 border border-rose-200/80 px-3 py-1.5 rounded-full flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-rose-800" />
                <span>4 Langkah Peminjaman</span>
              </span>
            </div>
          </div>
        </div>

        {/* 4 Steps Grid */}
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {steps.map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={item.step}
                className="group bg-white rounded-2xl p-6 border border-stone-200/90 hover:border-rose-800/40 shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between relative"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-900/30 group-hover:bg-rose-900 transition-colors" />
                      <span className="font-serif font-black text-2xl sm:text-3xl text-rose-900/40 group-hover:text-rose-900 transition-colors">
                        {item.step}
                      </span>
                    </div>

                    <div className="w-10 h-10 rounded-xl bg-stone-50 text-rose-900 border border-stone-200/80 flex items-center justify-center group-hover:bg-rose-900 group-hover:text-amber-200 group-hover:border-rose-800 transition-all duration-300 shadow-2xs">
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>

                  <div className="inline-block text-[10px] font-bold text-amber-800 bg-amber-50/90 border border-amber-200/60 px-2.5 py-0.5 rounded-full mb-2.5">
                    {item.badge}
                  </div>

                  <h3 className="font-serif font-bold text-base text-stone-900 mb-2 group-hover:text-rose-900 transition-colors">
                    {item.title}
                  </h3>

                  <p className="text-xs text-stone-600 leading-relaxed">
                    {item.desc}
                  </p>
                </div>

                <div className="mt-5 pt-3.5 border-t border-stone-100 flex items-center justify-between text-[11px] font-medium text-stone-400">
                  <span>Langkah {item.step} dari 04</span>
                  {index < steps.length - 1 && (
                    <ArrowRight className="w-3.5 h-3.5 text-stone-300 group-hover:text-rose-800 group-hover:translate-x-1 transition-all" />
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
