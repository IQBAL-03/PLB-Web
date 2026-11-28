'use client';

import React, { useState } from 'react';
import { Book, Volume } from '@/types/book';
import { BookReview } from '@/types/review';
import { Member } from '@/types/member';
import { Star, BookOpen, MessageSquarePlus } from 'lucide-react';

interface BookModalProps {
  book: Book | null;
  isOpen: boolean;
  isBorrowed: boolean;
  reviews: BookReview[];
  members: Member[];
  onClose: () => void;
  onBorrow: (bookId: string, volumeNumber: number | null, nis: string, studentName: string) => void;
  onSubmitReview: (bookId: string, rating: number, reviewText: string, nis: string, studentName: string) => void;
  onPreviewCover?: (coverImg: string, title: string) => void;
  onOpenRegister?: (nis: string) => void;
}

export default function BookModal({
  book,
  isOpen,
  isBorrowed,
  reviews,
  members,
  onClose,
  onBorrow,
  onSubmitReview,
  onPreviewCover,
  onOpenRegister,
}: BookModalProps) {
  const [selectedVolumeNum, setSelectedVolumeNum] = useState<number>(1);
  const [activeModalAction, setActiveModalAction] = useState<'pinjam' | 'ulasan'>('pinjam');

  // Borrow states
  const [borrowerNis, setBorrowerNis] = useState<string>('');
  const [borrowerName, setBorrowerName] = useState<string>('');
  const [nisStatusMessage, setNisStatusMessage] = useState<{
    type: 'success' | 'warning' | 'error' | 'not_found' | '';
    text: string;
  }>({ type: '', text: '' });

  // Review states
  const [userRating, setUserRating] = useState<number>(5);
  const [reviewerNis, setReviewerNis] = useState<string>('');
  const [reviewerName, setReviewerName] = useState<string>('');
  const [reviewText, setReviewText] = useState<string>('');
  const [reviewSubmitted, setReviewSubmitted] = useState<boolean>(false);

  if (!isOpen || !book) return null;

  // Active volume logic
  let activeVolume: Volume | null = null;
  let activeCover = book.coverImg || '/img/placeholder-book.svg';

  if (book.hasVolumes && book.volumes && book.volumes.length > 0) {
    activeVolume =
      book.volumes.find((v) => v.volumeNumber === selectedVolumeNum) ||
      book.volumes[0];
    if (activeVolume && activeVolume.coverImg) {
      activeCover = activeVolume.coverImg;
    }
  }

  const currentStock = activeVolume ? activeVolume.stock : book.stock;
  const isOutOfStock = currentStock <= 0;

  // Real-time NIS verification for borrowing with live API check
  const handleNisChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.trim();
    setBorrowerNis(val);

    if (!val) {
      setBorrowerName('');
      setNisStatusMessage({ type: '', text: '' });
      return;
    }

    // 1. Check local members first
    let foundMember = members.find((m) => String(m.nis) === val);

    // 2. If not found locally, query live API
    if (!foundMember && val.length >= 3) {
      try {
        const res = await fetch(`/api/members?nis=${encodeURIComponent(val)}`);
        const resJson = await res.json();
        if (resJson && resJson.success && resJson.data) {
          foundMember = resJson.data;
        }
      } catch {
        // network fallback
      }
    }

    if (foundMember) {
      setBorrowerName(foundMember.name);
      if (foundMember.status === 'Ada Denda') {
        setNisStatusMessage({
          type: 'error',
          text: 'Peminjaman ditolak: Siswa memiliki denda keterlambatan buku yang belum diselesaikan.',
        });
      } else if (foundMember.status === 'Menunggu Verifikasi') {
        setNisStatusMessage({
          type: 'warning',
          text: 'Status anggota Anda sedang "Menunggu Verifikasi" oleh pustakawan di Gedung Literasi Lt. 2.',
        });
      } else if (foundMember.activeLoans >= 2) {
        setNisStatusMessage({
          type: 'error',
          text: 'Batas maksimal peminjaman (2 buku aktif) telah tercapai.',
        });
      } else {
        setNisStatusMessage({
          type: 'success',
          text: `Siswa terverifikasi: ${foundMember.name} (${foundMember.classRoom}) - Status Kartu: ${foundMember.status}`,
        });
      }
    } else {
      setBorrowerName('');
      setNisStatusMessage({
        type: 'not_found',
        text: 'NIS tidak ditemukan di sistem perpustakaan.',
      });
    }
  };

  const handleBorrowSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!borrowerNis || !borrowerName) return;

    onBorrow(
      book.id,
      book.hasVolumes ? (activeVolume ? activeVolume.volumeNumber : 1) : null,
      borrowerNis,
      borrowerName
    );
  };

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewText.trim() || !reviewerName.trim()) return;

    onSubmitReview(book.id, userRating, reviewText, reviewerNis, reviewerName);
    setReviewSubmitted(true);
    setReviewText('');
    setTimeout(() => setReviewSubmitted(false), 4000);
  };

  const bookReviews = reviews.filter((r) => r.bookId === book.id);
  const ratingVal = typeof book.rating === 'number' ? book.rating : Number(book.rating) || 0;

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
    >
      <div className="fixed inset-0" onClick={onClose} />

      <div className="relative bg-white rounded-3xl max-w-3xl w-full shadow-2xl border border-stone-200 overflow-hidden z-10 my-8">
        {/* Modal Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200 bg-stone-50/80">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-900" />
            <h3 className="font-serif font-bold text-sm sm:text-base text-stone-900">
              Detail &amp; Penilaian Buku
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

        {/* Modal Scrollable Content */}
        <div className="p-6 max-h-[82vh] overflow-y-auto">
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-start">
            {/* Left Cover Column */}
            <div className="sm:col-span-5 flex flex-col items-center">
              <button
                type="button"
                onClick={() => onPreviewCover && onPreviewCover(activeCover, book.title)}
                className="group relative w-full max-w-[210px] rounded-xl overflow-hidden shadow-md border border-stone-200 bg-stone-100 hover:ring-2 hover:ring-rose-800 transition-all cursor-zoom-in flex items-center justify-center p-2 focus:outline-none"
                title="Klik untuk melihat sampul ukuran asli"
              >
                <img
                  src={activeCover}
                  alt={book.title}
                  className="max-h-[290px] w-auto h-auto max-w-full object-contain rounded transition-transform duration-200 group-hover:scale-102"
                />
                {activeVolume && (
                  <div className="absolute top-2 right-2 bg-stone-900/85 text-white text-[11px] font-bold px-2 py-0.5 rounded shadow-xs">
                    Vol. {activeVolume.volumeNumber}
                  </div>
                )}
                <div className="absolute inset-x-0 bottom-0 bg-stone-950/75 backdrop-blur-xs py-1 px-2 text-center text-[10px] text-white font-medium opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                  <span>Lihat Ukuran Asli</span>
                </div>
              </button>

              <div className="mt-3.5 text-center">
                <p className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider">
                  Lokasi Rak
                </p>
                <p className="text-xs sm:text-sm font-bold text-stone-800">
                  {book.shelf || 'Rak Utama'}
                </p>
              </div>
            </div>

            {/* Right Details Column */}
            <div className="sm:col-span-7 flex flex-col">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                {isBorrowed ? (
                  <span className="inline-block bg-blue-100 text-blue-900 border border-blue-200 text-xs px-2.5 py-0.5 rounded-full font-semibold">
                    Sedang Anda Pinjam
                  </span>
                ) : !isOutOfStock ? (
                  <span className="inline-block bg-emerald-100 text-emerald-900 border border-emerald-200 text-xs px-2.5 py-0.5 rounded-full font-semibold">
                    Tersedia untuk Dipinjam
                  </span>
                ) : (
                  <span className="inline-block bg-rose-100 text-rose-900 border border-rose-200 text-xs px-2.5 py-0.5 rounded-full font-semibold">
                    Stok Sedang Habis
                  </span>
                )}

                <span className="inline-block bg-stone-100 text-stone-800 border border-stone-200 text-xs px-2 py-0.5 rounded font-semibold">
                  {book.language || 'Bahasa Indonesia'}
                </span>
              </div>

              {book.genres && book.genres.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-2">
                  {book.genres.map((g) => (
                    <span
                      key={g}
                      className="inline-block bg-stone-100 text-stone-700 border border-stone-200 text-[11px] px-2.5 py-0.5 rounded-full font-medium"
                    >
                      {g}
                    </span>
                  ))}
                </div>
              )}

              <h2 className="font-serif text-xl sm:text-2xl font-bold text-stone-900 leading-tight mb-1">
                {book.title}
              </h2>

              <p className="text-xs sm:text-sm text-stone-600 font-medium mb-1.5">
                Karya <span className="text-stone-900 font-semibold">{book.author}</span> &bull; Tahun {book.year}
              </p>

              {/* Rating score badge */}
              <div className="flex items-center gap-2 mb-3 text-xs">
                <span className="bg-amber-500 text-stone-950 font-extrabold px-2 py-0.5 rounded text-[11px] flex items-center gap-1">
                  <Star className="w-3 h-3 fill-current text-stone-950" />
                  <span>{ratingVal.toFixed(1)} / 5</span>
                </span>
                <span className="text-stone-500">
                  Berdasarkan {book.reviewsCount || 0} ulasan siswa
                </span>
              </div>

              {/* 3 Stats Grid */}
              <div className="bg-stone-50 rounded-xl p-3 border border-stone-200 mb-4 text-xs grid grid-cols-3 gap-2">
                <div>
                  <span className="text-stone-500 block">Kategori</span>
                  <span className="font-semibold text-stone-800">{book.category}</span>
                </div>
                <div>
                  <span className="text-stone-500 block">Edisi</span>
                  <span className="font-semibold text-stone-800">{book.language || 'Indonesia'}</span>
                </div>
                <div>
                  <span className="text-stone-500 block">Sisa Stok</span>
                  <span className={`font-bold ${currentStock > 0 ? 'text-emerald-800' : 'text-rose-800'}`}>
                    {currentStock} Eks
                  </span>
                </div>
              </div>

              {/* Manga Volume Selector */}
              {book.hasVolumes && book.volumes && book.volumes.length > 0 && (
                <div className="mb-4 bg-amber-50/70 border border-amber-200/80 rounded-xl p-3.5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-stone-800 uppercase tracking-wider">
                      Pilih Volume Seri:
                    </span>
                    <span className="text-xs font-bold text-rose-900">
                      {activeVolume ? activeVolume.volumeTitle : `Volume ${selectedVolumeNum}`}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mb-2.5">
                    {book.volumes.map((v) => (
                      <button
                        key={v.volumeNumber}
                        type="button"
                        onClick={() => setSelectedVolumeNum(v.volumeNumber)}
                        className={`px-2.5 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
                          v.volumeNumber === (activeVolume ? activeVolume.volumeNumber : selectedVolumeNum)
                            ? 'bg-rose-900 text-white shadow-xs'
                            : 'bg-white text-stone-700 border border-stone-300 hover:bg-stone-100'
                        }`}
                      >
                        Vol {v.volumeNumber}
                      </button>
                    ))}
                  </div>
                  {activeVolume && (
                    <div className="pt-2 border-t border-amber-200/60 text-xs">
                      <span className="font-bold text-stone-700 block mb-0.5">
                        Sinopsis {activeVolume.volumeTitle}:
                      </span>
                      <p className="text-stone-700 leading-relaxed">
                        {activeVolume.description}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* General Synopsis */}
              <div className="mb-4">
                <h4 className="text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Sinopsis Buku
                </h4>
                <p className="text-xs sm:text-sm text-stone-600 leading-relaxed whitespace-pre-line">
                  {book.synopsis}
                </p>
              </div>

              {/* Action Tabs: Pinjam Buku vs Beri Rating */}
              <div className="border-t border-stone-200 pt-3">
                <div className="flex items-center gap-2 mb-3">
                  <button
                    type="button"
                    onClick={() => setActiveModalAction('pinjam')}
                    className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                      activeModalAction === 'pinjam'
                        ? 'bg-rose-900 text-white shadow-xs'
                        : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                    }`}
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Pinjam Buku Ini</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveModalAction('ulasan')}
                    className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                      activeModalAction === 'ulasan'
                        ? 'bg-rose-900 text-white shadow-xs'
                        : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                    }`}
                  >
                    <MessageSquarePlus className="w-3.5 h-3.5" />
                    <span>Beri Rating &amp; Ulasan</span>
                  </button>
                </div>

                {/* Tab: Form Peminjaman */}
                {activeModalAction === 'pinjam' && (
                  <div>
                    {isBorrowed ? (
                      <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-xs text-blue-900">
                        Buku ini sedang Anda pinjam. Harap kembalikan dalam batas waktu 7 hari kerja di meja sirkulasi Lt. 2.
                      </div>
                    ) : currentStock > 0 ? (
                      <form onSubmit={handleBorrowSubmit} className="flex flex-col gap-2.5">
                        <div>
                          <label htmlFor="borrowerNis" className="block text-xs font-semibold text-stone-700 mb-1">
                            Nomor Induk Siswa (NIS)
                          </label>
                          <input
                            type="text"
                            id="borrowerNis"
                            value={borrowerNis}
                            onChange={handleNisChange}
                            className="w-full text-xs sm:text-sm px-3 py-2 rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-rose-800"
                            placeholder="Ketik NIS Anda (Contoh: 20261001)"
                            required
                          />
                          {nisStatusMessage.text && (
                            <div
                              className={`mt-1.5 text-xs p-2.5 rounded-lg font-medium flex flex-wrap items-center justify-between gap-1.5 ${
                                nisStatusMessage.type === 'success'
                                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                  : nisStatusMessage.type === 'error'
                                  ? 'bg-rose-50 text-rose-800 border border-rose-200'
                                  : nisStatusMessage.type === 'warning'
                                  ? 'bg-amber-50 text-amber-800 border border-amber-200'
                                  : 'bg-rose-50 text-rose-900 border border-rose-200'
                              }`}
                            >
                              <span>{nisStatusMessage.text}</span>
                              {nisStatusMessage.type === 'not_found' && onOpenRegister && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    onClose();
                                    onOpenRegister(borrowerNis);
                                  }}
                                  className="underline font-bold text-rose-900 hover:text-rose-950 cursor-pointer"
                                >
                                  Daftar Anggota Sekarang &rarr;
                                </button>
                              )}
                            </div>
                          )}
                        </div>

                        <div>
                          <label htmlFor="borrowerName" className="block text-xs font-semibold text-stone-700 mb-1">
                            Nama Lengkap Siswa
                          </label>
                          <input
                            type="text"
                            id="borrowerName"
                            value={borrowerName}
                            onChange={(e) => setBorrowerName(e.target.value)}
                            className="w-full text-xs sm:text-sm px-3 py-2 rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-rose-800"
                            placeholder="Nama otomatis muncul saat NIS valid"
                            required
                          />
                        </div>

                        <button
                          type="submit"
                          disabled={
                            nisStatusMessage.type === 'error' ||
                            nisStatusMessage.type === 'not_found' ||
                            !borrowerNis ||
                            !borrowerName
                          }
                          className={`w-full font-semibold text-xs sm:text-sm py-2.5 px-4 rounded-lg transition-colors shadow-sm mt-1 ${
                            nisStatusMessage.type === 'error' ||
                            nisStatusMessage.type === 'not_found' ||
                            !borrowerNis ||
                            !borrowerName
                              ? 'bg-stone-300 text-stone-500 cursor-not-allowed'
                              : 'bg-rose-900 hover:bg-rose-950 text-white cursor-pointer'
                          }`}
                        >
                          Konfirmasi Pinjam {book.hasVolumes && activeVolume ? `(Vol. ${activeVolume.volumeNumber})` : ''} (7 Hari)
                        </button>
                      </form>
                    ) : (
                      <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 text-xs text-rose-900">
                        Seluruh eksemplar buku ini sedang dipinjam. Periksa kembali beberapa hari lagi.
                      </div>
                    )}
                  </div>
                )}

                {/* Tab: Form Beri Rating */}
                {activeModalAction === 'ulasan' && (
                  <form onSubmit={handleReviewSubmit} className="bg-stone-50 p-4 rounded-xl border border-stone-200">
                    <h5 className="font-semibold text-xs text-stone-800 mb-2">
                      Beri Penilaian Bintang &amp; Pendapatmu
                    </h5>

                    {/* Star selector */}
                    <div className="flex items-center gap-1 mb-3">
                      <span className="text-xs text-stone-600 mr-1">Rating:</span>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setUserRating(star)}
                          className="p-1 focus:outline-none cursor-pointer"
                        >
                          <Star
                            className={`w-5 h-5 ${
                              userRating >= star
                                ? 'text-amber-500 fill-current'
                                : 'text-stone-300'
                            } hover:scale-115 transition-transform`}
                          />
                        </button>
                      ))}
                      <span className="text-xs font-bold text-amber-700 ml-2">
                        {userRating} / 5 Bintang
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-2.5">
                      <input
                        type="text"
                        value={reviewerNis}
                        onChange={(e) => setReviewerNis(e.target.value)}
                        placeholder="NIS Siswa (Opsional)"
                        className="w-full text-xs px-3 py-2 rounded-lg border border-stone-300 bg-white"
                      />
                      <input
                        type="text"
                        value={reviewerName}
                        onChange={(e) => setReviewerName(e.target.value)}
                        placeholder="Nama Siswa (Contoh: Ahmad XII PPLG)"
                        required
                        className="w-full text-xs px-3 py-2 rounded-lg border border-stone-300 bg-white"
                      />
                    </div>

                    <textarea
                      value={reviewText}
                      onChange={(e) => setReviewText(e.target.value)}
                      placeholder="Bagikan ulasan atau kesan setelah membaca buku ini..."
                      rows={3}
                      required
                      className="w-full text-xs px-3 py-2 rounded-lg border border-stone-300 bg-white mb-2.5"
                    />

                    {reviewSubmitted && (
                      <div className="mb-2.5 text-xs bg-emerald-50 text-emerald-800 p-2.5 rounded-lg border border-emerald-200">
                        Ulasan Anda berhasil dikirimkan! Nilai rating buku otomatis diperbarui.
                      </div>
                    )}

                    <button
                      type="submit"
                      className="px-4 py-2 rounded-lg bg-rose-900 hover:bg-rose-950 text-white font-semibold text-xs transition-colors cursor-pointer"
                    >
                      Kirim Penilaian
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>

          {/* Reader Reviews List */}
          <div className="mt-8 pt-6 border-t border-stone-200">
            <h4 className="font-serif font-bold text-base text-stone-900 mb-4">
              Ulasan Pembaca ({bookReviews.length})
            </h4>

            <div className="space-y-3">
              {bookReviews.length === 0 ? (
                <p className="text-xs text-stone-500 italic">
                  Belum ada ulasan untuk buku ini. Silakan gunakan tab &ldquo;Beri Rating &amp; Ulasan&rdquo; untuk menjadi pengulas pertama!
                </p>
              ) : (
                bookReviews.map((rev) => (
                  <div
                    key={rev.id}
                    className="p-3.5 rounded-xl bg-stone-50 border border-stone-200 text-xs"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-semibold text-stone-800">{rev.studentName}</span>
                      <div className="flex items-center gap-0.5 text-amber-500">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            className={`w-3 h-3 ${
                              rev.rating >= s ? 'text-amber-500 fill-current' : 'text-stone-300'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-stone-600 leading-relaxed">{rev.reviewText}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
