/**
 * @file Modal controller for student self-registration and digital library membership card.
 */

import { $, escapeHtml } from '../../utils/dom.js';
import { showToast } from '../../utils/toast.js';
import { initialMembers } from '../../admin/admin-data.js';
import { memberCardView } from './member-card.view.js';

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
      container.innerHTML = memberCardView.renderNotFound(trimmedNis);
      return;
    }

    const activeLoans = getActiveLoansForNis(member.nis);
    container.innerHTML = memberCardView.renderCard(member, activeLoans);
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

        // Sync to TiDB database via API if available
        fetch('/api/members', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            nis,
            name,
            class_room: classRoom,
            status: 'Menunggu Verifikasi',
          }),
        }).catch(() => {});

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
