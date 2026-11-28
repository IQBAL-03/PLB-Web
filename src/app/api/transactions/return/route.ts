import { NextRequest, NextResponse } from 'next/server';
import { isTiDBConfigured, queryTiDB, memoryDb } from '@/lib/db';

// POST /api/transactions/return - Return a borrowed book & compute fine
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const transactionId = body.transactionId || body.id;
    const condition = (body.condition || 'normal').toLowerCase();
    const customFine = Number(body.customFine || body.fine) || 0;

    if (!transactionId) {
      return NextResponse.json(
        { success: false, error: 'ID Transaksi wajib diisi' },
        { status: 400 }
      );
    }

    // Find transaction
    let tx = memoryDb.transactions.find((t) => t.id === transactionId);
    if (isTiDBConfigured()) {
      const rows = await queryTiDB<any>('SELECT * FROM transactions WHERE id = ?', [transactionId]);
      if (rows && rows.length > 0) {
        const r = rows[0];
        tx = {
          id: r.id,
          nis: r.nis,
          studentName: r.student_name,
          classRoom: r.class_room,
          bookId: r.book_id,
          bookTitle: r.book_title,
          volumeNumber: r.volume_number,
          price: Number(r.price) || 0,
          loanDate: r.loan_date,
          dueDate: r.due_date,
          returnDate: r.return_date,
          status: r.status,
          fine: Number(r.fine) || 0,
          finePaid: Boolean(r.fine_paid),
        };
      }
    }

    if (!tx) {
      return NextResponse.json(
        { success: false, error: 'Transaksi tidak ditemukan' },
        { status: 404 }
      );
    }

    if (tx.status !== 'Dipinjam') {
      return NextResponse.json(
        { success: false, error: 'Buku pada transaksi ini sudah pernah dikembalikan' },
        { status: 400 }
      );
    }

    const todayStr = new Date().toISOString().split('T')[0];
    const dueDate = new Date(tx.dueDate);
    const returnDate = new Date(todayStr);

    // Calculate late days
    const diffTime = returnDate.getTime() - dueDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const lateDays = Math.max(0, diffDays);

    let fineAmount = 0;
    if (condition === 'hilang') {
      fineAmount = tx.price || 60000;
    } else if (condition === 'rusak') {
      fineAmount = customFine > 0 ? customFine : 15000;
    } else {
      fineAmount = lateDays * 1000; // Rp 1.000 / hari keterlambatan
    }

    const newStatus = lateDays > 0 ? 'Terlambat' : 'Kembali';

    if (isTiDBConfigured()) {
      await queryTiDB(
        `UPDATE transactions
         SET status = ?, return_date = ?, fine = ?, fine_paid = ?, updated_at = NOW()
         WHERE id = ?`,
        [newStatus, todayStr, fineAmount, fineAmount === 0 ? 1 : 0, tx.id]
      );

      // Restore book stock only if NOT lost
      if (condition !== 'hilang') {
        await queryTiDB('UPDATE books SET stock = stock + 1 WHERE id = ?', [tx.bookId]);
      }

      // Decrement member active loans
      await queryTiDB(
        'UPDATE members SET active_loans = GREATEST(0, active_loans - 1) WHERE nis = ?',
        [tx.nis]
      );

      // If fine exists, mark member as 'Ada Denda'
      if (fineAmount > 0) {
        await queryTiDB("UPDATE members SET status = 'Ada Denda' WHERE nis = ?", [tx.nis]);
      }
    }

    // Sync memory
    tx.status = newStatus;
    tx.returnDate = todayStr;
    tx.fine = fineAmount;
    tx.finePaid = fineAmount === 0;

    if (condition !== 'hilang') {
      const book = memoryDb.books.find((b) => b.id === tx!.bookId);
      if (book) book.stock += 1;
    }

    const member = memoryDb.members.find((m) => m.nis === tx!.nis);
    if (member) {
      member.activeLoans = Math.max(0, member.activeLoans - 1);
      if (fineAmount > 0) {
        member.status = 'Ada Denda';
      }
    }

    let detailMsg = 'Pengembalian tepat waktu tanpa denda.';
    if (condition === 'hilang') {
      detailMsg = `Buku dinyatakan hilang. Ganti rugi senilai Rp ${fineAmount.toLocaleString('id-ID')}.`;
    } else if (condition === 'rusak') {
      detailMsg = `Buku mengalami kerusakan fisik. Biaya perbaikan: Rp ${fineAmount.toLocaleString('id-ID')}.`;
    } else if (fineAmount > 0) {
      detailMsg = `Terlambat ${lateDays} hari. Denda keterlambatan: Rp ${fineAmount.toLocaleString('id-ID')}.`;
    }

    return NextResponse.json({
      success: true,
      message: `Buku "${tx.bookTitle}" berhasil dikembalikan. ${detailMsg}`,
      data: {
        transactionId: tx.id,
        returnDate: todayStr,
        condition,
        lateDays,
        fine: fineAmount,
        status: newStatus,
      },
    });
  } catch (error: any) {
    console.error('Error returning book:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Gagal memproses pengembalian' },
      { status: 500 }
    );
  }
}
