/**
 * @file Controller for handling star rating interactions, student review submissions, and updates.
 */

import { $, $$ } from '../../utils/dom.js';
import { showToast } from '../../utils/toast.js';
import { eventBus } from '../../core/events.js';
import { state } from '../../core/state.js';
import { reviewsService } from './reviews.service.js';
import { reviewsView } from './reviews.view.js';

export const reviewsController = {
  currentBook: null,
  currentNis: '',

  async loadAndRender(book, initialNis = '') {
    this.currentBook = book;
    const storedNis = initialNis || localStorage.getItem('sisperpus_student_nis') || '';
    this.currentNis = storedNis;

    const mount = $('#bookReviewsMountPoint');
    if (!mount) return;

    mount.innerHTML = `
      <div class="py-6 text-center text-xs text-stone-500 flex items-center justify-center gap-2">
        <svg class="animate-spin w-4 h-4 text-rose-800" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path></svg>
        <span>Memuat ulasan dan penilaian siswa...</span>
      </div>
    `;

    const data = await reviewsService.fetchReviews(book.id, storedNis);
    mount.innerHTML = reviewsView.renderSection(book, data, storedNis);
    this.bindEvents();
  },

  bindEvents() {
    // Star rating buttons
    $$('.star-rating-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const val = Number(btn.dataset.starVal) || 5;
        const hiddenInput = $('#reviewRatingInput');
        if (hiddenInput) hiddenInput.value = val;

        const label = $('#starRatingLabel');
        if (label) label.textContent = `${val} dari 5 Bintang`;

        $$('.star-rating-btn').forEach((b) => {
          const bVal = Number(b.dataset.starVal);
          const svg = b.querySelector('svg');
          if (svg) {
            svg.setAttribute('class', `w-6 h-6 pointer-events-none fill-current ${bVal <= val ? 'text-amber-500' : 'text-stone-300'}`);
          }
        });
      });
    });

    // NIS input auto-fill & lookup
    const nisInput = $('#reviewNisInput');
    const nameInput = $('#reviewNameInput');
    if (nisInput) {
      nisInput.addEventListener('change', async () => {
        const nis = nisInput.value.trim();
        if (!nis) return;
        localStorage.setItem('sisperpus_student_nis', nis);
        this.currentNis = nis;

        // Auto-fill student name from cached members if available
        try {
          const raw = localStorage.getItem('sisperpus_admin_members');
          if (raw) {
            const members = JSON.parse(raw);
            const found = members.find((m) => String(m.nis) === nis);
            if (found && nameInput && !nameInput.value) {
              nameInput.value = found.name;
            }
          }
        } catch {}

        // Check if this student already reviewed this book
        if (this.currentBook) {
          const data = await reviewsService.fetchReviews(this.currentBook.id, nis);
          const formArea = $('#reviewFormContainer');
          if (formArea && data.userReview) {
            formArea.innerHTML = reviewsView.renderForm(this.currentBook, data.userReview, nis);
            this.bindEvents();
          }
        }
      });
    }

    // Submission form
    const form = $('#reviewSubmissionForm');
    if (form) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const bookId = $('#reviewBookId') ? $('#reviewBookId').value : (this.currentBook && this.currentBook.id);
        const rating = Number($('#reviewRatingInput') ? $('#reviewRatingInput').value : 5) || 5;
        const nis = $('#reviewNisInput') ? $('#reviewNisInput').value.trim() : '';
        const name = $('#reviewNameInput') ? $('#reviewNameInput').value.trim() : '';
        const comment = $('#reviewCommentInput') ? $('#reviewCommentInput').value.trim() : '';
        const submitBtn = $('#btnSubmitReview');

        if (!nis) {
          showToast('Nomor Induk Siswa (NIS) wajib diisi.', 'warning');
          return;
        }

        if (comment.length < 3) {
          showToast('Ulasan minimal harus 3 karakter.', 'warning');
          return;
        }

        if (rating < 1 || rating > 5) {
          showToast('Rating bintang harus antara 1 sampai 5.', 'warning');
          return;
        }

        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.textContent = 'Menyimpan...';
        }

        try {
          await reviewsService.submitReview({
            bookId,
            nis,
            studentName: name,
            rating,
            reviewText: comment,
          });

          showToast('Ulasan dan rating Anda berhasil disimpan ke database perpustakaan.', 'success');
          localStorage.setItem('sisperpus_student_nis', nis);
          this.currentNis = nis;

          // Sync books catalog and refresh UI
          await state.syncBooks();
          eventBus.emit('books:synced');

          if (this.currentBook) {
            const updatedBook = state.books.find((b) => b.id === this.currentBook.id) || this.currentBook;
            await this.loadAndRender(updatedBook, nis);
          }
        } catch (err) {
          showToast(err.message || 'Gagal menyimpan ulasan.', 'error');
        } finally {
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Simpan Ulasan';
          }
        }
      });
    }

    // Delete review button
    const deleteBtn = $('#btnDeleteMyReview');
    if (deleteBtn) {
      deleteBtn.addEventListener('click', async () => {
        if (!confirm('Apakah Anda yakin ingin menghapus penilaian dan ulasan Anda untuk buku ini?')) {
          return;
        }

        deleteBtn.disabled = true;
        deleteBtn.textContent = 'Menghapus...';

        try {
          await reviewsService.deleteReview({
            bookId: this.currentBook.id,
            nis: this.currentNis,
          });

          showToast('Ulasan Anda berhasil dihapus dan rating diperbarui.', 'success');
          await state.syncBooks();
          eventBus.emit('books:synced');

          if (this.currentBook) {
            const updatedBook = state.books.find((b) => b.id === this.currentBook.id) || this.currentBook;
            await this.loadAndRender(updatedBook, this.currentNis);
          }
        } catch (err) {
          showToast(err.message || 'Gagal menghapus ulasan.', 'error');
        } finally {
          deleteBtn.disabled = false;
          deleteBtn.textContent = 'Hapus Ulasan';
        }
      });
    }
  },
};
