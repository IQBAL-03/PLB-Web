/**
 * @file Handlers and form bindings for book catalog CRUD and cover image management in the admin panel.
 */

import { $ } from '../../utils/dom.js';
import { showToast } from '../../utils/toast.js';
import { adminState } from '../admin-state.js';
import { booksView } from '../views/books-view.js';
import { imagePreviewModal } from '../../features/modal/image-preview.modal.js';
import { bookVolumeHelper } from './book-volume-helper.js';
import { bookGenreHelper } from './book-genre-helper.js';

export const bookActions = {
  bind(switchTabFn) {
    bookVolumeHelper.bind();
    bookGenreHelper.bind();
    document.addEventListener('click', async (e) => {
      // Full photo popup preview on card cover click
      const previewBtn = e.target.closest('[data-action="preview-cover"]');
      if (previewBtn) {
        const src = previewBtn.dataset.coverSrc;
        const title = previewBtn.dataset.bookTitle;
        if (src) imagePreviewModal.open(src, title);
        return;
      }

      // Trigger cover photo upload file chooser
      if (e.target.closest('#triggerCoverUploadBtn')) {
        const fileInput = $('#bookCoverFileInput');
        if (fileInput) fileInput.click();
        return;
      }

      // Open add modal
      if (e.target.closest('#openAddBookBtn')) {
        const modal = $('#bookModalDialog');
        const form = $('#bookForm');
        if (modal && form) {
          form.reset();
          $('#bookFormOriginalId').value = '';
          if ($('#bookYearInput')) $('#bookYearInput').value = '-';
          $('#bookPriceInput').value = '';
          $('#bookCoverInput').value = '';
          $('#bookCloudinaryIdInput').value = '';
          $('#bookModalCoverPreview').src = 'img/placeholder-book.svg';
          $('#bookCoverFileName').textContent = 'Belum ada foto yang dipilih (Maks 2MB)';
          $('#bookModalTitle').textContent = 'Tambah Koleksi & Sampul Buku Baru';
          bookGenreHelper.setGenres([]);
          if ($('#bookHasVolumesCheckbox')) $('#bookHasVolumesCheckbox').checked = false;
          if ($('#bookVolumesSection')) $('#bookVolumesSection').classList.add('hidden');
          if ($('#addNewVolumeItemBtn')) $('#addNewVolumeItemBtn').classList.add('hidden');
          if ($('#bookVolumesList')) $('#bookVolumesList').innerHTML = '';
          bookVolumeHelper.syncTotalStock(false);
          modal.classList.remove('hidden');
        }
        return;
      }

      // Close modal
      if (e.target.closest('#closeBookModalBtn') || e.target.dataset.closeBookModal) {
        const modal = $('#bookModalDialog');
        if (modal) modal.classList.add('hidden');
        return;
      }

      // Edit book
      const editBtn = e.target.closest('[data-book-action="edit"]');
      if (editBtn) {
        const id = editBtn.dataset.id;
        await adminState.syncBooksFromAPI();
        const book = adminState.books.find((b) => b.id === id);
        if (book) {
          const cover = book.coverImg || '';
          $('#bookFormOriginalId').value = book.id;
          $('#bookIdInput').value = book.id;
          $('#bookTitleInput').value = book.title;
          $('#bookAuthorInput').value = book.author;
          $('#bookCategoryInput').value = book.category;
          $('#bookLanguageInput').value = book.language || 'Bahasa Indonesia';
          if ($('#bookYearInput')) $('#bookYearInput').value = book.year || '-';
          $('#bookPriceInput').value = book.price || '';
          $('#bookStockInput').value = book.stock;
          $('#bookShelfInput').value = book.shelf;
          $('#bookSynopsisInput').value = book.synopsis || '';
          $('#bookCoverInput').value = cover;
          $('#bookCloudinaryIdInput').value = '';
          $('#bookModalCoverPreview').src = cover || 'img/placeholder-book.svg';
          $('#bookCoverFileName').textContent = cover ? (cover.startsWith('http') ? 'Tersimpan di Cloudinary' : cover) : 'Belum ada foto (Maks 2MB)';
          $('#bookModalTitle').textContent = `Edit Buku & Sampul (${book.id})`;
          bookGenreHelper.setGenres(book.genres || []);
          const hasVols = Boolean(book.hasVolumes && book.volumes && book.volumes.length > 0);
          if ($('#bookHasVolumesCheckbox')) $('#bookHasVolumesCheckbox').checked = hasVols;
          if ($('#bookVolumesSection')) $('#bookVolumesSection').classList.toggle('hidden', !hasVols);
          if ($('#addNewVolumeItemBtn')) $('#addNewVolumeItemBtn').classList.toggle('hidden', !hasVols);
          if (hasVols) {
            bookVolumeHelper.populate(book.volumes, cover);
          } else if ($('#bookVolumesList')) {
            $('#bookVolumesList').innerHTML = '';
          }
          bookVolumeHelper.syncTotalStock(hasVols);
          $('#bookModalDialog').classList.remove('hidden');
        }
        return;
      }

      // Delete book
      const delBtn = e.target.closest('[data-book-action="delete"]');
      if (delBtn) {
        const id = delBtn.dataset.id;
        if (confirm(`Yakin ingin menghapus buku ${id} dari katalog TiDB?`)) {
          await adminState.deleteBook(id);
          switchTabFn('books');
          showToast(`Buku ${id} berhasil dihapus dari sistem dan TiDB.`, 'success');
        }
      }
    });

    // Cover photo file upload to Cloudinary (max 2 MB, images only)
    document.addEventListener('change', async (e) => {
      if (e.target.id === 'bookCoverFileInput') {
        const file = e.target.files && e.target.files[0];
        if (!file) return;

        const MAX_BYTES = 2 * 1024 * 1024;
        if (file.size > MAX_BYTES) {
          showToast('Ukuran foto melebihi batas maksimal 2 MB.', 'error');
          e.target.value = '';
          return;
        }

        if (!file.type.startsWith('image/')) {
          showToast('Hanya berkas foto (PNG, JPG, WEBP) yang diizinkan.', 'error');
          e.target.value = '';
          return;
        }

        const preview = $('#bookModalCoverPreview');
        if (preview) preview.src = URL.createObjectURL(file);
        if ($('#bookCoverFileName')) $('#bookCoverFileName').textContent = file.name;
        if ($('#bookModalCoverUploading')) $('#bookModalCoverUploading').classList.remove('hidden');
        const triggerBtn = $('#triggerCoverUploadBtn');
        if (triggerBtn) triggerBtn.disabled = true;

        const formData = new FormData();
        formData.append('cover', file);

        try {
          const res = await fetch('/api/upload/cover', { method: 'POST', body: formData });
          const data = await res.json();
          if (!res.ok || !data.success) throw new Error(data.error || data.message || 'Gagal mengunggah foto ke Cloudinary.');
          if ($('#bookCoverInput')) $('#bookCoverInput').value = data.url;
          if ($('#bookCloudinaryIdInput')) $('#bookCloudinaryIdInput').value = data.public_id || '';
          if (preview) preview.src = data.url;
          showToast('Foto sampul berhasil diunggah ke Cloudinary.', 'success');
        } catch (err) {
          showToast(err.message || 'Terjadi kesalahan saat mengunggah foto.', 'error');
        } finally {
          if ($('#bookModalCoverUploading')) $('#bookModalCoverUploading').classList.add('hidden');
          if (triggerBtn) triggerBtn.disabled = false;
        }
      }
    });

    // Form submission
    document.addEventListener('submit', async (e) => {
      if (e.target.id === 'bookForm') {
        e.preventDefault();
        const origId = $('#bookFormOriginalId').value;
        const id = $('#bookIdInput').value.trim();
        const title = $('#bookTitleInput').value.trim();
        const author = $('#bookAuthorInput').value.trim();
        const category = $('#bookCategoryInput').value;
        const language = $('#bookLanguageInput').value;
        const year = ($('#bookYearInput') ? $('#bookYearInput').value.trim() : '') || '-';
        const price = Number($('#bookPriceInput').value) || 0;
        const hasVolumes = $('#bookHasVolumesCheckbox') ? $('#bookHasVolumesCheckbox').checked : false;
        const volumes = hasVolumes ? bookVolumeHelper.collect() : [];
        const stock = hasVolumes && volumes.length > 0
          ? volumes.reduce((sum, v) => sum + (Number(v.stock) || 0), 0)
          : (Number($('#bookStockInput').value) || 0);
        const shelf = $('#bookShelfInput').value.trim();
        const synopsis = $('#bookSynopsisInput').value.trim();
        const coverImg = $('#bookCoverInput').value.trim() || '';
        const genres = bookGenreHelper.getGenres();

        const origBook = origId ? adminState.books.find((b) => b.id === origId) : null;
        if (hasVolumes && origBook && Array.isArray(origBook.volumes)) {
          volumes.forEach((vol) => {
            if (!vol.coverImg) {
              const prevVol = origBook.volumes.find((pv) => pv.volumeNumber === vol.volumeNumber);
              if (prevVol && prevVol.coverImg) {
                vol.coverImg = prevVol.coverImg;
              }
            }
          });
        }
        const rating = origBook && origBook.rating ? Number(origBook.rating) : (id === 'M003' ? 5 : 4.9);
        const isPopular = origBook ? Boolean(origBook.isPopular) : true;
        const isSpotlight = origBook ? Boolean(origBook.isSpotlight) : false;
        const reviewsCount = origBook ? (origBook.reviewsCount || 0) : 0;
        const badge = origBook && origBook.badge ? origBook.badge : 'Koleksi Pilihan';

        let finalCover = coverImg;
        if (!finalCover && origBook && origBook.coverImg) {
          finalCover = origBook.coverImg;
        }

        const clInput = $('#bookCloudinaryIdInput');
        const clId = clInput && clInput.value.trim() ? clInput.value.trim() : (origBook && origBook.cloudinary_public_id ? origBook.cloudinary_public_id : '');

        const payload = {
          id,
          title,
          author,
          category,
          genres,
          language,
          year,
          price,
          stock,
          shelf,
          synopsis,
          rating,
          reviews_count: reviewsCount,
          badge,
          isPopular,
          isSpotlight,
          coverImg: finalCover,
          cloudinary_public_id: clId,
          hasVolumes: hasVolumes && volumes.length > 0,
          volumes: volumes,
        };

        if (origId) {
          await adminState.updateBook(origId, payload);
          showToast(`Katalog buku "${title}" berhasil diperbarui di TiDB.`, 'success');
        } else {
          await adminState.addBook(payload);
          showToast(`Buku baru "${title}" berhasil ditambahkan ke TiDB.`, 'success');
        }
        $('#bookModalDialog').classList.add('hidden');
        switchTabFn('books');
      }
    });

    // Live inputs (search, filter, and cover preview)
    document.addEventListener('input', (e) => {
      if (e.target.id === 'bookCoverInput') {
        const preview = $('#bookModalCoverPreview');
        if (preview) preview.src = e.target.value.trim();
      }

      if (e.target.id === 'bookSearchInput' || e.target.id === 'bookCategorySelect') {
        const q = $('#bookSearchInput') ? $('#bookSearchInput').value : '';
        const cat = $('#bookCategorySelect') ? $('#bookCategorySelect').value : 'Semua';
        const filtered = adminState.getBooks(q, cat);
        const cardGrid = $('#booksCardGrid');
        if (cardGrid) cardGrid.innerHTML = booksView.renderCards(filtered);
        const count = $('#booksCountLabel');
        if (count) count.textContent = `Menampilkan ${filtered.length} judul`;
      }
    });
  },
};
