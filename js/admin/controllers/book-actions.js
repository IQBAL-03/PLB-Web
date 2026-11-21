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

      // Open add modal
      if (e.target.closest('#openAddBookBtn')) {
        const modal = $('#bookModalDialog');
        const form = $('#bookForm');
        if (modal && form) {
          form.reset();
          $('#bookFormOriginalId').value = '';
          $('#bookPriceInput').value = '';
          $('#bookCoverInput').value = 'cover-sementara/look-back.png';
          $('#bookModalCoverPreview').src = 'cover-sementara/look-back.png';
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
          $('#bookModalCoverPreview').src = cover;
          $('#bookModalTitle').textContent = `Edit Buku & Sampul (${book.id})`;
          $('#bookModalDialog').classList.remove('hidden');
        }
        return;
      }

      // Delete book
      const delBtn = e.target.closest('[data-book-action="delete"]');
      if (delBtn) {
        const id = delBtn.dataset.id;
        if (confirm(`Yakin ingin menghapus buku ${id} dari katalog?`)) {
          adminState.deleteBook(id);
          switchTabFn('books');
          showToast(`Buku ${id} berhasil dihapus dari sistem.`, 'success');
        }
      }
    });

    // Form submission
    document.addEventListener('submit', (e) => {
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
          adminState.updateBook(origId, payload);
          showToast(`Katalog buku "${title}" dan sampul berhasil diperbarui.`, 'success');
        } else {
          adminState.addBook(payload);
          showToast(`Buku baru "${title}" berhasil ditambahkan ke katalog.`, 'success');
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
