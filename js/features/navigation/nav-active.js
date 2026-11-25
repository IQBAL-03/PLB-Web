/**
 * @file Active navigation link indicator synchronized with clicks and scroll position.
 */

const NAV_SECTIONS = ['beranda', 'sorotan', 'katalog'];

export const navActive = {
  manualLockUntil: 0,

  set(sectionId) {
    const targetId = NAV_SECTIONS.includes(sectionId) ? sectionId : 'beranda';
    document.querySelectorAll('[data-nav-section]').forEach((link) => {
      const isMatch = link.dataset.navSection === targetId;
      link.classList.toggle('text-rose-900', isMatch);
      link.classList.toggle('font-bold', isMatch);
      link.classList.toggle('border-b-2', isMatch && link.closest('#desktopMainNav') !== null);
      link.classList.toggle('border-rose-900', isMatch && link.closest('#desktopMainNav') !== null);
      link.classList.toggle('text-stone-600', !isMatch && link.closest('#desktopMainNav') !== null);
    });
  },

  lockBriefly(ms = 750) {
    this.manualLockUntil = Date.now() + ms;
  },

  syncFromScroll() {
    if (Date.now() < this.manualLockUntil) return;
    const y = window.scrollY;
    let active = 'beranda';
    for (const id of NAV_SECTIONS) {
      const el = document.getElementById(id);
      if (!el || el.classList.contains('hidden')) continue;
      const top = el.getBoundingClientRect().top + y;
      if (y + 140 >= top) active = id;
    }
    this.set(active);
  },
};
