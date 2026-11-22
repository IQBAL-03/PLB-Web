/**
 * @file Modal controller handling book detail displays, series volume changes, and borrow workflow.
 */

import { $ } from '../../utils/dom.js';
import { state } from '../../core/state.js';
import { eventBus } from '../../core/events.js';
import { showToast } from '../../utils/toast.js';
import { bookModalView } from './book-modal.view.js';
import { imagePreviewModal } from './image-preview.modal.js';
import { memberModal } from './member-modal.js';
import { initialMembers } from '../../admin/admin-data.js';

function getMembersList() {
  try {
    const raw = localStorage.getItem('sisperpus_admin_members');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {
    // Storage access fallback
  }
  return JSON.parse(JSON.stringify(initialMembers));
}

export const bookModalController = {
  init() {
    this.bindEvents();
    eventBus.on('modal:book-selected', (book) => {
      if (book) {
        bookModalView.renderContent(book, state.isBookBorrowed(book.id), 1);
        bookModalView.open();
      }
    });
  },

  bindEvents() {
    const modal = bookModalView.modal;
    if (!modal) return;

    // Close button
    const closeBtn = $('#closeBookModalBtn');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => bookModalView.close());
    }

    // Backdrop click
    const backdrop = $('#bookModalBackdrop');
    if (backdrop) {
      backdrop.addEventListener('click', () => bookModalView.close());
    }

    // Escape key
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
        bookModalView.close();
      }
    });

    // Handle volume chip button clicks
    document.addEventListener('click', (e) => {
      const volBtn = e.target.closest('.volume-chip-btn');
      if (volBtn) {
        const volumeNum = volBtn.dataset.volume;
        if (volumeNum && state.selectedBook) {
          bookModalView.updateActiveVolume(state.selectedBook, volumeNum);
        }
      }

      // Handle quick register link click inside borrow modal
      const quickRegBtn = e.target.closest('#btnQuickRegisterFromBorrow');
      if (quickRegBtn) {
        const nis = quickRegBtn.dataset.nis || '';
        bookModalView.close();
        memberModal.open('register', nis);
        return;
      }

      // Handle cover preview click inside detail modal
      const coverBtn = e.target.closest('#openCoverPreviewBtn');
      if (coverBtn) {
        const coverImg = $('#bookModalCoverImg');
        const currentBook = state.selectedBook;
        if (coverImg && coverImg.src) {
          const volumeLabel = $('#activeVolumeLabel');
          const title = currentBook
            ? currentBook.hasVolumes && volumeLabel
              ? `${currentBook.title} (${volumeLabel.textContent})`
              : currentBook.title
            : 'Sampul Buku';
          imagePreviewModal.open(coverImg.src, title);
        }
      }
    });

    // Live NIS check and verification feedback
    document.addEventListener('input', (e) => {
      if (e.target && e.target.id === 'borrowerNis') {
        const nis = e.target.value.trim();
        const statusEl = $('#nisVerificationStatus');
        const nameInput = $('#borrowerName');
        if (!statusEl) return;

        if (!nis) {
          statusEl.className = 'mt-1.5 text-xs hidden';
          statusEl.innerHTML = '';
          return;
        }

        const members = getMembersList();
        const member = members.find((m) => String(m.nis) === String(nis));

        if (!member) {
          if (nis.length >= 3) {
            statusEl.className = 'mt-1.5 text-xs text-rose-600 flex items-center justify-between font-medium';
            statusEl.innerHTML = `
              <span>✕ NIS belum terdaftar.</span>
              <button type="button" id="btnQuickRegisterFromBorrow" data-nis="${escapeHtml(nis)}" class="underline font-bold text-rose-800 hover:text-rose-950 cursor-pointer">Daftar Sekarang &rarr;</button>
            `;
          } else {
            statusEl.className = 'mt-1.5 text-xs hidden';
            statusEl.innerHTML = '';
          }
          return;
        }

        // Auto-fill student name from verified membership record
        if (nameInput) {
          nameInput.value = member.name;
        }

        if (member.status === 'Aktif') {
          if ((member.activeLoans || 0) >= 2) {
            statusEl.className = 'mt-1.5 text-xs text-amber-700 flex items-center gap-1 font-medium';
            statusEl.innerHTML = `<span>⚠️ ${member.name} (${member.classRoom}) &middot; Batas pinjam penuh (2 buku aktif).</span>`;
          } else {
            statusEl.className = 'mt-1.5 text-xs text-emerald-700 flex items-center gap-1 font-semibold';
            statusEl.innerHTML = `<span>✓ Terverifikasi: ${member.name} (${member.classRoom}) &middot; Siap pinjam.</span>`;
          }
        } else if (member.status === 'Menunggu Verifikasi') {
          statusEl.className = 'mt-1.5 text-xs text-amber-600 flex items-center gap-1 font-medium';
          statusEl.innerHTML = `<span>⏳ ${member.name} &middot; Status: Menunggu Verifikasi Admin.</span>`;
        } else if (member.status === 'Ada Denda') {
          statusEl.className = 'mt-1.5 text-xs text-rose-700 flex items-center gap-1 font-medium';
          statusEl.innerHTML = `<span>⚠️ ${member.name} &middot; Ada denda keterlambatan tertunggak.</span>`;
        } else {
          statusEl.className = 'mt-1.5 text-xs text-stone-500 flex items-center gap-1 font-medium';
          statusEl.innerHTML = `<span>✕ ${member.name} &middot; Status anggota: ${member.status}.</span>`;
        }
      }
    });

    // Borrow form submission with strict member verification
    document.addEventListener('submit', (e) => {
      if (e.target && e.target.id === 'borrowForm') {
        e.preventDefault();
        const nisInput = $('#borrowerNis');
        const nameInput = $('#borrowerName');
        const volumeInput = $('#selectedVolumeInput');

        const nis = nisInput ? nisInput.value.trim() : '';
        const name = nameInput ? nameInput.value.trim() : '';
        const selectedVol = volumeInput ? volumeInput.value : '';

        // 1. Validasi input dasar
        if (!nis || !name) {
          showToast('NIS dan Nama Peminjam wajib diisi.', 'warning');
          return;
        }

        // 2. Validasi Keberadaan Anggota
        const members = getMembersList();
        const memberIdx = members.findIndex((m) => String(m.nis) === String(nis));
        if (memberIdx === -1) {
          showToast(`NIS ${nis} belum terdaftar sebagai anggota perpustakaan. Silakan hubungi petugas perpustakaan.`, 'error', 6000);
          return;
        }

        const member = members[memberIdx];

        // 3. Validasi Status Verifikasi oleh Admin
        if (member.status === 'Menunggu Verifikasi') {
          showToast(`Siswa "${member.name}" masih MENUNGGU VERIFIKASI dari admin perpustakaan. Peminjaman belum diizinkan.`, 'warning', 6000);
          return;
        }

        if (member.status === 'Ada Denda') {
          showToast(`Siswa "${member.name}" memiliki kewajiban denda keterlambatan. Harap selesaikan denda terlebih dahulu.`, 'error', 6000);
          return;
        }

        if (member.status !== 'Aktif') {
          showToast(`Keanggotaan siswa "${member.name}" berstatus "${member.status}". Belum diizinkan meminjam buku.`, 'error', 5000);
          return;
        }

        // 4. Validasi Batas Pinjaman Maksimal (Maks 2 Buku)
        const currentActiveLoans = member.activeLoans || 0;
        if (currentActiveLoans >= 2) {
          showToast(`Siswa "${member.name}" sudah mencapai batas maksimal pinjam (2 buku). Kembalikan buku lama terlebih dahulu.`, 'warning', 6000);
          return;
        }

        const currentBook = state.selectedBook;
        if (!currentBook) return;

        // 5. Update data anggota (tambah activeLoans +1)
        member.activeLoans = currentActiveLoans + 1;
        members[memberIdx] = member;
        try {
          localStorage.setItem('sisperpus_admin_members', JSON.stringify(members));
        } catch {
          // Storage quota fallback
        }

        // 6. Update stok buku lokal
        if (currentBook.hasVolumes && selectedVol && currentBook.volumes) {
          const vol = currentBook.volumes.find((v) => v.volumeNumber === Number(selectedVol));
          if (vol && vol.stock > 0) {
            vol.stock -= 1;
          }
        } else if (currentBook.stock > 0) {
          currentBook.stock -= 1;
        }
        try {
          localStorage.setItem('sisperpus_admin_books', JSON.stringify(state.books));
        } catch {
          // Storage quota fallback
        }

        // 7. Tandai buku sedang dipinjam di state pengguna
        state.borrowBook(currentBook.id);

        // Sync to TiDB database via API if available
        fetch('/api/transactions/borrow', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            nis: member.nis,
            student_name: member.name,
            class_room: member.classRoom || '',
            book_id: currentBook.id,
            book_title: currentBook.title + (currentBook.hasVolumes && selectedVol ? ` (Vol. ${selectedVol})` : ''),
            volume_number: selectedVol ? Number(selectedVol) : null,
          }),
        }).catch(() => {});

        // 8. Catat transaksi sirkulasi
        try {
          const now = new Date();
          const dueDate = new Date();
          dueDate.setDate(now.getDate() + 7);
          const raw = localStorage.getItem('sisperpus_admin_transactions');
          const txs = raw ? JSON.parse(raw) : [];
          txs.unshift({
            id: `TRX-${Date.now().toString().slice(-6)}`,
            studentName: member.name,
            nis: member.nis,
            bookId: currentBook.id,
            bookTitle: currentBook.title + (currentBook.hasVolumes && selectedVol ? ` (Vol. ${selectedVol})` : ''),
            borrowDate: now.toISOString().split('T')[0],
            dueDate: dueDate.toISOString().split('T')[0],
            returnDate: null,
            status: 'Dipinjam',
            fine: 0,
            finePaid: false,
          });
          localStorage.setItem('sisperpus_admin_transactions', JSON.stringify(txs));
        } catch {
          // Storage quota fallback
        }

        bookModalView.close();

        const volSuffix = currentBook.hasVolumes && selectedVol ? ` (Volume ${selectedVol})` : '';
        showToast(`Buku "${currentBook.title}${volSuffix}" berhasil dipinjam atas nama ${member.name} (${member.nis}). Harap kembalikan dalam 7 hari kerja.`, 'success', 6000);
      }
    });
  },
};
