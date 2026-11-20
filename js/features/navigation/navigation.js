/**
 * @file Navigation and mobile drawer controller for SISPERPUS.
 */

import { $, $$ } from '../../utils/dom.js';

export const navigation = {
  init() {
    this.bindMobileMenu();
    this.bindScrollEffects();
    this.bindSearchShortcuts();
  },

  bindMobileMenu() {
    const toggleBtn = $('#mobileMenuBtn');
    const drawer = $('#mobileNavDrawer');
    const closeBtn = $('#closeMobileMenuBtn');
    const backdrop = $('#mobileNavBackdrop');

    const openMenu = () => {
      if (!drawer) return;
      drawer.classList.remove('hidden');
      document.body.classList.add('overflow-hidden');
    };

    const closeMenu = () => {
      if (!drawer) return;
      drawer.classList.add('hidden');
      document.body.classList.remove('overflow-hidden');
    };

    if (toggleBtn) toggleBtn.addEventListener('click', openMenu);
    if (closeBtn) closeBtn.addEventListener('click', closeMenu);
    if (backdrop) backdrop.addEventListener('click', closeMenu);

    $$('#mobileNavDrawer a').forEach((link) => {
      link.addEventListener('click', closeMenu);
    });
  },

  bindScrollEffects() {
    const header = $('#mainHeader');
    if (!header) return;

    window.addEventListener('scroll', () => {
      if (window.scrollY > 20) {
        header.classList.add('shadow-md', 'bg-white/95', 'backdrop-blur-md');
        header.classList.remove('bg-white');
      } else {
        header.classList.remove('shadow-md', 'bg-white/95', 'backdrop-blur-md');
        header.classList.add('bg-white');
      }
    });
  },

  bindSearchShortcuts() {
    window.addEventListener('keydown', (e) => {
      if (e.key === '/' && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
        e.preventDefault();
        const searchInput = $('#heroSearchInput');
        if (searchInput) {
          searchInput.focus();
          searchInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
    });
  },
};
