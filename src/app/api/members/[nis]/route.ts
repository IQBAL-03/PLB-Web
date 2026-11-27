import { NextRequest, NextResponse } from 'next/server';
import { isTiDBConfigured, queryTiDB, memoryDb } from '@/lib/db';
import { MemberStatus } from '@/types/member';

// PUT /api/members/[nis] - Update member status (e.g. verify, clear fine)
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ nis: string }> }
) {
  try {
    const { nis } = await params;
    const body = await req.json();
    const { status }: { status: MemberStatus } = body;

    if (!status) {
      return NextResponse.json(
        { success: false, error: 'Status anggota wajib disertakan' },
        { status: 400 }
      );
    }

    if (isTiDBConfigured()) {
      await queryTiDB('UPDATE members SET status = ?, updated_at = NOW() WHERE nis = ?', [
        status,
        nis,
      ]);
    }

    const member = memoryDb.members.find((m) => m.nis === nis);
    if (member) {
      member.status = status;
    }

    return NextResponse.json({
      success: true,
      message: `Status anggota NIS ${nis} berhasil diubah menjadi "${status}"`,
      data: { nis, status },
    });
  } catch (error: any) {
    console.error('Error updating member:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Gagal memperbarui status anggota' },
      { status: 500 }
    );
  }
}
