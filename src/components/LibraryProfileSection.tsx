'use client';

import React from 'react';
import { Monitor, Wind, Users, Clock3, Sparkles, BookCheck } from 'lucide-react';

export default function LibraryProfileSection() {
  const facilities = [
    {
      title: 'OPAC Kiosk Digital',
      desc: 'Terminal pencarian koleksi buku mandiri berbasis web yang terhubung real-time dengan database sekolah.',
      icon: Monitor,
      highlight: 'Mandiri & Cepat',
    },
    {
      title: 'Ruang Baca Ber-AC PPLG',
      desc: 'Area tenang dengan pendingin udara, Wi-Fi berkecepatan tinggi, dan colokan riset koding siswa.',
      icon: Wind,
      highlight: 'Nyaman & Sejuk',
    },
    {
      title: 'Ruang Kolaborasi Proyek',
      desc: 'Meja bundar & whiteboard untuk kerja kelompok Praktik Lintas Bidang (PLB) serta kegiatan P5.',
      icon: Users,
      highlight: 'Diskusi Tim',
    },
    {
      title: 'Layanan Sirkulasi Terjadwal',
      desc: 'Petugas siap melayani setiap hari sekolah, Senin – Jumat pukul 07.30 – 15.30 WIB di Lt. 2.',
      icon: Clock3,
      highlight: '07.30 - 15.30 WIB',
    },
  ];

  return (
    <section id="profil" className="py-10 sm:py-14 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="bg-gradient-to-br from-stone-900 via-rose-950 to-stone-950 rounded-3xl p-7 sm:p-10 lg:p-12 text-white shadow-2xl border border-rose-900/40 relative overflow-hidden">
        {/* Ambient atmospheric glows */}
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-rose-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center relative z-10">
          {/* Left Column: School Profile Information */}
          <div className="lg:col-span-5 flex flex-col justify-center">
            <div className="inline-flex items-center gap-2 mb-3 self-start">
              <span className="bg-amber-400/20 text-amber-300 border border-amber-300/30 text-[10px] sm:text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider backdrop-blur-xs flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>Profil Perpustakaan</span>
              </span>
              <span className="text-xs text-rose-200/80 font-medium">Gedung Literasi Lt. 2</span>
            </div>

            <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight leading-tight mb-4 text-white">
              Pusat Sumber Belajar &amp; Literasi Digital Sekolah
            </h2>

            <p className="text-stone-300 text-xs sm:text-sm leading-relaxed mb-4">
              Perpustakaan SISPERPUS dikembangkan sebagai ekosistem belajar terpadu yang memadukan buku cetak sastra, literatur akademik kejuruan (PPLG), serial manga edukatif, serta sistem sirkulasi digital modern.
            </p>

            <p className="text-stone-300 text-xs sm:text-sm leading-relaxed mb-6">
              Mendukung kurikulum merdeka melalui kolaborasi Praktik Lintas Bidang (PLB) dan pembentukan karakter Profil Pelajar Pancasila yang gemar membaca dan kritis berpikir.
            </p>

            {/* Visi & Komitmen Box */}
            <div className="bg-stone-900/80 rounded-2xl p-4 sm:p-5 border border-rose-800/40 mb-6 backdrop-blur-xs">
              <div className="flex items-center gap-2 mb-1.5 text-amber-300 text-xs font-bold uppercase tracking-wider">
                <BookCheck className="w-4 h-4 text-amber-400" />
                <span>Visi &amp; Komitmen Layanan</span>
              </div>
              <p className="text-xs text-stone-300 italic leading-relaxed">
                &ldquo;Mewujudkan lingkungan belajar yang literat, inklusif, dan ramah teknologi bagi seluruh generasi muda bangsa.&rdquo;
              </p>
            </div>

            {/* Micro Stats Banner */}
            <div className="grid grid-cols-3 gap-3 pt-4 border-t border-rose-900/60 text-center">
              <div>
                <span className="font-serif font-black text-xl sm:text-2xl text-amber-300 block">1.500+</span>
                <span className="text-[10px] text-stone-400 uppercase tracking-wider">Koleksi Buku</span>
              </div>
              <div>
                <span className="font-serif font-black text-xl sm:text-2xl text-amber-300 block">4 Zona</span>
                <span className="text-[10px] text-stone-400 uppercase tracking-wider">Fasilitas Khusus</span>
              </div>
              <div>
                <span className="font-serif font-black text-xl sm:text-2xl text-amber-300 block">100%</span>
                <span className="text-[10px] text-stone-400 uppercase tracking-wider">Bebas Denda</span>
              </div>
            </div>
          </div>

          {/* Right Column: 4 Facilities Cards Styled to Match Theme */}
          <div className="lg:col-span-7">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {facilities.map((fac) => {
                const Icon = fac.icon;
                return (
                  <div
                    key={fac.title}
                    className="p-5 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-amber-400/40 backdrop-blur-md transition-all duration-300 hover:-translate-y-1 group flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div className="w-10 h-10 rounded-xl bg-rose-900/80 text-amber-300 border border-rose-700 flex items-center justify-center font-bold shadow-xs group-hover:bg-amber-500 group-hover:text-stone-950 transition-colors">
                          <Icon className="w-5 h-5" />
                        </div>
                        <span className="text-[10px] font-bold text-amber-300/90 bg-white/10 px-2 py-0.5 rounded-full border border-white/10">
                          {fac.highlight}
                        </span>
                      </div>

                      <h3 className="font-serif font-bold text-sm sm:text-base text-white mb-1.5 group-hover:text-amber-200 transition-colors">
                        {fac.title}
                      </h3>

                      <p className="text-xs text-stone-300 leading-relaxed">
                        {fac.desc}
                      </p>
                    </div>

                    <div className="mt-4 pt-2.5 border-t border-white/10 flex items-center text-[10px] font-medium text-stone-400">
                      Tersedia untuk Siswa &amp; Guru
                    </div>
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
