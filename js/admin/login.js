/**
 * @file Controller for admin login form with frontend simulation bypass.
 */

import { $ } from '../utils/dom.js';
import { showToast } from '../utils/toast.js';

document.addEventListener('DOMContentLoaded', () => {
  const form = $('#adminLoginForm');
  const bypassBtn = $('#bypassLoginBtn');

  const goToDashboard = () => {
    showToast('Login berhasil. Mengalihkan ke Dashboard...', 'success', 2000);
    setTimeout(() => {
      window.location.href = 'admin.html';
    }, 600);
  };

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const user = $('#adminUsername').value.trim();
      const pass = $('#adminPassword').value.trim();

      if (!user || !pass) {
        showToast('NIP / Username dan Password wajib diisi.', 'warning');
        return;
      }
      goToDashboard();
    });
  }

  if (bypassBtn) {
    bypassBtn.addEventListener('click', () => {
      goToDashboard();
    });
  }
});
