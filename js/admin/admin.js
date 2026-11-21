/**
 * @file Bootstrap entry point for the SISPERPUS administrative dashboard.
 */

import { adminDashboardController } from './admin-dashboard.controller.js';
import { showToast } from '../utils/toast.js';

document.addEventListener('DOMContentLoaded', () => {
  adminDashboardController.init();

  const logoutBtn = document.getElementById('adminLogoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      showToast('Sesi petugas telah berakhir. Mengalihkan ke halaman login...', 'info');
      setTimeout(() => {
        window.location.href = 'login.html';
      }, 800);
    });
  }
});
