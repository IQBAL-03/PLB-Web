import { NextRequest, NextResponse } from 'next/server';
import { isTiDBConfigured, queryTiDB, memoryDb } from '@/lib/db';
import { Book } from '@/types/book';

// GET /api/books - Get all books
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');

    if (isTiDBConfigured()) {
      let sql = 'SELECT * FROM books WHERE 1=1';
      const params: any[] = [];

      if (category && category !== 'Semua Koleksi') {
        sql += ' AND category = ?';
        params.push(category);
      }
      if (search) {
        sql += ' AND (title LIKE ? OR author LIKE ? OR synopsis LIKE ?)';
        params.push(`%${search}%`, `%${search}%`, `%${search}%`);
      }
      sql += ' ORDER BY created_at DESC';

      const rows = await queryTiDB<any>(sql, params);
      if (rows) {
        const books: Book[] = rows.map((r) => {
          let volumes = [];
          let genres = [];
          try {
            volumes = r.volumes_json ? JSON.parse(r.volumes_json) : [];
          } catch {}
          try {
            genres = r.genres_json ? JSON.parse(r.genres_json) : [];
          } catch {}

          return {
            id: r.id,
            title: r.title,
            author: r.author,
            category: r.category,
            language: r.language || 'Bahasa Indonesia',
            price: Number(r.price) || 0,
            year: r.year || '-',
            shelf: r.shelf || '',
            stock: Number(r.stock) || 0,
            rating: Number(r.rating) || 0,
            reviewsCount: Number(r.reviews_count) || 0,
            badge: r.badge || '',
            synopsis: r.synopsis || '',
            coverImg: r.cover_img || '',
            cloudinaryPublicId: r.cloudinary_public_id || '',
            isPopular: Boolean(r.is_popular),
            isSpotlight: Boolean(r.is_spotlight),
            hasVolumes: Boolean(r.has_volumes),
            volumes,
            genres,
          };
        });

        return NextResponse.json({ success: true, source: 'tidb', data: books });
      }
    }

    // In-memory fallback
    let filtered = memoryDb.books;
    if (category && category !== 'Semua Koleksi') {
      filtered = filtered.filter((b) => b.category === category);
    }
    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(
        (b) =>
          b.title.toLowerCase().includes(q) ||
          b.author.toLowerCase().includes(q) ||
          b.synopsis.toLowerCase().includes(q)
      );
    }

    return NextResponse.json({ success: true, source: 'memory', data: filtered });
  } catch (error: any) {
    console.error('Error fetching books:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Gagal mengambil data buku' },
      { status: 500 }
    );
  }
}

// POST /api/books - Add a new book (Staff/Admin)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      id = `B-${Date.now()}`,
      title,
      author,
      category = 'Buku Referensi',
      language = 'Bahasa Indonesia',
      price = 0,
      year = '-',
      shelf = 'Rak Utama',
      stock = 5,
      synopsis = '',
      coverImg = '',
      hasVolumes = false,
      volumes = [],
      genres = [],
      badge = '',
    } = body;

    if (!title || !author) {
      return NextResponse.json(
        { success: false, error: 'Judul dan penulis buku wajib diisi' },
        { status: 400 }
      );
    }

    const newBook: Book = {
      id,
      title,
      author,
      category,
      language,
      price: Number(price),
      year,
      shelf,
      stock: Number(stock),
      rating: 0,
      reviewsCount: 0,
      borrowCount: 0,
      badge,
      synopsis,
      coverImg,
      isPopular: false,
      isSpotlight: false,
      hasVolumes,
      volumes,
      genres,
    };

    if (isTiDBConfigured()) {
      const sql = `
        INSERT INTO books (
          id, title, author, category, language, price, year, shelf, stock,
          rating, reviews_count, badge, synopsis, cover_img, has_volumes,
          volumes_json, genres_json, is_popular, is_spotlight
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      await queryTiDB(sql, [
        newBook.id,
        newBook.title,
        newBook.author,
        newBook.category,
        newBook.language,
        newBook.price,
        newBook.year,
        newBook.shelf,
        newBook.stock,
        newBook.rating,
        newBook.reviewsCount,
        newBook.badge,
        newBook.synopsis,
        newBook.coverImg,
        newBook.hasVolumes ? 1 : 0,
        JSON.stringify(newBook.volumes || []),
        JSON.stringify(newBook.genres || []),
        0,
        0,
      ]);
    }

    // Always keep memoryDb in sync
    memoryDb.books.unshift(newBook);

    return NextResponse.json(
      { success: true, message: 'Buku berhasil ditambahkan', data: newBook },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating book:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Gagal menambahkan buku' },
      { status: 500 }
    );
  }
}

// DELETE /api/books?id=... - Delete a book (Staff/Admin)
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID buku wajib disertakan' },
        { status: 400 }
      );
    }

    if (isTiDBConfigured()) {
      await queryTiDB('DELETE FROM books WHERE id = ?', [id]);
    }

    memoryDb.books = memoryDb.books.filter((b) => b.id !== id);

    return NextResponse.json({
      success: true,
      message: 'Buku berhasil dihapus dari katalog',
    });
  } catch (error: any) {
    console.error('Error deleting book:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Gagal menghapus buku' },
      { status: 500 }
    );
  }
}
