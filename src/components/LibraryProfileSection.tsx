'use client';

import React from 'react';
import { Monitor, Wind, Users, Clock3 } from 'lucide-react';

export default function LibraryProfileSection() {
  const facilities = [
    {
      title: 'OPAC Kiosk Digital',
      desc: 'Terminal pencarian koleksi buku mandiri yang terhubung real-time dengan TiDB Cloud.',
      icon: Monitor,
    },
    {
      title: 'Ruang Baca Ber-AC PPLG',
      desc: 'Ruang baca tenang dengan pendingin udara, Wi-Fi berkecepatan tinggi, dan area charging laptop.',
      icon: Wind,
    },
    {
      title: 'Ruang Diskusi Kolaborasi',
      desc: 'Area meja bundar & papan tulis untuk kerja kelompok Praktik Lintas Bidang (PLB) dan P5.',
      icon: Users,
    },
    {
      title: 'Layanan Sirkulasi Terjadwal',
      desc: 'Buka setiap Senin – Jumat pukul 07.30 – 15.30 WIB dengan pustakawan siap melayani.',
      icon: Clock3,
    },
  ];

  return (
    <section id="profil" className="py-12 sm:py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-10 lg:p-12 border border-stone-200 shadow-sm relative overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-5 flex flex-col">
            <span className="text-[11px] sm:text-xs font-bold text-rose-900 bg-rose-50 border border-rose-200 px-3 py-1 rounded-full uppercase tracking-wider self-start mb-3">
              Profil Perpustakaan
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-extrabold text-stone-900 tracking-tight leading-tight mb-4">
              Pusat Sumber Belajar &amp; Literasi Digital Sekolah
            </h2>
            <p className="text-stone-600 text-xs sm:text-sm leading-relaxed mb-4">
              Perpustakaan SISPERPUS hadir sebagai ekosistem belajar modern yang mendukung kurikulum merdeka, pembelajaran Praktik Lintas Bidang (PLB), dan penguatan karakter Profil Pelajar Pancasila.
            </p>
            <p className="text-stone-600 text-xs sm:text-sm leading-relaxed mb-6">
              Mengintegrasikan sistem katalog sirkulasi online terpadu, koleksi buku fiksi berkualitas, literatur akademik kejuruan (PPLG), hingga serial manga edukatif pilihan.
            </p>

            <div className="bg-[#F6F2EA] rounded-xl p-4 border border-stone-200/80">
              <span className="text-xs font-bold text-rose-950 uppercase tracking-wider block mb-1">
                Visi &amp; Komitmen Layanan
              </span>
              <p className="text-xs text-stone-700 italic">
                &ldquo;Mewujudkan lingkungan belajar yang literat, inklusif, dan ramah teknologi bagi seluruh generasi muda bangsa.&rdquo;
              </p>
            </div>
          </div>

          <div className="lg:col-span-7">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {facilities.map((fac) => {
                const Icon = fac.icon;
                return (
                  <div
                    key={fac.title}
                    className="p-5 rounded-xl border border-stone-200 bg-stone-50/70 hover:bg-stone-50 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-lg bg-rose-900 text-amber-200 flex items-center justify-center font-bold mb-3 shadow-xs">
                      <Icon className="w-5 h-5" />
                    </div>
                    <h3 className="font-serif font-bold text-sm text-stone-900 mb-1">
                      {fac.title}
                    </h3>
                    <p className="text-xs text-stone-600 leading-relaxed">
                      {fac.desc}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
