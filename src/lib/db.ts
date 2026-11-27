import mysql, { Pool } from 'mysql2/promise';
import { starterBooks } from '@/data/starter-books';
import { starterMembers } from '@/data/starter-members';
import { starterReviews } from '@/data/starter-reviews';
import { starterTransactions } from '@/data/starter-transactions';
import { Book } from '@/types/book';
import { Member } from '@/types/member';
import { BookReview } from '@/types/review';
import { Transaction } from '@/types/transaction';

/**
 * In-memory fallback database state for offline development & mock testing.
 * When TIDB_HOST is configured, calls automatically query the live MySQL/TiDB Cloud.
 */
class MemoryDatabase {
  books: Book[] = JSON.parse(JSON.stringify(starterBooks));
  members: Member[] = JSON.parse(JSON.stringify(starterMembers));
  reviews: BookReview[] = JSON.parse(JSON.stringify(starterReviews));
  transactions: Transaction[] = JSON.parse(JSON.stringify(starterTransactions));

  reset() {
    this.books = JSON.parse(JSON.stringify(starterBooks));
    this.members = JSON.parse(JSON.stringify(starterMembers));
    this.reviews = JSON.parse(JSON.stringify(starterReviews));
    this.transactions = JSON.parse(JSON.stringify(starterTransactions));
  }
}

// Global memory cache across hot reloads in Next.js development
declare global {
  // eslint-disable-next-line no-var
  var __memoryDb: MemoryDatabase | undefined;
  // eslint-disable-next-line no-var
  var __tidbPool: Pool | undefined;
}

export const memoryDb = globalThis.__memoryDb ?? new MemoryDatabase();
if (process.env.NODE_ENV !== 'production') {
  globalThis.__memoryDb = memoryDb;
}

export function isTiDBConfigured(): boolean {
  return Boolean(
    process.env.TIDB_HOST &&
    process.env.TIDB_USER &&
    process.env.TIDB_PASSWORD
  );
}

export function getTiDBPool(): Pool | null {
  if (!isTiDBConfigured()) {
    return null;
  }

  if (globalThis.__tidbPool) {
    return globalThis.__tidbPool;
  }

  const pool = mysql.createPool({
    host: process.env.TIDB_HOST,
    port: Number(process.env.TIDB_PORT) || 4000,
    user: process.env.TIDB_USER,
    password: process.env.TIDB_PASSWORD,
    database: process.env.TIDB_DB || 'test',
    ssl: {
      rejectUnauthorized: true,
    },
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  });

  if (process.env.NODE_ENV !== 'production') {
    globalThis.__tidbPool = pool;
  }

  return pool;
}

/**
 * Generic query function that queries TiDB if configured, or returns null to indicate
 * that the in-memory fallback should be used.
 */
export async function queryTiDB<T = any>(sql: string, params: any[] = []): Promise<T[] | null> {
  const pool = getTiDBPool();
  if (!pool) return null;

  try {
    const [rows] = await pool.query(sql, params);
    return rows as T[];
  } catch (error) {
    console.error('[TiDB Error]', error);
    throw error;
  }
}
