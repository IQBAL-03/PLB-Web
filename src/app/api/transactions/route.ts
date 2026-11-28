import { NextRequest, NextResponse } from 'next/server';
import { isTiDBConfigured, queryTiDB, memoryDb } from '@/lib/db';
import { Transaction } from '@/types/transaction';

// GET /api/transactions - Get circulation records
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const nis = searchParams.get('nis');
    const status = searchParams.get('status');

    if (isTiDBConfigured()) {
      let sql = 'SELECT * FROM transactions WHERE 1=1';
      const params: any[] = [];

      if (nis) {
        sql += ' AND nis = ?';
        params.push(nis);
      }
      if (status) {
        sql += ' AND status = ?';
        params.push(status);
      }
      sql += ' ORDER BY created_at DESC';

      const rows = await queryTiDB<any>(sql, params);
      if (rows) {
        const txs: Transaction[] = rows.map((r) => ({
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
          createdAt: r.created_at,
        }));
        return NextResponse.json({ success: true, source: 'tidb', data: txs });
      }
    }

    // In-memory fallback
    let filtered = memoryDb.transactions;
    if (nis) {
      filtered = filtered.filter((t) => t.nis === nis);
    }
    if (status) {
      filtered = filtered.filter((t) => t.status === status);
    }

    return NextResponse.json({ success: true, source: 'memory', data: filtered });
  } catch (error: any) {
    console.error('Error fetching transactions:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Gagal memuat transaksi' },
      { status: 500 }
    );
  }
}
