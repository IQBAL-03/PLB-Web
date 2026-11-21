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
import { categories } from '../data/library-data.js';

export const adminAppController = {
  currentTab: 'dashboard',
  reportStartDate: '2026-11-01',
  reportEndDate: '2026-11-21',

  async init() {
    this.bindNavigation();
    this.bindDashboardAndReport();
    memberActions.bind((tab) => this.switchTab(tab));
    bookActions.bind((tab) => this.switchTab(tab));
    this.switchTab('dashboard');
    const synced = await adminState.syncBooksFromAPI();
    if (synced && this.currentTab === 'books') {
      this.switchTab('books');
    }

    // Golang live change detection and auto-reload for admin
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
                window.location.reload();
                return;
              }
              const updated = await adminState.syncBooksFromAPI();
              if (updated && this.currentTab === 'books') {
                this.switchTab('books');
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
      const transactions = adminState.getTransactions();
      dashboardView.render(container, metrics, transactions);
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

  bindDashboardAndReport() {
    document.addEventListener('click', (e) => {
      if (e.target.closest('#triggerPrintPdfBtn')) {
        window.print();
        return;
      }

      if (e.target.closest('#dashQuickLoanBtn')) {
        showToast('Gunakan tab Kelola Buku atau catat sirkulasi pada formulir transaksi.', 'info');
        return;
      }

      const returnBtn = e.target.closest('[data-action="return-loan"]');
      if (returnBtn) {
        const id = returnBtn.dataset.id;
        adminState.returnTransaction(id);
        this.switchTab('dashboard');
        showToast(`Transaksi ${id} tuntas. Buku telah dikembalikan.`, 'success');
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
        const q = e.target.value;
        const filtered = adminState.getTransactions('Semua', q);
        const tbody = $('#dashTableBody');
        if (tbody) tbody.innerHTML = dashboardView.renderRows(filtered);
      }
    });
  },
};
