/**
 * @file Bootstrap entry point for the SISPERPUS administrative dashboard with session guard.
 */

import { adminAppController } from './admin-app.controller.js';
import { imagePreviewModal } from '../features/modal/image-preview.modal.js';
import { showToast } from '../utils/toast.js';
import '../utils/image-fallback.js';

// Enforce authentication before loading administrative interface
const token = localStorage.getItem('sisperpus_token');
let currentUser = null;
try {
  currentUser = JSON.parse(localStorage.getItem('sisperpus_user') || 'null');
} catch (e) {
  currentUser = null;
}

if (!token || !currentUser || currentUser.role !== 'admin') {
  window.location.replace('login.html');
}

document.addEventListener('DOMContentLoaded', () => {
  // Update admin header name
  const adminNameEl = document.getElementById('adminCurrentUserName');
  if (adminNameEl && currentUser && (currentUser.name || currentUser.username)) {
    adminNameEl.textContent = currentUser.name || currentUser.username;
  }

  adminAppController.init();
  imagePreviewModal.init();

  const logoutBtn = document.getElementById('adminLogoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      localStorage.removeItem('sisperpus_token');
      localStorage.removeItem('sisperpus_user');
      showToast('Sesi petugas telah berakhir. Mengalihkan ke halaman login...', 'info');
      setTimeout(() => {
        window.location.replace('login.html');
      }, 500);
    });
  }
});
