/**
 * @file Application entry point for SISPERPUS digital school library.
 */

import { $ } from './utils/dom.js';
import { navigation } from './features/navigation/navigation.js';
import { spotlightView } from './features/spotlight/spotlight.view.js';
import { catalogController } from './features/catalog/catalog.controller.js';
import { bookModalController } from './features/modal/book-modal.controller.js';
import { imagePreviewModal } from './features/modal/image-preview.modal.js';
import { showToast } from './utils/toast.js';

document.addEventListener('DOMContentLoaded', () => {
  navigation.init();
  spotlightView.init($('#spotlightContainer'));
  catalogController.init();
  bookModalController.init();
  imagePreviewModal.init();

  // Guide button click handler
  const guideBtn = $('#libraryGuideBtn');
  if (guideBtn) {
    guideBtn.addEventListener('click', () => {
      showToast('Panduan: Siswa dapat meminjam maksimal 2 buku selama 7 hari kerja menggunakan NIS.', 'info', 6000);
    });
  }

  // Member card action trigger
  const memberBtn = $('#memberCardBtn');
  if (memberBtn) {
    memberBtn.addEventListener('click', () => {
      showToast('Layanan Kartu Anggota Digital terintegrasi dengan NIS siswa perpustakaan.', 'info');
    });
  }
});
