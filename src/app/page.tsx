'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Header from '@/components/Header';
import HeroSection from '@/components/HeroSection';
import SpotlightSection from '@/components/SpotlightSection';
import BorrowingGuideSection from '@/components/BorrowingGuideSection';
import LibraryProfileSection from '@/components/LibraryProfileSection';
import CatalogSection from '@/components/CatalogSection';
import Footer from '@/components/Footer';
import BookModal from '@/components/BookModal';
import MemberCardModal from '@/components/MemberCardModal';
import ImagePreviewModal from '@/components/ImagePreviewModal';
import ToastContainer, { ToastMessage } from '@/components/Toast';

import { starterBooks } from '@/data/starter-books';
import { starterMembers } from '@/data/starter-members';
import { starterReviews } from '@/data/starter-reviews';
import { starterTransactions } from '@/data/starter-transactions';
import { Book, BookCategory } from '@/types/book';
import { Member } from '@/types/member';
import { BookReview } from '@/types/review';
import { Transaction } from '@/types/transaction';
import { resolveWeeklySpotlight } from '@/lib/spotlight';

const categories: BookCategory[] = [
  'Semua Koleksi',
  'Komik & Manga',
  'Fiksi & Sastra',
  'Sains & Teknologi',
  'Sejarah & Biografi',
  'Pengembangan Diri',
  'Buku Referensi',
];

export default function HomePage() {
  const [books, setBooks] = useState<Book[]>(starterBooks);
  const [members, setMembers] = useState<Member[]>(starterMembers);
  const [reviews, setReviews] = useState<BookReview[]>(starterReviews);
  const [transactions, setTransactions] = useState<Transaction[]>(starterTransactions);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeCategory, setActiveCategory] = useState<BookCategory>('Semua Koleksi');

  // Modal states
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [isMemberCardOpen, setIsMemberCardOpen] = useState<boolean>(false);
  const [previewCover, setPreviewCover] = useState<{ isOpen: boolean; url: string; title: string }>({
    isOpen: false,
    url: '',
    title: '',
  });

  // Toast helper
  const addToast = (message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info', title?: string) => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, message, type, title }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  // Fetch live data from API on mount with localStorage & starter fallback
  useEffect(() => {
    let isMounted = true;

    // 1. Initial local load
    if (typeof window !== 'undefined') {
      try {
        const storedBooks = localStorage.getItem('sisperpus_books');
        if (storedBooks) setBooks(JSON.parse(storedBooks));

        const storedMembers = localStorage.getItem('sisperpus_members');
        if (storedMembers) setMembers(JSON.parse(storedMembers));

        const storedReviews = localStorage.getItem('sisperpus_reviews');
        if (storedReviews) setReviews(JSON.parse(storedReviews));

        const storedTx = localStorage.getItem('sisperpus_transactions');
        if (storedTx) setTransactions(JSON.parse(storedTx));
      } catch (e) {
        console.error('Error loading stored state:', e);
      }
    }

    // 2. Fetch live data from backend API
    const loadLiveApiData = async () => {
      try {
        const [booksRes, membersRes, reviewsRes, txRes] = await Promise.allSettled([
          fetch('/api/books', { cache: 'no-store' }).then((r) => r.json()),
          fetch('/api/members', { cache: 'no-store' }).then((r) => r.json()),
          fetch('/api/reviews', { cache: 'no-store' }).then((r) => r.json()),
          fetch('/api/transactions', { cache: 'no-store' }).then((r) => r.json()),
        ]);

        if (!isMounted) return;

        if (booksRes.status === 'fulfilled' && booksRes.value?.success && Array.isArray(booksRes.value?.data)) {
          setBooks(booksRes.value.data);
        }
        if (membersRes.status === 'fulfilled' && membersRes.value?.success && Array.isArray(membersRes.value?.data)) {
          setMembers(membersRes.value.data);
        }
        if (reviewsRes.status === 'fulfilled' && reviewsRes.value?.success && Array.isArray(reviewsRes.value?.data)) {
          setReviews(reviewsRes.value.data);
        }
        if (txRes.status === 'fulfilled' && txRes.value?.success && Array.isArray(txRes.value?.data)) {
          setTransactions(txRes.value.data);
        }
      } catch (err) {
        console.warn('API sync warning (using offline cache):', err);
      }
    };

    loadLiveApiData();

    return () => {
      isMounted = false;
    };
  }, []);

  // Sync to local storage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('sisperpus_books', JSON.stringify(books));
        localStorage.setItem('sisperpus_members', JSON.stringify(members));
        localStorage.setItem('sisperpus_reviews', JSON.stringify(reviews));
        localStorage.setItem('sisperpus_transactions', JSON.stringify(transactions));
      } catch {}
    }
  }, [books, members, reviews, transactions]);

  // Spotlight computation
  const spotlight = useMemo(() => resolveWeeklySpotlight(books), [books]);

  // Set of currently borrowed book IDs
  const borrowedBookIds = useMemo(() => {
    return new Set(
      transactions
        .filter((t) => t.status === 'Dipinjam')
        .map((t) => t.bookId)
    );
  }, [transactions]);

  // Handle borrowing a book with API integration
  const handleBorrowBook = async (
    bookId: string,
    volumeNumber: number | null,
    nis: string,
    studentName: string
  ) => {
    try {
      const res = await fetch('/api/transactions/borrow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nis, bookId, volumeNumber }),
      });

      const resData = await res.json();

      if (!res.ok || !resData.success) {
        addToast(
          resData.error || 'Peminjaman ditolak oleh sistem perpustakaan.',
          'error',
          'Peminjaman Gagal'
        );
        return;
      }

      const newTx: Transaction = resData.data;

      // Update local state
      setTransactions((prev) => [newTx, ...prev]);

      setBooks((prev) =>
        prev.map((b) => {
          if (b.id !== bookId) return b;
          let updatedVolumes = b.volumes;
          if (volumeNumber && b.hasVolumes && b.volumes) {
            updatedVolumes = b.volumes.map((v) =>
              v.volumeNumber === volumeNumber
                ? { ...v, stock: Math.max(0, v.stock - 1) }
                : v
            );
          }
          return {
            ...b,
            stock: Math.max(0, b.stock - 1),
            borrowCount: (b.borrowCount || 0) + 1,
            volumes: updatedVolumes,
          };
        })
      );

      setMembers((prev) =>
        prev.map((m) =>
          m.nis === nis ? { ...m, activeLoans: m.activeLoans + 1 } : m
        )
      );

      setSelectedBook(null);

      addToast(
        resData.message || `Buku berhasil dipinjam atas nama ${studentName}. Batas pengembalian: ${newTx.dueDate}.`,
        'success',
        'Peminjaman Berhasil!'
      );
    } catch (err: any) {
      console.error('Borrow request error:', err);
      addToast(
        'Terjadi kendala saat menghubungkan ke database server.',
        'error',
        'Koneksi Gagal'
      );
    }
  };

  // Handle submitting a review with API integration
  const handleSubmitReview = async (
    bookId: string,
    rating: number,
    reviewText: string,
    nis: string,
    studentName: string
  ) => {
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookId, rating, reviewText, nis, studentName }),
      });

      const resData = await res.json();

      if (!res.ok || !resData.success) {
        addToast(resData.error || 'Gagal mengirimkan ulasan buku.', 'error', 'Gagal Mengirim');
        return;
      }

      const newReview: BookReview = resData.data;
      const updatedReviews = [newReview, ...reviews];
      setReviews(updatedReviews);

      // Recalculate book average rating
      const bookReviews = updatedReviews.filter((r) => r.bookId === bookId);
      const avgRating =
        bookReviews.reduce((acc, r) => acc + r.rating, 0) / bookReviews.length;

      setBooks((prev) =>
        prev.map((b) =>
          b.id === bookId
            ? {
                ...b,
                rating: Number(avgRating.toFixed(1)),
                reviewsCount: bookReviews.length,
              }
            : b
        )
      );

      addToast(
        `Terima kasih ${studentName}! Penilaian bintang ${rating}/5 dan ulasan Anda telah disimpan.`,
        'success',
        'Ulasan Terkirim'
      );
    } catch (err) {
      console.error('Review request error:', err);
      addToast('Terjadi kendala saat menyimpan ulasan ke server.', 'error', 'Koneksi Gagal');
    }
  };

  // Handle register member with API integration
  const handleRegisterMember = async (nis: string, name: string, classRoom: string) => {
    try {
      const res = await fetch('/api/members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nis, name, classRoom }),
      });

      const resData = await res.json();

      if (!res.ok || !resData.success) {
        addToast(resData.error || 'Gagal mendaftarkan anggota baru.', 'error', 'Pendaftaran Gagal');
        return;
      }

      const newMember: Member = resData.data;
      setMembers((prev) => [newMember, ...prev]);

      addToast(
        `Pendaftaran anggota dengan NIS ${nis} (${name}) berhasil dibuat dan berstatus ${newMember.status}.`,
        'success',
        'Anggota Terdaftar'
      );
    } catch (err) {
      console.error('Member register error:', err);
      addToast('Terjadi kendala saat mendaftarkan anggota ke server.', 'error', 'Koneksi Gagal');
    }
  };

  const handleOpenCoverPreview = (coverImg: string, title: string) => {
    setPreviewCover({
      isOpen: true,
      url: coverImg,
      title,
    });
  };

  return (
    <>
      <Header
        onOpenMemberCard={() => setIsMemberCardOpen(true)}
        onOpenSearch={() => {
          const catElem = document.getElementById('katalog');
          if (catElem) catElem.scrollIntoView({ behavior: 'smooth' });
        }}
      />

      <main className="flex-grow">
        <HeroSection
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onCategoryFilter={(cat) => setActiveCategory(cat as BookCategory)}
        />

        <SpotlightSection
          spotlight={spotlight}
          onSelectBook={setSelectedBook}
          onPreviewCover={handleOpenCoverPreview}
        />

        {/* 4 Steps Borrowing Guide (Option A - Polished) */}
        <BorrowingGuideSection />

        {/* School Profile & 4 Facilities (Option A - Theme Matched) */}
        <LibraryProfileSection />

        {/* Catalog Section with Clickable Cards & Clean Visual Hierarchy */}
        <CatalogSection
          books={books}
          categories={categories}
          activeCategory={activeCategory}
          searchQuery={searchQuery}
          borrowedBookIds={borrowedBookIds}
          onSelectCategory={setActiveCategory}
          onSelectBook={setSelectedBook}
          onPreviewCover={handleOpenCoverPreview}
        />
      </main>

      <Footer />

      {/* Book Detail & Rating / Borrow Modal */}
      <BookModal
        book={selectedBook}
        isOpen={Boolean(selectedBook)}
        isBorrowed={selectedBook ? borrowedBookIds.has(selectedBook.id) : false}
        reviews={reviews}
        members={members}
        onClose={() => setSelectedBook(null)}
        onBorrow={handleBorrowBook}
        onSubmitReview={handleSubmitReview}
        onPreviewCover={handleOpenCoverPreview}
      />

      {/* Member Card & Digital ID Modal */}
      <MemberCardModal
        isOpen={isMemberCardOpen}
        members={members}
        transactions={transactions}
        onClose={() => setIsMemberCardOpen(false)}
        onRegisterMember={handleRegisterMember}
      />

      {/* Full-size Image Preview Lightbox */}
      <ImagePreviewModal
        isOpen={previewCover.isOpen}
        imageUrl={previewCover.url}
        title={previewCover.title}
        onClose={() => setPreviewCover({ isOpen: false, url: '', title: '' })}
      />

      {/* Sleek Toast Notifications */}
      <ToastContainer
        toasts={toasts}
        onDismiss={(id) => setToasts((prev) => prev.filter((t) => t.id !== id))}
      />
    </>
  );
}
