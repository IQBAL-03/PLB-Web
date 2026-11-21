/**
 * @file Handlers and form bindings for book catalog CRUD and cover image management in the admin panel.
 */

import { $ } from '../../utils/dom.js';
import { showToast } from '../../utils/toast.js';
import { adminState } from '../admin-state.js';
import { booksView } from '../views/books-view.js';
import { imagePreviewModal } from '../../features/modal/image-preview.modal.js';

export const bookActions = {
  bind(switchTabFn) {
    document.addEventListener('click', (e) => {
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
          $('#bookPriceInput').value = '';
          $('#bookCoverInput').value = 'cover-sementara/look-back.png';
          $('#bookCloudinaryIdInput').value = '';
          $('#bookModalCoverPreview').src = 'cover-sementara/look-back.png';
          $('#bookCoverFileName').textContent = 'Format: PNG, JPG, WEBP (Maks 2MB)';
          $('#bookModalTitle').textContent = 'Tambah Koleksi & Sampul Buku Baru';
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
        const book = adminState.books.find((b) => b.id === id);
        if (book) {
          const cover = book.coverImg || 'cover-sementara/look-back.png';
          $('#bookFormOriginalId').value = book.id;
          $('#bookIdInput').value = book.id;
          $('#bookTitleInput').value = book.title;
          $('#bookAuthorInput').value = book.author;
          $('#bookCategoryInput').value = book.category;
          $('#bookLanguageInput').value = book.language || 'Bahasa Indonesia';
          $('#bookPriceInput').value = book.price || '';
          $('#bookStockInput').value = book.stock;
          $('#bookShelfInput').value = book.shelf;
          $('#bookSynopsisInput').value = book.synopsis || '';
          $('#bookCoverInput').value = cover;
          $('#bookCloudinaryIdInput').value = '';
          $('#bookModalCoverPreview').src = cover;
          $('#bookCoverFileName').textContent = cover.startsWith('http') ? 'Tersimpan di Cloudinary' : 'Format: PNG, JPG, WEBP (Maks 2MB)';
          $('#bookModalTitle').textContent = `Edit Buku & Sampul (${book.id})`;
          $('#bookModalDialog').classList.remove('hidden');
        }
        return;
      }

      // Delete book
      const delBtn = e.target.closest('[data-book-action="delete"]');
      if (delBtn) {
        const id = delBtn.dataset.id;
        if (confirm(`Yakin ingin menghapus buku ${id} dari katalog TiDB?`)) {
          adminState.deleteBook(id);
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

        const nameLabel = $('#bookCoverFileName');
        if (nameLabel) nameLabel.textContent = file.name;

        const overlay = $('#bookModalCoverUploading');
        if (overlay) overlay.classList.remove('hidden');

        const triggerBtn = $('#triggerCoverUploadBtn');
        if (triggerBtn) triggerBtn.disabled = true;

        const formData = new FormData();
        formData.append('cover', file);

        try {
          const res = await fetch('/api/upload/cover', {
            method: 'POST',
            body: formData,
          });
          const data = await res.json();
          if (!res.ok || !data.success) {
            throw new Error(data.error || data.message || 'Gagal mengunggah foto ke Cloudinary.');
          }

          const coverInput = $('#bookCoverInput');
          if (coverInput) coverInput.value = data.url;

          const clIdInput = $('#bookCloudinaryIdInput');
          if (clIdInput) clIdInput.value = data.public_id || '';

          if (preview) preview.src = data.url;
          showToast('Foto sampul berhasil diunggah ke Cloudinary.', 'success');
        } catch (err) {
          showToast(err.message || 'Terjadi kesalahan saat mengunggah foto.', 'error');
        } finally {
          if (overlay) overlay.classList.add('hidden');
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
        const price = Number($('#bookPriceInput').value) || 0;
        const stock = Number($('#bookStockInput').value) || 0;
        const shelf = $('#bookShelfInput').value.trim();
        const synopsis = $('#bookSynopsisInput').value.trim();
        const coverImg = $('#bookCoverInput').value.trim() || 'cover-sementara/look-back.png';

        const payload = {
          id,
          title,
          author,
          category,
          language,
          price,
          stock,
          shelf,
          synopsis,
          rating: 4.9,
          coverImg,
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
