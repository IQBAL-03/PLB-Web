/**
 * @file Full table view and CRUD modal for library member and student management.
 */

import { escapeHtml } from '../../utils/dom.js';

export const membersView = {
  render(container, members) {
    if (!container) return;

    container.innerHTML = `
      <div class="space-y-6">
        <!-- Header & Action -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-stone-200 shadow-xs">
          <div>
            <h1 class="font-serif text-2xl sm:text-3xl font-bold text-stone-900 mb-1">Daftar Anggota &amp; Siswa</h1>
            <p class="text-xs sm:text-sm text-stone-500">Kelola data keanggotaan siswa untuk peminjaman buku perpustakaan.</p>
          </div>
          <button type="button" id="openAddMemberBtn" class="px-4 py-2.5 rounded-lg bg-rose-900 hover:bg-rose-950 text-white text-xs sm:text-sm font-semibold transition-colors cursor-pointer shadow-xs self-start sm:self-auto">
            + Tambah Anggota Baru
          </button>
        </div>

        <!-- Members Table Container -->
        <div class="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
          <div class="p-5 border-b border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 class="font-serif text-lg font-bold text-stone-900">Data Master Siswa Terdaftar</h2>
              <span id="memberCountLabel" class="text-xs text-stone-500">Total ${members.length} anggota aktif</span>
            </div>
            <div class="w-full sm:w-72">
              <input type="text" id="memberSearchInput" placeholder="Cari nama, NIS, atau kelas..."
                class="w-full text-xs px-3.5 py-2 rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-rose-800 bg-stone-50/50" />
            </div>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse">
              <thead>
                <tr class="bg-stone-100/75 border-b border-stone-200 text-[11px] font-bold text-stone-600 uppercase tracking-wider">
                  <th class="py-3 px-4">NIS</th>
                  <th class="py-3 px-4">Nama Lengkap Siswa</th>
                  <th class="py-3 px-4">Kelas</th>
                  <th class="py-3 px-4 text-center">Pinjaman Aktif</th>
                  <th class="py-3 px-4 text-center">Status</th>
                  <th class="py-3 px-4 text-center">Aksi Manajemen</th>
                </tr>
              </thead>
              <tbody id="membersTableBody" class="divide-y divide-stone-100">
                ${this.renderRows(members)}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Add / Edit Member Modal Form -->
      <div id="memberModalDialog" class="fixed inset-0 z-50 hidden" role="dialog" aria-modal="true" aria-labelledby="memberModalTitle">
        <div class="fixed inset-0 bg-stone-950/70 backdrop-blur-xs" data-close-member-modal="true"></div>
        <div class="fixed inset-0 z-10 overflow-y-auto flex items-center justify-center p-4">
          <div class="relative bg-white rounded-2xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-stone-200">
            <button type="button" id="closeMemberModalBtn" class="absolute top-4 right-4 p-2 text-stone-400 hover:text-stone-800 text-2xl font-bold leading-none cursor-pointer">&times;</button>
            <h3 id="memberModalTitle" class="font-serif text-xl font-bold text-stone-900 mb-1">Tambah Anggota Siswa</h3>
            <p class="text-xs text-stone-500 mb-5">Lengkapi identitas siswa untuk mendaftarkan kartu perpustakaan.</p>

            <form id="memberForm" class="space-y-4">
              <input type="hidden" id="memberFormOriginalNis" value="" />
              <div>
                <label for="memberNis" class="block text-xs font-bold text-stone-700 uppercase mb-1">Nomor Induk Siswa (NIS)</label>
                <input type="text" id="memberNis" required class="w-full text-xs sm:text-sm px-3.5 py-2 rounded-lg border border-stone-300 focus:ring-2 focus:ring-rose-800 focus:outline-none" placeholder="Contoh: 202610999" />
              </div>
              <div>
                <label for="memberName" class="block text-xs font-bold text-stone-700 uppercase mb-1">Nama Lengkap</label>
                <input type="text" id="memberName" required class="w-full text-xs sm:text-sm px-3.5 py-2 rounded-lg border border-stone-300 focus:ring-2 focus:ring-rose-800 focus:outline-none" placeholder="Nama siswa" />
              </div>
              <div>
                <label for="memberClass" class="block text-xs font-bold text-stone-700 uppercase mb-1">Kelas</label>
                <input type="text" id="memberClass" required class="w-full text-xs sm:text-sm px-3.5 py-2 rounded-lg border border-stone-300 focus:ring-2 focus:ring-rose-800 focus:outline-none" placeholder="Contoh: XI-MIPA-3" />
              </div>
              <div>
                <label for="memberStatus" class="block text-xs font-bold text-stone-700 uppercase mb-1">Status Keanggotaan</label>
                <select id="memberStatus" class="w-full text-xs sm:text-sm px-3.5 py-2 rounded-lg border border-stone-300 focus:ring-2 focus:ring-rose-800 focus:outline-none bg-stone-50">
                  <option value="Aktif">Aktif (Terverifikasi)</option>
                  <option value="Menunggu Verifikasi">Menunggu Verifikasi</option>
                  <option value="Ada Denda">Ada Denda</option>
                  <option value="Non-Aktif">Non-Aktif</option>
                </select>
              </div>
              <button type="submit" class="w-full bg-rose-900 hover:bg-rose-950 text-white font-semibold text-xs sm:text-sm py-2.5 px-4 rounded-lg transition-colors cursor-pointer shadow-xs">
                Simpan Data Anggota
              </button>
            </form>
          </div>
        </div>
      </div>
    `;
  },

  renderRows(members) {
    if (members.length === 0) {
      return `<tr><td colspan="6" class="py-10 text-center text-stone-400 text-xs">Tidak ada data anggota siswa yang cocok.</td></tr>`;
    }

    return members
      .map((m) => {
        let badge = '<span class="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">Aktif</span>';
        if (m.status === 'Menunggu Verifikasi') {
          badge = '<span class="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-200">Menunggu Verifikasi</span>';
        } else if (m.status === 'Ada Denda') {
          badge = '<span class="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-200">Ada Denda</span>';
        } else if (m.status === 'Non-Aktif') {
          badge = '<span class="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-stone-100 text-stone-600 border border-stone-200">Non-Aktif</span>';
        }

        const verifyBtn = m.status === 'Menunggu Verifikasi'
          ? `<button type="button" data-member-action="verify" data-nis="${m.nis}"
              class="px-2.5 py-1 rounded bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-[11px] transition-colors cursor-pointer shadow-xs"
              title="Setujui dan Verifikasi Anggota Siswa">
              Verifikasi
            </button>`
          : '';

        return `
          <tr class="hover:bg-stone-50/80 transition-colors border-b border-stone-200/80 text-xs">
            <td class="py-3 px-4 font-mono font-semibold text-stone-800 whitespace-nowrap">${escapeHtml(m.nis)}</td>
            <td class="py-3 px-4 font-bold text-stone-900">${escapeHtml(m.name)}</td>
            <td class="py-3 px-4 text-stone-600">${escapeHtml(m.classRoom)}</td>
            <td class="py-3 px-4 text-center font-bold ${m.activeLoans > 0 ? 'text-amber-900' : 'text-stone-400'}">${m.activeLoans || 0}</td>
            <td class="py-3 px-4 text-center whitespace-nowrap">${badge}</td>
            <td class="py-3 px-4 text-center whitespace-nowrap">
              <div class="flex items-center justify-center gap-1.5">
                ${verifyBtn}
                <button type="button" data-member-action="edit" data-nis="${m.nis}"
                  class="px-2.5 py-1 rounded bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold text-[11px] border border-stone-300 transition-colors cursor-pointer">
                  Edit
                </button>
                <button type="button" data-member-action="delete" data-nis="${m.nis}"
                  class="px-2.5 py-1 rounded bg-rose-50 hover:bg-rose-100 text-rose-800 font-semibold text-[11px] border border-rose-200 transition-colors cursor-pointer">
                  Hapus
                </button>
              </div>
            </td>
          </tr>
        `;
      })
      .join('');
  },
};
