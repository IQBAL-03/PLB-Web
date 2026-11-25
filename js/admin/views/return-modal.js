/**
 * @file Modal dialog for confirming book return condition and fine calculation.
 */

import { escapeHtml } from '../../utils/dom.js';

const formatRp = (n) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);

export const returnModal = {
  open(tx, bookPrice, onConfirm) {
    const existing = document.getElementById('returnConditionModal');
    if (existing) existing.remove();

    const dueStr = String(tx.dueDate || '').slice(0, 10);
    const today = new Date();
    const dueTime = dueStr ? new Date(dueStr + 'T00:00:00') : null;
    const daysLate = dueTime && today > dueTime ? Math.floor((today - dueTime) / 86400000) : 0;
    const lateFine = daysLate > 0 ? daysLate * 1000 : 0;
    const lostFine = Number(bookPrice) || 0;

    const wrapper = document.createElement('div');
    wrapper.id = 'returnConditionModal';
    wrapper.className = 'fixed inset-0 z-50 flex items-center justify-center p-4';
    wrapper.innerHTML = `
      <div class="fixed inset-0 bg-stone-950/60 backdrop-blur-xs" data-close-return="1"></div>
      <div class="relative z-10 bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-stone-200 space-y-4">
        <div class="flex items-start justify-between border-b border-stone-200 pb-3">
          <div>
            <h3 class="font-serif text-lg font-bold text-stone-900">Konfirmasi Pengembalian</h3>
            <p class="text-xs text-stone-500">${escapeHtml(tx.id)} &middot; ${escapeHtml(tx.studentName)}</p>
          </div>
          <button type="button" data-close-return="1" class="text-stone-400 hover:text-stone-800 text-xl font-bold leading-none cursor-pointer">&times;</button>
        </div>

        <div class="bg-stone-50 p-3 rounded-xl border border-stone-200 text-xs space-y-1">
          <div class="font-bold text-stone-800">${escapeHtml(tx.bookTitle)}</div>
          <div class="text-stone-500">Harga Buku: <strong class="text-stone-800">${formatRp(lostFine)}</strong> &middot; Telat: <strong class="${daysLate > 0 ? 'text-rose-800' : 'text-emerald-700'}">${daysLate} hari</strong></div>
        </div>

        <form id="returnConditionForm" class="space-y-3 text-xs">
          <label class="block font-bold text-stone-700 uppercase">Kondisi Buku Saat Dikembalikan</label>
          <select id="returnConditionSelect" class="w-full px-3 py-2 rounded-lg border border-stone-300 bg-white focus:ring-2 focus:ring-rose-800 focus:outline-none">
            <option value="normal">Normal / Baik (Telat Rp 1.000/hari: ${formatRp(lateFine)})</option>
            <option value="rusak">Rusak (Nominal Denda Ditentukan Admin)</option>
            <option value="hilang">Hilang (Denda Sesuai Harga Buku: ${formatRp(lostFine)})</option>
          </select>

          <div id="returnFinePreviewBox" class="bg-amber-50 border border-amber-200 rounded-xl p-3 text-amber-900">
            Total Denda: <strong id="returnFinePreviewText">${formatRp(lateFine)}</strong>
          </div>

          <div id="returnDamageFineGroup" class="hidden">
            <label for="returnDamageFineInput" class="block font-bold text-stone-700 uppercase mb-1">Nominal Denda Kerusakan (Rp)</label>
            <input type="number" id="returnDamageFineInput" min="0" step="1000" value="0"
              class="w-full px-3 py-2 rounded-lg border border-stone-300 focus:ring-2 focus:ring-rose-800 focus:outline-none" />
          </div>

          <div class="flex items-center justify-end gap-2 pt-2">
            <button type="button" data-close-return="1" class="px-4 py-2 rounded-lg border border-stone-300 text-stone-700 font-semibold hover:bg-stone-50 cursor-pointer">Batal</button>
            <button type="submit" class="px-4 py-2 rounded-lg bg-rose-900 hover:bg-rose-950 text-white font-semibold cursor-pointer shadow-xs">Simpan Pengembalian</button>
          </div>
        </form>
      </div>
    `;
    document.body.appendChild(wrapper);

    const sel = wrapper.querySelector('#returnConditionSelect');
    const dmgGroup = wrapper.querySelector('#returnDamageFineGroup');
    const dmgInput = wrapper.querySelector('#returnDamageFineInput');
    const previewBox = wrapper.querySelector('#returnFinePreviewBox');
    const previewText = wrapper.querySelector('#returnFinePreviewText');

    sel.addEventListener('change', () => {
      const val = sel.value;
      dmgGroup.classList.toggle('hidden', val !== 'rusak');
      previewBox.classList.toggle('hidden', val === 'rusak');
      previewText.textContent = val === 'hilang' ? formatRp(lostFine) : formatRp(lateFine);
    });

    wrapper.addEventListener('click', (e) => {
      if (e.target.dataset.closeReturn) wrapper.remove();
    });

    wrapper.querySelector('#returnConditionForm').addEventListener('submit', (e) => {
      e.preventDefault();
      const cond = sel.value;
      const fine = cond === 'hilang' ? lostFine : cond === 'rusak' ? Math.max(0, Number(dmgInput.value) || 0) : lateFine;
      wrapper.remove();
      onConfirm(cond, fine);
    });
  },
};
