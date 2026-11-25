/**
 * @file Navigation and mobile drawer controller for SISPERPUS.
 */

import { $, $$ } from '../../utils/dom.js';
import { state } from '../../core/state.js';
import { eventBus } from '../../core/events.js';

const SCROLL_STORAGE_KEY = 'sisperpus_scroll_state';
const TRACKED_SECTIONS = ['beranda', 'sorotan', 'katalog', 'informasi', 'footer'];

export const navigation = {
  isRestoring: true,
  isProgrammaticScroll: false,
  hasUserInteracted: false,
  lastRestoredY: 0,
  programmaticTimer: null,

  init() {
    this.setupScrollRestoration();
    this.bindSmoothAnchors();
    this.bindMobileMenu();
    this.bindScrollEffects();
    this.bindSearchShortcuts();
  },

  setupScrollRestoration() {
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }

    document.documentElement.style.overflowAnchor = 'none';

    const markUserInteraction = () => {
      this.hasUserInteracted = true;
      this.isRestoring = false;
      document.documentElement.style.overflowAnchor = '';
    };

    window.addEventListener('wheel', markUserInteraction, { passive: true, once: true });
    window.addEventListener('touchstart', markUserInteraction, { passive: true, once: true });
    window.addEventListener('keydown', (e) => {
      if (['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', ' '].includes(e.key)) {
        markUserInteraction();
      }
    }, { passive: true });

    let scrollDebounce = null;
    window.addEventListener(
      'scroll',
      () => {
        if (this.isProgrammaticScroll) return;
        if (this.isRestoring) {
          if (Math.abs(window.scrollY - this.lastRestoredY) > 12) {
            markUserInteraction();
          } else {
            return;
          }
        }
        clearTimeout(scrollDebounce);
        scrollDebounce = setTimeout(() => this.saveScrollState(), 60);
      },
      { passive: true }
    );

    const flushSave = () => {
      if (!this.isRestoring) this.saveScrollState();
    };
    window.addEventListener('beforeunload', flushSave);
    window.addEventListener('pagehide', flushSave);

    const finishRestore = () => {
      requestAnimationFrame(() => {
        if (!this.hasUserInteracted) {
          this.restoreScrollPosition();
        }
        setTimeout(() => {
          this.isRestoring = false;
          document.documentElement.style.overflowAnchor = '';
        }, 120);
      });
    };

    if (!state.isLoading) {
      finishRestore();
    } else {
      let aligned = false;
      const runOnce = () => {
        if (aligned) return;
        aligned = true;
        finishRestore();
      };
      eventBus.on('books:synced', runOnce);
      if (state.initialSyncPromise) {
        state.initialSyncPromise.finally(runOnce);
      }
    }

    setTimeout(() => {
      if (this.isRestoring) {
        this.isRestoring = false;
        document.documentElement.style.overflowAnchor = '';
      }
    }, 2500);
  },

  saveScrollState() {
    if (document.body.classList.contains('overflow-hidden')) return;
    try {
      const y = window.scrollY;
      const maxScroll = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
      const atBottom = maxScroll > 50 && y >= maxScroll - 24;
      let activeId = 'beranda';
      let offset = y;

      for (const id of TRACKED_SECTIONS) {
        const el = document.getElementById(id);
        if (!el || el.classList.contains('hidden')) continue;
        const top = el.getBoundingClientRect().top + y;
        if (y + 80 >= top) {
          activeId = id;
          offset = y - top;
        }
      }

      sessionStorage.setItem(
        SCROLL_STORAGE_KEY,
        JSON.stringify({ y, sectionId: activeId, offset, atBottom })
      );
    } catch {
      // Storage quota fallback
    }
  },

  scrollToInstant(top) {
    const safeTop = Math.max(0, top);
    this.lastRestoredY = safeTop;
    this.isProgrammaticScroll = true;
    clearTimeout(this.programmaticTimer);
    window.scrollTo({ top: safeTop, behavior: 'instant' });
    this.programmaticTimer = setTimeout(() => {
      this.isProgrammaticScroll = false;
    }, 100);
  },

  restoreScrollPosition() {
    try {
      const raw = sessionStorage.getItem(SCROLL_STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw);
        if (saved && typeof saved.y === 'number') {
          if (saved.y <= 10 && !saved.atBottom) {
            this.scrollToInstant(0);
            return;
          }
          if (saved.atBottom) {
            const maxScroll = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
            this.scrollToInstant(maxScroll);
            return;
          }
          const sectionEl = saved.sectionId ? document.getElementById(saved.sectionId) : null;
          if (sectionEl && !sectionEl.classList.contains('hidden')) {
            const sectionTop = sectionEl.getBoundingClientRect().top + window.scrollY;
            const targetY = sectionTop + (Number(saved.offset) || 0);
            this.scrollToInstant(targetY);
            return;
          }
          this.scrollToInstant(saved.y);
          return;
        }
      }
    } catch {
      // Storage parse fallback
    }

    if (window.location.hash) {
      const hashTarget = document.querySelector(window.location.hash);
      if (hashTarget && !hashTarget.classList.contains('hidden')) {
        this.scrollToInstant(hashTarget.getBoundingClientRect().top + window.scrollY);
      }
    }
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
        this.hasUserInteracted = true;
        this.isRestoring = false;
        document.documentElement.style.overflowAnchor = '';
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
