'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');

    // Default admin credential or env configured
    const validUser = 'admin';
    const validPass = 'admin123';

    setTimeout(() => {
      if (
        (username.trim().toLowerCase() === validUser && password === validPass) ||
        (username.trim().toLowerCase() === 'iqbal' && password === 'admin123') ||
        (username.trim().toLowerCase() === 'haniin' && password === 'admin123')
      ) {
        const sessionUser = {
          name: username.trim() === 'admin' ? 'Administrator' : username.trim(),
          username: username.trim(),
          role: 'admin',
        };

        if (typeof window !== 'undefined') {
          localStorage.setItem('sisperpus_token', `tok_${Date.now()}`);
          localStorage.setItem('sisperpus_user', JSON.stringify(sessionUser));
        }

        router.push('/admin');
      } else {
        setErrorMsg('Username atau kata sandi tidak valid. Coba: admin / admin123');
        setIsLoading(false);
      }
    }, 400);
  };

  return (
    <div className="bg-[#F6F2EA] text-stone-800 font-sans antialiased min-h-screen flex flex-col justify-between selection:bg-rose-900 selection:text-white">
      {/* Top Header */}
      <header className="py-4 px-6 border-b border-stone-200 bg-white shadow-2xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 focus:outline-none rounded-lg p-1">
            <div className="w-9 h-9 rounded-lg bg-rose-900 text-amber-200 flex items-center justify-center font-serif font-black text-lg shadow-xs">
              S
            </div>
            <div className="flex flex-col">
              <span className="font-serif font-bold text-base text-stone-900 tracking-tight leading-none">
                SISPERPUS
              </span>
              <span className="text-[10px] text-stone-500 font-medium tracking-wider uppercase">
                Perpustakaan Sekolah
              </span>
            </div>
          </Link>
          <Link
            href="/"
            className="text-xs font-semibold text-stone-600 hover:text-rose-900 transition-colors inline-flex items-center gap-1"
          >
            <span>&larr;</span>
            <span>Katalog Publik Siswa</span>
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-grow flex items-center justify-center p-4 sm:p-6 my-8">
        <div className="w-full max-w-md bg-white rounded-2xl border border-stone-200 shadow-xl p-6 sm:p-8">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-rose-50 text-rose-900 border border-rose-200 mb-3 shadow-xs">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h1 className="font-serif text-2xl font-bold text-stone-900 mb-1">
              Masuk Panel Petugas
            </h1>
            <p className="text-xs sm:text-sm text-stone-500">
              Sistem Informasi Perpustakaan Sekolah Terpadu
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            {errorMsg && (
              <div className="bg-rose-50 border border-rose-200 text-rose-800 text-xs p-3 rounded-lg font-medium">
                {errorMsg}
              </div>
            )}

            <div>
              <label
                htmlFor="adminUsername"
                className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1"
              >
                NIP / Username Petugas
              </label>
              <input
                type="text"
                id="adminUsername"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoFocus
                className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-rose-800 focus:border-rose-800 transition-shadow bg-stone-50/50"
                placeholder="Username (admin)"
              />
            </div>

            <div>
              <label
                htmlFor="adminPassword"
                className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1"
              >
                Kata Sandi
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="adminPassword"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full text-xs sm:text-sm px-3.5 py-2.5 pr-10 rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-rose-800 focus:border-rose-800 transition-shadow bg-stone-50/50"
                  placeholder="Kata sandi (admin123)"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-stone-400 hover:text-stone-700 focus:outline-none cursor-pointer"
                  aria-label="Tampilkan atau sembunyikan kata sandi"
                >
                  {showPassword ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-stone-600 pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-stone-300 text-rose-900 focus:ring-rose-800"
                />
                <span>Ingat sesi petugas ini</span>
              </label>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-rose-900 hover:bg-rose-950 text-white font-semibold text-xs sm:text-sm py-2.5 px-4 rounded-lg transition-colors cursor-pointer shadow-sm focus:outline-none focus:ring-2 focus:ring-rose-800"
              >
                {isLoading ? 'Memverifikasi...' : 'Masuk ke Panel Admin'}
              </button>
            </div>
          </form>

          <div className="mt-6 pt-4 border-t border-stone-200 text-center">
            <p className="text-[11px] text-stone-500">
              Akses khusus petugas perpustakaan sekolah SMK. Akun bawaan dev: <strong>admin</strong> / <strong>admin123</strong>.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 px-6 border-t border-stone-200 text-center text-[11px] text-stone-500 bg-white">
        &copy; 2026 SISPERPUS &bull; Sistem Informasi Perpustakaan Sekolah Terpadu
      </footer>
    </div>
  );
}
