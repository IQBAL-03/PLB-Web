/**
 * @file Toast notification provider for SISPERPUS.
 * Provides accessible screen-reader friendly status notifications.
 */

import { $, escapeHtml } from './dom.js';

let container = null;

const ensureContainer = () => {
  if (!container) {
    container = $('#toastContainer');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toastContainer';
      container.className = 'fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none px-4';
      container.setAttribute('aria-live', 'polite');
      document.body.appendChild(container);
    }
  }
  return container;
};

export const showToast = (message, type = 'info', duration = 3500) => {
  const root = ensureContainer();
  const toast = document.createElement('div');

  const bgStyles = {
    info: 'bg-slate-900 text-white border-slate-700',
    success: 'bg-emerald-900 text-white border-emerald-700',
    warning: 'bg-amber-900 text-white border-amber-700',
    error: 'bg-rose-900 text-white border-rose-700',
  }[type] || 'bg-slate-900 text-white border-slate-700';

  toast.className = `pointer-events-auto flex items-center justify-between p-3.5 rounded-lg border shadow-lg text-sm transition-all duration-300 transform translate-y-2 opacity-0 ${bgStyles}`;
  toast.innerHTML = `
    <span class="font-medium">${escapeHtml(message)}</span>
    <button type="button" class="ml-3 text-slate-300 hover:text-white text-base leading-none p-1" aria-label="Tutup notifikasi">&times;</button>
  `;

  const closeBtn = toast.querySelector('button');
  const dismiss = () => {
    toast.classList.add('opacity-0', 'translate-y-2');
    setTimeout(() => toast.remove(), 300);
  };

  closeBtn.addEventListener('click', dismiss);
  root.appendChild(toast);

  requestAnimationFrame(() => {
    toast.classList.remove('opacity-0', 'translate-y-2');
  });

  setTimeout(dismiss, duration);
};
