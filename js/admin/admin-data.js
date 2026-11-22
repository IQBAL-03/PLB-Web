/**
 * @file Initial data store and book market prices for the SISPERPUS admin panel.
 */

export const initialAdminMetrics = {
  totalBookStock: 16,
  totalBookTitles: 3,
  activeLoansCount: 0,
  completedLoansCount: 0,
  unpaidFinesAmount: 0,
  unpaidFinesCount: 0,
};

export const BOOK_PRICES = {
  M001: 55000,
  M002: 55000,
  M003: 245000,
};

export const initialTransactions = [];

export const initialMembers = [
  {
    nis: '20261001',
    name: 'Ahmad Pratama',
    classRoom: 'XII-PPLG-1',
    activeLoans: 0,
    status: 'Aktif',
  },
  {
    nis: '20261002',
    name: 'Budi Santoso',
    classRoom: 'XII-PPLG-2',
    activeLoans: 0,
    status: 'Menunggu Verifikasi',
  },
  {
    nis: '20261003',
    name: 'Siti Rahmawati',
    classRoom: 'XI-PPLG-1',
    activeLoans: 2,
    status: 'Aktif',
  },
];
