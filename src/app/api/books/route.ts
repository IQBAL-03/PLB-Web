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
      let sql =
        'SELECT *, COALESCE((SELECT COUNT(*) FROM transactions t WHERE t.book_id = books.id), 0) AS borrow_count FROM books WHERE 1=1';
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
            borrowCount: Number(r.borrow_count) || 0,
            badge: r.badge || '',
            synopsis: r.synopsis || '',
            coverImg: r.cover_img || '',
            cloudinaryPublicId: r.cloudinary_public_id || '',
            isPopular: Boolean(r.is_popular),
            isSpotlight: Boolean(r.is_spotlight),
            hasVolumes: Boolean(r.has_volumes) || volumes.length > 0,
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
    const rawId = typeof body.id === 'string' && body.id.trim() ? body.id.trim() : `B-${Date.now()}`;
    const title = String(body.title || '').trim();
    const author = String(body.author || '').trim();

    if (!title || !author) {
      return NextResponse.json(
        { success: false, error: 'Judul dan penulis buku wajib diisi' },
        { status: 400 }
      );
    }

    if (isTiDBConfigured()) {
      const existing = await queryTiDB<any>('SELECT id, title FROM books WHERE LOWER(id) = LOWER(?) LIMIT 1', [rawId]);
      if (existing && existing.length > 0) {
        return NextResponse.json(
          { success: false, error: `ID buku "${rawId}" sudah dipakai oleh "${existing[0].title}". Gunakan ID lain.` },
          { status: 409 }
        );
      }
    } else if (memoryDb.books.some((b) => b.id.toLowerCase() === rawId.toLowerCase())) {
      return NextResponse.json(
        { success: false, error: `ID buku "${rawId}" sudah digunakan. Gunakan ID lain.` },
        { status: 409 }
      );
    }

    const volumes = Array.isArray(body.volumes) ? body.volumes : [];
    const hasVolumes = Boolean(body.hasVolumes) && volumes.length > 0;
    const computedStock = hasVolumes
      ? volumes.reduce((sum: number, v: any) => sum + (Number(v.stock) || 0), 0)
      : Math.max(0, Number(body.stock) || 0);

    const newBook: Book = {
      id: rawId,
      title,
      author,
      category: body.category || 'Buku Referensi',
      language: body.language || 'Bahasa Indonesia',
      price: Math.max(0, Number(body.price) || 0),
      year: String(body.year || '').trim() || '-',
      shelf: String(body.shelf || '').trim() || 'Rak Utama',
      stock: computedStock,
      rating: 0,
      reviewsCount: 0,
      borrowCount: 0,
      badge: String(body.badge || '').trim() || 'Koleksi Pilihan',
      synopsis: String(body.synopsis || '').trim(),
      coverImg: String(body.coverImg || '').trim(),
      cloudinaryPublicId: String(body.cloudinaryPublicId || body.cloudinary_public_id || '').trim(),
      isPopular: Boolean(body.isPopular),
      isSpotlight: false,
      hasVolumes,
      volumes,
      genres: Array.isArray(body.genres) ? body.genres.slice(0, 10) : [],
    };

    if (isTiDBConfigured()) {
      const sql = `
        INSERT INTO books (
          id, title, author, category, language, price, year, shelf, stock,
          rating, reviews_count, badge, synopsis, cover_img, cloudinary_public_id,
          has_volumes, volumes_json, genres_json, is_popular, is_spotlight
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
        newBook.cloudinaryPublicId || '',
        newBook.hasVolumes ? 1 : 0,
        JSON.stringify(newBook.volumes || []),
        JSON.stringify(newBook.genres || []),
        newBook.isPopular ? 1 : 0,
        0,
      ]);
    }

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

// PUT /api/books - Update an existing book & its series/volumes (Staff/Admin)
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { searchParams } = new URL(req.url);
    const id = String(searchParams.get('id') || body.originalId || body.id || '').trim();
    const title = String(body.title || '').trim();
    const author = String(body.author || '').trim();

    if (!id || !title || !author) {
      return NextResponse.json(
        { success: false, error: 'ID, judul, dan penulis buku wajib diisi' },
        { status: 400 }
      );
    }

    const volumes = Array.isArray(body.volumes) ? body.volumes : [];
    const hasVolumes = Boolean(body.hasVolumes) && volumes.length > 0;
    const computedStock = hasVolumes
      ? volumes.reduce((sum: number, v: any) => sum + (Number(v.stock) || 0), 0)
      : Math.max(0, Number(body.stock) || 0);
    const genres = Array.isArray(body.genres) ? body.genres.slice(0, 10) : [];
    const year = String(body.year || '').trim() || '-';
    const badge = String(body.badge || '').trim() || 'Koleksi Pilihan';
    const coverImg = String(body.coverImg || '').trim();
    const cloudinaryPublicId = String(body.cloudinaryPublicId || body.cloudinary_public_id || '').trim();

    if (isTiDBConfigured()) {
      const sql = `
        UPDATE books
        SET title = ?, author = ?, category = ?, language = ?, price = ?,
            year = ?, shelf = ?, stock = ?, badge = ?, synopsis = ?,
            cover_img = IF(? != '', ?, cover_img),
            cloudinary_public_id = IF(? != '', ?, cloudinary_public_id),
            has_volumes = ?, volumes_json = ?, genres_json = ?, updated_at = NOW()
        WHERE id = ?
      `;
      await queryTiDB(sql, [
        title,
        author,
        body.category || 'Buku Referensi',
        body.language || 'Bahasa Indonesia',
        Math.max(0, Number(body.price) || 0),
        year,
        String(body.shelf || '').trim() || 'Rak Utama',
        computedStock,
        badge,
        String(body.synopsis || '').trim(),
        coverImg,
        coverImg,
        cloudinaryPublicId,
        cloudinaryPublicId,
        hasVolumes ? 1 : 0,
        JSON.stringify(volumes),
        JSON.stringify(genres),
        id,
      ]);
    }

    const idx = memoryDb.books.findIndex((b) => b.id === id);
    if (idx !== -1) {
      const prev = memoryDb.books[idx];
      memoryDb.books[idx] = {
        ...prev,
        title,
        author,
        category: body.category || prev.category,
        language: body.language || prev.language,
        price: Math.max(0, Number(body.price) || 0),
        year,
        shelf: String(body.shelf || '').trim() || prev.shelf,
        stock: computedStock,
        badge,
        synopsis: String(body.synopsis || '').trim(),
        coverImg: coverImg || prev.coverImg,
        cloudinaryPublicId: cloudinaryPublicId || prev.cloudinaryPublicId,
        hasVolumes,
        volumes,
        genres,
      };
    }

    return NextResponse.json({
      success: true,
      message: 'Data buku berhasil diperbarui',
    });
  } catch (error: any) {
    console.error('Error updating book:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Gagal memperbarui buku' },
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
