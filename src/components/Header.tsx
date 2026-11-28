'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Search } from 'lucide-react';

interface HeaderProps {
  onOpenMemberCard: () => void;
  onOpenSearch?: () => void;
}

export default function Header({ onOpenMemberCard, onOpenSearch }: HeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 bg-gradient-to-r from-rose-950 via-rose-900 to-amber-950 border-b border-rose-800/40 text-white backdrop-blur-md transition-all duration-200 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            <Link
              href="#beranda"
              className="flex items-center gap-3 group focus:outline-none focus:ring-2 focus:ring-amber-400 rounded-lg p-1"
            >
              <div className="w-10 h-10 rounded-xl bg-amber-400 text-rose-950 flex items-center justify-center font-serif font-black text-xl shadow-md group-hover:bg-amber-300 transition-colors">
                S
              </div>
              <div className="flex flex-col">
                <span className="font-serif font-bold text-lg sm:text-xl text-white tracking-tight leading-none">
                  SISPERPUS
                </span>
                <span className="text-[10px] sm:text-xs text-amber-300/90 font-medium tracking-wider uppercase">
                  Perpustakaan Sekolah
                </span>
              </div>
            </Link>

            <nav className="hidden md:flex items-center gap-6 lg:gap-8 text-sm font-medium text-stone-200">
              <Link href="#beranda" className="hover:text-amber-300 transition-colors py-1">
                Beranda
              </Link>
              <Link href="#sorotan" className="hover:text-amber-300 transition-colors py-1">
                Sorotan
              </Link>
              <Link href="#panduan" className="hover:text-amber-300 transition-colors py-1">
                Panduan
              </Link>
              <Link href="#profil" className="hover:text-amber-300 transition-colors py-1">
                Profil
              </Link>
              <Link href="#katalog" className="hover:text-amber-300 transition-colors py-1">
                Katalog Buku
              </Link>
            </nav>

            <div className="hidden sm:flex items-center gap-3">
              <button
                type="button"
                onClick={onOpenMemberCard}
                className="px-4 py-2 rounded-lg border border-white/20 bg-white/10 hover:bg-white/20 text-xs sm:text-sm font-semibold text-white transition-all cursor-pointer backdrop-blur-xs shadow-xs focus:outline-none focus:ring-2 focus:ring-amber-400"
              >
                Kartu Anggota
              </button>
              <Link
                href="#katalog"
                onClick={onOpenSearch}
                className="px-4 py-2 rounded-lg bg-amber-400 hover:bg-amber-300 text-stone-950 text-xs sm:text-sm font-bold transition-all shadow-md focus:outline-none focus:ring-2 focus:ring-white cursor-pointer flex items-center gap-1.5"
              >
                <Search className="w-3.5 h-3.5" />
                <span>Cari Buku</span>
              </Link>
            </div>

            <div className="flex sm:hidden">
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(true)}
                className="p-2 rounded-lg text-stone-200 hover:text-white hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-amber-400"
                aria-label="Buka navigasi utama"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Drawer with Matching Deep Maroon Style */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label="Navigasi Menu Mobile">
          <div
            className="fixed inset-0 bg-stone-950/70 backdrop-blur-xs transition-opacity"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="fixed inset-y-0 right-0 max-w-xs w-full bg-gradient-to-br from-rose-950 via-rose-900 to-amber-950 text-white shadow-2xl p-6 flex flex-col justify-between z-10 border-l border-rose-800/50 animate-in slide-in-from-right duration-200">
            <div>
              <div className="flex items-center justify-between pb-6 border-b border-rose-800/50">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-amber-400 text-rose-950 flex items-center justify-center font-serif font-black text-base">
                    S
                  </div>
                  <div className="flex flex-col">
                    <span className="font-serif font-bold text-base text-white">SISPERPUS</span>
                    <span className="text-[10px] text-amber-300/90 font-medium">Perpustakaan Sekolah</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-1.5 rounded-lg text-stone-300 hover:text-white hover:bg-white/10 text-xl font-bold leading-none cursor-pointer"
                  aria-label="Tutup menu navigasi"
                >
                  &times;
                </button>
              </div>

              <nav className="flex flex-col gap-4 mt-6 text-base font-semibold text-stone-200">
                <Link
                  href="#beranda"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="hover:text-amber-300 py-1 transition-colors"
                >
                  Beranda
                </Link>
                <Link
                  href="#sorotan"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="hover:text-amber-300 py-1 transition-colors"
                >
                  Sorotan Pekan Ini
                </Link>
                <Link
                  href="#panduan"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="hover:text-amber-300 py-1 transition-colors"
                >
                  Tata Cara Peminjaman
                </Link>
                <Link
                  href="#profil"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="hover:text-amber-300 py-1 transition-colors"
                >
                  Profil Perpustakaan
                </Link>
                <Link
                  href="#katalog"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="hover:text-amber-300 py-1 transition-colors"
                >
                  Katalog Lengkap
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onOpenMemberCard();
                  }}
                  className="text-left hover:text-amber-300 py-1 font-semibold text-amber-300 flex items-center justify-between cursor-pointer border-t border-rose-800/40 pt-3"
                >
                  <span>Kartu Anggota Siswa</span>
                  <span className="text-[10px] bg-amber-400 text-stone-950 font-bold px-2 py-0.5 rounded-full">
                    Layanan
                  </span>
                </button>
              </nav>
            </div>

            <div className="pt-6 border-t border-rose-800/50 flex flex-col gap-3">
              <Link
                href="#katalog"
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-full text-center py-2.5 px-4 rounded-lg bg-amber-400 text-stone-950 font-bold text-sm hover:bg-amber-300 transition-colors shadow-md flex items-center justify-center gap-2"
              >
                <Search className="w-4 h-4" />
                <span>Cari Buku Sekarang</span>
              </Link>
              <p className="text-[11px] text-stone-400 text-center">
                Layanan Digital Siswa &amp; Guru
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
