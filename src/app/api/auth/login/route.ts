import { NextRequest, NextResponse } from 'next/server';
import { isTiDBConfigured, queryTiDB } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json(
        { success: false, error: 'Username dan kata sandi wajib diisi' },
        { status: 400 }
      );
    }

    const cleanUser = username.trim().toLowerCase();

    // Check database users if TiDB configured
    if (isTiDBConfigured()) {
      const rows = await queryTiDB<any>(
        'SELECT * FROM users WHERE LOWER(username) = ? AND password_hash = ?',
        [cleanUser, password]
      );
      if (rows && rows.length > 0) {
        const u = rows[0];
        return NextResponse.json({
          success: true,
          token: `tok_${Date.now()}`,
          user: {
            id: u.id,
            username: u.username,
            name: u.name,
            role: u.role || 'admin',
          },
        });
      }
    }

    // Default fallbacks (admin, haniin, iqbal)
    if (
      (cleanUser === 'admin' && password === 'admin123') ||
      (cleanUser === 'haniin' && password === 'admin123') ||
      (cleanUser === 'iqbal' && password === 'admin123')
    ) {
      return NextResponse.json({
        success: true,
        token: `tok_${Date.now()}`,
        user: {
          username: cleanUser,
          name: cleanUser === 'admin' ? 'Administrator' : cleanUser,
          role: 'admin',
        },
      });
    }

    return NextResponse.json(
      { success: false, error: 'Username atau kata sandi tidak valid' },
      { status: 401 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Gagal login' },
      { status: 500 }
    );
  }
}
