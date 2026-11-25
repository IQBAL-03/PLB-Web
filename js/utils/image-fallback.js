/**
 * @file Fallback handler for book cover images with canonical recovery and vector placeholder fallback.
 */

export const CANONICAL_COVERS = {
  M001: 'https://res.cloudinary.com/tla0kvyw/image/upload/v1795280539/sisperpus/covers/cz2u1ghpk1jwmw1f3raz.png',
  M002: 'https://res.cloudinary.com/tla0kvyw/image/upload/v1795284818/sisperpus/covers/mcutp4vwndlxvmvvp86g.png',
  M003: 'https://res.cloudinary.com/tla0kvyw/image/upload/v1795281315/sisperpus/covers/euarfxor2hvjg0tlmwhx.jpg',
  M004: 'https://res.cloudinary.com/tla0kvyw/image/upload/v1795317341/sisperpus/covers/kjb8mgjjbpctkpkclhtb.jpg',
  N001: 'https://res.cloudinary.com/tla0kvyw/image/upload/v1795421943/sisperpus/covers/inej87lksstjuvr8u97c.jpg',
};

const DEFAULT_COVER_FALLBACK = 'img/cover-fallback.svg';

/**
 * Handles cover image load errors gracefully without broken icons or alt text distortion.
 * @param {HTMLImageElement} img
 * @param {string} [bookId]
 */
export function handleCoverError(img, bookId) {
  if (!img) return;

  const retries = Number(img.dataset.coverRetries || 0);
  img.dataset.coverRetries = String(retries + 1);

  // 1. If there is a known canonical URL for this book and not tried yet, retry once
  const canonical = CANONICAL_COVERS[bookId];
  if (retries === 0 && canonical && img.src !== canonical) {
    img.src = canonical;
    return;
  }

  // 2. Otherwise fall back to the clean vector placeholder
  img.onerror = null;
  img.src = DEFAULT_COVER_FALLBACK;
}

if (typeof window !== 'undefined') {
  window.handleCoverError = handleCoverError;
}
