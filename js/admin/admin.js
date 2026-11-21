/**
 * @file Bootstrap entry point for the SISPERPUS administrative dashboard.
 */

import { adminAppController } from './admin-app.controller.js';
import { imagePreviewModal } from '../features/modal/image-preview.modal.js';
import { showToast } from '../utils/toast.js';

document.addEventListener('DOMContentLoaded', () => {
  adminAppController.init();
  imagePreviewModal.init();

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
