/**
 * @file Modal controller for student self-registration and digital library membership card.
 */

import { $, escapeHtml } from '../../utils/dom.js';
import { showToast } from '../../utils/toast.js';
import { initialMembers } from '../../admin/admin-data.js';

function getMembersList() {
  try {
    const raw = localStorage.getItem('sisperpus_admin_members');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  return JSON.parse(JSON.stringify(initialMembers));
}

function saveMembersList(members) {
  try {
    localStorage.setItem('sisperpus_admin_members', JSON.stringify(members));
  } catch {}
}

function getActiveLoansForNis(nis) {
  try {
    const raw = localStorage.getItem('sisperpus_admin_transactions');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed.filter((t) => String(t.nis) === String(nis) && t.status === 'Dipinjam');
      }
    }
  } catch {}
  return [];
}

export const memberModal = {
  currentTab: 'check',

  get modal() {
    return $('#memberCardModal');
  },

  init() {
    this.bindEvents();
  },

  open(tab = 'check', prefillNis = '') {
    if (!this.modal) return;
    this.modal.classList.remove('hidden');
    document.body.classList.add('overflow-hidden');
    this.switchTab(tab);

    if (prefillNis) {
      const nisInput = $('#checkNisInput');
      if (nisInput) {
        nisInput.value = prefillNis;
        this.performCheck(prefillNis);
      }
    }
  },

  close() {
    if (!this.modal) return;
    this.modal.classList.add('hidden');
    document.body.classList.remove('overflow-hidden');
  },

  switchTab(tabName) {
    this.currentTab = tabName;
    const tabCheckBtn = $('#tabCheckMemberBtn');
    const tabRegBtn = $('#tabRegisterMemberBtn');
    const panelCheck = $('#panelCheckMember');
    const panelReg = $('#panelRegisterMember');

    if (tabName === 'check') {
      if (tabCheckBtn) tabCheckBtn.className = 'pb-2.5 px-3 border-b-2 border-rose-900 text-rose-900 font-bold transition-colors cursor-pointer';
      if (tabRegBtn) tabRegBtn.className = 'pb-2.5 px-3 border-b-2 border-transparent text-stone-500 hover:text-stone-800 transition-colors cursor-pointer';
      if (panelCheck) panelCheck.classList.remove('hidden');
      if (panelReg) panelReg.classList.add('hidden');
      const input = $('#checkNisInput');
      if (input) input.focus();
    } else {
      if (tabCheckBtn) tabCheckBtn.className = 'pb-2.5 px-3 border-b-2 border-transparent text-stone-500 hover:text-stone-800 transition-colors cursor-pointer';
      if (tabRegBtn) tabRegBtn.className = 'pb-2.5 px-3 border-b-2 border-rose-900 text-rose-900 font-bold transition-colors cursor-pointer';
      if (panelCheck) panelCheck.classList.add('hidden');
      if (panelReg) panelReg.classList.remove('hidden');
      const input = $('#regNis');
      if (input) input.focus();
    }
  },

  performCheck(nis) {
    const container = $('#memberCardResultContainer');
    if (!container) return;

    const trimmedNis = String(nis).trim();
    if (!trimmedNis) {
      showToast('Masukkan NIS terlebih dahulu.', 'warning');
      return;
    }

    const members = getMembersList();
    const member = members.find((m) => String(m.nis) === trimmedNis);

    if (!member) {
      container.innerHTML = `
        <div class="bg-rose-50 border border-rose-200 rounded-2xl p-5 text-center space-y-3">
          <div class="w-10 h-10 rounded-full bg-rose-100 text-rose-800 mx-auto flex items-center justify-center font-bold text-lg">✕</div>
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
      return;
    }

    const activeLoans = getActiveLoansForNis(member.nis);
    this.renderCardResult(member, activeLoans);
  },

  renderCardResult(member, activeLoans = []) {
    const container = $('#memberCardResultContainer');
    if (!container) return;

    let statusBadge = '<span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">✓ Aktif (Terverifikasi)</span>';
    let statusNotice = '';

    if (member.status === 'Menunggu Verifikasi') {
      statusBadge = '<span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">⏳ Menunggu Verifikasi Admin</span>';
      statusNotice = `
        <div class="mt-3 bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-900 leading-relaxed">
          <strong>Perhatian:</strong> Pendaftaran Anda telah tercatat dan sedang menunggu verifikasi oleh petugas perpustakaan di Gedung Literasi Lt. 2. Setelah status menjadi <strong>Aktif</strong>, Anda dapat langsung meminjam buku.
        </div>
      `;
    } else if (member.status === 'Ada Denda') {
      statusBadge = '<span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200">⚠️ Ada Denda</span>';
      statusNotice = `
        <div class="mt-3 bg-rose-50 border border-rose-200 rounded-xl p-3 text-xs text-rose-900 leading-relaxed">
          <strong>Perhatian:</strong> Anda memiliki kewajiban denda buku yang belum terselesaikan. Harap hubungi petugas perpustakaan.
        </div>
      `;
    } else if (member.status === 'Non-Aktif') {
      statusBadge = '<span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-stone-100 text-stone-700 border border-stone-200">✕ Non-Aktif</span>';
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

    container.innerHTML = `
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

  bindEvents() {
    // Open modal buttons
    document.addEventListener('click', (e) => {
      const openBtn = e.target.closest('#memberCardBtn, #mobileMemberCardBtn');
      if (openBtn) {
        e.preventDefault();
        this.open('check');
        return;
      }

      // Close modal
      if (e.target.closest('#closeMemberModalBtn') || e.target.id === 'memberModalBackdrop') {
        this.close();
        return;
      }

      // Tab switching
      if (e.target.closest('#tabCheckMemberBtn')) {
        this.switchTab('check');
        return;
      }

      if (e.target.closest('#tabRegisterMemberBtn')) {
        this.switchTab('register');
        return;
      }

      // Quick switch from "Not Found" card to registration
      const goRegBtn = e.target.closest('#btnGoRegisterFromCheck');
      if (goRegBtn) {
        const nis = goRegBtn.dataset.nis || '';
        this.switchTab('register');
        const regNisInput = $('#regNis');
        if (regNisInput && nis) {
          regNisInput.value = nis;
          const regName = $('#regName');
          if (regName) regName.focus();
        }
      }
    });

    // Close on Escape
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.modal && !this.modal.classList.contains('hidden')) {
        this.close();
      }
    });

    // Handle check member submit
    document.addEventListener('submit', (e) => {
      if (e.target && e.target.id === 'checkMemberForm') {
        e.preventDefault();
        const nis = $('#checkNisInput') ? $('#checkNisInput').value.trim() : '';
        this.performCheck(nis);
      }
    });

    // Handle self-registration submit
    document.addEventListener('submit', (e) => {
      if (e.target && e.target.id === 'selfRegisterForm') {
        e.preventDefault();
        const nisInput = $('#regNis');
        const nameInput = $('#regName');
        const classInput = $('#regClass');

        const nis = nisInput ? nisInput.value.trim() : '';
        const name = nameInput ? nameInput.value.trim() : '';
        const classRoom = classInput ? classInput.value.trim() : '';

        if (!nis || !name || !classRoom) {
          showToast('Semua kolom formulir pendaftaran wajib diisi.', 'warning');
          return;
        }

        const members = getMembersList();
        const exists = members.some((m) => String(m.nis) === String(nis));
        if (exists) {
          showToast(`NIS ${nis} sudah terdaftar sebelumnya. Silakan gunakan tab Cek Kartu.`, 'error', 5000);
          return;
        }

        // New student registration default status: "Menunggu Verifikasi"
        const newMember = {
          nis,
          name,
          classRoom,
          activeLoans: 0,
          status: 'Menunggu Verifikasi',
        };

        members.unshift(newMember);
        saveMembersList(members);

        showToast(`Pendaftaran atas nama ${name} berhasil! Menunggu verifikasi admin perpustakaan.`, 'success', 6000);

        // Reset form
        e.target.reset();

        // Switch to check tab and immediately display the new pending card
        this.switchTab('check');
        const checkInput = $('#checkNisInput');
        if (checkInput) checkInput.value = nis;
        this.renderCardResult(newMember, []);
      }
    });
  },
};
