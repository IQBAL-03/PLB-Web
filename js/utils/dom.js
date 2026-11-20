/**
 * @file DOM utility helpers for safe node querying and class toggles.
 */

export const $ = (selector, parent = document) => parent.querySelector(selector);
export const $$ = (selector, parent = document) => Array.from(parent.querySelectorAll(selector));

export const addClass = (el, ...cls) => el && el.classList.add(...cls);
export const removeClass = (el, ...cls) => el && el.classList.remove(...cls);
export const toggleClass = (el, cls, force) => el && el.classList.toggle(cls, force);

export const escapeHtml = (str) => {
  if (typeof str !== 'string') return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};
