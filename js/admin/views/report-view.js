/**
 * @file View component for custom date-range circulation reports with printable PDF formatting.
 */

import { escapeHtml } from '../../utils/dom.js';

export const reportView = {
  render(container, reportData) {
    if (!container) return;
    const formatRp = (num) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(num);

    container.innerHTML = `
      <div class="space-y-6">
        <!-- Filter Controls (Hidden in Print) -->
        <div class="no-print bg-white p-6 rounded-2xl border border-stone-200 shadow-xs flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 class="font-serif text-2xl sm:text-3xl font-bold text-stone-900 mb-1">Laporan Sirkulasi Buku</h1>
            <p class="text-xs sm:text-sm text-stone-500">Pilih rentang tanggal spesifik untuk memfilter transaksi dan mencetak laporan resmi.</p>
          </div>

          <form id="reportDateRangeForm" class="flex flex-wrap items-end gap-3">
            <div>
              <label for="reportStartDate" class="block text-xs font-bold text-stone-700 uppercase mb-1">Dari Tanggal</label>
              <input type="date" id="reportStartDate" value="${reportData.startDate || '2026-11-01'}" required
                class="text-xs px-3 py-2 rounded-lg border border-stone-300 focus:ring-2 focus:ring-rose-800 focus:outline-none bg-stone-50" />
            </div>
            <div>
              <label for="reportEndDate" class="block text-xs font-bold text-stone-700 uppercase mb-1">Sampai Tanggal</label>
              <input type="date" id="reportEndDate" value="${reportData.endDate || '2026-11-21'}" required
                class="text-xs px-3 py-2 rounded-lg border border-stone-300 focus:ring-2 focus:ring-rose-800 focus:outline-none bg-stone-50" />
            </div>
            <button type="submit" class="px-4 py-2 rounded-lg bg-stone-800 hover:bg-stone-900 text-white font-semibold text-xs transition-colors cursor-pointer shadow-xs">
              Tampilkan
            </button>
            <button type="button" id="triggerPrintPdfBtn" class="px-4 py-2 rounded-lg bg-rose-900 hover:bg-rose-950 text-white font-semibold text-xs transition-colors cursor-pointer shadow-xs flex items-center gap-1.5">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/></svg>
              <span>Cetak Dokumen PDF</span>
            </button>
          </form>
        </div>

        <!-- Printable Document Container -->
        <div class="bg-white p-6 sm:p-10 rounded-2xl border border-stone-200 shadow-xs space-y-6 printable-sheet">
          
          <!-- Official School Header (Kop Surat) -->
          <div class="border-b-2 border-stone-900 pb-4 text-center">
            <div class="flex items-center justify-center gap-3 mb-1">
              <div class="w-10 h-10 rounded-lg bg-rose-900 text-amber-200 flex items-center justify-center font-serif font-black text-xl">S</div>
              <div class="text-left">
                <h2 class="font-serif font-black text-lg text-stone-900 uppercase tracking-tight leading-none">SISPERPUS SEKOLAH TERPADU</h2>
                <p class="text-[11px] text-stone-600">Gedung Literasi Lantai 2 &middot; Surel: perpustakaan@sekolah.sch.id</p>
              </div>
            </div>
            <h3 class="font-serif font-bold text-base text-stone-900 uppercase tracking-wider mt-3">
              LAPORAN REKAPITULASI TRANSAKSI PEMINJAMAN BUKU
            </h3>
            <p class="text-xs text-stone-600 mt-0.5">
              Periode Tanggal: <strong class="text-stone-900">${reportData.startDate || 'Semua'}</strong> s.d. <strong class="text-stone-900">${reportData.endDate || 'Hari ini'}</strong>
            </p>
          </div>

          <!-- Summary Metric Boxes -->
          <div class="grid grid-cols-2 sm:grid-cols-5 gap-3 sm:gap-4 text-xs">
            <div class="bg-stone-50 p-3.5 rounded-xl border border-stone-200 text-center">
              <span class="text-stone-500 block text-[11px] font-bold uppercase">Total Transaksi</span>
              <span class="font-serif font-black text-xl text-stone-900">${reportData.totalCount}</span>
            </div>
            <div class="bg-stone-50 p-3.5 rounded-xl border border-stone-200 text-center">
              <span class="text-stone-500 block text-[11px] font-bold uppercase">Nilai Aset Beredar</span>
              <span class="font-serif font-black text-xl text-stone-900">${formatRp(reportData.totalBookValue || 0)}</span>
            </div>
            <div class="bg-stone-50 p-3.5 rounded-xl border border-stone-200 text-center">
              <span class="text-stone-500 block text-[11px] font-bold uppercase">Sedang Dipinjam</span>
              <span class="font-serif font-black text-xl text-amber-900">${reportData.activeCount}</span>
            </div>
            <div class="bg-stone-50 p-3.5 rounded-xl border border-stone-200 text-center">
              <span class="text-stone-500 block text-[11px] font-bold uppercase">Selesai Kembali</span>
              <span class="font-serif font-black text-xl text-emerald-800">${reportData.returnedCount}</span>
            </div>
            <div class="bg-stone-50 p-3.5 rounded-xl border border-stone-200 text-center col-span-2 sm:col-span-1">
              <span class="text-stone-500 block text-[11px] font-bold uppercase">Denda Tertunggak</span>
              <span class="font-serif font-black text-xl text-rose-900">${formatRp(reportData.unpaidFines)}</span>
            </div>
          </div>

          <!-- Itemized Transactions Table -->
          <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse border border-stone-300 text-xs">
              <thead>
                <tr class="bg-stone-100 border-b border-stone-300 font-bold text-stone-700">
                  <th class="py-2.5 px-3 border-r border-stone-300">No. TRX</th>
                  <th class="py-2.5 px-3 border-r border-stone-300">Siswa (NIS)</th>
                  <th class="py-2.5 px-3 border-r border-stone-300">Buku &amp; Edisi</th>
                  <th class="py-2.5 px-3 text-right border-r border-stone-300">Harga Pasar</th>
                  <th class="py-2.5 px-3 border-r border-stone-300">Tgl Pinjam</th>
                  <th class="py-2.5 px-3 border-r border-stone-300">Jatuh Tempo</th>
                  <th class="py-2.5 px-3 text-center border-r border-stone-300">Status</th>
                  <th class="py-2.5 px-3 text-right">Denda</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-stone-200">
                ${
                  reportData.transactions.length === 0
                    ? `<tr><td colspan="8" class="py-8 text-center text-stone-400 italic">Tidak ada transaksi tercatat pada rentang tanggal tersebut.</td></tr>`
                    : reportData.transactions
                        .map(
                          (t) => `
                    <tr class="border-b border-stone-200">
                      <td class="py-2 px-3 font-mono border-r border-stone-200">${escapeHtml(t.id)}</td>
                      <td class="py-2 px-3 border-r border-stone-200"><strong>${escapeHtml(t.studentName)}</strong> (${escapeHtml(t.nis)})</td>
                      <td class="py-2 px-3 border-r border-stone-200">${escapeHtml(t.bookTitle)}${t.volumeNumber ? ` (Vol ${t.volumeNumber})` : ''}</td>
                      <td class="py-2 px-3 text-right font-mono border-r border-stone-200">${formatRp(t.price || 0)}</td>
                      <td class="py-2 px-3 border-r border-stone-200">${t.loanDate}</td>
                      <td class="py-2 px-3 border-r border-stone-200">${t.dueDate}</td>
                      <td class="py-2 px-3 text-center border-r border-stone-200 font-semibold">${t.status}</td>
                      <td class="py-2 px-3 text-right font-mono">${t.fine > 0 ? formatRp(t.fine) : '-'}</td>
                    </tr>
                  `
                        )
                        .join('')
                }
              </tbody>
              <tfoot class="bg-stone-50 font-bold border-t-2 border-stone-300">
                <tr>
                  <td colspan="3" class="py-2.5 px-3 text-right border-r border-stone-300 uppercase text-[11px] text-stone-600">Total Akumulasi Sirkulasi:</td>
                  <td class="py-2.5 px-3 text-right font-mono border-r border-stone-300 text-stone-900">${formatRp(reportData.totalBookValue || 0)}</td>
                  <td colspan="3" class="py-2.5 px-3 border-r border-stone-300"></td>
                  <td class="py-2.5 px-3 text-right font-mono text-rose-900">${reportData.totalFines > 0 ? formatRp(reportData.totalFines) : '-'}</td>
                </tr>
              </tfoot>
            </table>
          </div>

          <!-- Official Signatures Block -->
          <div class="pt-8 grid grid-cols-2 text-center text-xs text-stone-800">
            <div>
              <p class="text-stone-500 mb-16">Mengetahui,<br />Kepala Perpustakaan Sekolah</p>
              <p class="font-bold underline">Drs. H. Hendra Setiawan, M.Pd</p>
              <p class="text-[11px] text-stone-500">NIP. 197508142002121003</p>
            </div>
            <div>
              <p class="text-stone-500 mb-16">Petugas Administrasi Perpustakaan,<br />Dicetak otomatis melalui SISPERPUS</p>
              <p class="font-bold underline">Siti Rahmawati, S.Ptk</p>
              <p class="text-[11px] text-stone-500">NIP. 198904122015052001</p>
            </div>
          </div>
        </div>
      </div>
    `;
  },
};
