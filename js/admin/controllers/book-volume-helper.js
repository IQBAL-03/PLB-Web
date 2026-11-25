/**
 * @file Helper for managing multi-volume and series book installments in the admin modal.
 */

import { $, escapeHtml } from '../../utils/dom.js';
import { showToast } from '../../utils/toast.js';

export const bookVolumeHelper = {
  renderRow(v = {}, idx = 0, defaultCover = 'img/placeholder-book.svg') {
    const num = v.volumeNumber || idx + 1;
    const title = v.volumeTitle || `Volume ${num}`;
    const stock = v.stock ?? 2;
    const cover = v.coverImg || defaultCover;
    const desc = v.description || '';

    return `
      <div class="bg-stone-50/90 p-4 sm:p-5 rounded-2xl border border-stone-300 shadow-xs space-y-4 volume-item-row relative" data-volume-index="${idx}">
        <!-- Top bar: Volume badge and delete action -->
        <div class="flex items-center justify-between pb-2 border-b border-stone-200">
          <div class="flex items-center gap-2">
            <span class="px-2.5 py-1 rounded-full bg-rose-900 text-white text-xs font-bold shadow-2xs">
              Volume #${num}
            </span>
            <span class="text-xs font-semibold text-stone-600">Pengaturan Edisi Seri</span>
          </div>
          <button type="button" class="delete-volume-btn px-2.5 py-1 text-xs font-semibold text-rose-700 hover:text-white hover:bg-rose-700 rounded-lg border border-rose-300 hover:border-rose-700 transition-colors cursor-pointer" title="Hapus Volume Ini">
            Hapus Volume
          </button>
        </div>

        <!-- Cover upload & large preview (sebesar edisi buku utama) -->
        <div class="bg-white p-3.5 sm:p-4 rounded-xl border border-stone-200 flex flex-col sm:flex-row items-center gap-4">
          <div class="w-24 sm:w-28 aspect-[3/4] bg-stone-100 rounded-lg overflow-hidden border border-stone-300 shrink-0 flex items-center justify-center relative shadow-xs">
            <img src="${escapeHtml(cover)}" alt="Sampul Vol ${num}" class="volume-thumb-preview w-full h-full object-contain" onerror="this.src='img/placeholder-book.svg'" />
          </div>
          <div class="w-full space-y-2">
            <span class="block text-xs font-bold text-stone-700 uppercase">Foto Sampul Volume #${num}</span>
            <input type="text" class="volume-cover-input w-full text-xs px-3 py-1.5 rounded-lg border border-stone-300 bg-stone-50 font-mono text-[11px] focus:ring-1 focus:ring-rose-800 focus:outline-none" placeholder="URL Foto Sampul" value="${escapeHtml(v.coverImg || '')}" />
            <div class="flex flex-wrap items-center gap-2 pt-1">
              <button type="button" class="upload-volume-cover-btn px-3.5 py-2 rounded-lg bg-stone-800 hover:bg-stone-900 text-white font-semibold text-xs transition-colors cursor-pointer shadow-xs flex items-center gap-1.5">
                <svg class="w-3.5 h-3.5 text-amber-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/></svg>
                <span>Pilih Foto Sampul Volume (Maks 2MB)</span>
              </button>
              <span class="text-[11px] text-stone-500">Tersimpan di Cloudinary</span>
            </div>
          </div>
        </div>

        <!-- Volume details: Number, Title, Stock -->
        <div class="grid grid-cols-1 sm:grid-cols-12 gap-3">
          <div class="sm:col-span-3">
            <label class="block text-xs font-bold text-stone-700 uppercase mb-1">Nomor Volume</label>
            <input type="number" min="1" class="volume-num-input w-full text-xs sm:text-sm px-3.5 py-2 rounded-lg border border-stone-300 focus:ring-2 focus:ring-rose-800 focus:outline-none" value="${num}" />
          </div>
          <div class="sm:col-span-6">
            <label class="block text-xs font-bold text-stone-700 uppercase mb-1">Judul Seri/Volume</label>
            <input type="text" class="volume-title-input w-full text-xs sm:text-sm px-3.5 py-2 rounded-lg border border-stone-300 focus:ring-2 focus:ring-rose-800 focus:outline-none" placeholder="Volume ${num} (Chapter ...)" value="${escapeHtml(title)}" />
          </div>
          <div class="sm:col-span-3">
            <label class="block text-xs font-bold text-stone-700 uppercase mb-1">Stok Volume</label>
            <input type="number" min="0" class="volume-stock-input w-full text-xs sm:text-sm px-3.5 py-2 rounded-lg border border-stone-300 focus:ring-2 focus:ring-rose-800 focus:outline-none" value="${stock}" />
          </div>
        </div>

        <!-- Per-Volume Synopsis -->
        <div>
          <label class="block text-xs font-bold text-stone-700 uppercase mb-1">Sinopsis / Ringkasan Khusus Volume #${num}</label>
          <textarea rows="2" class="volume-desc-input w-full text-xs sm:text-sm px-3.5 py-2 rounded-lg border border-stone-300 focus:ring-2 focus:ring-rose-800 focus:outline-none" placeholder="Sinopsis atau rangkuman cerita khusus pada volume ini...">${escapeHtml(desc)}</textarea>
        </div>
      </div>
    `;
  },

  populate(volumes = [], defaultCover = 'img/placeholder-book.svg') {
    const list = $('#bookVolumesList');
    if (!list) return;

    if (volumes && volumes.length > 0) {
      list.innerHTML = volumes.map((v, i) => this.renderRow(v, i, defaultCover)).join('');
    } else {
      list.innerHTML = this.renderRow({}, 0, defaultCover);
    }
  },

  collect() {
    const rows = document.querySelectorAll('#bookVolumesList .volume-item-row');
    const volumes = [];

    rows.forEach((row, idx) => {
      const numInput = row.querySelector('.volume-num-input');
      const titleInput = row.querySelector('.volume-title-input');
      const stockInput = row.querySelector('.volume-stock-input');
      const coverInput = row.querySelector('.volume-cover-input');
      const descInput = row.querySelector('.volume-desc-input');

      const num = Number(numInput ? numInput.value : idx + 1) || idx + 1;
      const title = titleInput ? titleInput.value.trim() : `Volume ${num}`;
      const stock = Number(stockInput ? stockInput.value : 0) || 0;
      const cover = coverInput ? coverInput.value.trim() : '';
      const description = descInput ? descInput.value.trim() : '';

      volumes.push({
        volumeNumber: num,
        volumeTitle: title || `Volume ${num}`,
        stock: stock,
        coverImg: cover || '',
        description: description,
      });
    });

    return volumes;
  },

  syncTotalStock(forceHasVolumes = null) {
    const stockInput = $('#bookStockInput');
    const checkbox = $('#bookHasVolumesCheckbox');
    if (!stockInput) return;

    const hasVols = forceHasVolumes !== null ? Boolean(forceHasVolumes) : Boolean(checkbox && checkbox.checked);
    stockInput.readOnly = hasVols;
    stockInput.classList.toggle('bg-stone-100', hasVols);
    stockInput.classList.toggle('text-stone-500', hasVols);
    stockInput.classList.toggle('cursor-not-allowed', hasVols);

    if (hasVols) {
      let total = 0;
      document.querySelectorAll('#bookVolumesList .volume-stock-input').forEach((inp) => {
        total += Math.max(0, Number(inp.value) || 0);
      });
      stockInput.value = total;
    }
  },

  bind() {
    document.addEventListener('change', (e) => {
      if (e.target.id === 'bookHasVolumesCheckbox') {
        const checked = e.target.checked;
        const section = $('#bookVolumesSection');
        const addBtn = $('#addNewVolumeItemBtn');
        const list = $('#bookVolumesList');

        if (section) section.classList.toggle('hidden', !checked);
        if (addBtn) addBtn.classList.toggle('hidden', !checked);

        if (checked && list && list.children.length === 0) {
          const cover = $('#bookCoverInput') ? $('#bookCoverInput').value : 'img/placeholder-book.svg';
          list.innerHTML = this.renderRow({}, 0, cover);
        }
        this.syncTotalStock(checked);
      }
    });

    document.addEventListener('click', async (e) => {
      // Add volume row
      if (e.target.closest('#addNewVolumeItemBtn')) {
        const list = $('#bookVolumesList');
        if (list) {
          const count = list.querySelectorAll('.volume-item-row').length;
          const cover = $('#bookCoverInput') ? $('#bookCoverInput').value : 'img/placeholder-book.svg';
          const temp = document.createElement('div');
          temp.innerHTML = this.renderRow({}, count, cover);
          if (temp.firstElementChild) list.appendChild(temp.firstElementChild);
          this.syncTotalStock(true);
        }
        return;
      }

      // Delete volume row
      const delBtn = e.target.closest('.delete-volume-btn');
      if (delBtn) {
        const row = delBtn.closest('.volume-item-row');
        if (row) {
          row.remove();
          this.syncTotalStock();
        }
        return;
      }

      // Upload volume cover
      const upBtn = e.target.closest('.upload-volume-cover-btn');
      if (upBtn) {
        const row = upBtn.closest('.volume-item-row');
        const coverInput = row ? row.querySelector('.volume-cover-input') : null;
        if (!coverInput) return;

        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = 'image/png,image/jpeg,image/webp';
        fileInput.className = 'hidden';

        fileInput.onchange = async () => {
          const file = fileInput.files && fileInput.files[0];
          if (!file) return;

          if (file.size > 2 * 1024 * 1024) {
            showToast('Ukuran foto volume melebihi batas maksimal 2 MB.', 'error');
            return;
          }

          const isImg = file.type.startsWith('image/') || ((!file.type || file.type === 'application/octet-stream') && /\.(png|jpe?g|webp|gif|bmp|avif|jfif)$/i.test(file.name));
          if (!isImg) {
            showToast('Hanya berkas foto yang diizinkan.', 'error');
            return;
          }

          upBtn.disabled = true;
          upBtn.textContent = '...';
          const fd = new FormData();
          fd.append('cover', file);

          try {
            const res = await fetch('/api/upload/cover', { method: 'POST', body: fd });
            const data = await res.json();
            if (!res.ok || !data.success) {
              throw new Error(data.error || 'Gagal mengunggah foto volume.');
            }
            coverInput.value = data.url;
            const thumb = row.querySelector('.volume-thumb-preview');
            if (thumb) thumb.src = data.url;
            showToast('Foto sampul volume berhasil diunggah ke Cloudinary.', 'success');
          } catch (err) {
            showToast(err.message || 'Gagal mengunggah foto volume.', 'error');
          } finally {
            upBtn.disabled = false;
            upBtn.textContent = 'Foto';
          }
        };

        fileInput.click();
      }
    });

    document.addEventListener('input', (e) => {
      if (e.target.classList.contains('volume-stock-input')) {
        this.syncTotalStock();
      }
      if (e.target.classList.contains('volume-cover-input')) {
        const row = e.target.closest('.volume-item-row');
        const thumb = row ? row.querySelector('.volume-thumb-preview') : null;
        if (thumb && e.target.value.trim()) {
          thumb.src = e.target.value.trim();
        }
      }
    });
  },
};
