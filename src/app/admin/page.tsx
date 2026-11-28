'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  BookMarked,
  FileText,
  RotateCw,
  ArrowLeft,
  LogOut,
  Search,
  Plus,
  Pencil,
  MessageSquare,
  Trash2,
  Printer,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Activity,
  CheckCheck,
  Star,
  BookOpen,
  UserCheck,
  Coins,
  ShieldCheck,
  Sparkles,
  Inbox,
  Clock,
  BookCopy,
} from 'lucide-react';
import { Book } from '@/types/book';
import { Member, MemberStatus } from '@/types/member';
import { Transaction } from '@/types/transaction';
import { starterBooks } from '@/data/starter-books';
import { starterMembers } from '@/data/starter-members';
import { starterTransactions } from '@/data/starter-transactions';
import BookFormModal from '@/components/admin/BookFormModal';
import BookReviewsModal from '@/components/admin/BookReviewsModal';

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

  // Book modals states
  const [isBookFormOpen, setIsBookFormOpen] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [reviewsModalBook, setReviewsModalBook] = useState<{ id: string; title: string } | null>(null);

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

  // Search & Filter states
  const [txSearch, setTxSearch] = useState('');
  const [txStatusFilter, setTxStatusFilter] = useState<'Semua' | 'Dipinjam' | 'Kembali' | 'Terlambat'>('Semua');
  const [memberSearch, setMemberSearch] = useState('');
  const [bookSearch, setBookSearch] = useState('');

  // Return book action with condition (Normal, Rusak, Hilang)
  const handleReturnBook = async (txId: string) => {
    const tx = transactions.find((t) => t.id === txId);
    if (!tx) return;

    const conditionInput = prompt(
      `Pengembalian Buku "${tx.bookTitle}" (Peminjam: ${tx.studentName})\n\nPilih kondisi buku:\n- Ketik "normal" : Pengembalian biasa (denda dihitung Rp 1.000 / hari jika terlambat)\n- Ketik "rusak"  : Ada kerusakan fisik buku\n- Ketik "hilang" : Buku hilang (denda seharga buku, stok tidak bertambah)\n\nMasukkan kondisi:`,
      'normal'
    );

    if (conditionInput === null) return;

    const condition = conditionInput.trim().toLowerCase();
    let customFine = 0;
    if (condition === 'rusak') {
      const finePrompt = prompt('Masukkan nominal denda kerusakan buku (Rp):', '15000');
      customFine = Number(finePrompt) || 15000;
    }

    try {
      const res = await fetch('/api/transactions/return', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transactionId: txId, condition, customFine }),
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

  // Settle / Pay fine action (API-connected)
  const handlePayFine = async (txId?: string, nis?: string) => {
    try {
      const res = await fetch('/api/transactions/pay-fine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transactionId: txId, nis }),
      });

      const result = await res.json();
      if (!result.success) {
        alert(result.error || 'Gagal melunaskan denda');
        return;
      }

      alert(result.message || 'Denda berhasil dilunaskan!');
      await loadAdminData();
    } catch (err: any) {
      alert(err.message || 'Terjadi kesalahan saat melunaskan denda');
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

      // If status cleared to 'Aktif', also pay fine in transactions
      if (newStatus === 'Aktif') {
        await handlePayFine(undefined, nis);
      }
    } catch (err: any) {
      alert(err.message || 'Terjadi kesalahan saat memperbarui status anggota');
    }
  };

  // Delete member (API-connected)
  const handleDeleteMember = async (nis: string, name: string) => {
    if (!confirm(`Hapus anggota "${name}" (NIS: ${nis}) dari sistem perpustakaan?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/members/${nis}`, { method: 'DELETE' });
      const result = await res.json();
      if (!result.success) {
        alert(result.error || 'Gagal menghapus anggota');
        return;
      }

      alert(`Anggota ${name} (${nis}) berhasil dihapus.`);
      setMembers((prev) => prev.filter((m) => m.nis !== nis));
    } catch (err: any) {
      alert(err.message || 'Terjadi kesalahan saat menghapus anggota');
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
  const totalStock = books.reduce((acc, b) => acc + (b.stock || 0), 0);
  const activeLoansCount = transactions.filter((t) => t.status === 'Dipinjam').length;
  const returnedCount = transactions.filter((t) => t.status === 'Kembali').length;
  const overdueCount = transactions.filter((t) => t.status === 'Terlambat').length;
  const totalFines = transactions.reduce((acc, t) => acc + (t.fine || 0), 0);

  // Filtered lists for admin tables
  const filteredTransactions = transactions.filter((t) => {
    const matchStatus = txStatusFilter === 'Semua' ? true : t.status === txStatusFilter;
    const q = txSearch.toLowerCase().trim();
    const matchQuery =
      !q ||
      t.studentName.toLowerCase().includes(q) ||
      t.nis.toLowerCase().includes(q) ||
      t.bookTitle.toLowerCase().includes(q);
    return matchStatus && matchQuery;
  });

  const filteredMembers = members.filter((m) => {
    const q = memberSearch.toLowerCase().trim();
    return (
      !q ||
      m.name.toLowerCase().includes(q) ||
      m.nis.toLowerCase().includes(q) ||
      m.classRoom.toLowerCase().includes(q)
    );
  });

  const filteredBooks = books.filter((b) => {
    const q = bookSearch.toLowerCase().trim();
    return (
      !q ||
      b.title.toLowerCase().includes(q) ||
      b.author.toLowerCase().includes(q) ||
      b.shelf.toLowerCase().includes(q) ||
      b.id.toLowerCase().includes(q)
    );
  });

  // Initials generator
  const getInitials = (name: string) => {
    if (!name) return 'S';
    return name
      .split(' ')
      .filter(Boolean)
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  return (
    <div className="bg-[#FAF8F5] text-stone-800 font-sans antialiased min-h-screen flex flex-col selection:bg-rose-950 selection:text-white">
      {/* Top Navbar: Quiet Luxury Executive Style */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200/80 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-18">
            {/* Logo & Navigation */}
            <div className="flex items-center gap-6 lg:gap-8">
              <Link href="/admin" className="flex items-center gap-3 focus:outline-none rounded-xl p-1 group">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-900 to-rose-950 text-amber-300 flex items-center justify-center font-serif font-black text-lg shadow-sm border border-rose-800/80 transition-transform group-hover:scale-105">
                  S
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="font-serif font-black text-base tracking-tight text-stone-900 leading-none group-hover:text-rose-950 transition-colors">
                      SISPERPUS
                    </span>
                    <span className="text-[10px] bg-rose-50 text-rose-950 font-bold px-2 py-0.5 rounded-full border border-rose-200/80 uppercase tracking-wider">
                      ADMIN
                    </span>
                  </div>
                  <span className="text-[11px] text-stone-400 font-medium mt-1">
                    Sistem Perpustakaan Sekolah
                  </span>
                </div>
              </Link>

              {/* Desktop Segmented Pill Tabs */}
              <nav className="hidden md:flex items-center gap-1 p-1 bg-stone-100/80 rounded-2xl border border-stone-200/70 text-xs">
                <button
                  type="button"
                  onClick={() => setActiveTab('dashboard')}
                  className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer ${
                    activeTab === 'dashboard'
                      ? 'bg-rose-950 text-white shadow-xs'
                      : 'text-stone-600 hover:text-stone-900 hover:bg-white/80'
                  }`}
                >
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  <span>Dashboard</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('members')}
                  className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer ${
                    activeTab === 'members'
                      ? 'bg-rose-950 text-white shadow-xs'
                      : 'text-stone-600 hover:text-stone-900 hover:bg-white/80'
                  }`}
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>Daftar Anggota</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('books')}
                  className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer ${
                    activeTab === 'books'
                      ? 'bg-rose-950 text-white shadow-xs'
                      : 'text-stone-600 hover:text-stone-900 hover:bg-white/80'
                  }`}
                >
                  <BookMarked className="w-3.5 h-3.5" />
                  <span>Kelola Buku</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('report')}
                  className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer ${
                    activeTab === 'report'
                      ? 'bg-rose-950 text-white shadow-xs'
                      : 'text-stone-600 hover:text-stone-900 hover:bg-white/80'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Laporan &amp; Denda</span>
                </button>
              </nav>
            </div>

            {/* Right Action Tools */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={loadAdminData}
                disabled={isLoadingData}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-stone-700 bg-white hover:bg-stone-50 border border-stone-200/90 shadow-2xs transition-all cursor-pointer disabled:opacity-60 active:scale-95"
                title="Segarkan data dari server"
              >
                <RotateCw className={`w-3.5 h-3.5 text-stone-500 ${isLoadingData ? 'animate-spin' : ''}`} />
                <span>{isLoadingData ? 'Memuat...' : 'Segarkan'}</span>
              </button>

              <Link
                href="/"
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-stone-700 bg-white hover:bg-stone-50 border border-stone-200/90 shadow-2xs transition-all active:scale-95"
              >
                <ArrowLeft className="w-3.5 h-3.5 text-stone-500" />
                <span>Katalog Publik</span>
              </Link>

              <div className="flex items-center gap-3 pl-3 border-l border-stone-200">
                <div className="hidden sm:flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-rose-100 border border-rose-200 text-rose-950 flex items-center justify-center font-bold text-xs shadow-2xs">
                    AP
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="text-xs font-bold text-stone-900 leading-none">
                      {currentUser?.name || 'Administrator'}
                    </span>
                    <span className="text-[10px] text-stone-400 font-medium mt-0.5">Petugas Perpustakaan</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="p-2 text-stone-400 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                  title="Keluar dari Panel Admin"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Mobile Tab Strip */}
          <div className="flex md:hidden items-center gap-1.5 overflow-x-auto py-2.5 border-t border-stone-100 scrollbar-none text-xs">
            <button
              type="button"
              onClick={() => setActiveTab('dashboard')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                activeTab === 'dashboard' ? 'bg-rose-950 text-white shadow-xs' : 'text-stone-600 bg-stone-100'
              }`}
            >
              Dashboard
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('members')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                activeTab === 'members' ? 'bg-rose-950 text-white shadow-xs' : 'text-stone-600 bg-stone-100'
              }`}
            >
              Anggota
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('books')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                activeTab === 'books' ? 'bg-rose-950 text-white shadow-xs' : 'text-stone-600 bg-stone-100'
              }`}
            >
              Kelola Buku
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('report')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                activeTab === 'report' ? 'bg-rose-950 text-white shadow-xs' : 'text-stone-600 bg-stone-100'
              }`}
            >
              Laporan
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        {/* ========================================================= */}
        {/* TAB 1: DASHBOARD SIRKULASI & STATS */}
        {/* ========================================================= */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8 animate-in fade-in duration-200">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 tracking-tight">
                  Dashboard Sirkulasi &amp; Koleksi
                </h1>
                <p className="text-xs sm:text-sm text-stone-500 mt-1">
                  Ringkasan data operasional dan pemantauan peredaran buku perpustakaan secara terpadu
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-800 border border-emerald-200/80">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  Sistem Realtime Aktif
                </span>
              </div>
            </div>

            {/* 4 Stat Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {/* Card 1: Judul Buku */}
              <div className="bg-white p-5 sm:p-6 rounded-2xl border border-stone-200/80 shadow-xs hover:shadow-md hover:border-stone-300 transition-all duration-200 relative overflow-hidden group">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider">
                    Judul Buku
                  </span>
                  <div className="w-9 h-9 rounded-xl bg-stone-100 text-stone-600 flex items-center justify-center group-hover:bg-rose-50 group-hover:text-rose-950 transition-colors">
                    <BookOpen className="w-4 h-4" />
                  </div>
                </div>
                <div className="font-serif font-black text-3xl sm:text-4xl text-stone-900 tracking-tight">
                  {books.length}
                </div>
                <div className="flex items-center gap-1.5 mt-2">
                  <span className="text-xs text-stone-500 font-medium">Koleksi Terdaftar</span>
                  <span className="text-stone-300">&bull;</span>
                  <span className="text-[11px] text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.2 rounded">Katalog</span>
                </div>
              </div>

              {/* Card 2: Total Eksemplar */}
              <div className="bg-white p-5 sm:p-6 rounded-2xl border border-stone-200/80 shadow-xs hover:shadow-md hover:border-stone-300 transition-all duration-200 relative overflow-hidden group">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider">
                    Total Eksemplar
                  </span>
                  <div className="w-9 h-9 rounded-xl bg-stone-100 text-stone-600 flex items-center justify-center group-hover:bg-stone-200 transition-colors">
                    <Layers className="w-4 h-4" />
                  </div>
                </div>
                <div className="font-serif font-black text-3xl sm:text-4xl text-stone-900 tracking-tight">
                  {totalStock}
                </div>
                <div className="flex items-center gap-1.5 mt-2">
                  <span className="text-xs text-stone-500 font-medium">Fisik di Rak</span>
                  <span className="text-stone-300">&bull;</span>
                  <span className="text-[11px] text-stone-600 font-bold bg-stone-100 px-1.5 py-0.2 rounded">Stok Aktif</span>
                </div>
              </div>

              {/* Card 3: Peminjaman Aktif */}
              <div className="bg-white p-5 sm:p-6 rounded-2xl border border-stone-200/80 shadow-xs hover:shadow-md hover:border-rose-300 transition-all duration-200 relative overflow-hidden group">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[11px] font-bold text-rose-900 uppercase tracking-wider">
                    Peminjaman Aktif
                  </span>
                  <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-900 flex items-center justify-center group-hover:bg-rose-100 transition-colors">
                    <Activity className="w-4 h-4" />
                  </div>
                </div>
                <div className="font-serif font-black text-3xl sm:text-4xl text-rose-950 tracking-tight">
                  {activeLoansCount}
                </div>
                <div className="flex items-center gap-1.5 mt-2">
                  <span className="text-xs text-stone-500 font-medium">Di Tangan Siswa</span>
                  {overdueCount > 0 && (
                    <>
                      <span className="text-stone-300">&bull;</span>
                      <span className="text-[11px] text-rose-700 font-bold bg-rose-50 px-1.5 py-0.2 rounded">
                        {overdueCount} Terlambat
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Card 4: Siswa Terdaftar */}
              <div className="bg-white p-5 sm:p-6 rounded-2xl border border-stone-200/80 shadow-xs hover:shadow-md hover:border-stone-300 transition-all duration-200 relative overflow-hidden group">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider">
                    Siswa Terdaftar
                  </span>
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center group-hover:bg-emerald-100 transition-colors">
                    <UserCheck className="w-4 h-4" />
                  </div>
                </div>
                <div className="font-serif font-black text-3xl sm:text-4xl text-stone-900 tracking-tight">
                  {members.length}
                </div>
                <div className="flex items-center gap-1.5 mt-2">
                  <span className="text-xs text-stone-500 font-medium">Kartu Digital</span>
                  <span className="text-stone-300">&bull;</span>
                  <span className="text-[11px] text-emerald-800 font-bold bg-emerald-50 px-1.5 py-0.2 rounded">Terverifikasi</span>
                </div>
              </div>
            </div>

            {/* Transactions Circulation Table Card */}
            <div className="bg-white rounded-2xl border border-stone-200/80 shadow-xs overflow-hidden">
              <div className="p-5 sm:p-6 border-b border-stone-200/80 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-serif font-bold text-lg text-stone-900">
                      Sirkulasi Peminjaman Buku
                    </h2>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-stone-100 text-stone-600 border border-stone-200/60">
                      {transactions.length} Total
                    </span>
                  </div>
                  <p className="text-xs text-stone-500 mt-1">
                    Daftar peminjaman fisik buku sekolah beserta batas jatuh tempo pengembalian
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  {/* Search Bar */}
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={txSearch}
                      onChange={(e) => setTxSearch(e.target.value)}
                      placeholder="Cari siswa, NIS, judul..."
                      className="text-xs pl-9 pr-3.5 py-2 rounded-xl border border-stone-200 bg-stone-50/70 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-950/20 focus:border-rose-950 transition-all w-60 max-w-full"
                    />
                  </div>

                  {/* Filter Pills */}
                  <div className="flex items-center gap-1 bg-stone-100/80 p-1 rounded-xl text-xs font-semibold border border-stone-200/70">
                    {(['Semua', 'Dipinjam', 'Kembali', 'Terlambat'] as const).map((st) => {
                      const count =
                        st === 'Semua'
                          ? transactions.length
                          : st === 'Dipinjam'
                          ? activeLoansCount
                          : st === 'Kembali'
                          ? returnedCount
                          : overdueCount;
                      return (
                        <button
                          key={st}
                          type="button"
                          onClick={() => setTxStatusFilter(st)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                            txStatusFilter === st
                              ? 'bg-rose-950 text-white shadow-2xs'
                              : 'text-stone-600 hover:text-stone-900 hover:bg-white/80'
                          }`}
                        >
                          <span>{st}</span>
                          <span
                            className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                              txStatusFilter === st
                                ? 'bg-rose-900 text-rose-100'
                                : 'bg-stone-200/80 text-stone-600'
                            }`}
                          >
                            {count}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#FAF8F5] text-stone-500 font-bold uppercase tracking-wider text-[11px] border-b border-stone-200/80">
                    <tr>
                      <th className="px-6 py-4">NIS &amp; Siswa</th>
                      <th className="px-6 py-4">Judul Koleksi</th>
                      <th className="px-6 py-4">Tgl Pinjam</th>
                      <th className="px-6 py-4">Jatuh Tempo</th>
                      <th className="px-6 py-4">Status Sirkulasi</th>
                      <th className="px-6 py-4 text-right">Aksi Petugas</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {filteredTransactions.map((tx) => (
                      <tr key={tx.id} className="hover:bg-[#FCFBF8] transition-colors">
                        <td className="px-6 py-4.5">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-stone-100 border border-stone-200 text-stone-800 flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
                              {getInitials(tx.studentName)}
                            </div>
                            <div>
                              <span className="font-bold text-stone-900 block text-xs">{tx.studentName}</span>
                              <span className="text-[11px] text-stone-400 font-mono mt-0.5 block">
                                NIS: {tx.nis} &bull; {tx.classRoom}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4.5">
                          <span className="font-serif font-bold text-stone-900 block text-xs">{tx.bookTitle}</span>
                          {tx.volumeNumber && (
                            <span className="inline-block mt-1 text-[10px] bg-amber-50 text-amber-900 border border-amber-200/80 px-2 py-0.5 rounded-md font-bold">
                              Vol. {tx.volumeNumber}
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4.5 text-stone-600 font-medium">{tx.loanDate}</td>
                        <td className="px-6 py-4.5 font-semibold text-stone-800">{tx.dueDate}</td>
                        <td className="px-6 py-4.5">
                          {tx.status === 'Dipinjam' ? (
                            <span className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-900 border border-blue-200/80 font-bold px-2.5 py-1 rounded-full text-[11px]">
                              <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
                              Dipinjam
                            </span>
                          ) : tx.status === 'Kembali' ? (
                            <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-900 border border-emerald-200/80 font-bold px-2.5 py-1 rounded-full text-[11px]">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                              Kembali
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 bg-rose-50 text-rose-900 border border-rose-200/80 font-bold px-2.5 py-1 rounded-full text-[11px]">
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-600"></span>
                              Terlambat
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4.5 text-right">
                          {tx.status === 'Dipinjam' ? (
                            <button
                              type="button"
                              onClick={() => handleReturnBook(tx.id)}
                              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-rose-950 hover:bg-rose-900 text-white rounded-xl font-semibold text-xs shadow-xs transition-all cursor-pointer active:scale-95"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                              <span>Kembalikan Buku</span>
                            </button>
                          ) : (
                            <span className="text-[11px] text-stone-400 font-medium">Selesai</span>
                          )}
                        </td>
                      </tr>
                    ))}
                    {filteredTransactions.length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center">
                          <div className="flex flex-col items-center justify-center">
                            <div className="w-12 h-12 rounded-2xl bg-stone-100 flex items-center justify-center text-stone-400 mb-3">
                              <Inbox className="w-6 h-6" />
                            </div>
                            <p className="font-serif font-bold text-stone-800 text-sm">Tidak Ada Sirkulasi</p>
                            <p className="text-xs text-stone-400 mt-1">
                              Tidak ditemukan data transaksi yang sesuai filter atau pencarian Anda.
                            </p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 2: MANAJEMEN ANGGOTA SISWA */}
        {/* ========================================================= */}
        {activeTab === 'members' && (
          <div className="space-y-8 animate-in fade-in duration-200">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 tracking-tight">
                  Manajemen Anggota Siswa
                </h1>
                <p className="text-xs sm:text-sm text-stone-500 mt-1">
                  Verifikasi keaktifan kartu perpustakaan digital siswa dan pengelolaan status bebas denda
                </p>
              </div>

              <div className="relative">
                <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={memberSearch}
                  onChange={(e) => setMemberSearch(e.target.value)}
                  placeholder="Cari siswa, NIS, kelas..."
                  className="text-xs pl-9 pr-3.5 py-2.5 rounded-xl border border-stone-200 bg-white focus:outline-none focus:ring-2 focus:ring-rose-950/20 focus:border-rose-950 transition-all w-64 max-w-full shadow-2xs"
                />
              </div>
            </div>

            {/* Table Card */}
            <div className="bg-white rounded-2xl border border-stone-200/80 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#FAF8F5] text-stone-500 font-bold uppercase tracking-wider text-[11px] border-b border-stone-200/80">
                    <tr>
                      <th className="px-6 py-4">NIS</th>
                      <th className="px-6 py-4">Nama Siswa</th>
                      <th className="px-6 py-4">Kelas</th>
                      <th className="px-6 py-4">Pinjaman Aktif</th>
                      <th className="px-6 py-4">Status Kartu</th>
                      <th className="px-6 py-4 text-right">Tindakan Admin</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {filteredMembers.map((m) => (
                      <tr key={m.nis} className="hover:bg-[#FCFBF8] transition-colors">
                        <td className="px-6 py-4.5">
                          <span className="font-mono font-bold text-stone-900 bg-stone-100/80 px-2.5 py-1 rounded-md text-[11px] border border-stone-200">
                            {m.nis}
                          </span>
                        </td>
                        <td className="px-6 py-4.5">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-rose-50 border border-rose-200 text-rose-950 flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
                              {getInitials(m.name)}
                            </div>
                            <div>
                              <span className="font-bold text-stone-900 block text-xs">{m.name}</span>
                              <span className="text-[11px] text-stone-400">Anggota Perpustakaan</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4.5">
                          <span className="font-semibold text-stone-700 bg-stone-50 border border-stone-200 px-2.5 py-1 rounded-md text-[11px]">
                            {m.classRoom}
                          </span>
                        </td>
                        <td className="px-6 py-4.5 font-bold text-stone-800">
                          {m.activeLoans > 0 ? (
                            <span className="inline-flex items-center gap-1 text-rose-900 font-bold bg-rose-50 border border-rose-200 px-2 py-0.5 rounded">
                              {m.activeLoans} Buku
                            </span>
                          ) : (
                            <span className="text-stone-400 font-medium">0 Buku</span>
                          )}
                        </td>
                        <td className="px-6 py-4.5">
                          <span
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold ${
                              m.status === 'Aktif'
                                ? 'bg-emerald-50 text-emerald-900 border border-emerald-200/80'
                                : m.status === 'Ada Denda'
                                ? 'bg-rose-50 text-rose-900 border border-rose-200/80'
                                : 'bg-amber-50 text-amber-900 border border-amber-200/80'
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                m.status === 'Aktif'
                                  ? 'bg-emerald-600'
                                  : m.status === 'Ada Denda'
                                  ? 'bg-rose-600'
                                  : 'bg-amber-600'
                              }`}
                            ></span>
                            {m.status}
                          </span>
                        </td>
                        <td className="px-6 py-4.5 text-right">
                          <div className="inline-flex items-center justify-end gap-2">
                            {m.status === 'Menunggu Verifikasi' && (
                              <button
                                type="button"
                                onClick={() => handleUpdateMemberStatus(m.nis, 'Aktif')}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-semibold shadow-xs transition-all cursor-pointer active:scale-95"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Verifikasi</span>
                              </button>
                            )}
                            {m.status === 'Ada Denda' && (
                              <button
                                type="button"
                                onClick={() => handleUpdateMemberStatus(m.nis, 'Aktif')}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-stone-900 hover:bg-black text-white rounded-xl text-xs font-semibold shadow-xs transition-all cursor-pointer active:scale-95"
                              >
                                <CheckCheck className="w-3.5 h-3.5" />
                                <span>Lunaskan Denda</span>
                              </button>
                            )}
                            {m.status === 'Aktif' && (
                              <button
                                type="button"
                                onClick={() => handleUpdateMemberStatus(m.nis, 'Ada Denda')}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-rose-200 text-rose-900 hover:bg-rose-50 rounded-xl text-xs font-semibold transition-all cursor-pointer active:scale-95"
                              >
                                <AlertTriangle className="w-3.5 h-3.5 text-rose-700" />
                                <span>Beri Denda</span>
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => handleDeleteMember(m.nis, m.name)}
                              className="p-2 text-stone-400 hover:text-rose-700 hover:bg-rose-50 rounded-xl border border-transparent hover:border-rose-200 transition-colors cursor-pointer"
                              title={`Hapus Anggota ${m.name}`}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filteredMembers.length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center">
                          <div className="flex flex-col items-center justify-center">
                            <div className="w-12 h-12 rounded-2xl bg-stone-100 flex items-center justify-center text-stone-400 mb-3">
                              <Users className="w-6 h-6" />
                            </div>
                            <p className="font-serif font-bold text-stone-800 text-sm">Tidak Ada Anggota</p>
                            <p className="text-xs text-stone-400 mt-1">
                              Tidak ditemukan data siswa yang cocok dengan pencarian Anda.
                            </p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 3: KELOLA KOLEKSI BUKU PERPUSTAKAAN */}
        {/* ========================================================= */}
        {activeTab === 'books' && (
          <div className="space-y-8 animate-in fade-in duration-200">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 tracking-tight">
                  Kelola Koleksi Buku Perpustakaan
                </h1>
                <p className="text-xs sm:text-sm text-stone-500 mt-1">
                  Katalog buku, seri manga multi-volume, moderasi komentar pembaca, dan stok fisik perpustakaan
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={bookSearch}
                    onChange={(e) => setBookSearch(e.target.value)}
                    placeholder="Cari judul, penulis, rak..."
                    className="text-xs pl-9 pr-3.5 py-2.5 rounded-xl border border-stone-200 bg-white focus:outline-none focus:ring-2 focus:ring-rose-950/20 focus:border-rose-950 transition-all w-56 max-w-full shadow-2xs"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setEditingBook(null);
                    setIsBookFormOpen(true);
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-950 hover:bg-rose-900 text-white text-xs font-semibold shadow-xs transition-all cursor-pointer active:scale-95"
                >
                  <Plus className="w-4 h-4" />
                  <span>Tambah Buku / Series</span>
                </button>
              </div>
            </div>

            {/* Books Table Card */}
            <div className="bg-white rounded-2xl border border-stone-200/80 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#FAF8F5] text-stone-500 font-bold uppercase tracking-wider text-[11px] border-b border-stone-200/80">
                    <tr>
                      <th className="px-6 py-4">Sampul &amp; Judul</th>
                      <th className="px-6 py-4">Kategori &amp; Tag</th>
                      <th className="px-6 py-4">Penulis</th>
                      <th className="px-6 py-4">Lokasi Rak</th>
                      <th className="px-6 py-4">Stok Fisik</th>
                      <th className="px-6 py-4">Rating</th>
                      <th className="px-6 py-4 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {filteredBooks.map((b) => (
                      <tr key={b.id} className="hover:bg-[#FCFBF8] transition-colors">
                        {/* Sampul & Judul */}
                        <td className="px-6 py-4.5">
                          <div className="flex items-center gap-3.5">
                            <img
                              src={b.coverImg || '/img/placeholder-book.svg'}
                              alt={b.title}
                              className="w-12 h-16 object-cover rounded-lg shadow-sm border border-stone-200/80 shrink-0 bg-stone-100"
                            />
                            <div className="min-w-0">
                              <span className="font-serif font-bold text-stone-900 block text-xs hover:text-rose-950 transition-colors line-clamp-1">
                                {b.title}
                              </span>
                              <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                                <span className="text-[10px] font-mono text-stone-500 bg-stone-100 border border-stone-200/80 px-1.5 py-0.2 rounded font-medium">
                                  ID: {b.id}
                                </span>
                                {b.hasVolumes && b.volumes && b.volumes.length > 0 && (
                                  <span className="text-[10px] font-bold px-2 py-0.2 rounded bg-amber-50 text-amber-900 border border-amber-200/80">
                                    Series {b.volumes.length} Vol
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Kategori & Tag */}
                        <td className="px-6 py-4.5">
                          <span className="font-medium text-stone-800 block text-xs">{b.category}</span>
                          {b.badge && (
                            <span className="inline-block mt-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-rose-50 text-rose-950 border border-rose-200/80">
                              {b.badge}
                            </span>
                          )}
                        </td>

                        {/* Penulis */}
                        <td className="px-6 py-4.5 text-stone-600 font-medium">{b.author}</td>

                        {/* Lokasi Rak */}
                        <td className="px-6 py-4.5">
                          <span className="font-mono text-stone-700 bg-stone-50 border border-stone-200 px-2.5 py-1 rounded-md text-[11px]">
                            {b.shelf || 'Rak Utama'}
                          </span>
                        </td>

                        {/* Stok */}
                        <td className="px-6 py-4.5">
                          <span className={`font-bold text-xs ${b.stock > 0 ? 'text-stone-900' : 'text-rose-700'}`}>
                            {b.stock} Eks
                          </span>
                          <span className="flex items-center gap-1 text-[10px] text-stone-400 mt-0.5">
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${b.stock > 0 ? 'bg-emerald-500' : 'bg-rose-500'}`}
                            ></span>
                            {b.stock > 0 ? 'Tersedia' : 'Habis'}
                          </span>
                        </td>

                        {/* Rating */}
                        <td className="px-6 py-4.5">
                          <div className="flex items-center gap-1.5">
                            <Star className="w-3.5 h-3.5 text-amber-500 fill-current" />
                            <span className="font-bold text-stone-900 text-xs">
                              {(Number(b.rating) || 0).toFixed(1)}
                            </span>
                          </div>
                          <span className="text-[10px] text-stone-400 block mt-0.5">
                            ({b.reviewsCount || 0} ulasan)
                          </span>
                        </td>

                        {/* Aksi Inline Tidy Row */}
                        <td className="px-6 py-4.5 text-right">
                          <div className="inline-flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingBook(b);
                                setIsBookFormOpen(true);
                              }}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-stone-700 hover:text-stone-900 hover:bg-stone-50 bg-white border border-stone-200/90 rounded-xl text-xs font-semibold cursor-pointer shadow-2xs transition-all active:scale-95"
                              title="Edit Data Buku"
                            >
                              <Pencil className="w-3.5 h-3.5 text-stone-500" />
                              <span>Edit</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => setReviewsModalBook({ id: b.id, title: b.title })}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-amber-900 hover:bg-amber-100/70 bg-amber-50 border border-amber-200/80 rounded-xl text-xs font-semibold cursor-pointer shadow-2xs transition-all active:scale-95"
                              title="Lihat & Moderasi Ulasan"
                            >
                              <MessageSquare className="w-3.5 h-3.5 text-amber-700" />
                              <span>Ulasan ({b.reviewsCount || 0})</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDeleteBook(b.id, b.title)}
                              className="p-2 text-stone-400 hover:text-rose-700 hover:bg-rose-50 rounded-xl border border-transparent hover:border-rose-200 transition-colors cursor-pointer"
                              title={`Hapus buku "${b.title}"`}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filteredBooks.length === 0 && (
                      <tr>
                        <td colSpan={7} className="px-6 py-12 text-center">
                          <div className="flex flex-col items-center justify-center">
                            <div className="w-12 h-12 rounded-2xl bg-stone-100 flex items-center justify-center text-stone-400 mb-3">
                              <BookMarked className="w-6 h-6" />
                            </div>
                            <p className="font-serif font-bold text-stone-800 text-sm">Tidak Ada Koleksi Buku</p>
                            <p className="text-xs text-stone-400 mt-1">
                              Tidak ditemukan data buku yang cocok dengan kata kunci pencarian.
                            </p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 4: LAPORAN & DENDA */}
        {/* ========================================================= */}
        {activeTab === 'report' && (
          <div className="space-y-8 animate-in fade-in duration-200">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 tracking-tight">
                  Laporan Keterlambatan &amp; Denda
                </h1>
                <p className="text-xs sm:text-sm text-stone-500 mt-1">
                  Rekapitulasi sirkulasi, denda keterlambatan buku (Rp 1.000 / hari), serta status pelunasan
                </p>
              </div>
              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-stone-900 hover:bg-black text-white rounded-xl text-xs font-semibold cursor-pointer shadow-xs transition-all active:scale-95"
              >
                <Printer className="w-4 h-4 text-stone-300" />
                <span>Cetak / Simpan PDF</span>
              </button>
            </div>

            {/* 3 Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
              <div className="bg-white p-5 sm:p-6 rounded-2xl border border-stone-200/80 shadow-xs hover:shadow-md transition-all">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider">
                    Total Peminjaman
                  </span>
                  <div className="w-9 h-9 rounded-xl bg-stone-100 text-stone-600 flex items-center justify-center">
                    <FileText className="w-4 h-4" />
                  </div>
                </div>
                <div className="font-serif font-black text-3xl sm:text-4xl text-stone-900 tracking-tight">
                  {transactions.length}
                </div>
                <span className="text-xs text-stone-400 font-medium block mt-2">Rekapitulasi Sirkulasi Keseluruhan</span>
              </div>

              <div className="bg-white p-5 sm:p-6 rounded-2xl border border-stone-200/80 shadow-xs hover:shadow-md transition-all">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[11px] font-bold text-rose-900 uppercase tracking-wider">
                    Total Akumulasi Denda
                  </span>
                  <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-900 flex items-center justify-center">
                    <Coins className="w-4 h-4" />
                  </div>
                </div>
                <div className="font-serif font-black text-3xl sm:text-4xl text-rose-900 tracking-tight">
                  Rp {totalFines.toLocaleString('id-ID')}
                </div>
                <span className="text-xs text-stone-400 font-medium block mt-2">Denda Terhitung Sistem</span>
              </div>

              <div className="bg-white p-5 sm:p-6 rounded-2xl border border-stone-200/80 shadow-xs hover:shadow-md transition-all">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[11px] font-bold text-emerald-900 uppercase tracking-wider">
                    Tarif Denda Resmi
                  </span>
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                </div>
                <div className="font-serif font-black text-3xl sm:text-4xl text-emerald-900 tracking-tight">
                  Rp 1.000 <span className="text-sm font-sans font-normal text-stone-500">/ Hari</span>
                </div>
                <span className="text-xs text-stone-400 font-medium block mt-2">Kebijakan Perpustakaan Sekolah</span>
              </div>
            </div>

            {/* Fines Details Table Card */}
            <div className="bg-white rounded-2xl border border-stone-200/80 shadow-xs overflow-hidden">
              <div className="p-5 sm:p-6 border-b border-stone-200/80">
                <h3 className="font-serif font-bold text-lg text-stone-900">
                  Rincian Transaksi yang Terkena Denda
                </h3>
                <p className="text-xs text-stone-500 mt-1">
                  Daftar keterlambatan dan status pelunasan denda sirkulasi siswa
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#FAF8F5] text-stone-500 font-bold uppercase tracking-wider text-[11px] border-b border-stone-200/80">
                    <tr>
                      <th className="px-6 py-4">NIS &amp; Siswa</th>
                      <th className="px-6 py-4">Judul Buku</th>
                      <th className="px-6 py-4">Jatuh Tempo</th>
                      <th className="px-6 py-4">Denda</th>
                      <th className="px-6 py-4">Status Denda</th>
                      <th className="px-6 py-4 text-right">Aksi Petugas</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {transactions
                      .filter((t) => (t.fine || 0) > 0)
                      .map((tx) => (
                        <tr key={tx.id} className="hover:bg-[#FCFBF8] transition-colors">
                          <td className="px-6 py-4.5">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-rose-50 border border-rose-200 text-rose-950 flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
                                {getInitials(tx.studentName)}
                              </div>
                              <div>
                                <span className="font-bold text-stone-900 block text-xs">{tx.studentName}</span>
                                <span className="text-[11px] text-stone-400 font-mono mt-0.5 block">
                                  NIS: {tx.nis} &bull; {tx.classRoom}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4.5 font-serif font-bold text-stone-800 text-xs">{tx.bookTitle}</td>
                          <td className="px-6 py-4.5 text-stone-600 font-medium">{tx.dueDate}</td>
                          <td className="px-6 py-4.5 font-bold text-rose-900 text-xs">
                            Rp {(tx.fine || 0).toLocaleString('id-ID')}
                          </td>
                          <td className="px-6 py-4.5">
                            {tx.finePaid ? (
                              <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-900 border border-emerald-200/80 font-bold px-2.5 py-1 rounded-full text-[11px]">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                                Lunas
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 bg-rose-50 text-rose-900 border border-rose-200/80 font-bold px-2.5 py-1 rounded-full text-[11px]">
                                <span className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-pulse"></span>
                                Belum Dibayar
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4.5 text-right">
                            {!tx.finePaid && (
                              <button
                                type="button"
                                onClick={() => handlePayFine(tx.id, tx.nis)}
                                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-semibold text-xs shadow-xs transition-all cursor-pointer active:scale-95"
                              >
                                <CheckCheck className="w-3.5 h-3.5" />
                                <span>Lunaskan Denda</span>
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    {transactions.filter((t) => (t.fine || 0) > 0).length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center">
                          <div className="flex flex-col items-center justify-center">
                            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-3">
                              <ShieldCheck className="w-6 h-6" />
                            </div>
                            <p className="font-serif font-bold text-stone-800 text-sm">Tidak Ada Denda Aktif</p>
                            <p className="text-xs text-stone-400 mt-1">
                              Seluruh sirkulasi peminjaman tertib dan bebas tunggakan denda.
                            </p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Clean Admin Footer */}
      <footer className="mt-auto py-6 border-t border-stone-200/80 bg-white/80 text-xs text-stone-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="font-medium text-stone-600">
            &copy; 2026 SISPERPUS &bull; Panel Pengelolaan Perpustakaan Sekolah. Hak Cipta Dilindungi.
          </p>
          <div className="flex items-center gap-2 text-[11px] text-stone-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
            <span>Sesi Petugas Aktif</span>
            <span>&bull;</span>
            <span>SMK Praktik Lintas Bidang</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <BookFormModal
        isOpen={isBookFormOpen}
        editingBook={editingBook}
        existingBooks={books}
        onClose={() => setIsBookFormOpen(false)}
        onSaved={loadAdminData}
      />

      <BookReviewsModal
        bookId={reviewsModalBook?.id ?? null}
        bookTitle={reviewsModalBook?.title ?? ''}
        onClose={() => setReviewsModalBook(null)}
        onMutated={loadAdminData}
      />
    </div>
  );
}
