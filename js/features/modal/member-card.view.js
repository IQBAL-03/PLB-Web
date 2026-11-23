/**
 * @file Render helpers for digital library student cards and search results.
 */

import { escapeHtml } from '../../utils/dom.js';

export const memberCardView = {
  renderNotFound(trimmedNis) {
    return `
      <div class="bg-rose-50 border border-rose-200 rounded-2xl p-5 text-center space-y-3">
        <div class="w-10 h-10 rounded-full bg-rose-100 text-rose-800 mx-auto flex items-center justify-center font-bold text-xs uppercase">NIS</div>
        <div>
          <h4 class="font-bold text-stone-900 text-sm">NIS "${escapeHtml(trimmedNis)}" Tidak Ditemukan</h4>
          <p class="text-xs text-stone-600 mt-1 max-w-sm mx-auto">
            Nomor Induk Siswa ini belum terdaftar dalam sistem perpustakaan. Apakah Anda ingin mendaftar sebagai anggota baru sekarang?
          </p>
        </div>
        <button type="button" id="btnGoRegisterFromCheck" data-nis="${escapeHtml(trimmedNis)}"
          class="px-4 py-2 rounded-lg bg-rose-900 hover:bg-rose-950 text-white font-semibold text-xs transition-colors cursor-pointer shadow-xs inline-flex items-center gap-1.5">
          <span>Daftar Anggota Baru Sekarang</span>
          <span>&rarr;</span>
        </button>
      </div>
    `;
  },

  renderCard(member, activeLoans = []) {
    let statusBadge = '<span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">Aktif (Terverifikasi)</span>';
    let statusNotice = '';

    if (member.status === 'Menunggu Verifikasi') {
      statusBadge = '<span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">Menunggu Verifikasi</span>';
      statusNotice = `
        <div class="mt-3 bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-900 leading-relaxed">
          <strong>Perhatian:</strong> Pendaftaran Anda telah tercatat dan sedang menunggu verifikasi oleh petugas perpustakaan di Gedung Literasi Lt. 2. Setelah status menjadi <strong>Aktif</strong>, Anda dapat langsung meminjam buku.
        </div>
      `;
    } else if (member.status === 'Ada Denda') {
      statusBadge = '<span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200">Ada Denda</span>';
      statusNotice = `
        <div class="mt-3 bg-rose-50 border border-rose-200 rounded-xl p-3 text-xs text-rose-900 leading-relaxed">
          <strong>Perhatian:</strong> Anda memiliki kewajiban denda buku yang belum terselesaikan. Harap hubungi petugas perpustakaan.
        </div>
      `;
    } else if (member.status === 'Non-Aktif') {
      statusBadge = '<span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-stone-100 text-stone-700 border border-stone-200">Non-Aktif</span>';
    }

    const loansListHtml =
      activeLoans.length > 0
        ? `
      <div class="space-y-2 mt-2">
        ${activeLoans
          .map(
            (l) => `
          <div class="flex items-center justify-between p-2.5 bg-stone-50 rounded-lg border border-stone-200 text-xs">
            <div class="min-w-0 pr-2">
              <span class="font-bold text-stone-900 block truncate">${escapeHtml(l.bookTitle)}</span>
              <span class="text-[11px] text-stone-500">Dipinjam: ${escapeHtml(l.borrowDate)}</span>
            </div>
            <div class="text-right shrink-0">
              <span class="text-[10px] uppercase font-bold text-rose-900 block">Jatuh Tempo</span>
              <span class="text-xs font-semibold text-stone-800">${escapeHtml(l.dueDate)}</span>
            </div>
          </div>
        `
          )
          .join('')}
      </div>
    `
        : `
      <p class="text-xs text-stone-500 italic mt-1">Tidak ada buku yang sedang dipinjam saat ini.</p>
    `;

    return `
      <div class="space-y-4">
        <!-- Digital Library Student Card -->
        <div class="relative bg-gradient-to-br from-stone-900 via-stone-800 to-rose-950 text-white rounded-2xl p-5 shadow-xl border border-stone-700/80 overflow-hidden">
          <div class="absolute -right-10 -bottom-10 w-40 h-40 bg-rose-800/20 rounded-full blur-2xl pointer-events-none"></div>
          <div class="relative z-10">
            <!-- Card Header -->
            <div class="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
              <div class="flex items-center gap-2">
                <div class="w-8 h-8 rounded-lg bg-rose-900 text-amber-200 flex items-center justify-center font-serif font-black text-sm shadow-xs border border-rose-700">S</div>
                <div>
                  <h4 class="font-serif font-bold text-xs tracking-wide uppercase text-white leading-none">SISPERPUS DIGITAL</h4>
                  <span class="text-[9px] text-stone-300 font-medium tracking-wider">KARTU ANGGOTA PERPUSTAKAAN</span>
                </div>
              </div>
              <div>${statusBadge}</div>
            </div>

            <!-- Card Body -->
            <div class="grid grid-cols-12 gap-3 items-center">
              <div class="col-span-3 sm:col-span-2 flex justify-center">
                <div class="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-amber-200 text-xl font-bold font-serif shadow-inner">
                  ${escapeHtml(member.name.charAt(0).toUpperCase())}
                </div>
              </div>
              <div class="col-span-9 sm:col-span-10">
                <span class="text-[10px] text-stone-400 block uppercase tracking-wider font-semibold">Nama Lengkap Siswa</span>
                <h3 class="font-serif font-bold text-base sm:text-lg text-white leading-tight">${escapeHtml(member.name)}</h3>
                <div class="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-stone-300">
                  <div>
                    <span class="text-[10px] text-stone-400 block leading-none">NIS:</span>
                    <span class="font-mono font-bold text-amber-300">${escapeHtml(member.nis)}</span>
                  </div>
                  <div>
                    <span class="text-[10px] text-stone-400 block leading-none">Kelas:</span>
                    <span class="font-semibold text-white">${escapeHtml(member.classRoom)}</span>
                  </div>
                  <div>
                    <span class="text-[10px] text-stone-400 block leading-none">Pinjaman Aktif:</span>
                    <span class="font-bold text-white">${activeLoans.length} Buku</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        ${statusNotice}

        <!-- Active Loans Information -->
        <div class="bg-white rounded-xl border border-stone-200 p-4 shadow-2xs">
          <h4 class="font-serif font-bold text-xs uppercase tracking-wider text-stone-700 mb-2">Buku yang Sedang Dipinjam (${activeLoans.length})</h4>
          ${loansListHtml}
        </div>
      </div>
    `;
  },
};
