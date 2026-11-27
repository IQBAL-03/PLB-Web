'use client';

import React, { useState } from 'react';
import { Book, Volume } from '@/types/book';
import { BookReview } from '@/types/review';
import { Member } from '@/types/member';

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
}: BookModalProps) {
  const [selectedVolumeNum, setSelectedVolumeNum] = useState<number>(1);
  const [borrowerNis, setBorrowerNis] = useState<string>('');
  const [borrowerName, setBorrowerName] = useState<string>('');
  const [nisStatusMessage, setNisStatusMessage] = useState<{
    type: 'success' | 'warning' | 'error' | '';
    text: string;
  }>({ type: '', text: '' });

  // Review form states
  const [userRating, setUserRating] = useState<number>(5);
  const [reviewerNis, setReviewerNis] = useState<string>('');
  const [reviewerName, setReviewerName] = useState<string>('');
  const [reviewText, setReviewText] = useState<string>('');
  const [reviewSuccess, setReviewSuccess] = useState<boolean>(false);

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

  // Real-time NIS verification for borrowing
  const handleNisChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.trim();
    setBorrowerNis(val);

    if (!val) {
      setBorrowerName('');
      setNisStatusMessage({ type: '', text: '' });
      return;
    }

    const foundMember = members.find((m) => m.nis === val);
    if (foundMember) {
      setBorrowerName(foundMember.name);
      if (foundMember.status === 'Ada Denda') {
        setNisStatusMessage({
          type: 'error',
          text: 'Peminjaman ditolak: Siswa memiliki denda keterlambatan yang belum dilunasi di perpustakaan.',
        });
      } else if (foundMember.status === 'Menunggu Verifikasi') {
        setNisStatusMessage({
          type: 'warning',
          text: 'Pendaftaran Anda sedang menunggu verifikasi petugas perpustakaan.',
        });
      } else {
        setNisStatusMessage({
          type: 'success',
          text: `Siswa terverifikasi: ${foundMember.name} (${foundMember.classRoom}) - Status: ${foundMember.status}`,
        });
      }
    } else {
      setBorrowerName('');
      setNisStatusMessage({
        type: 'error',
        text: 'NIS tidak ditemukan di sistem perpustakaan. Daftarkan diri di Kartu Anggota.',
      });
    }
  };

  const handleBorrowSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!borrowerNis || !borrowerName) return;

    const foundMember = members.find((m) => m.nis === borrowerNis);
    if (foundMember && foundMember.status === 'Ada Denda') {
      alert('Maaf, peminjaman tidak diizinkan karena terdapat denda keterlambatan yang belum diselesaikan.');
      return;
    }

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
    setReviewSuccess(true);
    setReviewText('');
    setTimeout(() => setReviewSuccess(false), 4000);
  };

  const bookReviews = reviews.filter((r) => r.bookId === book.id);
  const ratingVal = typeof book.rating === 'number' ? book.rating : Number(book.rating) || 0;

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
    >
      <div
        className="fixed inset-0"
        onClick={onClose}
      />

      <div className="relative bg-white rounded-2xl max-w-3xl w-full shadow-2xl border border-stone-200 overflow-hidden z-10 my-8">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200 bg-stone-50/70">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-900" />
            <h3 className="font-serif font-bold text-sm sm:text-base text-stone-900">
              Detail Informasi Buku
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

        {/* Modal Content */}
        <div className="p-6 max-h-[80vh] overflow-y-auto">
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-start">
            {/* Left Cover */}
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
                  <svg className="w-3.5 h-3.5 text-amber-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
                  </svg>
                  <span>Lihat Ukuran Asli</span>
                </div>
              </button>

              <div className="mt-3.5 text-center">
                <p className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider">
                  Lokasi Rak
                </p>
                <p className="text-xs sm:text-sm font-bold text-stone-800">
                  {book.shelf || 'Rak Koleksi Utama'}
                </p>
              </div>
            </div>

            {/* Right Details */}
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

              {/* Rating Snippet */}
              <div className="flex items-center gap-2 mb-3 text-xs">
                <div className="flex items-center gap-0.5 text-amber-500">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <svg
                      key={star}
                      className={`w-3.5 h-3.5 ${
                        ratingVal >= star ? 'text-amber-500' : 'text-stone-300'
                      } fill-current shrink-0`}
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <span className="font-bold text-stone-800 text-xs">
                  {ratingVal.toFixed(1)} / 5
                </span>
                <span className="text-stone-500 text-xs">
                  ({book.reviewsCount || 0} ulasan)
                </span>
              </div>

              {/* 3 Stats Grid */}
              <div className="bg-stone-50 rounded-xl p-3 border border-stone-200 mb-4 text-xs grid grid-cols-3 gap-2">
                <div>
                  <span className="text-stone-500 block">Kategori</span>
                  <span className="font-semibold text-stone-800">{book.category}</span>
                </div>
                <div>
                  <span className="text-stone-500 block">Edisi Bahasa</span>
                  <span className="font-semibold text-stone-800">{book.language || 'Bahasa Indonesia'}</span>
                </div>
                <div>
                  <span className="text-stone-500 block">Sisa Stok</span>
                  <span className={`font-bold ${currentStock > 0 ? 'text-emerald-800' : 'text-rose-800'}`}>
                    {currentStock} Eksemplar
                  </span>
                </div>
              </div>

              {/* Manga Volume Selector */}
              {book.hasVolumes && book.volumes && book.volumes.length > 0 && (
                <div className="mb-4 bg-amber-50/70 border border-amber-200/80 rounded-xl p-3.5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-stone-800 uppercase tracking-wider">
                      Pilih Volume:
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
                  {book.hasVolumes ? 'Sinopsis Umum' : 'Sinopsis'}
                </h4>
                <p className="text-xs sm:text-sm text-stone-600 leading-relaxed whitespace-pre-line">
                  {book.synopsis}
                </p>
              </div>

              {/* Borrow Form with NIS Check & Fine Protection */}
              {isBorrowed ? (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-xs text-blue-900">
                  Buku ini sudah tercatat dalam daftar peminjaman aktif Anda. Harap kembalikan tepat waktu dalam 7 hari kerja.
                </div>
              ) : currentStock > 0 ? (
                <form
                  onSubmit={handleBorrowSubmit}
                  className="border-t border-stone-200 pt-3 flex flex-col gap-2.5"
                >
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label htmlFor="borrowerNis" className="text-xs font-semibold text-stone-700">
                        Nomor Induk Siswa (NIS)
                      </label>
                      <span className="text-[10px] text-stone-400">Wajib Terdaftar &amp; Bebas Denda</span>
                    </div>
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
                        className={`mt-1.5 text-xs p-2 rounded font-medium ${
                          nisStatusMessage.type === 'success'
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : nisStatusMessage.type === 'error'
                            ? 'bg-rose-50 text-rose-800 border border-rose-200'
                            : 'bg-amber-50 text-amber-800 border border-amber-200'
                        }`}
                      >
                        {nisStatusMessage.text}
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
                      placeholder="Nama siswa"
                      required
                    />
                  </div>

                  <div className="text-[11px] text-stone-500 bg-stone-50 p-2.5 rounded-lg border border-stone-200">
                    <span className="font-semibold text-stone-700">Ketentuan Peminjaman:</span> Batas waktu 7 hari kerja. Denda keterlambatan berlaku Rp 1.000 / hari jika melewati jatuh tempo.
                  </div>

                  <button
                    type="submit"
                    disabled={nisStatusMessage.type === 'error'}
                    className={`w-full font-semibold text-xs sm:text-sm py-2.5 px-4 rounded-lg transition-colors cursor-pointer shadow-sm ${
                      nisStatusMessage.type === 'error'
                        ? 'bg-stone-300 text-stone-500 cursor-not-allowed'
                        : 'bg-rose-900 hover:bg-rose-950 text-white'
                    }`}
                  >
                    Konfirmasi Peminjaman {book.hasVolumes && activeVolume ? `(Volume ${activeVolume.volumeNumber})` : ''} (7 Hari)
                  </button>
                </form>
              ) : (
                <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 text-xs text-rose-900">
                  Eksemplar untuk buku/volume ini sedang dipinjam seluruhnya. Silakan pilih volume lain atau periksa kembali nanti.
                </div>
              )}
            </div>
          </div>

          {/* Reviews & Star Rating Section */}
          <div className="mt-8 pt-6 border-t border-stone-200">
            <h4 className="font-serif font-bold text-base text-stone-900 mb-4">
              Ulasan &amp; Penilaian Pembaca ({bookReviews.length})
            </h4>

            {/* Existing reviews */}
            <div className="space-y-3 mb-6">
              {bookReviews.length === 0 ? (
                <p className="text-xs text-stone-500 italic">
                  Belum ada ulasan untuk buku ini. Jadilah pembaca pertama yang memberikan ulasan!
                </p>
              ) : (
                bookReviews.map((rev) => (
                  <div
                    key={rev.id}
                    className="p-3.5 rounded-xl bg-stone-50 border border-stone-200 text-xs"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-1.5 font-semibold text-stone-800">
                        <span>{rev.studentName}</span>
                      </div>
                      <div className="flex items-center gap-0.5 text-amber-500">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <svg
                            key={s}
                            className={`w-3 h-3 ${rev.rating >= s ? 'text-amber-500' : 'text-stone-300'} fill-current`}
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                    </div>
                    <p className="text-stone-600 leading-relaxed">{rev.reviewText}</p>
                  </div>
                ))
              )}
            </div>

            {/* Write a review form */}
            <form onSubmit={handleReviewSubmit} className="bg-stone-50 p-4 rounded-xl border border-stone-200">
              <h5 className="font-semibold text-xs text-stone-800 mb-2">
                Tulis Ulasan &amp; Beri Bintang
              </h5>

              {/* Star selector */}
              <div className="flex items-center gap-1 mb-3">
                <span className="text-xs text-stone-600 mr-2">Pilih Rating:</span>
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setUserRating(star)}
                    className="p-1 focus:outline-none cursor-pointer"
                  >
                    <svg
                      className={`w-5 h-5 ${userRating >= star ? 'text-amber-500' : 'text-stone-300'} fill-current hover:scale-110 transition-transform`}
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  </button>
                ))}
                <span className="text-xs font-bold text-amber-700 ml-2">{userRating} / 5 Bintang</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
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
                  placeholder="Nama Siswa (Contoh: Ahmad - XII PPLG)"
                  required
                  className="w-full text-xs px-3 py-2 rounded-lg border border-stone-300 bg-white"
                />
              </div>

              <textarea
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                placeholder="Bagikan pengalaman membaca Anda..."
                rows={3}
                required
                className="w-full text-xs px-3 py-2 rounded-lg border border-stone-300 bg-white mb-3"
              />

              {reviewSuccess && (
                <div className="mb-3 text-xs bg-emerald-50 text-emerald-800 p-2.5 rounded-lg border border-emerald-200">
                  Ulasan Anda berhasil dikirimkan! Terima kasih atas kontribusi literasinya.
                </div>
              )}

              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-rose-900 hover:bg-rose-950 text-white font-semibold text-xs transition-colors cursor-pointer"
              >
                Kirim Ulasan Pembaca
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
