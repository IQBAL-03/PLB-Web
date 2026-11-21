/**
 * @file View component for admin dashboard summary and circulation transactions.
 */

import { escapeHtml } from '../../utils/dom.js';

export const dashboardView = {
  render(container, metrics, transactions) {
    if (!container) return;
    const formatRp = (num) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(num);

    container.innerHTML = `
      <div class="space-y-8">
        <!-- Banner & Quick Action -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-stone-200 shadow-xs">
          <div>
            <h1 class="font-serif text-2xl sm:text-3xl font-bold text-stone-900 mb-1">Manajemen &amp; Sirkulasi Perpustakaan</h1>
            <p class="text-xs sm:text-sm text-stone-500">Ringkasan operasional peminjaman, buku aktif, pengembalian, dan denda.</p>
          </div>
          <div class="flex items-center gap-2.5 shrink-0">
            <button type="button" id="dashQuickLoanBtn" class="px-4 py-2.5 rounded-lg bg-rose-900 hover:bg-rose-950 text-white text-xs sm:text-sm font-semibold transition-colors cursor-pointer shadow-xs">
              + Catat Peminjaman
            </button>
          </div>
        </div>

        <!-- 4 KPI Metrics Cards -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div class="bg-white rounded-xl p-5 border border-stone-200 shadow-xs">
            <div class="flex items-center justify-between mb-2">
              <span class="text-xs font-bold text-stone-500 uppercase tracking-wider">Total Stok Buku</span>
              <div class="w-8 h-8 rounded-lg bg-rose-50 text-rose-900 flex items-center justify-center font-bold">B</div>
            </div>
            <div class="text-2xl sm:text-3xl font-serif font-black text-stone-900 mb-1">${metrics.totalBookStock.toLocaleString('id-ID')}</div>
            <p class="text-[11px] text-stone-500 font-medium">Tersebar di ${metrics.totalBookTitles} judul koleksi aktif</p>
          </div>

          <div class="bg-white rounded-xl p-5 border border-stone-200 shadow-xs">
            <div class="flex items-center justify-between mb-2">
              <span class="text-xs font-bold text-stone-500 uppercase tracking-wider">Transaksi Peminjaman</span>
              <div class="w-8 h-8 rounded-lg bg-amber-50 text-amber-900 flex items-center justify-center font-bold">P</div>
            </div>
            <div class="text-2xl sm:text-3xl font-serif font-black text-amber-900 mb-1">${metrics.activeLoansCount}</div>
            <p class="text-[11px] text-stone-500 font-medium">Buku sedang dipinjam siswa &amp; guru</p>
          </div>

          <div class="bg-white rounded-xl p-5 border border-stone-200 shadow-xs">
            <div class="flex items-center justify-between mb-2">
              <span class="text-xs font-bold text-stone-500 uppercase tracking-wider">Buku Selesai Kembali</span>
              <div class="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center font-bold">K</div>
            </div>
            <div class="text-2xl sm:text-3xl font-serif font-black text-emerald-800 mb-1">${metrics.completedLoansCount}</div>
            <p class="text-[11px] text-stone-500 font-medium">Pengembalian tertib tercatat</p>
          </div>

          <div class="bg-white rounded-xl p-5 border border-stone-200 shadow-xs">
            <div class="flex items-center justify-between mb-2">
              <span class="text-xs font-bold text-stone-500 uppercase tracking-wider">Denda Belum Dibayar</span>
              <div class="w-8 h-8 rounded-lg bg-rose-50 text-rose-900 flex items-center justify-center font-bold">Rp</div>
            </div>
            <div class="text-2xl sm:text-3xl font-serif font-black text-rose-950 mb-1">${formatRp(metrics.unpaidFinesAmount)}</div>
            <p class="text-[11px] text-rose-800 font-semibold">${metrics.unpaidFinesCount} transaksi terlambat</p>
          </div>
        </div>

        <!-- Transactions Section -->
        <div class="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
          <div class="p-5 sm:p-6 border-b border-stone-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 class="font-serif text-lg sm:text-xl font-bold text-stone-900">Riwayat Transaksi Peminjaman</h2>
              <span id="dashTableResultCount" class="text-xs text-stone-500">Menampilkan ${transactions.length} transaksi</span>
            </div>

            <div class="flex flex-wrap items-center gap-2 sm:gap-3">
              <input type="text" id="dashSearchInput" placeholder="Cari NIS, nama siswa, atau buku..."
                class="text-xs px-3 py-2 rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-rose-800 w-full sm:w-60 bg-stone-50/50" />
              <div class="flex items-center gap-1" id="dashTxFilters">
                <button type="button" data-tx-filter="Semua" class="px-3 py-1.5 rounded-lg text-xs font-bold bg-rose-900 text-white cursor-pointer shadow-xs">Semua</button>
                <button type="button" data-tx-filter="Dipinjam" class="px-3 py-1.5 rounded-lg text-xs font-semibold bg-stone-100 hover:bg-stone-200 text-stone-700 cursor-pointer">Dipinjam</button>
                <button type="button" data-tx-filter="Terlambat" class="px-3 py-1.5 rounded-lg text-xs font-semibold bg-stone-100 hover:bg-stone-200 text-stone-700 cursor-pointer">Terlambat</button>
                <button type="button" data-tx-filter="Kembali" class="px-3 py-1.5 rounded-lg text-xs font-semibold bg-stone-100 hover:bg-stone-200 text-stone-700 cursor-pointer">Kembali</button>
              </div>
            </div>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse">
              <thead>
                <tr class="bg-stone-100/75 border-b border-stone-200 text-[11px] font-bold text-stone-600 uppercase tracking-wider">
                  <th class="py-3 px-4">No. Transaksi</th>
                  <th class="py-3 px-4">Siswa / NIS</th>
                  <th class="py-3 px-4">Buku &amp; Volume</th>
                  <th class="py-3 px-4">Jadwal Pinjam</th>
                  <th class="py-3 px-4 text-center">Status</th>
                  <th class="py-3 px-4 text-right">Denda</th>
                  <th class="py-3 px-4 text-center">Aksi Cepat</th>
                </tr>
              </thead>
              <tbody id="dashTableBody" class="divide-y divide-stone-100">
                ${this.renderRows(transactions)}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  },

  renderRows(transactions) {
    if (transactions.length === 0) {
      return `<tr><td colspan="7" class="py-10 text-center text-stone-400 text-xs">Tidak ada data transaksi.</td></tr>`;
    }
    const formatRp = (num) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(num);

    return transactions
      .map((t) => {
        const isLate = t.status === 'Terlambat';
        const isBorrowed = t.status === 'Dipinjam';
        const statusBadge = isLate
          ? '<span class="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-rose-100 text-rose-900 border border-rose-200">Terlambat</span>'
          : isBorrowed
          ? '<span class="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-200">Dipinjam</span>'
          : '<span class="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">Kembali</span>';

        const vol = t.volumeNumber ? `<span class="ml-1 text-[10px] font-bold text-amber-900 bg-amber-50 border border-amber-200 px-1 rounded">Vol ${t.volumeNumber}</span>` : '';

        return `
          <tr class="hover:bg-stone-50/80 transition-colors border-b border-stone-200/80 text-xs">
            <td class="py-3 px-4 font-mono font-semibold text-stone-700 whitespace-nowrap">${escapeHtml(t.id)}</td>
            <td class="py-3 px-4">
              <div class="font-bold text-stone-900">${escapeHtml(t.studentName)}</div>
              <div class="text-[11px] text-stone-400 font-mono">NIS: ${escapeHtml(t.nis)} &middot; ${escapeHtml(t.classRoom)}</div>
            </td>
            <td class="py-3 px-4">
              <div class="font-serif font-bold text-stone-800">${escapeHtml(t.bookTitle)}${vol}</div>
              <div class="text-[11px] text-stone-400">ID: ${escapeHtml(t.bookId)}</div>
            </td>
            <td class="py-3 px-4 text-stone-600 whitespace-nowrap">
              <div>Pinjam: ${t.loanDate}</div>
              <div class="text-[11px] font-semibold ${isLate ? 'text-rose-800' : 'text-stone-500'}">Jatuh Tempo: ${t.dueDate}</div>
            </td>
            <td class="py-3 px-4 text-center whitespace-nowrap">${statusBadge}</td>
            <td class="py-3 px-4 text-right whitespace-nowrap">
              ${t.fine > 0 ? `<div class="font-bold text-rose-900">${formatRp(t.fine)}</div><div class="text-[10px] ${t.finePaid ? 'text-emerald-700' : 'text-rose-600 font-semibold'}">${t.finePaid ? 'Lunas' : 'Belum Bayar'}</div>` : '<span class="text-stone-400">-</span>'}
            </td>
            <td class="py-3 px-4 text-center whitespace-nowrap">
              <div class="flex items-center justify-center gap-1.5">
                ${t.status !== 'Kembali' ? `<button type="button" data-action="return-loan" data-id="${t.id}" class="px-2.5 py-1 rounded-md bg-stone-100 hover:bg-stone-200 text-stone-800 font-semibold text-[11px] border border-stone-300 transition-colors cursor-pointer">Kembalikan</button>` : '<span class="text-stone-400 text-[11px] italic">Tuntas</span>'}
                ${!t.finePaid && t.fine > 0 ? `<button type="button" data-action="pay-fine" data-id="${t.id}" class="px-2.5 py-1 rounded-md bg-rose-50 hover:bg-rose-100 text-rose-900 font-bold text-[11px] border border-rose-200 transition-colors cursor-pointer">Bayar Denda</button>` : ''}
              </div>
            </td>
          </tr>
        `;
      })
      .join('');
  },
};
