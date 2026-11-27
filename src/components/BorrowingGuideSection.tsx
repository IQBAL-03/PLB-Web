'use client';

import React from 'react';
import { BookOpen, UserCheck, MapPin, Clock } from 'lucide-react';

export default function BorrowingGuideSection() {
  const steps = [
    {
      step: '01',
      title: 'Pilih Koleksi Buku',
      desc: 'Cari buku favoritmu di katalog digital. Cek status ketersediaan stok atau pilih volume manga yang ingin kamu baca.',
      icon: BookOpen,
      badge: 'Online OPAC',
    },
    {
      step: '02',
      title: 'Masukkan NIS Siswa',
      desc: 'Tekan "Pinjam Buku" dan masukkan Nomor Induk Siswa (NIS). Sistem memvalidasi keaktifan kartu dan status bebas denda.',
      icon: UserCheck,
      badge: 'Validasi Otomatis',
    },
    {
      step: '03',
      title: 'Ambil Fisik di Lt. 2',
      desc: 'Kunjungi meja sirkulasi perpustakaan di Gedung Literasi Lt. 2. Tunjukkan NIS ke pustakawan untuk serah terima fisik buku.',
      icon: MapPin,
      badge: 'Meja Sirkulasi',
    },
    {
      step: '04',
      title: 'Masa Pinjam & Bebas Denda',
      desc: 'Batas peminjaman maksimal 7 hari kerja (maks. 2 buku). Kembalikan tepat waktu agar terhindar dari denda Rp 1.000/hari.',
      icon: Clock,
      badge: '7 Hari Kerja',
    },
  ];

  return (
    <section id="panduan" className="py-12 sm:py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <span className="text-xs font-bold text-rose-900 uppercase tracking-wider block mb-1">
          Panduan Siswa
        </span>
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-stone-200">
          <div>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900">
              Tata Cara Peminjaman Buku
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 mt-1">
              Alur peminjaman cepat dan teratur bagi seluruh siswa dan warga sekolah
            </p>
          </div>
          <span className="text-xs font-semibold text-rose-900 bg-rose-50 border border-rose-200 px-3 py-1 rounded-full self-start sm:self-auto">
            4 Langkah Mudah
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {steps.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.step}
              className="bg-white rounded-2xl p-6 border border-stone-200 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between relative group"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="font-serif font-black text-2xl text-rose-900/40 group-hover:text-rose-900 transition-colors">
                    {item.step}
                  </span>
                  <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-900 flex items-center justify-center group-hover:bg-rose-900 group-hover:text-white transition-colors">
                    <Icon className="w-5 h-5" />
                  </div>
                </div>
                <div className="inline-block text-[10px] font-bold text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-full mb-2">
                  {item.badge}
                </div>
                <h3 className="font-serif font-bold text-base text-stone-900 mb-2">
                  {item.title}
                </h3>
                <p className="text-xs text-stone-600 leading-relaxed">
                  {item.desc}
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-stone-100 flex items-center text-[11px] font-medium text-stone-400">
                Langkah {item.step} dari 04
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
