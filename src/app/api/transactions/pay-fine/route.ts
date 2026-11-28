import { NextRequest, NextResponse } from 'next/server';
import { isTiDBConfigured, queryTiDB, memoryDb } from '@/lib/db';

// POST /api/transactions/pay-fine - Mark fine as paid & restore member status
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { searchParams } = new URL(req.url);
    const transactionId = body.transactionId || body.id || searchParams.get('id');
    const nis = body.nis || searchParams.get('nis');

    if (!transactionId && !nis) {
      return NextResponse.json(
        { success: false, error: 'ID Transaksi atau NIS wajib disertakan' },
        { status: 400 }
      );
    }

    if (transactionId) {
      if (isTiDBConfigured()) {
        await queryTiDB('UPDATE transactions SET fine_paid = 1, updated_at = NOW() WHERE id = ?', [
          transactionId,
        ]);
      }
      const tx = memoryDb.transactions.find((t) => t.id === transactionId);
      if (tx) {
        tx.finePaid = true;
      }
    }

    // Check if member has other unpaid fines
    const targetNis =
      nis || memoryDb.transactions.find((t) => t.id === transactionId)?.nis;

    if (targetNis) {
      let hasOtherUnpaid = false;
      if (isTiDBConfigured()) {
        const rows = await queryTiDB<any>(
          'SELECT COUNT(*) as cnt FROM transactions WHERE nis = ? AND fine > 0 AND fine_paid = 0',
          [targetNis]
        );
        if (rows && rows[0] && Number(rows[0].cnt) > 0) {
          hasOtherUnpaid = true;
        } else {
          await queryTiDB("UPDATE members SET status = 'Aktif', updated_at = NOW() WHERE nis = ?", [
            targetNis,
          ]);
        }
      }

      const memoryUnpaid = memoryDb.transactions.some(
        (t) => t.nis === targetNis && t.fine > 0 && !t.finePaid
      );
      if (!hasOtherUnpaid && !memoryUnpaid) {
        const mem = memoryDb.members.find((m) => m.nis === targetNis);
        if (mem && mem.status === 'Ada Denda') {
          mem.status = 'Aktif';
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Denda berhasil dilunaskan dan status siswa telah dipulihkan.',
    });
  } catch (error: any) {
    console.error('Error paying fine:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Gagal memproses pelunasan denda' },
      { status: 500 }
    );
  }
}
