/**
 * @file View component rendering KPI metrics cards, transaction table rows, and status badges.
 */

import { escapeHtml } from '../utils/dom.js';

export const adminDashboardView = {
  renderKpiCards(container, metrics) {
    if (!container) return;
    const formatRp = (num) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(num);

    container.innerHTML = `
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div class="bg-white rounded-xl p-5 border border-stone-200 shadow-xs flex flex-col justify-between">
          <div class="flex items-center justify-between mb-3">
            <span class="text-xs font-bold text-stone-500 uppercase tracking-wider">Total Stok Buku</span>
            <div class="w-9 h-9 rounded-lg bg-rose-50 text-rose-900 border border-rose-200 flex items-center justify-center">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>
            </div>
          </div>
          <div>
            <div class="text-2xl sm:text-3xl font-serif font-black text-stone-900 mb-1">${metrics.totalBookStock.toLocaleString('id-ID')}</div>
            <p class="text-[11px] text-stone-500 font-medium">Tersebar di ${metrics.totalBookTitles} judul aktif perpustakaan</p>
          </div>
        </div>

        <div class="bg-white rounded-xl p-5 border border-stone-200 shadow-xs flex flex-col justify-between">
          <div class="flex items-center justify-between mb-3">
            <span class="text-xs font-bold text-stone-500 uppercase tracking-wider">Transaksi Peminjaman</span>
            <div class="w-9 h-9 rounded-lg bg-amber-50 text-amber-900 border border-amber-200 flex items-center justify-center">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
            </div>
          </div>
          <div>
            <div class="text-2xl sm:text-3xl font-serif font-black text-amber-900 mb-1">${metrics.activeLoansCount}</div>
            <p class="text-[11px] text-stone-500 font-medium">Eksemplar sedang dipinjam siswa &amp; guru</p>
          </div>
        </div>

        <div class="bg-white rounded-xl p-5 border border-stone-200 shadow-xs flex flex-col justify-between">
          <div class="flex items-center justify-between mb-3">
            <span class="text-xs font-bold text-stone-500 uppercase tracking-wider">Buku Selesai Kembali</span>
            <div class="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center justify-center">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            </div>
          </div>
          <div>
            <div class="text-2xl sm:text-3xl font-serif font-black text-emerald-800 mb-1">${metrics.completedLoansCount}</div>
            <p class="text-[11px] text-stone-500 font-medium">Pengembalian tepat waktu bulan ini</p>
          </div>
        </div>

        <div class="bg-white rounded-xl p-5 border border-stone-200 shadow-xs flex flex-col justify-between">
          <div class="flex items-center justify-between mb-3">
            <span class="text-xs font-bold text-stone-500 uppercase tracking-wider">Denda Belum Dibayar</span>
            <div class="w-9 h-9 rounded-lg bg-rose-50 text-rose-900 border border-rose-200 flex items-center justify-center">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            </div>
          </div>
          <div>
            <div class="text-2xl sm:text-3xl font-serif font-black text-rose-950 mb-1">${formatRp(metrics.unpaidFinesAmount)}</div>
            <p class="text-[11px] text-rose-800 font-semibold">${metrics.unpaidFinesCount} transaksi terlambat membutuhkan tindak lanjut</p>
          </div>
        </div>
      </div>
    `;
  },

  renderTransactionsTable(tbody, transactions) {
    if (!tbody) return;
    if (transactions.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="7" class="py-12 text-center text-stone-400 text-xs">
            Tidak ada transaksi yang cocok dengan kata kunci atau filter status yang dipilih.
          </td>
        </tr>
      `;
      return;
    }

    const formatRp = (num) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(num);

    tbody.innerHTML = transactions
      .map((t) => {
        const isLate = t.status === 'Terlambat';
        const isBorrowed = t.status === 'Dipinjam';
        const statusBadge = isLate
          ? '<span class="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-rose-100 text-rose-900 border border-rose-200">Terlambat</span>'
          : isBorrowed
          ? '<span class="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-200">Dipinjam</span>'
          : '<span class="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">Kembali</span>';

        const volumeTag = t.volumeNumber
          ? `<span class="ml-1 text-[10px] font-bold text-amber-900 bg-amber-50 border border-amber-200 px-1 rounded">Vol ${t.volumeNumber}</span>`
          : '';

        return `
          <tr class="hover:bg-stone-50/80 transition-colors border-b border-stone-200/80 text-xs">
            <td class="py-3 px-4 font-mono font-semibold text-stone-700 whitespace-nowrap">${escapeHtml(t.id)}</td>
            <td class="py-3 px-4">
              <div class="font-bold text-stone-900">${escapeHtml(t.studentName)}</div>
              <div class="text-[11px] text-stone-400 font-mono">NIS: ${escapeHtml(t.nis)} &middot; Kelas: ${escapeHtml(t.classRoom)}</div>
            </td>
            <td class="py-3 px-4">
              <div class="font-serif font-bold text-stone-800">${escapeHtml(t.bookTitle)}${volumeTag}</div>
              <div class="text-[11px] text-stone-400">ID: ${escapeHtml(t.bookId)}</div>
            </td>
            <td class="py-3 px-4 text-stone-600 whitespace-nowrap">
              <div>Pinjam: ${t.loanDate}</div>
              <div class="text-[11px] font-semibold ${isLate ? 'text-rose-800' : 'text-stone-500'}">Jatuh Tempo: ${t.dueDate}</div>
            </td>
            <td class="py-3 px-4 text-center whitespace-nowrap">${statusBadge}</td>
            <td class="py-3 px-4 text-right whitespace-nowrap">
              ${
                t.fine > 0
                  ? `<div class="font-bold text-rose-900">${formatRp(t.fine)}</div>
                     <div class="text-[10px] ${t.finePaid ? 'text-emerald-700' : 'text-rose-600 font-semibold'}">${t.finePaid ? 'Lunas' : 'Belum Dibayar'}</div>`
                  : '<span class="text-stone-400">-</span>'
              }
            </td>
            <td class="py-3 px-4 text-center whitespace-nowrap">
              <div class="flex items-center justify-center gap-1.5">
                ${
                  t.status !== 'Kembali'
                    ? `<button type="button" data-action="return-loan" data-id="${t.id}"
                         class="px-2.5 py-1 rounded-md bg-stone-100 hover:bg-stone-200 text-stone-800 font-semibold text-[11px] border border-stone-300 transition-colors cursor-pointer"
                         title="Konfirmasi Pengembalian Buku">
                         Kembalikan
                       </button>`
                    : '<span class="text-stone-400 text-[11px] italic">Tuntas</span>'
                }
                ${
                  !t.finePaid && t.fine > 0
                    ? `<button type="button" data-action="pay-fine" data-id="${t.id}"
                         class="px-2.5 py-1 rounded-md bg-rose-50 hover:bg-rose-100 text-rose-900 font-bold text-[11px] border border-rose-200 transition-colors cursor-pointer"
                         title="Tandai Denda Telah Dilunasi">
                         Bayar Denda
                       </button>`
                    : ''
                }
              </div>
            </td>
          </tr>
        `;
      })
      .join('');
  },
};
