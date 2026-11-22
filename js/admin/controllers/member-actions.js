/**
 * @file Handlers and form bindings for member CRUD actions in the admin panel.
 */

import { $ } from '../../utils/dom.js';
import { showToast } from '../../utils/toast.js';
import { adminState } from '../admin-state.js';
import { membersView } from '../views/members-view.js';

export const memberActions = {
  bind(switchTabFn) {
    document.addEventListener('click', (e) => {
      if (e.target.closest('#openAddMemberBtn')) {
        const modal = $('#memberModalDialog');
        const form = $('#memberForm');
        if (modal && form) {
          form.reset();
          $('#memberFormOriginalNis').value = '';
          $('#memberModalTitle').textContent = 'Tambah Anggota Siswa Baru';
          modal.classList.remove('hidden');
        }
        return;
      }

      if (e.target.closest('#closeMemberModalBtn') || e.target.dataset.closeMemberModal) {
        const modal = $('#memberModalDialog');
        if (modal) modal.classList.add('hidden');
        return;
      }

      const verifyBtn = e.target.closest('[data-member-action="verify"]');
      if (verifyBtn) {
        const nis = verifyBtn.dataset.nis;
        const updated = adminState.updateMember(nis, { status: 'Aktif' });
        if (updated) {
          switchTabFn('members');
          showToast(`Anggota ${updated.name} (NIS: ${nis}) berhasil diverifikasi menjadi Aktif.`, 'success');
        }
        return;
      }

      const editBtn = e.target.closest('[data-member-action="edit"]');
      if (editBtn) {
        const nis = editBtn.dataset.nis;
        const member = adminState.members.find((m) => m.nis === nis);
        if (member) {
          $('#memberFormOriginalNis').value = member.nis;
          $('#memberNis').value = member.nis;
          $('#memberName').value = member.name;
          $('#memberClass').value = member.classRoom;
          $('#memberStatus').value = member.status;
          $('#memberModalTitle').textContent = 'Edit Data Anggota Siswa';
          $('#memberModalDialog').classList.remove('hidden');
        }
        return;
      }

      const delBtn = e.target.closest('[data-member-action="delete"]');
      if (delBtn) {
        const nis = delBtn.dataset.nis;
        if (confirm(`Hapus anggota dengan NIS ${nis}?`)) {
          adminState.deleteMember(nis);
          switchTabFn('members');
          showToast(`Anggota NIS ${nis} berhasil dihapus.`, 'success');
        }
      }
    });

    document.addEventListener('submit', (e) => {
      if (e.target.id === 'memberForm') {
        e.preventDefault();
        const origNis = $('#memberFormOriginalNis').value;
        const nis = $('#memberNis').value.trim();
        const name = $('#memberName').value.trim();
        const classRoom = $('#memberClass').value.trim();
        const status = $('#memberStatus').value;

        if (origNis) {
          adminState.updateMember(origNis, { nis, name, classRoom, status });
          showToast(`Data anggota ${name} berhasil diperbarui.`, 'success');
        } else {
          adminState.addMember({ nis, name, classRoom, activeLoans: 0, status });
          showToast(`Anggota baru ${name} (${nis}) berhasil didaftarkan.`, 'success');
        }
        $('#memberModalDialog').classList.add('hidden');
        switchTabFn('members');
      }
    });

    document.addEventListener('input', (e) => {
      if (e.target.id === 'memberSearchInput') {
        const q = e.target.value;
        const filtered = adminState.getMembers(q);
        const tbody = $('#membersTableBody');
        if (tbody) tbody.innerHTML = membersView.renderRows(filtered);
        const count = $('#memberCountLabel');
        if (count) count.textContent = `Menampilkan ${filtered.length} anggota`;
      }
    });
  },
};
