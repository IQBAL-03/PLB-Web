import { NextResponse } from 'next/server';
import { memoryDb } from '@/lib/db';

export async function GET() {
  const hash = `${memoryDb.books.length}-${memoryDb.members.length}-${memoryDb.transactions.length}-${memoryDb.reviews.length}`;
  return NextResponse.json({
    ok: true,
    hash,
    timestamp: Date.now(),
  });
}
