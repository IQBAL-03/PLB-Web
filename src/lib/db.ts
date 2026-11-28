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
  // eslint-disable-next-line no-var
  var __dbMigrated: boolean | undefined;
}

export const memoryDb = globalThis.__memoryDb ?? new MemoryDatabase();
if (process.env.NODE_ENV !== 'production') {
  globalThis.__memoryDb = memoryDb;
}

export function isTiDBConfigured(): boolean {
  const host = process.env.TIDB_HOST?.trim();
  const user = process.env.TIDB_USER?.trim();
  const pass = process.env.TIDB_PASSWORD?.trim();

  // Ensure it's not the default placeholder template
  return Boolean(
    host &&
    user &&
    pass &&
    user !== 'your_tidb_username' &&
    pass !== 'your_tidb_password' &&
    !user.includes('your_') &&
    !pass.includes('your_')
  );
}

/**
 * Runs DDL migrations to ensure all 5 core tables exist on the connected TiDB Cloud/MySQL instance.
 */
async function ensureDatabaseSchema(pool: Pool) {
  if (globalThis.__dbMigrated) return;

  try {
    // 1. Users Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) DEFAULT NULL,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(150) DEFAULT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(20) NOT NULL DEFAULT 'admin',
        auth_provider VARCHAR(20) NOT NULL DEFAULT 'local',
        is_verified TINYINT(1) NOT NULL DEFAULT 1,
        created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
        UNIQUE KEY uq_user_username (username)
      )
    `);

    // 2. Books Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS books (
        id VARCHAR(50) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        author VARCHAR(255) NOT NULL,
        category VARCHAR(100) NOT NULL,
        language VARCHAR(50) NOT NULL DEFAULT 'Bahasa Indonesia',
        price INT NOT NULL DEFAULT 0,
        year VARCHAR(10) NOT NULL DEFAULT '',
        shelf VARCHAR(100) NOT NULL DEFAULT '',
        stock INT NOT NULL DEFAULT 0,
        rating DOUBLE NOT NULL DEFAULT 0.0,
        reviews_count INT NOT NULL DEFAULT 0,
        badge VARCHAR(100) NOT NULL DEFAULT '',
        synopsis TEXT,
        cover_img VARCHAR(500) NOT NULL DEFAULT '',
        cloudinary_public_id VARCHAR(255) NOT NULL DEFAULT '',
        is_popular TINYINT(1) NOT NULL DEFAULT 0,
        is_spotlight TINYINT(1) NOT NULL DEFAULT 0,
        has_volumes TINYINT(1) NOT NULL DEFAULT 0,
        volumes_json TEXT,
        genres_json TEXT,
        created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
        updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)
      )
    `);

    // 3. Members Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS members (
        nis VARCHAR(50) PRIMARY KEY,
        name VARCHAR(150) NOT NULL,
        class_room VARCHAR(50) NOT NULL,
        active_loans INT NOT NULL DEFAULT 0,
        status VARCHAR(20) NOT NULL DEFAULT 'Aktif',
        created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
        updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)
      )
    `);

    // 4. Transactions Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS transactions (
        id VARCHAR(50) PRIMARY KEY,
        nis VARCHAR(50) NOT NULL,
        student_name VARCHAR(150) NOT NULL,
        class_room VARCHAR(50) NOT NULL,
        book_id VARCHAR(50) NOT NULL,
        book_title VARCHAR(255) NOT NULL,
        volume_number INT DEFAULT NULL,
        price INT NOT NULL DEFAULT 0,
        loan_date DATE NOT NULL,
        due_date DATE NOT NULL,
        return_date DATE DEFAULT NULL,
        status VARCHAR(30) NOT NULL DEFAULT 'Dipinjam',
        fine INT NOT NULL DEFAULT 0,
        fine_paid TINYINT(1) NOT NULL DEFAULT 1,
        created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
        updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
        INDEX idx_trx_dates (loan_date, due_date),
        INDEX idx_trx_nis (nis)
      )
    `);

    // 5. Book Reviews Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS book_reviews (
        id VARCHAR(50) PRIMARY KEY,
        book_id VARCHAR(50) NOT NULL,
        nis VARCHAR(50) NOT NULL,
        student_name VARCHAR(150) NOT NULL,
        rating INT NOT NULL DEFAULT 5,
        review_text TEXT NOT NULL,
        created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
        updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
        UNIQUE KEY uq_book_review_student (book_id, nis),
        INDEX idx_review_book (book_id),
        INDEX idx_review_nis (nis)
      )
    `);

    // Seed default admin account if not present
    await pool.query(`
      INSERT IGNORE INTO users (id, username, name, email, password_hash, role, auth_provider, is_verified)
      VALUES (1, 'admin', 'Administrator Perpustakaan', 'admin@sisperpus.sch.id', 'admin123', 'admin', 'local', 1)
    `);

    // Seed books if table is empty
    const [bookCount]: any = await pool.query('SELECT COUNT(*) as cnt FROM books');
    if (bookCount && bookCount[0] && Number(bookCount[0].cnt) === 0) {
      for (const b of starterBooks) {
        await pool.query(
          `INSERT INTO books (
            id, title, author, category, language, price, year, shelf, stock,
            rating, reviews_count, badge, synopsis, cover_img, has_volumes,
            volumes_json, genres_json, is_popular, is_spotlight
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            b.id,
            b.title,
            b.author,
            b.category,
            b.language,
            b.price,
            b.year,
            b.shelf,
            b.stock,
            b.rating,
            b.reviewsCount,
            b.badge || '',
            b.synopsis,
            b.coverImg,
            b.hasVolumes ? 1 : 0,
            JSON.stringify(b.volumes || []),
            JSON.stringify(b.genres || []),
            b.isPopular ? 1 : 0,
            b.isSpotlight ? 1 : 0,
          ]
        );
      }
    }

    // Seed members if table is empty
    const [memberCount]: any = await pool.query('SELECT COUNT(*) as cnt FROM members');
    if (memberCount && memberCount[0] && Number(memberCount[0].cnt) === 0) {
      for (const m of starterMembers) {
        await pool.query(
          `INSERT INTO members (nis, name, class_room, active_loans, status)
           VALUES (?, ?, ?, ?, ?)`,
          [m.nis, m.name, m.classRoom, m.activeLoans, m.status]
        );
      }
    }

    // Seed reviews if table is empty
    const [reviewCount]: any = await pool.query('SELECT COUNT(*) as cnt FROM book_reviews');
    if (reviewCount && reviewCount[0] && Number(reviewCount[0].cnt) === 0) {
      for (const r of starterReviews) {
        await pool.query(
          `INSERT INTO book_reviews (id, book_id, nis, student_name, rating, review_text)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [r.id, r.bookId, r.nis, r.studentName, r.rating, r.reviewText]
        );
      }
    }

    globalThis.__dbMigrated = true;
    console.log('✓ TiDB Database schema initialized and seeded successfully.');
  } catch (err) {
    console.error('Failed to run TiDB migrations:', err);
  }
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

  // Trigger schema check in background
  ensureDatabaseSchema(pool).catch(() => {});

  return pool;
}

/**
 * Generic query function that queries TiDB if configured, or returns null to indicate
 * that the in-memory fallback should be used. Catches database errors gracefully so the app
 * continues working even if the cloud database is unreachable or offline.
 */
export async function queryTiDB<T = any>(sql: string, params: any[] = []): Promise<T[] | null> {
  if (!isTiDBConfigured()) return null;

  try {
    const pool = getTiDBPool();
    if (!pool) return null;

    const [rows] = await pool.query(sql, params);
    return rows as T[];
  } catch (error: any) {
    console.warn('[TiDB Fallback -> In-Memory Active]:', error.message || error);
    return null;
  }
}
