/**
 * @file Controller for staff login authentication and password visibility toggle.
 */

import { $ } from '../utils/dom.js';
import { showToast } from '../utils/toast.js';

document.addEventListener('DOMContentLoaded', () => {
  const form = $('#adminLoginForm');
  const usernameInput = $('#adminUsername');
  const passwordInput = $('#adminPassword');
  const togglePasswordBtn = $('#togglePasswordBtn');
  const eyeIconOpen = $('#eyeIconOpen');
  const eyeIconClosed = $('#eyeIconClosed');
  const submitBtn = $('#submitLoginBtn');

  // Password visibility toggle
  if (togglePasswordBtn && passwordInput) {
    togglePasswordBtn.addEventListener('click', () => {
      const isPassword = passwordInput.getAttribute('type') === 'password';
      passwordInput.setAttribute('type', isPassword ? 'text' : 'password');
      if (eyeIconOpen && eyeIconClosed) {
        eyeIconOpen.classList.toggle('hidden', isPassword);
        eyeIconClosed.classList.toggle('hidden', !isPassword);
      }
    });
  }

  // Handle form submission
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const username = usernameInput ? usernameInput.value.trim() : '';
      const password = passwordInput ? passwordInput.value.trim() : '';

      if (!username || !password) {
        showToast('NIP / Username dan Password wajib diisi.', 'warning');
        return;
      }

      const originalBtnText = submitBtn ? submitBtn.innerText : 'Masuk ke Panel Admin';
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerText = 'Memverifikasi Kredensial...';
      }

      try {
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password }),
        });

        let data = {};
        try {
          data = await response.json();
        } catch {
          data = {};
        }

        if (!response.ok || !data.ok) {
          showToast(data.message || 'Username atau password yang Anda masukkan salah.', 'error');
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerText = originalBtnText;
          }
          return;
        }

        // Validate administrator role
        if (!data.user || data.user.role !== 'admin') {
          showToast('Akses ditolak. Akun Anda bukan administrator.', 'error');
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerText = originalBtnText;
          }
          return;
        }

        // Store authentication credentials
        localStorage.setItem('sisperpus_token', data.token || 'admin-session');
        localStorage.setItem('sisperpus_user', JSON.stringify(data.user));

        showToast('Login berhasil. Mengalihkan ke Dashboard...', 'success', 2000);
        setTimeout(() => {
          window.location.href = 'admin.html';
        }, 500);
      } catch (err) {
        showToast('Gagal terhubung ke server autentikasi. Silakan periksa koneksi Anda.', 'error');
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerText = originalBtnText;
        }
      }
    });
  }
});
