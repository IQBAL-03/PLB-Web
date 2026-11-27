'use client';

import React, { useState } from 'react';
import { Member } from '@/types/member';
import { Transaction } from '@/types/transaction';

interface MemberCardModalProps {
  isOpen: boolean;
  members: Member[];
  transactions: Transaction[];
  onClose: () => void;
  onRegisterMember: (nis: string, name: string, classRoom: string) => void;
}

export default function MemberCardModal({
  isOpen,
  members,
  transactions,
  onClose,
  onRegisterMember,
}: MemberCardModalProps) {
  const [searchNis, setSearchNis] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'cek' | 'daftar'>('cek');
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [hasSearched, setHasSearched] = useState<boolean>(false);

  // New registration fields
  const [regNis, setRegNis] = useState<string>('');
  const [regName, setRegName] = useState<string>('');
  const [regClass, setRegClass] = useState<string>('XII-PPLG-1');
  const [regSuccess, setRegSuccess] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchNis.trim();
    if (!query) return;

    const found = members.find((m) => m.nis === query);
    setSelectedMember(found || null);
    setHasSearched(true);
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regNis.trim() || !regName.trim()) return;

    onRegisterMember(regNis.trim(), regName.trim(), regClass);
    setRegSuccess(true);
    setSearchNis(regNis.trim());
    setTimeout(() => {
      setRegSuccess(false);
      setActiveTab('cek');
      const found = members.find((m) => m.nis === regNis.trim());
      if (found) setSelectedMember(found);
    }, 1500);
  };

  const memberLoans = selectedMember
    ? transactions.filter((t) => t.nis === selectedMember.nis && t.status === 'Dipinjam')
    : [];

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
    >
      <div className="fixed inset-0" onClick={onClose} />

      <div className="relative bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-stone-200 overflow-hidden z-10 my-8">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200 bg-stone-50/70">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-900" />
            <h3 className="font-serif font-bold text-sm sm:text-base text-stone-900">
              Kartu Anggota Perpustakaan Siswa
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-stone-400 hover:text-stone-800 hover:bg-stone-200 transition-colors text-xl font-bold leading-none cursor-pointer"
            aria-label="Tutup modal"
          >
            &times;
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex border-b border-stone-200 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('cek')}
            className={`flex-1 py-3 text-center transition-colors border-b-2 cursor-pointer ${
              activeTab === 'cek'
                ? 'border-rose-900 text-rose-900 bg-rose-50/40'
                : 'border-transparent text-stone-600 hover:text-stone-900'
            }`}
          >
            Cek Status Kartu Siswa
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('daftar')}
            className={`flex-1 py-3 text-center transition-colors border-b-2 cursor-pointer ${
              activeTab === 'daftar'
                ? 'border-rose-900 text-rose-900 bg-rose-50/40'
                : 'border-transparent text-stone-600 hover:text-stone-900'
            }`}
          >
            Daftar Anggota Baru
          </button>
        </div>

        {/* Tab content */}
        <div className="p-6">
          {activeTab === 'cek' ? (
            <div className="space-y-4">
              <form onSubmit={handleSearch} className="flex gap-2">
                <input
                  type="text"
                  value={searchNis}
                  onChange={(e) => setSearchNis(e.target.value)}
                  placeholder="Masukkan Nomor Induk Siswa (NIS)..."
                  className="flex-1 text-xs sm:text-sm px-3.5 py-2.5 rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-rose-800"
                  required
                />
                <button
                  type="submit"
                  className="px-4 py-2.5 bg-rose-900 hover:bg-rose-950 text-white rounded-lg font-semibold text-xs transition-colors cursor-pointer"
                >
                  Periksa
                </button>
              </form>

              {hasSearched && !selectedMember && (
                <div className="bg-rose-50 border border-rose-200 rounded-2xl p-5 text-center space-y-3">
                  <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-800 mx-auto flex items-center justify-center font-bold text-xs uppercase">
                    NIS
                  </div>
                  <div>
                    <h4 className="font-bold text-stone-900 text-sm">
                      NIS &ldquo;{searchNis}&rdquo; Tidak Ditemukan
                    </h4>
                    <p className="text-xs text-stone-600 mt-1 max-w-sm mx-auto">
                      Nomor Induk Siswa ini belum terdaftar dalam sistem perpustakaan. Apakah Anda ingin mendaftar sebagai anggota baru sekarang?
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setRegNis(searchNis);
                      setActiveTab('daftar');
                    }}
                    className="px-4 py-2 rounded-lg bg-rose-900 hover:bg-rose-950 text-white font-semibold text-xs transition-colors cursor-pointer shadow-xs inline-flex items-center gap-1.5"
                  >
                    <span>Daftar Anggota Baru Sekarang</span>
                    <span>&rarr;</span>
                  </button>
                </div>
              )}

              {selectedMember && (
                <div className="space-y-4">
                  {/* Digital Library Student Card */}
                  <div className="relative bg-gradient-to-br from-stone-900 via-stone-800 to-rose-950 text-white rounded-2xl p-5 shadow-xl border border-stone-700/80 overflow-hidden">
                    <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-rose-800/20 rounded-full blur-2xl pointer-events-none" />
                    <div className="relative z-10">
                      {/* Card Header */}
                      <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-rose-900 text-amber-200 flex items-center justify-center font-serif font-black text-sm shadow-xs border border-rose-700">
                            S
                          </div>
                          <div>
                            <h4 className="font-serif font-bold text-xs tracking-wide uppercase text-white leading-none">
                              SISPERPUS DIGITAL
                            </h4>
                            <span className="text-[9px] text-stone-300 font-medium tracking-wider">
                              KARTU ANGGOTA PERPUSTAKAAN
                            </span>
                          </div>
                        </div>

                        <div>
                          {selectedMember.status === 'Aktif' ? (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                              Aktif
                            </span>
                          ) : selectedMember.status === 'Ada Denda' ? (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200 animate-pulse">
                              Ada Denda Keterlambatan
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
                              {selectedMember.status}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Card Body */}
                      <div className="grid grid-cols-12 gap-3 items-center">
                        <div className="col-span-3 sm:col-span-2 flex justify-center">
                          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-amber-200 text-xl font-bold font-serif shadow-inner">
                            {selectedMember.name.charAt(0).toUpperCase()}
                          </div>
                        </div>
                        <div className="col-span-9 sm:col-span-10">
                          <p className="font-serif font-bold text-base sm:text-lg text-white leading-tight">
                            {selectedMember.name}
                          </p>
                          <div className="flex items-center gap-3 text-xs text-stone-300 mt-1">
                            <span>NIS: <strong className="text-white">{selectedMember.nis}</strong></span>
                            <span>Kelas: <strong className="text-white">{selectedMember.classRoom}</strong></span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Late Fine Warning Alert */}
                  {selectedMember.status === 'Ada Denda' && (
                    <div className="bg-rose-50 border border-rose-200 rounded-xl p-3.5 text-xs text-rose-900 leading-relaxed">
                      <strong className="block mb-1 text-rose-950 font-bold">
                        Peringatan Kewajiban Denda Keterlambatan:
                      </strong>
                      Kartu ini memiliki denda buku yang belum terselesaikan. Harap segera menemui petugas perpustakaan di Gedung Literasi Lt. 2 untuk pengembalian dan penyelesaian denda Rp 1.000 / hari.
                    </div>
                  )}

                  {/* Active Loans */}
                  <div>
                    <h5 className="font-semibold text-xs text-stone-800 mb-2">
                      Daftar Buku Sedang Dipinjam ({memberLoans.length})
                    </h5>
                    {memberLoans.length === 0 ? (
                      <p className="text-xs text-stone-500 italic">
                        Tidak ada buku yang sedang dipinjam saat ini.
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {memberLoans.map((loan) => (
                          <div
                            key={loan.id}
                            className="flex items-center justify-between p-3 bg-stone-50 rounded-lg border border-stone-200 text-xs"
                          >
                            <div>
                              <span className="font-bold text-stone-900 block">
                                {loan.bookTitle} {loan.volumeNumber ? `(Vol. ${loan.volumeNumber})` : ''}
                              </span>
                              <span className="text-[11px] text-stone-500">
                                Tanggal Pinjam: {loan.loanDate}
                              </span>
                            </div>
                            <div className="text-right">
                              <span className="text-[10px] uppercase font-bold text-rose-900 block">
                                Jatuh Tempo
                              </span>
                              <span className="text-xs font-semibold text-stone-800">
                                {loan.dueDate}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <form onSubmit={handleRegister} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Nomor Induk Siswa (NIS)
                </label>
                <input
                  type="text"
                  value={regNis}
                  onChange={(e) => setRegNis(e.target.value)}
                  placeholder="Contoh: 20261005"
                  required
                  className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-lg border border-stone-300"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Nama Lengkap Siswa
                </label>
                <input
                  type="text"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  placeholder="Nama sesuai presensi sekolah"
                  required
                  className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-lg border border-stone-300"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Kelas / Jurusan
                </label>
                <select
                  value={regClass}
                  onChange={(e) => setRegClass(e.target.value)}
                  className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-lg border border-stone-300 bg-white"
                >
                  <option value="XII-PPLG-1">XII PPLG 1</option>
                  <option value="XII-PPLG-2">XII PPLG 2</option>
                  <option value="XI-PPLG-1">XI PPLG 1</option>
                  <option value="XI-PPLG-2">XI PPLG 2</option>
                  <option value="X-PPLG-1">X PPLG 1</option>
                  <option value="X-PPLG-2">X PPLG 2</option>
                </select>
              </div>

              {regSuccess && (
                <div className="bg-emerald-50 text-emerald-800 border border-emerald-200 p-3 rounded-lg text-xs">
                  Pendaftaran berhasil! Akun Anda kini aktif di sistem SISPERPUS.
                </div>
              )}

              <button
                type="submit"
                className="w-full py-2.5 bg-rose-900 hover:bg-rose-950 text-white font-semibold rounded-lg transition-colors cursor-pointer mt-2"
              >
                Kirim Pendaftaran Anggota
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
