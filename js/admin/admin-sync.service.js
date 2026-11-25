/**
 * @file API synchronization helpers for admin members, transactions, and books.
 */

export const adminSyncService = {
  async fetchMembers() {
    try {
      const res = await fetch(`/api/members?t=${Date.now()}`, { cache: 'no-store' });
      if (!res.ok) return null;
      const data = await res.json();
      if (data && data.ok && Array.isArray(data.members) && data.members.length > 0) {
        return data.members.map((m) => ({
          nis: m.nis,
          name: m.name,
          classRoom: m.class_room || m.classRoom,
          activeLoans: m.active_loans ?? m.activeLoans ?? 0,
          status: m.status,
        }));
      }
    } catch {
      // Offline fallback
    }
    return null;
  },

  async fetchTransactions() {
    try {
      const res = await fetch(`/api/transactions?t=${Date.now()}`, { cache: 'no-store' });
      if (!res.ok) return null;
      const data = await res.json();
      if (data && data.ok && Array.isArray(data.transactions)) {
        return data.transactions.map((t) => ({
          id: t.id,
          studentName: t.student_name || t.studentName,
          nis: t.nis,
          bookId: t.book_id || t.bookId,
          bookTitle: t.book_title || t.bookTitle,
          volumeNumber: t.volume_number || t.volumeNumber || null,
          price: t.price || 0,
          loanDate: t.loan_date || t.loanDate,
          dueDate: t.due_date || t.dueDate,
          returnDate: t.return_date || t.returnDate,
          status: t.status,
          fine: t.fine || 0,
          finePaid: t.fine_paid ?? t.finePaid ?? true,
        }));
      }
    } catch {
      // Offline fallback
    }
    return null;
  },

  async fetchBooks() {
    try {
      const res = await fetch(`/api/books?t=${Date.now()}`, { cache: 'no-store' });
      if (!res.ok) return null;
      const data = await res.json();
      if (data && data.ok && Array.isArray(data.books) && data.books.length > 0) {
        return data.books;
      }
    } catch {
      // Offline fallback
    }
    return null;
  },
};
