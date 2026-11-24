/**
 * @file Navigation and mobile drawer controller for SISPERPUS.
 */

import { $, $$ } from '../../utils/dom.js';

export const navigation = {
  init() {
    this.bindScrollRestoration();
    this.bindSmoothAnchors();
    this.bindMobileMenu();
    this.bindScrollEffects();
    this.bindSearchShortcuts();
  },

  bindScrollRestoration() {
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }

    const savedPos = sessionStorage.getItem('sisperpus_scroll_y');
    if (savedPos !== null && Number(savedPos) > 0) {
      window.scrollTo({ top: Number(savedPos), behavior: 'instant' });
    }

    window.addEventListener('scroll', () => {
      sessionStorage.setItem('sisperpus_scroll_y', String(window.scrollY));
    }, { passive: true });
  },

  bindSmoothAnchors() {
    document.addEventListener('click', (e) => {
      const link = e.target.closest('a[href^="#"]');
      if (!link) return;
      const href = link.getAttribute('href');
      if (!href || href === '#' || href === '#!') return;
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth' });
        history.pushState(null, '', href);
      }
    });
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
