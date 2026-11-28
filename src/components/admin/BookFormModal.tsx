'use client';

import React, { useEffect, useState, useRef } from 'react';
import { Book, Volume } from '@/types/book';

interface BookFormModalProps {
  isOpen: boolean;
  editingBook: Book | null;
  existingBooks: Book[];
  onClose: () => void;
  onSaved: () => Promise<void> | void;
}

const CATEGORIES = [
  'Komik & Manga',
  'Fiksi & Sastra',
  'Sains & Teknologi',
  'Sejarah & Biografi',
  'Pengembangan Diri',
  'Buku Referensi',
];

const MAX_IMAGE_BYTES = 2 * 1024 * 1024;
const IMAGE_EXT_REGEX = /\.(png|jpe?g|webp|gif|bmp|avif|jfif)$/i;

function isValidImageFile(file: File): boolean {
  if (file.type && file.type.startsWith('image/')) return true;
  if (!file.type || file.type === 'application/octet-stream') {
    return IMAGE_EXT_REGEX.test(file.name);
  }
  return false;
}

async function uploadImageFile(file: File): Promise<{ url: string; public_id: string }> {
  if (file.size > MAX_IMAGE_BYTES) {
    throw new Error('Ukuran foto melebihi batas maksimal 2 MB.');
  }
  if (!isValidImageFile(file)) {
    throw new Error('Hanya berkas foto (PNG, JPG, WEBP) yang diizinkan.');
  }
  const fd = new FormData();
  fd.append('cover', file);
  const res = await fetch('/api/upload/cover', { method: 'POST', body: fd });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.success || !data.url) {
    throw new Error(data.error || 'Gagal mengunggah foto sampul.');
  }
  return { url: data.url, public_id: data.public_id || '' };
}

export default function BookFormModal({
  isOpen,
  editingBook,
  existingBooks,
  onClose,
  onSaved,
}: BookFormModalProps) {
  const mainFileInputRef = useRef<HTMLInputElement | null>(null);
  const [id, setId] = useState('');
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [category, setCategory] = useState('Komik & Manga');
  const [badge, setBadge] = useState('Koleksi Pilihan');
  const [language, setLanguage] = useState('Bahasa Indonesia');
  const [year, setYear] = useState('-');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState(5);
  const [shelf, setShelf] = useState('Rak Utama');
  const [synopsis, setSynopsis] = useState('');
  const [coverImg, setCoverImg] = useState('');
  const [cloudinaryPublicId, setCloudinaryPublicId] = useState('');
  const [genres, setGenres] = useState<string[]>([]);
  const [genreDraft, setGenreDraft] = useState('');
  const [hasVolumes, setHasVolumes] = useState(false);
  const [volumes, setVolumes] = useState<Volume[]>([]);

  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [uploadingVolIndex, setUploadingVolIndex] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    setFormError('');
    if (editingBook) {
      setId(editingBook.id);
      setTitle(editingBook.title);
      setAuthor(editingBook.author);
      setCategory(editingBook.category || 'Komik & Manga');
      setBadge(editingBook.badge || 'Koleksi Pilihan');
      setLanguage(editingBook.language || 'Bahasa Indonesia');
      setYear(editingBook.year || '-');
      setPrice(editingBook.price ? String(editingBook.price) : '');
      setShelf(editingBook.shelf || 'Rak Utama');
      setSynopsis(editingBook.synopsis || '');
      setCoverImg(editingBook.coverImg || '');
      setCloudinaryPublicId(editingBook.cloudinaryPublicId || '');
      setGenres(Array.isArray(editingBook.genres) ? editingBook.genres : []);
      const vols = Array.isArray(editingBook.volumes) ? editingBook.volumes : [];
      const volActive = Boolean(editingBook.hasVolumes && vols.length > 0);
      setHasVolumes(volActive);
      setVolumes(vols.map((v) => ({ ...v })));
      setStock(
        volActive
          ? vols.reduce((sum, v) => sum + (Number(v.stock) || 0), 0)
          : Number(editingBook.stock) || 0
      );
    } else {
      setId('');
      setTitle('');
      setAuthor('');
      setCategory('Komik & Manga');
      setBadge('Koleksi Pilihan');
      setLanguage('Bahasa Indonesia');
      setYear('-');
      setPrice('');
      setStock(5);
      setShelf('Rak Utama');
      setSynopsis('');
      setCoverImg('');
      setCloudinaryPublicId('');
      setGenres([]);
      setGenreDraft('');
      setHasVolumes(false);
      setVolumes([]);
    }
  }, [isOpen, editingBook]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const computedTotalStock =
    hasVolumes && volumes.length > 0
      ? volumes.reduce((sum, v) => sum + (Number(v.stock) || 0), 0)
      : stock;

  const handleAddGenre = () => {
    const clean = genreDraft.trim();
    if (!clean || genres.length >= 10) return;
    if (!genres.some((g) => g.toLowerCase() === clean.toLowerCase())) {
      setGenres([...genres, clean]);
    }
    setGenreDraft('');
  };

  const handleToggleVolumes = (checked: boolean) => {
    setHasVolumes(checked);
    if (checked && volumes.length === 0) {
      setVolumes([
        {
          volumeNumber: 1,
          volumeTitle: 'Volume 1',
          coverImg: coverImg || '',
          stock: 1,
          description: '',
        },
      ]);
    }
  };

  const handleAddVolume = () => {
    const nextNum =
      volumes.reduce((max, v) => Math.max(max, Number(v.volumeNumber) || 0), 0) + 1;
    setVolumes([
      ...volumes,
      {
        volumeNumber: nextNum,
        volumeTitle: `Volume ${nextNum}`,
        coverImg: '',
        stock: 1,
        description: '',
      },
    ]);
  };

  const updateVolume = (index: number, patch: Partial<Volume>) => {
    setVolumes((prev) => prev.map((v, idx) => (idx === index ? { ...v, ...patch } : v)));
  };

  const removeVolume = (index: number) => {
    setVolumes((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleMainCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFormError('');
    setIsUploadingCover(true);
    try {
      const uploaded = await uploadImageFile(file);
      setCoverImg(uploaded.url);
      setCloudinaryPublicId(uploaded.public_id);
    } catch (err: any) {
      setFormError(err.message || 'Gagal mengunggah foto sampul.');
    } finally {
      setIsUploadingCover(false);
      e.target.value = '';
    }
  };

  const handleVolumeCoverUpload = async (
    index: number,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFormError('');
    setUploadingVolIndex(index);
    try {
      const uploaded = await uploadImageFile(file);
      updateVolume(index, { coverImg: uploaded.url });
    } catch (err: any) {
      setFormError(err.message || `Gagal mengunggah foto volume ${index + 1}.`);
    } finally {
      setUploadingVolIndex(null);
      e.target.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    const cleanId = id.trim();
    const cleanTitle = title.trim();
    const cleanAuthor = author.trim();
    if (!cleanTitle || !cleanAuthor) {
      setFormError('Judul dan pengarang buku wajib diisi.');
      return;
    }

    if (!editingBook && cleanId) {
      const duplicate = existingBooks.find(
        (b) => b.id.toLowerCase() === cleanId.toLowerCase()
      );
      if (duplicate) {
        setFormError(`ID buku "${cleanId}" sudah dipakai oleh "${duplicate.title}".`);
        return;
      }
    }

    const activeVolumes = hasVolumes
      ? volumes.map((v, i) => ({
          volumeNumber: Number(v.volumeNumber) || i + 1,
          volumeTitle: v.volumeTitle.trim() || `Volume ${i + 1}`,
          coverImg: (v.coverImg || '').trim(),
          stock: Math.max(0, Number(v.stock) || 0),
          description: (v.description || '').trim(),
        }))
      : [];

    const payload = {
      id: cleanId || undefined,
      originalId: editingBook?.id,
      title: cleanTitle,
      author: cleanAuthor,
      category,
      badge: badge.trim() || 'Koleksi Pilihan',
      genres,
      language,
      year: year.trim() || '-',
      price: Math.max(0, Number(price) || 0),
      stock: computedTotalStock,
      shelf: shelf.trim() || 'Rak Utama',
      synopsis: synopsis.trim(),
      coverImg: coverImg.trim(),
      cloudinaryPublicId,
      hasVolumes: hasVolumes && activeVolumes.length > 0,
      volumes: activeVolumes,
    };

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/books', {
        method: editingBook ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Gagal menyimpan data buku.');
      }
      await onSaved();
      onClose();
    } catch (err: any) {
      setFormError(err.message || 'Terjadi kesalahan saat menyimpan data buku.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="bookFormModalTitle"
    >
      <div className="fixed inset-0 bg-stone-950/60 backdrop-blur-xs" onClick={onClose} />
      <div className="relative z-10 bg-white rounded-2xl max-w-3xl w-full p-5 sm:p-6 shadow-2xl border border-stone-200 max-h-[90vh] overflow-y-auto space-y-5">
        <div className="flex items-start justify-between border-b border-stone-200 pb-3 gap-3">
          <div>
            <h3 id="bookFormModalTitle" className="font-serif text-lg font-bold text-stone-900">
              {editingBook
                ? `Edit Data, Sampul & Seri (${editingBook.id})`
                : 'Tambah Koleksi & Seri Buku Baru'}
            </h3>
            <p className="text-xs text-stone-500">
              Atur informasi katalog, sampul utama, dan daftar volume apabila buku berbentuk seri.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup modal form buku"
            className="min-w-[36px] min-h-[36px] flex items-center justify-center rounded-lg text-stone-500 hover:text-stone-900 hover:bg-stone-100 text-xl font-bold leading-none cursor-pointer"
          >
            &times;
          </button>
        </div>

        {formError && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-800">
            {formError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Cover Upload & Preview */}
          <div className="bg-stone-50 border border-stone-200 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="w-20 aspect-[3/4] rounded-lg bg-stone-200 overflow-hidden border border-stone-300 shrink-0">
              <img
                src={coverImg || '/img/placeholder-book.svg'}
                alt="Pratinjau sampul buku"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 w-full space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <input
                  ref={mainFileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp,.jfif,.avif"
                  onChange={handleMainCoverUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  disabled={isUploadingCover}
                  onClick={() => mainFileInputRef.current?.click()}
                  className="min-h-[36px] px-3.5 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-900 text-white font-semibold cursor-pointer transition-colors disabled:opacity-60"
                >
                  {isUploadingCover ? 'Mengunggah...' : 'Unggah Foto Sampul (Maks 2MB)'}
                </button>
                <span className="text-[11px] text-stone-500">
                  Format: PNG, JPG, WEBP atau masukkan URL di bawah
                </span>
              </div>
              <input
                type="url"
                value={coverImg}
                onChange={(e) => setCoverImg(e.target.value)}
                placeholder="https://... (URL foto sampul)"
                className="w-full px-3 py-2 rounded-lg border border-stone-300 bg-white focus:ring-2 focus:ring-rose-800 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label htmlFor="bookIdInput" className="block font-bold text-stone-700 uppercase mb-1">
                ID Buku
              </label>
              <input
                id="bookIdInput"
                type="text"
                value={id}
                readOnly={Boolean(editingBook)}
                onChange={(e) => setId(e.target.value)}
                placeholder="Opsional (mis. M005)"
                className={`w-full px-3 py-2 rounded-lg border border-stone-300 focus:ring-2 focus:ring-rose-800 focus:outline-none ${
                  editingBook ? 'bg-stone-100 text-stone-500 cursor-not-allowed' : 'bg-white'
                }`}
              />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="bookTitleInput" className="block font-bold text-stone-700 uppercase mb-1">
                Judul Buku
              </label>
              <input
                id="bookTitleInput"
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Judul lengkap buku atau seri"
                className="w-full px-3 py-2 rounded-lg border border-stone-300 focus:ring-2 focus:ring-rose-800 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label htmlFor="bookAuthorInput" className="block font-bold text-stone-700 uppercase mb-1">
                Pengarang
              </label>
              <input
                id="bookAuthorInput"
                type="text"
                required
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="Nama penulis"
                className="w-full px-3 py-2 rounded-lg border border-stone-300 focus:ring-2 focus:ring-rose-800 focus:outline-none"
              />
            </div>
            <div>
              <label htmlFor="bookCategoryInput" className="block font-bold text-stone-700 uppercase mb-1">
                Kategori
              </label>
              <select
                id="bookCategoryInput"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-stone-300 bg-stone-50 focus:ring-2 focus:ring-rose-800 focus:outline-none cursor-pointer"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="bookBadgeInput" className="block font-bold text-stone-700 uppercase mb-1">
                Tag Spesial
              </label>
              <input
                id="bookBadgeInput"
                type="text"
                maxLength={32}
                value={badge}
                onChange={(e) => setBadge(e.target.value)}
                placeholder="Koleksi Pilihan"
                className="w-full px-3 py-2 rounded-lg border border-stone-300 focus:ring-2 focus:ring-rose-800 focus:outline-none"
              />
            </div>
          </div>

          {/* Genre Chips */}
          <div className="border border-stone-200 rounded-xl p-3.5 bg-stone-50/70 space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor="bookGenreInput" className="font-bold text-stone-700 uppercase">
                Genre Buku (Maksimal 10)
              </label>
              <span className="text-[11px] font-semibold text-stone-500">
                {genres.length} / 10 genre
              </span>
            </div>
            <div className="flex items-center gap-2">
              <input
                id="bookGenreInput"
                type="text"
                value={genreDraft}
                onChange={(e) => setGenreDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddGenre();
                  }
                }}
                placeholder="Ketik genre lalu tekan Enter atau Tambah..."
                className="flex-1 px-3 py-2 rounded-lg border border-stone-300 bg-white focus:ring-2 focus:ring-rose-800 focus:outline-none"
              />
              <button
                type="button"
                onClick={handleAddGenre}
                className="min-h-[36px] px-3.5 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-900 text-white font-semibold cursor-pointer shrink-0"
              >
                + Tambah
              </button>
            </div>
            {genres.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {genres.map((g) => (
                  <span
                    key={g}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white border border-stone-300 text-stone-800 font-semibold text-[11px]"
                  >
                    <span>{g}</span>
                    <button
                      type="button"
                      onClick={() => setGenres(genres.filter((item) => item !== g))}
                      aria-label={`Hapus genre ${g}`}
                      className="text-stone-400 hover:text-rose-800 font-bold cursor-pointer"
                    >
                      &times;
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <div>
              <label htmlFor="bookLanguageInput" className="block font-bold text-stone-700 uppercase mb-1">
                Bahasa
              </label>
              <select
                id="bookLanguageInput"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-stone-300 bg-stone-50 focus:ring-2 focus:ring-rose-800 focus:outline-none cursor-pointer"
              >
                <option value="Bahasa Indonesia">Bahasa Indonesia</option>
                <option value="Bahasa Inggris">Bahasa Inggris</option>
              </select>
            </div>
            <div>
              <label htmlFor="bookYearInput" className="block font-bold text-stone-700 uppercase mb-1">
                Tahun Terbit
              </label>
              <input
                id="bookYearInput"
                type="text"
                maxLength={10}
                value={year}
                onChange={(e) => setYear(e.target.value)}
                placeholder="-"
                className="w-full px-3 py-2 rounded-lg border border-stone-300 focus:ring-2 focus:ring-rose-800 focus:outline-none"
              />
            </div>
            <div>
              <label htmlFor="bookPriceInput" className="block font-bold text-stone-700 uppercase mb-1">
                Harga (Rp)
              </label>
              <input
                id="bookPriceInput"
                type="number"
                min={0}
                step={1000}
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="85000"
                className="w-full px-3 py-2 rounded-lg border border-stone-300 focus:ring-2 focus:ring-rose-800 focus:outline-none"
              />
            </div>
            <div>
              <label htmlFor="bookStockInput" className="block font-bold text-stone-700 uppercase mb-1">
                Jumlah Stok
              </label>
              <input
                id="bookStockInput"
                type="number"
                min={0}
                required
                readOnly={hasVolumes}
                value={computedTotalStock}
                onChange={(e) => setStock(Math.max(0, Number(e.target.value) || 0))}
                className={`w-full px-3 py-2 rounded-lg border border-stone-300 focus:ring-2 focus:ring-rose-800 focus:outline-none ${
                  hasVolumes ? 'bg-stone-100 text-stone-600 font-bold cursor-not-allowed' : ''
                }`}
              />
              {hasVolumes && (
                <span className="text-[10px] text-amber-800 font-medium block mt-0.5">
                  Otomatis dari total stok volume
                </span>
              )}
            </div>
            <div className="col-span-2 sm:col-span-1">
              <label htmlFor="bookShelfInput" className="block font-bold text-stone-700 uppercase mb-1">
                Nomor Rak
              </label>
              <input
                id="bookShelfInput"
                type="text"
                required
                value={shelf}
                onChange={(e) => setShelf(e.target.value)}
                placeholder="Rak M-01"
                className="w-full px-3 py-2 rounded-lg border border-stone-300 focus:ring-2 focus:ring-rose-800 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label htmlFor="bookSynopsisInput" className="block font-bold text-stone-700 uppercase mb-1">
              Sinopsis Ringkas
            </label>
            <textarea
              id="bookSynopsisInput"
              rows={2}
              value={synopsis}
              onChange={(e) => setSynopsis(e.target.value)}
              placeholder="Deskripsi ringkas buku..."
              className="w-full px-3 py-2 rounded-lg border border-stone-300 focus:ring-2 focus:ring-rose-800 focus:outline-none"
            />
          </div>

          {/* Series / Multi-Volume Section */}
          <div className="border border-stone-200 rounded-xl p-3.5 bg-stone-50/80 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={hasVolumes}
                  onChange={(e) => handleToggleVolumes(e.target.checked)}
                  className="w-4 h-4 rounded text-rose-900 focus:ring-rose-800 border-stone-300 cursor-pointer"
                />
                <span className="font-bold text-stone-800 uppercase">
                  Buku Ini Memiliki Seri / Multi-Volume
                </span>
              </label>
              {hasVolumes && (
                <button
                  type="button"
                  onClick={handleAddVolume}
                  className="min-h-[34px] px-3 py-1 rounded-lg bg-stone-800 hover:bg-stone-900 text-white text-[11px] font-semibold transition-colors cursor-pointer shadow-2xs"
                >
                  + Tambah Volume
                </button>
              )}
            </div>

            {hasVolumes && (
              <div className="space-y-3 pt-3 border-t border-stone-200">
                <p className="text-xs text-stone-500">
                  Tambahkan daftar volume atau edisi lanjutan. Setiap volume dapat memiliki stok, gambar sampul, dan sinopsis masing-masing. Total stok buku otomatis dijumlahkan dari seluruh volume.
                </p>

                <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
                  {volumes.map((vol, index) => (
                    <div
                      key={index}
                      className="p-3.5 rounded-xl bg-white border border-stone-200 shadow-2xs space-y-3"
                    >
                      <div className="flex items-center justify-between gap-2 pb-2 border-b border-stone-100">
                        <span className="font-bold text-stone-800">
                          Volume #{vol.volumeNumber}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeVolume(index)}
                          className="text-[11px] font-semibold text-rose-700 hover:text-rose-900 px-2 py-1 rounded hover:bg-rose-50 cursor-pointer"
                        >
                          Hapus Volume
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-start">
                        <div className="sm:col-span-2 flex flex-col items-center gap-1.5">
                          <div className="w-14 aspect-[3/4] rounded-md bg-stone-100 border border-stone-200 overflow-hidden">
                            <img
                              src={vol.coverImg || coverImg || '/img/placeholder-book.svg'}
                              alt={`Sampul ${vol.volumeTitle}`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <label className="w-full text-center px-2 py-1 rounded bg-stone-800 hover:bg-stone-900 text-white text-[10px] font-semibold cursor-pointer">
                            {uploadingVolIndex === index ? '...' : 'Foto'}
                            <input
                              type="file"
                              accept="image/png,image/jpeg,image/webp,.jfif,.avif"
                              onChange={(e) => handleVolumeCoverUpload(index, e)}
                              className="hidden"
                            />
                          </label>
                        </div>

                        <div className="sm:col-span-10 space-y-2.5">
                          <div className="grid grid-cols-1 sm:grid-cols-6 gap-2">
                            <div className="sm:col-span-1">
                              <label className="block text-[10px] font-bold text-stone-600 uppercase mb-0.5">
                                No. Vol
                              </label>
                              <input
                                type="number"
                                min={1}
                                value={vol.volumeNumber}
                                onChange={(e) =>
                                  updateVolume(index, {
                                    volumeNumber: Math.max(1, Number(e.target.value) || 1),
                                  })
                                }
                                className="w-full px-2.5 py-1.5 rounded-lg border border-stone-300"
                              />
                            </div>
                            <div className="sm:col-span-4">
                              <label className="block text-[10px] font-bold text-stone-600 uppercase mb-0.5">
                                Judul Volume / Chapter
                              </label>
                              <input
                                type="text"
                                value={vol.volumeTitle}
                                onChange={(e) =>
                                  updateVolume(index, { volumeTitle: e.target.value })
                                }
                                placeholder="Contoh: Volume 1 (Chapter 1-23)"
                                className="w-full px-2.5 py-1.5 rounded-lg border border-stone-300"
                              />
                            </div>
                            <div className="sm:col-span-1">
                              <label className="block text-[10px] font-bold text-stone-600 uppercase mb-0.5">
                                Stok
                              </label>
                              <input
                                type="number"
                                min={0}
                                value={vol.stock}
                                onChange={(e) =>
                                  updateVolume(index, {
                                    stock: Math.max(0, Number(e.target.value) || 0),
                                  })
                                }
                                className="w-full px-2.5 py-1.5 rounded-lg border border-stone-300"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold text-stone-600 uppercase mb-0.5">
                              URL Foto Sampul Volume (Opsional)
                            </label>
                            <input
                              type="url"
                              value={vol.coverImg}
                              onChange={(e) =>
                                updateVolume(index, { coverImg: e.target.value })
                              }
                              placeholder="https://..."
                              className="w-full px-2.5 py-1.5 rounded-lg border border-stone-300"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold text-stone-600 uppercase mb-0.5">
                              Sinopsis Khusus Volume
                            </label>
                            <textarea
                              rows={2}
                              value={vol.description}
                              onChange={(e) =>
                                updateVolume(index, { description: e.target.value })
                              }
                              placeholder="Ringkasan cerita volume ini..."
                              className="w-full px-2.5 py-1.5 rounded-lg border border-stone-300"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-200">
            <button
              type="button"
              onClick={onClose}
              className="min-h-[40px] px-4 py-2 rounded-lg border border-stone-300 text-stone-700 hover:bg-stone-100 font-semibold cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting || isUploadingCover || uploadingVolIndex !== null}
              className="min-h-[40px] px-5 py-2 rounded-lg bg-rose-900 hover:bg-rose-950 text-white font-semibold transition-colors cursor-pointer shadow-xs disabled:opacity-60"
            >
              {isSubmitting
                ? 'Menyimpan...'
                : editingBook
                  ? 'Simpan Perubahan Buku'
                  : 'Simpan Buku Baru'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
