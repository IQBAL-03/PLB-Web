import { NextRequest, NextResponse } from 'next/server';
import { isTiDBConfigured, queryTiDB, memoryDb } from '@/lib/db';
import { Member } from '@/types/member';

// GET /api/members - Get all members or single by ?nis=...
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const nis = searchParams.get('nis');

    if (isTiDBConfigured()) {
      if (nis) {
        const rows = await queryTiDB<any>('SELECT * FROM members WHERE nis = ?', [nis]);
        if (rows && rows.length > 0) {
          const r = rows[0];
          const member: Member = {
            nis: r.nis,
            name: r.name,
            classRoom: r.class_room,
            activeLoans: Number(r.active_loans) || 0,
            status: r.status,
            createdAt: r.created_at,
          };
          return NextResponse.json({ success: true, source: 'tidb', data: member });
        }
        return NextResponse.json({ success: false, error: 'NIS tidak ditemukan' }, { status: 404 });
      }

      const rows = await queryTiDB<any>('SELECT * FROM members ORDER BY created_at DESC');
      if (rows) {
        const members: Member[] = rows.map((r) => ({
          nis: r.nis,
          name: r.name,
          classRoom: r.class_room,
          activeLoans: Number(r.active_loans) || 0,
          status: r.status,
          createdAt: r.created_at,
        }));
        return NextResponse.json({ success: true, source: 'tidb', data: members });
      }
    }

    // In-memory fallback
    if (nis) {
      const found = memoryDb.members.find((m) => m.nis === nis);
      if (found) {
        return NextResponse.json({ success: true, source: 'memory', data: found });
      }
      return NextResponse.json({ success: false, error: 'NIS tidak ditemukan' }, { status: 404 });
    }

    return NextResponse.json({ success: true, source: 'memory', data: memoryDb.members });
  } catch (error: any) {
    console.error('Error fetching members:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Gagal memuat anggota' },
      { status: 500 }
    );
  }
}

// POST /api/members - Register a new member
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { nis, name, classRoom = 'XII-PPLG-1' } = body;

    if (!nis || !name) {
      return NextResponse.json(
        { success: false, error: 'NIS dan Nama Siswa wajib diisi' },
        { status: 400 }
      );
    }

    const trimmedNis = String(nis).trim();
    const trimmedName = String(name).trim();

    // Check duplicate
    if (isTiDBConfigured()) {
      const existing = await queryTiDB<any>('SELECT nis FROM members WHERE nis = ?', [trimmedNis]);
      if (existing && existing.length > 0) {
        return NextResponse.json(
          { success: false, error: 'NIS sudah terdaftar sebelumnya' },
          { status: 409 }
        );
      }

      await queryTiDB(
        'INSERT INTO members (nis, name, class_room, active_loans, status) VALUES (?, ?, ?, 0, ?)',
        [trimmedNis, trimmedName, classRoom, 'Aktif']
      );
    } else {
      const existing = memoryDb.members.find((m) => m.nis === trimmedNis);
      if (existing) {
        return NextResponse.json(
          { success: false, error: 'NIS sudah terdaftar sebelumnya' },
          { status: 409 }
        );
      }
    }

    const newMember: Member = {
      nis: trimmedNis,
      name: trimmedName,
      classRoom,
      activeLoans: 0,
      status: 'Aktif',
      createdAt: new Date().toISOString(),
    };

    memoryDb.members.push(newMember);

    return NextResponse.json(
      { success: true, message: 'Pendaftaran anggota berhasil', data: newMember },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error registering member:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Gagal mendaftarkan anggota' },
      { status: 500 }
    );
  }
}
