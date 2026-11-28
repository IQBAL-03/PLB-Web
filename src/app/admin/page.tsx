'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Book } from '@/types/book';
import { Member, MemberStatus } from '@/types/member';
import { Transaction } from '@/types/transaction';
import { starterBooks } from '@/data/starter-books';
import { starterMembers } from '@/data/starter-members';
import { starterTransactions } from '@/data/starter-transactions';

type AdminTab = 'dashboard' | 'members' | 'books' | 'report';

export default function AdminPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  const [currentUser, setCurrentUser] = useState<{ name: string; username: string } | null>(null);

  // Data states
  const [books, setBooks] = useState<Book[]>(starterBooks);
  const [members, setMembers] = useState<Member[]>(starterMembers);
  const [transactions, setTransactions] = useState<Transaction[]>(starterTransactions);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // New book form states
  const [newBookTitle, setNewBookTitle] = useState('');
  const [newBookAuthor, setNewBookAuthor] = useState('');
  const [newBookCategory, setNewBookCategory] = useState('Komik & Manga');
  const [newBookStock, setNewBookStock] = useState(5);
  const [newBookShelf, setNewBookShelf] = useState('Rak Utama');
  const [newBookCover, setNewBookCover] = useState('');
  const [newBookSynopsis, setNewBookSynopsis] = useState('');

  // Fetch live data from backend APIs
  const loadAdminData = async () => {
    setIsLoadingData(true);
    try {
      const [booksRes, membersRes, txRes] = await Promise.allSettled([
        fetch('/api/books').then((r) => r.json()),
        fetch('/api/members').then((r) => r.json()),
        fetch('/api/transactions').then((r) => r.json()),
      ]);

      if (booksRes.status === 'fulfilled' && booksRes.value?.success && Array.isArray(booksRes.value.data)) {
        setBooks(booksRes.value.data);
      }
      if (membersRes.status === 'fulfilled' && membersRes.value?.success && Array.isArray(membersRes.value.data)) {
        setMembers(membersRes.value.data);
      }
      if (txRes.status === 'fulfilled' && txRes.value?.success && Array.isArray(txRes.value.data)) {
        setTransactions(txRes.value.data);
      }
    } catch (err) {
      console.error('Failed to load admin data from API:', err);
    } finally {
      setIsLoadingData(false);
    }
  };

  // Check auth & load data on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('sisperpus_token');
      const userRaw = localStorage.getItem('sisperpus_user');
      if (!token || !userRaw) {
        router.replace('/login');
        return;
      }
      try {
        const u = JSON.parse(userRaw);
        setCurrentUser(u);
      } catch {
        router.replace('/login');
      }
    }
    loadAdminData();
  }, [router]);

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('sisperpus_token');
      localStorage.removeItem('sisperpus_user');
    }
    router.push('/login');
  };

  // Return book action (API-connected)
  const handleReturnBook = async (txId: string) => {
    const tx = transactions.find((t) => t.id === txId);
    if (!tx) return;

    try {
      const res = await fetch('/api/transactions/return', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transactionId: txId }),
      });

      const result = await res.json();
      if (!result.success) {
        alert(result.error || 'Gagal memproses pengembalian buku');
        return;
      }

      alert(result.message || `Buku "${tx.bookTitle}" berhasil dikembalikan.`);
      await loadAdminData();
    } catch (err: any) {
      alert(err.message || 'Terjadi kesalahan saat memproses pengembalian');
    }
  };

  // Verify / Update member status (API-connected)
  const handleUpdateMemberStatus = async (nis: string, newStatus: MemberStatus) => {
    try {
      const res = await fetch(`/api/members/${nis}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      const result = await res.json();
      if (!result.success) {
        alert(result.error || 'Gagal memperbarui status anggota');
        return;
      }

      setMembers((prev) =>
        prev.map((m) => (m.nis === nis ? { ...m, status: newStatus } : m))
      );
    } catch (err: any) {
      alert(err.message || 'Terjadi kesalahan saat memperbarui status anggota');
    }
  };

  // Add new book (API-connected)
  const handleAddBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBookTitle.trim() || !newBookAuthor.trim()) return;

    setIsSubmitting(true);
    try {
      const payload = {
        title: newBookTitle.trim(),
        author: newBookAuthor.trim(),
        category: newBookCategory,
        language: 'Bahasa Indonesia',
        price: 60000,
        year: new Date().getFullYear().toString(),
        shelf: newBookShelf,
        stock: Number(newBookStock),
        synopsis: newBookSynopsis || 'Sinopsis buku perpustakaan sekolah.',
        coverImg: newBookCover || '',
        badge: 'Buku Baru',
      };

      const res = await fetch('/api/books', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await res.json();
      if (!result.success) {
        alert(result.error || 'Gagal menambahkan buku baru');
        return;
      }

      alert(`Buku "${payload.title}" berhasil ditambahkan ke katalog perpustakaan!`);
      setNewBookTitle('');
      setNewBookAuthor('');
      setNewBookCover('');
      setNewBookSynopsis('');
      await loadAdminData();
    } catch (err: any) {
      alert(err.message || 'Terjadi kesalahan saat menyimpan buku');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete book (API-connected)
  const handleDeleteBook = async (bookId: string, title: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus buku "${title}" dari katalog?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/books?id=${bookId}`, {
        method: 'DELETE',
      });
      const result = await res.json();
      if (!result.success) {
        alert(result.error || 'Gagal menghapus buku');
        return;
      }

      alert(`Buku "${title}" berhasil dihapus.`);
      setBooks((prev) => prev.filter((b) => b.id !== bookId));
    } catch (err: any) {
      alert(err.message || 'Terjadi kesalahan saat menghapus buku');
    }
  };

  // Metric computations
  const totalStock = books.reduce((acc, b) => acc + b.stock, 0);
  const activeLoansCount = transactions.filter((t) => t.status === 'Dipinjam').length;
  const totalFines = transactions.reduce((acc, t) => acc + (t.fine || 0), 0);

  return (
    <div className="bg-[#F6F2EA] text-stone-800 font-sans antialiased min-h-screen flex flex-col selection:bg-rose-900 selection:text-white">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-white border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-6">
              <Link href="/admin" className="flex items-center gap-2.5 focus:outline-none rounded-lg p-1">
                <div className="w-9 h-9 rounded-lg bg-rose-900 text-amber-200 flex items-center justify-center font-serif font-black text-lg shadow-xs">
                  S
                </div>
                <div className="flex flex-col">
                  <span className="font-serif font-bold text-base text-stone-900 tracking-tight leading-none">
                    SISPERPUS
                  </span>
                  <span className="text-[10px] text-rose-800 font-bold uppercase tracking-wider">
                    Panel Admin
                  </span>
                </div>
              </Link>

              {/* Navigation Tabs */}
              <nav className="hidden md:flex items-center gap-2 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setActiveTab('dashboard')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                    activeTab === 'dashboard'
                      ? 'bg-rose-900 text-white shadow-xs'
                      : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
                  }`}
                >
                  Dashboard
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('members')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                    activeTab === 'members'
                      ? 'bg-rose-900 text-white shadow-xs'
                      : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
                  }`}
                >
                  Daftar Anggota
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('books')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                    activeTab === 'books'
                      ? 'bg-rose-900 text-white shadow-xs'
                      : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
                  }`}
                >
                  Kelola Buku
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('report')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                    activeTab === 'report'
                      ? 'bg-rose-900 text-white shadow-xs'
                      : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
                  }`}
                >
                  Laporan &amp; Denda
                </button>
              </nav>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={loadAdminData}
                disabled={isLoadingData}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-stone-700 bg-stone-100 hover:bg-stone-200 transition-colors cursor-pointer disabled:opacity-60"
                title="Segarkan data dari server"
              >
                <svg
                  className={`w-3.5 h-3.5 text-stone-600 ${isLoadingData ? 'animate-spin' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                <span>{isLoadingData ? 'Memuat...' : 'Segarkan'}</span>
              </button>

              <Link
                href="/"
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-stone-600 bg-stone-100 hover:bg-stone-200 transition-colors"
              >
                <span>&larr;</span>
                <span>Katalog Publik</span>
              </Link>

              <div className="flex items-center gap-2 pl-2 border-l border-stone-200">
                <div className="hidden sm:flex flex-col text-right">
                  <span className="text-xs font-bold text-stone-900 leading-none">
                    {currentUser?.name || 'Administrator'}
                  </span>
                  <span className="text-[10px] text-stone-500">Petugas Perpustakaan</span>
                </div>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="p-2 text-stone-500 hover:text-rose-900 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                  title="Keluar dari Panel"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Mobile Tab Strip */}
          <div className="flex md:hidden items-center gap-1.5 overflow-x-auto py-2 border-t border-stone-100 scrollbar-none text-xs">
            <button
              type="button"
              onClick={() => setActiveTab('dashboard')}
              className={`px-2.5 py-1 rounded-md text-xs font-bold whitespace-nowrap ${
                activeTab === 'dashboard' ? 'bg-rose-900 text-white' : 'text-stone-600'
              }`}
            >
              Dashboard
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('members')}
              className={`px-2.5 py-1 rounded-md text-xs font-semibold whitespace-nowrap ${
                activeTab === 'members' ? 'bg-rose-900 text-white' : 'text-stone-600'
              }`}
            >
              Anggota
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('books')}
              className={`px-2.5 py-1 rounded-md text-xs font-semibold whitespace-nowrap ${
                activeTab === 'books' ? 'bg-rose-900 text-white' : 'text-stone-600'
              }`}
            >
              Buku
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('report')}
              className={`px-2.5 py-1 rounded-md text-xs font-semibold whitespace-nowrap ${
                activeTab === 'report' ? 'bg-rose-900 text-white' : 'text-stone-600'
              }`}
            >
              Laporan
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab 1: Dashboard */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <div>
              <h1 className="font-serif text-2xl font-bold text-stone-900">
                Dashboard Sirkulasi &amp; Koleksi
              </h1>
              <p className="text-xs text-stone-500">
                Ringkasan data operasional perpustakaan sekolah digital
              </p>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-xs">
                <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">
                  Judul Buku
                </span>
                <span className="font-serif font-black text-2xl text-stone-900">
                  {books.length}
                </span>
                <span className="text-[11px] text-stone-400 block mt-1">Koleksi Terdaftar</span>
              </div>

              <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-xs">
                <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">
                  Total Eksemplar
                </span>
                <span className="font-serif font-black text-2xl text-stone-900">
                  {totalStock}
                </span>
                <span className="text-[11px] text-stone-400 block mt-1">Fisik di Rak Perpustakaan</span>
              </div>

              <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-xs">
                <span className="text-[10px] font-bold text-rose-900 uppercase tracking-wider block">
                  Peminjaman Aktif
                </span>
                <span className="font-serif font-black text-2xl text-rose-900">
                  {activeLoansCount}
                </span>
                <span className="text-[11px] text-stone-400 block mt-1">Buku di Tangan Siswa</span>
              </div>

              <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-xs">
                <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">
                  Siswa Terdaftar
                </span>
                <span className="font-serif font-black text-2xl text-stone-900">
                  {members.length}
                </span>
                <span className="text-[11px] text-stone-400 block mt-1">Kartu Anggota Digital</span>
              </div>
            </div>

            {/* Recent Transactions Table */}
            <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
              <div className="px-6 py-4 border-b border-stone-200 flex items-center justify-between">
                <div>
                  <h2 className="font-serif font-bold text-base text-stone-900">
                    Sirkulasi Peminjaman Terbaru
                  </h2>
                  <p className="text-xs text-stone-500">
                    Daftar peminjaman buku oleh siswa
                  </p>
                </div>
                <span className="text-xs font-semibold text-stone-600 bg-stone-100 px-3 py-1 rounded-full">
                  {transactions.length} Riwayat
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-stone-50 text-stone-600 font-bold uppercase tracking-wider border-b border-stone-200">
                    <tr>
                      <th className="px-6 py-3">NIS &amp; Siswa</th>
                      <th className="px-6 py-3">Judul Buku</th>
                      <th className="px-6 py-3">Tgl Pinjam</th>
                      <th className="px-6 py-3">Jatuh Tempo</th>
                      <th className="px-6 py-3">Status</th>
                      <th className="px-6 py-3 text-right">Aksi Petugas</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {transactions.map((tx) => (
                      <tr key={tx.id} className="hover:bg-stone-50/50">
                        <td className="px-6 py-3.5">
                          <span className="font-bold text-stone-900 block">{tx.studentName}</span>
                          <span className="text-[11px] text-stone-400">NIS: {tx.nis} &bull; {tx.classRoom}</span>
                        </td>
                        <td className="px-6 py-3.5">
                          <span className="font-semibold text-stone-800 block">{tx.bookTitle}</span>
                          {tx.volumeNumber && (
                            <span className="text-[10px] bg-amber-100 text-amber-900 px-1.5 py-0.2 rounded font-bold">
                              Vol. {tx.volumeNumber}
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-3.5 text-stone-600">{tx.loanDate}</td>
                        <td className="px-6 py-3.5 font-semibold text-stone-800">{tx.dueDate}</td>
                        <td className="px-6 py-3.5">
                          {tx.status === 'Dipinjam' ? (
                            <span className="inline-block bg-blue-100 text-blue-900 font-bold px-2 py-0.5 rounded-full text-[10px]">
                              Dipinjam
                            </span>
                          ) : tx.status === 'Kembali' ? (
                            <span className="inline-block bg-emerald-100 text-emerald-900 font-bold px-2 py-0.5 rounded-full text-[10px]">
                              Kembali
                            </span>
                          ) : (
                            <span className="inline-block bg-rose-100 text-rose-900 font-bold px-2 py-0.5 rounded-full text-[10px]">
                              Terlambat
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-3.5 text-right">
                          {tx.status === 'Dipinjam' && (
                            <button
                              type="button"
                              onClick={() => handleReturnBook(tx.id)}
                              className="px-3 py-1 bg-rose-900 hover:bg-rose-950 text-white rounded font-semibold text-[11px] transition-colors cursor-pointer"
                            >
                              Kembalikan Buku
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Members */}
        {activeTab === 'members' && (
          <div className="space-y-6">
            <div>
              <h1 className="font-serif text-2xl font-bold text-stone-900">
                Manajemen Anggota Siswa
              </h1>
              <p className="text-xs text-stone-500">
                Verifikasi keaktifan kartu anggota dan status bebas denda
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-stone-50 text-stone-600 font-bold uppercase tracking-wider border-b border-stone-200">
                    <tr>
                      <th className="px-6 py-3">NIS</th>
                      <th className="px-6 py-3">Nama Siswa</th>
                      <th className="px-6 py-3">Kelas</th>
                      <th className="px-6 py-3">Pinjaman Aktif</th>
                      <th className="px-6 py-3">Status Kartu</th>
                      <th className="px-6 py-3 text-right">Tindakan Admin</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {members.map((m) => (
                      <tr key={m.nis} className="hover:bg-stone-50/50">
                        <td className="px-6 py-3.5 font-mono font-bold text-stone-900">{m.nis}</td>
                        <td className="px-6 py-3.5 font-semibold text-stone-800">{m.name}</td>
                        <td className="px-6 py-3.5 text-stone-600">{m.classRoom}</td>
                        <td className="px-6 py-3.5 font-bold text-stone-700">{m.activeLoans} Buku</td>
                        <td className="px-6 py-3.5">
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              m.status === 'Aktif'
                                ? 'bg-emerald-100 text-emerald-900 border border-emerald-200'
                                : m.status === 'Ada Denda'
                                ? 'bg-rose-100 text-rose-900 border border-rose-200'
                                : 'bg-amber-100 text-amber-900 border border-amber-200'
                            }`}
                          >
                            {m.status}
                          </span>
                        </td>
                        <td className="px-6 py-3.5 text-right space-x-1.5">
                          {m.status === 'Menunggu Verifikasi' && (
                            <button
                              type="button"
                              onClick={() => handleUpdateMemberStatus(m.nis, 'Aktif')}
                              className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded text-[11px] font-semibold cursor-pointer"
                            >
                              Verifikasi
                            </button>
                          )}
                          {m.status === 'Ada Denda' && (
                            <button
                              type="button"
                              onClick={() => handleUpdateMemberStatus(m.nis, 'Aktif')}
                              className="px-2.5 py-1 bg-stone-700 hover:bg-stone-800 text-white rounded text-[11px] font-semibold cursor-pointer"
                            >
                              Lunaskan Denda
                            </button>
                          )}
                          {m.status === 'Aktif' && (
                            <button
                              type="button"
                              onClick={() => handleUpdateMemberStatus(m.nis, 'Ada Denda')}
                              className="px-2.5 py-1 border border-rose-300 text-rose-800 hover:bg-rose-50 rounded text-[11px] font-semibold cursor-pointer"
                            >
                              Beri Denda
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Books */}
        {activeTab === 'books' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="font-serif text-2xl font-bold text-stone-900">
                  Kelola Koleksi Buku Perpustakaan
                </h1>
                <p className="text-xs text-stone-500">
                  Katalog, volume seri manga, dan ketersediaan stok fisik
                </p>
              </div>
            </div>

            {/* Add Book Form */}
            <div className="bg-white rounded-2xl border border-stone-200 shadow-xs p-6">
              <h3 className="font-serif font-bold text-base text-stone-900 mb-4">
                Tambah Buku Baru ke Katalog
              </h3>
              <form onSubmit={handleAddBook} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Judul Buku</label>
                  <input
                    type="text"
                    value={newBookTitle}
                    onChange={(e) => setNewBookTitle(e.target.value)}
                    placeholder="Contoh: Filosofi Kopi"
                    required
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Penulis</label>
                  <input
                    type="text"
                    value={newBookAuthor}
                    onChange={(e) => setNewBookAuthor(e.target.value)}
                    placeholder="Contoh: Dee Lestari"
                    required
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Kategori</label>
                  <select
                    value={newBookCategory}
                    onChange={(e) => setNewBookCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg bg-white"
                  >
                    <option value="Fiksi & Sastra">Fiksi & Sastra</option>
                    <option value="Komik & Manga">Komik & Manga</option>
                    <option value="Sains & Teknologi">Sains & Teknologi</option>
                    <option value="Sejarah & Biografi">Sejarah & Biografi</option>
                    <option value="Pengembangan Diri">Pengembangan Diri</option>
                    <option value="Buku Referensi">Buku Referensi</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Stok Eksemplar</label>
                  <input
                    type="number"
                    min="1"
                    value={newBookStock}
                    onChange={(e) => setNewBookStock(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Lokasi Rak</label>
                  <input
                    type="text"
                    value={newBookShelf}
                    onChange={(e) => setNewBookShelf(e.target.value)}
                    placeholder="Contoh: Rak F-01"
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">URL Sampul (Opsional)</label>
                  <input
                    type="url"
                    value={newBookCover}
                    onChange={(e) => setNewBookCover(e.target.value)}
                    placeholder="https://..."
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg"
                  />
                </div>
                <div className="sm:col-span-2 lg:col-span-3">
                  <label className="block font-semibold text-stone-700 mb-1">Sinopsis</label>
                  <textarea
                    rows={2}
                    value={newBookSynopsis}
                    onChange={(e) => setNewBookSynopsis(e.target.value)}
                    placeholder="Deskripsi singkat buku..."
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg"
                  />
                </div>
                <div className="sm:col-span-2 lg:col-span-3">
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-rose-900 hover:bg-rose-950 text-white font-semibold rounded-lg transition-colors cursor-pointer"
                  >
                    Simpan Buku Baru
                  </button>
                </div>
              </form>
            </div>

            {/* Books Table */}
            <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-stone-50 text-stone-600 font-bold uppercase tracking-wider border-b border-stone-200">
                    <tr>
                      <th className="px-6 py-3">Sampul &amp; Judul</th>
                      <th className="px-6 py-3">Kategori</th>
                      <th className="px-6 py-3">Penulis</th>
                      <th className="px-6 py-3">Rak</th>
                      <th className="px-6 py-3">Stok</th>
                      <th className="px-6 py-3">Rating</th>
                      <th className="px-6 py-3 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {books.map((b) => (
                      <tr key={b.id} className="hover:bg-stone-50/50">
                        <td className="px-6 py-3.5 flex items-center gap-3">
                          <img
                            src={b.coverImg || '/img/placeholder-book.svg'}
                            alt={b.title}
                            className="w-10 h-14 object-cover rounded shadow-xs shrink-0"
                          />
                          <div>
                            <span className="font-bold text-stone-900 block">{b.title}</span>
                            <span className="text-[10px] text-stone-400">ID: {b.id}</span>
                          </div>
                        </td>
                        <td className="px-6 py-3.5 font-medium text-stone-700">{b.category}</td>
                        <td className="px-6 py-3.5 text-stone-600">{b.author}</td>
                        <td className="px-6 py-3.5 font-medium text-stone-700">{b.shelf}</td>
                        <td className="px-6 py-3.5 font-bold text-stone-900">{b.stock} Eks</td>
                        <td className="px-6 py-3.5">
                          <span className="font-bold text-amber-600">★ {b.rating.toFixed(1)}</span>
                          <span className="text-[10px] text-stone-400 block">({b.reviewsCount} ulasan)</span>
                        </td>
                        <td className="px-6 py-3.5 text-right">
                          <button
                            type="button"
                            onClick={() => handleDeleteBook(b.id, b.title)}
                            className="px-2.5 py-1 text-rose-700 hover:text-rose-900 hover:bg-rose-50 border border-rose-200 rounded text-[11px] font-semibold cursor-pointer transition-colors"
                          >
                            Hapus
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Report */}
        {activeTab === 'report' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="font-serif text-2xl font-bold text-stone-900">
                  Laporan Keterlambatan &amp; Denda
                </h1>
                <p className="text-xs text-stone-500">
                  Rekapitulasi denda keterlambatan sirkulasi perpustakaan (Rp 1.000 / hari)
                </p>
              </div>
              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-xs font-semibold cursor-pointer transition-colors"
              >
                Cetak / Simpan PDF
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white p-5 rounded-xl border border-stone-200">
                <span className="text-[10px] font-bold text-stone-500 uppercase block">Total Peminjaman</span>
                <span className="font-serif font-black text-2xl text-stone-900">{transactions.length} Transaksi</span>
              </div>
              <div className="bg-white p-5 rounded-xl border border-stone-200">
                <span className="text-[10px] font-bold text-rose-800 uppercase block">Total Akumulasi Denda</span>
                <span className="font-serif font-black text-2xl text-rose-900">
                  Rp {totalFines.toLocaleString('id-ID')}
                </span>
              </div>
              <div className="bg-white p-5 rounded-xl border border-stone-200">
                <span className="text-[10px] font-bold text-emerald-800 uppercase block">Tarif Denda Resmi</span>
                <span className="font-serif font-black text-2xl text-emerald-900">Rp 1.000 / Hari</span>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto py-4 border-t border-stone-200 bg-white text-center text-xs text-stone-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>&copy; 2026 SISPERPUS. Panel Pengelolaan Perpustakaan Sekolah.</p>
          <p className="text-[11px] text-stone-400">Sesi Petugas Aktif &bull; SMK Praktik Lintas Bidang</p>
        </div>
      </footer>
    </div>
  );
}
