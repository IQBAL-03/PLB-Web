/**
 * @file Master coordinator for tab navigation, dashboard circulation, and date-range reporting.
 */

import { $, $$ } from '../utils/dom.js';
import { showToast } from '../utils/toast.js';
import { adminState } from './admin-state.js';
import { dashboardView } from './views/dashboard-view.js';
import { membersView } from './views/members-view.js';
import { booksView } from './views/books-view.js';
import { reportView } from './views/report-view.js';
import { memberActions } from './controllers/member-actions.js';
import { bookActions } from './controllers/book-actions.js';
import { returnModal } from './views/return-modal.js';
import { categories } from '../data/library-data.js';

export const adminAppController = {
  currentTab: 'dashboard',
  activeTxFilter: 'Semua',
  dashSearchQuery: '',
  reportStartDate: '2026-11-01',
  reportEndDate: '2026-11-21',

  async init() {
    this.bindNavigation();
    this.bindDashboardAndReport();
    memberActions.bind((tab) => this.switchTab(tab));
    bookActions.bind((tab) => this.switchTab(tab));
    this.switchTab('dashboard');
    await Promise.all([
      adminState.syncBooksFromAPI(),
      adminState.syncMembersFromAPI(),
      adminState.syncTransactionsFromAPI(),
    ]);
    this.switchTab(this.currentTab);

    // Golang live change detection and silent sync for admin (no disruptive page reload)
    let lastAdminVersion = null;
    const checkAdminSync = async () => {
      try {
        const res = await fetch(`/api/sync/version?t=${Date.now()}`, { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          if (data && data.ok && data.hash) {
            if (lastAdminVersion !== null && lastAdminVersion !== data.hash) {
              lastAdminVersion = data.hash;
              const hasModalOpen = document.querySelector('#bookModalDialog:not(.hidden)');
              if (!hasModalOpen) {
                const updated = await adminState.syncBooksFromAPI();
                if (updated && (this.currentTab === 'books' || this.currentTab === 'dashboard')) {
                  this.switchTab(this.currentTab);
                }
              }
              return;
            }
            lastAdminVersion = data.hash;
          }
        }
      } catch {
        // Fallback
      }
    };

    checkAdminSync();

    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        checkAdminSync();
      }
    });
    window.addEventListener('focus', () => checkAdminSync());

    // High-frequency polling every 4 seconds
    setInterval(() => {
      if (typeof document === 'undefined' || document.visibilityState === 'visible') {
        checkAdminSync();
      }
    }, 4000);
  },

  switchTab(tabName) {
    this.currentTab = tabName;
    const container = $('#adminMainContainer');
    if (!container) return;

    $$('[data-admin-tab]').forEach((btn) => {
      const isActive = btn.dataset.adminTab === tabName;
      btn.className = isActive
        ? 'px-3 py-1.5 rounded-lg text-xs font-bold bg-rose-900 text-white shadow-xs cursor-pointer'
        : 'px-3 py-1.5 rounded-lg text-xs font-semibold text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition-colors cursor-pointer';
    });

    if (tabName === 'dashboard') {
      const metrics = adminState.getMetrics();
      const transactions = adminState.getTransactions(this.activeTxFilter, this.dashSearchQuery);
      dashboardView.render(container, metrics, transactions);
      this.syncDashFilterUI();
    } else if (tabName === 'members') {
      const members = adminState.getMembers();
      membersView.render(container, members);
    } else if (tabName === 'books') {
      const books = adminState.getBooks();
      booksView.render(container, books, categories);
    } else if (tabName === 'report') {
      const reportData = adminState.getReportData(this.reportStartDate, this.reportEndDate);
      reportView.render(container, reportData);
    }
  },

  bindNavigation() {
    document.addEventListener('click', (e) => {
      const tabBtn = e.target.closest('[data-admin-tab]');
      if (tabBtn) this.switchTab(tabBtn.dataset.adminTab);
    });
  },

  syncDashFilterUI() {
    $$('[data-tx-filter]').forEach((btn) => {
      const isMatch = btn.dataset.txFilter === this.activeTxFilter;
      btn.className = isMatch
        ? 'px-3 py-1.5 rounded-lg text-xs font-bold bg-rose-900 text-white cursor-pointer shadow-xs'
        : 'px-3 py-1.5 rounded-lg text-xs font-semibold bg-stone-100 hover:bg-stone-200 text-stone-700 cursor-pointer';
    });
    const searchInput = $('#dashSearchInput');
    if (searchInput && searchInput.value !== this.dashSearchQuery) {
      searchInput.value = this.dashSearchQuery;
    }
  },

  refreshDashTable() {
    const filtered = adminState.getTransactions(this.activeTxFilter, this.dashSearchQuery);
    const tbody = $('#dashTableBody');
    if (tbody) tbody.innerHTML = dashboardView.renderRows(filtered);
    const countLabel = $('#dashTableResultCount');
    if (countLabel) countLabel.textContent = `Menampilkan ${filtered.length} transaksi`;
  },

  bindDashboardAndReport() {
    document.addEventListener('click', (e) => {
      if (e.target.closest('#triggerPrintPdfBtn')) {
        window.print();
        return;
      }

      const filterBtn = e.target.closest('[data-tx-filter]');
      if (filterBtn) {
        this.activeTxFilter = filterBtn.dataset.txFilter || 'Semua';
        this.syncDashFilterUI();
        this.refreshDashTable();
        return;
      }

      const returnBtn = e.target.closest('[data-action="return-loan"]');
      if (returnBtn) {
        const id = returnBtn.dataset.id;
        const tx = adminState.transactions.find((t) => t.id === id);
        if (!tx) return;
        const book = adminState.books.find((b) => b.id === tx.bookId);
        const bookPrice = tx.price || (book && book.price) || 0;
        returnModal.open(tx, bookPrice, async (condition, fine) => {
          await adminState.returnTransaction(id, condition, fine);
          await adminState.syncBooksFromAPI();
          this.switchTab('dashboard');
          showToast(`Transaksi ${id} tuntas. Buku telah dikembalikan.`, 'success');
        });
        return;
      }

      const payBtn = e.target.closest('[data-action="pay-fine"]');
      if (payBtn) {
        const id = payBtn.dataset.id;
        adminState.payFine(id);
        this.switchTab('dashboard');
        showToast(`Denda transaksi ${id} telah dilunasi.`, 'success');
      }
    });

    document.addEventListener('submit', (e) => {
      if (e.target.id === 'reportDateRangeForm') {
        e.preventDefault();
        this.reportStartDate = $('#reportStartDate').value;
        this.reportEndDate = $('#reportEndDate').value;
        this.switchTab('report');
        showToast('Laporan dimuat ulang berdasarkan rentang tanggal terpilih.', 'info');
      }
    });

    document.addEventListener('input', (e) => {
      if (e.target.id === 'dashSearchInput') {
        this.dashSearchQuery = e.target.value;
        this.refreshDashTable();
      }
    });
  },
};
