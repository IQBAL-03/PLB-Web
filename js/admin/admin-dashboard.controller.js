/**
 * @file Controller managing admin dashboard actions, transaction filters, and modal dialogs.
 */

import { $, $$ } from '../utils/dom.js';
import { showToast } from '../utils/toast.js';
import { initialAdminMetrics, initialTransactions, initialMembers } from './admin-data.js';
import { adminDashboardView } from './admin-dashboard.view.js';

export const adminDashboardController = {
  metrics: { ...initialAdminMetrics },
  transactions: [...initialTransactions],
  members: [...initialMembers],
  activeFilter: 'Semua',
  searchQuery: '',

  init() {
    this.render();
    this.bindEvents();
  },

  render() {
    const kpiContainer = $('#kpiCardsContainer');
    adminDashboardView.renderKpiCards(kpiContainer, this.metrics);
    this.renderFilteredTable();
  },

  getFilteredTransactions() {
    return this.transactions.filter((t) => {
      const matchFilter = this.activeFilter === 'Semua' || t.status === this.activeFilter;
      const q = this.searchQuery.toLowerCase().trim();
      const matchQuery =
        !q ||
        t.studentName.toLowerCase().includes(q) ||
        t.nis.toLowerCase().includes(q) ||
        t.bookTitle.toLowerCase().includes(q) ||
        t.id.toLowerCase().includes(q);
      return matchFilter && matchQuery;
    });
  },

  renderFilteredTable() {
    const tbody = $('#transactionsTableBody');
    const filtered = this.getFilteredTransactions();
    adminDashboardView.renderTransactionsTable(tbody, filtered);

    const countLabel = $('#tableResultCount');
    if (countLabel) {
      countLabel.textContent = `Menampilkan ${filtered.length} transaksi`;
    }
  },

  recalculateMetrics() {
    const active = this.transactions.filter((t) => t.status === 'Dipinjam' || t.status === 'Terlambat').length;
    const completed = this.transactions.filter((t) => t.status === 'Kembali').length;
    const unpaidList = this.transactions.filter((t) => !t.finePaid && t.fine > 0);
    const unpaidAmount = unpaidList.reduce((acc, t) => acc + t.fine, 0);

    this.metrics.activeLoansCount = active;
    this.metrics.completedLoansCount = completed;
    this.metrics.unpaidFinesAmount = unpaidAmount;
    this.metrics.unpaidFinesCount = unpaidList.length;

    const kpiContainer = $('#kpiCardsContainer');
    adminDashboardView.renderKpiCards(kpiContainer, this.metrics);
  },

  bindEvents() {
    // Search input
    const searchInput = $('#adminSearchInput');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.searchQuery = e.target.value;
        this.renderFilteredTable();
      });
    }

    // Filter pills
    $$('[data-tx-filter]').forEach((btn) => {
      btn.addEventListener('click', () => {
        this.activeFilter = btn.dataset.txFilter;
        $$('[data-tx-filter]').forEach((b) => {
          b.className =
            b === btn
              ? 'px-3 py-1.5 rounded-lg text-xs font-bold bg-rose-900 text-white transition-colors cursor-pointer shadow-xs'
              : 'px-3 py-1.5 rounded-lg text-xs font-semibold bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors cursor-pointer';
        });
        this.renderFilteredTable();
      });
    });

    // Table action buttons (Return book & Pay fine)
    const tbody = $('#transactionsTableBody');
    if (tbody) {
      tbody.addEventListener('click', (e) => {
        const returnBtn = e.target.closest('[data-action="return-loan"]');
        if (returnBtn) {
          const id = returnBtn.dataset.id;
          const tx = this.transactions.find((t) => t.id === id);
          if (tx) {
            tx.status = 'Kembali';
            tx.returnDate = new Date().toISOString().split('T')[0];
            this.recalculateMetrics();
            this.renderFilteredTable();
            showToast(`Transaksi ${id} (${tx.bookTitle}) berhasil ditandai selesai/kembali.`, 'success');
          }
          return;
        }

        const payBtn = e.target.closest('[data-action="pay-fine"]');
        if (payBtn) {
          const id = payBtn.dataset.id;
          const tx = this.transactions.find((t) => t.id === id);
          if (tx) {
            tx.finePaid = true;
            this.recalculateMetrics();
            this.renderFilteredTable();
            showToast(`Denda sebesar Rp ${tx.fine.toLocaleString('id-ID')} untuk transaksi ${id} telah dilunasi.`, 'success');
          }
        }
      });
    }

    // Modal Triggers
    this.bindModalTriggers();
  },

  bindModalTriggers() {
    const bindModal = (openBtnId, modalId, closeBtnId) => {
      const openBtn = $(`#${openBtnId}`);
      const modal = $(`#${modalId}`);
      const closeBtn = $(`#${closeBtnId}`);
      if (openBtn && modal) {
        openBtn.addEventListener('click', () => modal.classList.remove('hidden'));
      }
      if (closeBtn && modal) {
        closeBtn.addEventListener('click', () => modal.classList.add('hidden'));
      }
      if (modal) {
        modal.addEventListener('click', (e) => {
          if (e.target.dataset.closeModal) modal.classList.add('hidden');
        });
      }
    };

    bindModal('openNewLoanModalBtn', 'newLoanModal', 'closeNewLoanModalBtn');
    bindModal('navMembersBtn', 'membersModal', 'closeMembersModalBtn');
    bindModal('navReportBtn', 'reportModal', 'closeReportModalBtn');
    bindModal('tableExportBtn', 'reportModal', 'closeReportModalBtn');

    // New Loan Form Submission
    const newLoanForm = $('#newLoanForm');
    if (newLoanForm) {
      newLoanForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const nis = $('#newLoanNis').value.trim();
        const studentName = $('#newLoanName').value.trim();
        const classRoom = $('#newLoanClass').value.trim();
        const bookTitle = $('#newLoanBookTitle').value.trim();
        const volumeNumber = $('#newLoanVolume').value ? Number($('#newLoanVolume').value) : null;

        if (!nis || !studentName || !bookTitle) {
          showToast('NIS, Nama Siswa, dan Judul Buku wajib diisi.', 'warning');
          return;
        }

        const newId = `TRX-2026-0${this.transactions.length + 80}`;
        const today = new Date().toISOString().split('T')[0];
        const nextWeek = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0];

        const newTx = {
          id: newId,
          nis,
          studentName,
          classRoom: classRoom || 'X-MIPA',
          bookId: 'MANUAL',
          bookTitle,
          volumeNumber,
          loanDate: today,
          dueDate: nextWeek,
          returnDate: null,
          status: 'Dipinjam',
          fine: 0,
          finePaid: true,
        };

        this.transactions.unshift(newTx);
        this.recalculateMetrics();
        this.renderFilteredTable();
        newLoanForm.reset();
        $('#newLoanModal').classList.add('hidden');
        showToast(`Peminjaman baru ${newId} berhasil dicatat untuk ${studentName}.`, 'success');
      });
    }

    // Report export trigger
    const exportPdfBtn = $('#confirmExportReportBtn');
    if (exportPdfBtn) {
      exportPdfBtn.addEventListener('click', () => {
        $('#reportModal').classList.add('hidden');
        showToast('Laporan transaksi peminjaman perpustakaan berhasil diunduh (Simulasi PDF/Excel).', 'success');
      });
    }
  },
};
