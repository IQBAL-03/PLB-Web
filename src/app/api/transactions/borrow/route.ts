import { NextRequest, NextResponse } from 'next/server';
import { isTiDBConfigured, queryTiDB, memoryDb } from '@/lib/db';
import { Transaction } from '@/types/transaction';

// POST /api/transactions/borrow - Borrow a book
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { nis, bookId, volumeNumber = null } = body;

    if (!nis || !bookId) {
      return NextResponse.json(
        { success: false, error: 'NIS dan ID Buku wajib diisi' },
        { status: 400 }
      );
    }

    const trimmedNis = String(nis).trim();

    // 1. Validate Member
    let member = memoryDb.members.find((m) => m.nis === trimmedNis);
    if (isTiDBConfigured()) {
      const mRows = await queryTiDB<any>('SELECT * FROM members WHERE nis = ?', [trimmedNis]);
      if (mRows && mRows.length > 0) {
        const r = mRows[0];
        member = {
          nis: r.nis,
          name: r.name,
          classRoom: r.class_room,
          activeLoans: Number(r.active_loans) || 0,
          status: r.status,
        };
      }
    }

    if (!member) {
      return NextResponse.json(
        { success: false, error: 'NIS tidak terdaftar dalam sistem perpustakaan' },
        { status: 404 }
      );
    }

    // Check fine status
    if (member.status === 'Ada Denda') {
      return NextResponse.json(
        {
          success: false,
          error: 'Peminjaman ditolak: Siswa memiliki denda keterlambatan yang belum diselesaikan.',
        },
        { status: 403 }
      );
    }

    if (member.status === 'Menunggu Verifikasi') {
      return NextResponse.json(
        {
          success: false,
          error: 'Peminjaman ditolak: Akun anggota masih menunggu verifikasi petugas perpustakaan.',
        },
        { status: 403 }
      );
    }

    // Max 2 active loans per student
    if (member.activeLoans >= 2) {
      return NextResponse.json(
        {
          success: false,
          error: 'Batas maksimal peminjaman (2 buku per siswa) telah tercapai.',
        },
        { status: 400 }
      );
    }

    // 2. Validate Book & Stock
    let book = memoryDb.books.find((b) => b.id === bookId);
    if (isTiDBConfigured()) {
      const bRows = await queryTiDB<any>('SELECT * FROM books WHERE id = ?', [bookId]);
      if (bRows && bRows.length > 0) {
        const r = bRows[0];
        let volumes = [];
        try {
          volumes = r.volumes_json ? JSON.parse(r.volumes_json) : [];
        } catch {}
        book = {
          id: r.id,
          title: r.title,
          author: r.author,
          category: r.category,
          language: r.language,
          price: Number(r.price) || 0,
          year: r.year,
          shelf: r.shelf,
          stock: Number(r.stock) || 0,
          rating: Number(r.rating) || 0,
          reviewsCount: Number(r.reviews_count) || 0,
          synopsis: r.synopsis,
          coverImg: r.cover_img,
          isPopular: Boolean(r.is_popular),
          hasVolumes: Boolean(r.has_volumes),
          volumes,
          genres: [],
        };
      }
    }

    if (!book) {
      return NextResponse.json({ success: false, error: 'Buku tidak ditemukan' }, { status: 404 });
    }

    if (book.stock <= 0) {
      return NextResponse.json(
        { success: false, error: 'Stok buku ini sedang habis dipinjam' },
        { status: 400 }
      );
    }

    // 3. Create Transaction
    const today = new Date();
    const dueDate = new Date();
    dueDate.setDate(today.getDate() + 7);

    const txId = `TRX-${Date.now()}`;
    const newTx: Transaction = {
      id: txId,
      nis: member.nis,
      studentName: member.name,
      classRoom: member.classRoom,
      bookId: book.id,
      bookTitle: book.title,
      volumeNumber: volumeNumber ? Number(volumeNumber) : null,
      price: book.price,
      loanDate: today.toISOString().split('T')[0],
      dueDate: dueDate.toISOString().split('T')[0],
      returnDate: null,
      status: 'Dipinjam',
      fine: 0,
      finePaid: true,
      createdAt: new Date().toISOString(),
    };

    if (isTiDBConfigured()) {
      // Insert Transaction
      await queryTiDB(
        `INSERT INTO transactions (
          id, nis, student_name, class_room, book_id, book_title, volume_number,
          price, loan_date, due_date, status, fine, fine_paid
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          newTx.id,
          newTx.nis,
          newTx.studentName,
          newTx.classRoom,
          newTx.bookId,
          newTx.bookTitle,
          newTx.volumeNumber,
          newTx.price,
          newTx.loanDate,
          newTx.dueDate,
          newTx.status,
          0,
          1,
        ]
      );

      // Decrement book stock
      await queryTiDB('UPDATE books SET stock = GREATEST(0, stock - 1) WHERE id = ?', [book.id]);

      // Increment member active loans
      await queryTiDB('UPDATE members SET active_loans = active_loans + 1 WHERE nis = ?', [
        member.nis,
      ]);
    }

    // Update in-memory state
    memoryDb.transactions.unshift(newTx);
    if (book) {
      book.stock = Math.max(0, book.stock - 1);
      book.borrowCount = (book.borrowCount || 0) + 1;
    }
    if (member) {
      member.activeLoans += 1;
    }

    return NextResponse.json(
      {
        success: true,
        message: `Buku "${book.title}" berhasil dipinjam hingga ${newTx.dueDate}`,
        data: newTx,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error borrowing book:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Gagal memproses peminjaman' },
      { status: 500 }
    );
  }
}
