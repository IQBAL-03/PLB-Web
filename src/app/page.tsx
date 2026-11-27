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

  // Load persisted local storage or fetch from API on mount
  useEffect(() => {
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

  // Handle borrowing a book
  const handleBorrowBook = (
    bookId: string,
    volumeNumber: number | null,
    nis: string,
    studentName: string
  ) => {
    const today = new Date();
    const dueDate = new Date();
    dueDate.setDate(today.getDate() + 7);

    const targetBook = books.find((b) => b.id === bookId);
    if (!targetBook) return;

    // Check fine status
    const targetMember = members.find((m) => m.nis === nis);
    if (targetMember && targetMember.status === 'Ada Denda') {
      addToast(
        'Peminjaman ditolak: Siswa memiliki denda keterlambatan buku yang belum dilunasi di perpustakaan.',
        'error',
        'Peminjaman Ditolak'
      );
      return;
    }

    // Create new transaction
    const newTx: Transaction = {
      id: `TRX-${Date.now()}`,
      nis,
      studentName,
      classRoom: targetMember?.classRoom || 'XII-PPLG',
      bookId,
      bookTitle: targetBook.title,
      volumeNumber,
      price: targetBook.price,
      loanDate: today.toISOString().split('T')[0],
      dueDate: dueDate.toISOString().split('T')[0],
      returnDate: null,
      status: 'Dipinjam',
      fine: 0,
      finePaid: true,
      createdAt: new Date().toISOString(),
    };

    setTransactions((prev) => [newTx, ...prev]);

    // Update book stock and borrow count
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

    // Update member's active loan count
    setMembers((prev) =>
      prev.map((m) =>
        m.nis === nis ? { ...m, activeLoans: m.activeLoans + 1 } : m
      )
    );

    setSelectedBook(null);

    addToast(
      `Buku "${targetBook.title}${volumeNumber ? ` (Vol. ${volumeNumber})` : ''}" berhasil dipinjam atas nama ${studentName}. Batas pengembalian: ${newTx.dueDate}.`,
      'success',
      'Peminjaman Berhasil!'
    );
  };

  // Handle submitting a review
  const handleSubmitReview = (
    bookId: string,
    rating: number,
    reviewText: string,
    nis: string,
    studentName: string
  ) => {
    const newReview: BookReview = {
      id: `rev-${Date.now()}`,
      bookId,
      nis,
      studentName,
      rating,
      reviewText,
      createdAt: new Date().toISOString(),
    };

    const updatedReviews = [newReview, ...reviews];
    setReviews(updatedReviews);

    // Recalculate book's rating and reviews count
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
  };

  // Handle register member
  const handleRegisterMember = (nis: string, name: string, classRoom: string) => {
    const newMember: Member = {
      nis,
      name,
      classRoom,
      activeLoans: 0,
      status: 'Aktif',
      createdAt: new Date().toISOString(),
    };
    setMembers((prev) => [newMember, ...prev]);
    addToast(
      `Pendaftaran anggota dengan NIS ${nis} (${name}) berhasil dibuat dan langsung berstatus Aktif.`,
      'success',
      'Anggota Baru Terdaftar'
    );
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
