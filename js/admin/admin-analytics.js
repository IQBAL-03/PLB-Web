/**
 * @file Analytics and date-range report aggregation for the admin dashboard.
 */

import { BOOK_PRICES } from './admin-data.js';

export const adminAnalytics = {
  getReportData(transactions = [], startDate, endDate) {
    const start = startDate ? new Date(startDate) : new Date('2020-01-01');
    const end = endDate ? new Date(endDate + 'T23:59:59') : new Date('2030-12-31');

    const filtered = transactions.filter((t) => {
      const loan = new Date(t.loanDate);
      return loan >= start && loan <= end;
    });

    const enrichedTransactions = filtered.map((t) => ({
      ...t,
      price: t.price || BOOK_PRICES[t.bookId] || 85000,
    }));

    const activeCount = enrichedTransactions.filter((t) => t.status === 'Dipinjam' || t.status === 'Terlambat').length;
    const returnedCount = enrichedTransactions.filter((t) => t.status === 'Kembali').length;
    const totalFines = enrichedTransactions.reduce((acc, t) => acc + (t.fine || 0), 0);
    const unpaidFines = enrichedTransactions.filter((t) => !t.finePaid).reduce((acc, t) => acc + (t.fine || 0), 0);
    const totalBookValue = enrichedTransactions.reduce((acc, t) => acc + (t.price || 0), 0);

    return {
      startDate,
      endDate,
      transactions: enrichedTransactions,
      totalCount: enrichedTransactions.length,
      activeCount,
      returnedCount,
      totalFines,
      unpaidFines,
      totalBookValue,
    };
  },

  getMetrics(books = [], transactions = []) {
    const totalStock = books.reduce((acc, b) => acc + (Number(b.stock) || 0), 0);
    const activeLoans = transactions.filter((t) => t.status === 'Dipinjam' || t.status === 'Terlambat').length;
    const completedLoans = transactions.filter((t) => t.status === 'Kembali').length;
    const unpaidList = transactions.filter((t) => !t.finePaid && t.fine > 0);
    const unpaidAmount = unpaidList.reduce((acc, t) => acc + t.fine, 0);

    return {
      totalBookStock: totalStock,
      totalBookTitles: books.length,
      activeLoansCount: activeLoans,
      completedLoansCount: completedLoans,
      unpaidFinesAmount: unpaidAmount,
      unpaidFinesCount: unpaidList.length,
    };
  },
};
