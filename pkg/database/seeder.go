package database

import (
	"database/sql"
	"fmt"

	"sisperpus/pkg/crypto"
)

// Seed populates initial administrative user, book catalog, members, and transactions.
func Seed(conn *sql.DB) error {
	if err := SeedAdmin(conn); err != nil {
		return err
	}
	if err := SeedBooks(conn); err != nil {
		return err
	}
	if err := SeedMembers(conn); err != nil {
		return err
	}
	if err := SeedTransactions(conn); err != nil {
		return err
	}
	return nil
}

// SeedAdmin guarantees the presence of the default staff administrator account.
func SeedAdmin(conn *sql.DB) error {
	passHash := crypto.HashPassword("Admin123")
	query := `
		INSERT INTO users (username, name, email, password_hash, role, auth_provider, is_verified)
		VALUES ('Admin', 'Administrator Perpustakaan', 'admin@sisperpus.sch.id', ?, 'admin', 'local', 1)
		ON DUPLICATE KEY UPDATE 
			password_hash = VALUES(password_hash),
			role = VALUES(role),
			name = VALUES(name)
	`
	_, err := conn.Exec(query, passHash)
	if err != nil {
		return fmt.Errorf("seeder akun admin: %w", err)
	}
	return nil
}

// SeedBooks seeds the core 16 book titles with authentic market prices and shelf tags.
func SeedBooks(conn *sql.DB) error {
	books := []struct {
		ID       string
		Title    string
		Author   string
		Category string
		Language string
		Price    int
		Year     string
		Shelf    string
		Stock    int
		Badge    string
		Synopsis string
		CoverImg string
	}{
		{"M001", "Look Back", "Tatsuki Fujimoto", "Komik & Manga", "Bahasa Indonesia", 55000, "2021", "Rak M-01 (Manga & Komik Edukasi)", 5, "Manga Pilihan", "Kisah persahabatan Fujino dan Kyomoto.", "cover-sementara/look-back.png"},
		{"M002", "Goodbye, Eri", "Tatsuki Fujimoto", "Komik & Manga", "Bahasa Indonesia", 55000, "2022", "Rak M-01 (Manga & Komik Edukasi)", 4, "Sinematik Populer", "Yuta merekam hari-hari terakhir ibunya sebagai tugas film.", "cover-sementara/goodbye-eri.png"},
		{"M003", "Goodnight Punpun", "Inio Asano", "Komik & Manga", "Bahasa Inggris", 245000, "2007", "Rak M-02 (Koleksi Khusus / Remaja)", 7, "Serial Multi-Volume", "Eksplorasi psikologis masa pendewasaan Onodera Punpun.", "cover-sementara/goodnight-punpun-1.png"},
		{"B001", "One Hundred Years of Solitude", "Gabriel Garcia Marquez", "Fiksi & Sastra", "Bahasa Indonesia", 125000, "1967", "Rak S-01 (Koleksi Dunia)", 4, "Sorotan Utama", "Kisah mahakarya realisme magis keluarga Buendia.", "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=400&q=80"},
		{"B002", "Bumi Manusia", "Pramoedya Ananta Toer", "Fiksi & Sastra", "Bahasa Indonesia", 135000, "1980", "Rak F-03 (Sastra Indonesia)", 6, "Koleksi Wajib", "Roman pergerakan dan cinta Minke di masa kolonial.", "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=400&q=80"},
		{"B003", "Laskar Pelangi", "Andrea Hirata", "Fiksi & Sastra", "Bahasa Indonesia", 89000, "2005", "Rak F-01 (Inspirasi)", 8, "Paling Banyak Dibaca", "Kisah inspiratif sepuluh anak Belitung menuntut ilmu.", "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&w=400&q=80"},
		{"B004", "Cosmos: Gagasan Masa Depan", "Carl Sagan", "Sains & Teknologi", "Bahasa Indonesia", 145000, "1980", "Rak ST-02 (Astronomi)", 3, "Pilihan Sains", "Eksplorasi ilmiah memukau tentang alam semesta.", "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=400&q=80"},
		{"B005", "Sapiens: Riwayat Manusia", "Yuval Noah Harari", "Sejarah & Biografi", "Bahasa Indonesia", 135000, "2011", "Rak SB-01 (Antropologi)", 5, "Rekomendasi Guru", "Penelusuran revolusi kognitif dan evolusi manusia.", "https://images.unsplash.com/photo-1461360370896-922624d12aa1?auto=format&fit=crop&w=400&q=80"},
		{"B006", "Cantik Itu Luka", "Eka Kurniawan", "Fiksi & Sastra", "Bahasa Indonesia", 110000, "2002", "Rak F-04 (Sastra Kontemporer)", 2, "Favorit Siswa", "Perpaduan sejarah Indonesia, mitologi lokal, dan tragedi.", "https://images.unsplash.com/photo-1541963463532-d68292c34b19?auto=format&fit=crop&w=400&q=80"},
		{"B007", "Atomic Habits: Perubahan Kecil", "James Clear", "Pengembangan Diri", "Bahasa Indonesia", 108000, "2018", "Rak PD-01 (Motivasi Siswa)", 7, "Terpopuler", "Panduan praktis membangun kebiasaan baik 1% tiap hari.", "https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?auto=format&fit=crop&w=400&q=80"},
		{"B008", "Kamus Besar Bahasa Indonesia", "Badan Pengembangan Bahasa", "Buku Referensi", "Bahasa Indonesia", 350000, "2023", "Rak REF-01 (Ruang Baca)", 4, "Koleksi Referensi", "Kamus baku terlengkap kosakata dan tata bahasa resmi.", "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=400&q=80"},
		{"B009", "A Brief History of Time", "Stephen Hawking", "Sains & Teknologi", "Bahasa Indonesia", 95000, "1988", "Rak ST-01 (Fisika Teoretis)", 3, "Sains Populer", "Misteri lubang hitam, big bang, dan panah waktu kosmis.", "https://images.unsplash.com/photo-1507842229450-7994df560731?auto=format&fit=crop&w=400&q=80"},
		{"B010", "Laut Bercerita", "Leila S. Chudori", "Fiksi & Sastra", "Bahasa Indonesia", 115000, "2017", "Rak F-02 (Sejarah Kontemporer)", 5, "Pilihan Editor", "Kisah persahabatan dan kehilangan aktivis mahasiswa 1998.", "https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&w=400&q=80"},
		{"B011", "Biografi B.J. Habibie: Guru Bangsa", "A. Makmur Makka", "Sejarah & Biografi", "Bahasa Indonesia", 85000, "2019", "Rak SB-02 (Tokoh Bangsa)", 4, "Inspirasi Pemuda", "Dedikasi riset kedirgantaraan dan pengabdian bangsa.", "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=400&q=80"},
		{"B012", "Dunia Sophie: Sejarah Filsafat", "Jostein Gaarder", "Pengembangan Diri", "Bahasa Indonesia", 120000, "1991", "Pengadaan Baru (Rak P-01)", 0, "Segera Hadir", "Novel misteri pengantar filsafat dunia bagi remaja.", "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?auto=format&fit=crop&w=400&q=80"},
		{"B013", "Ensiklopedia Flora & Fauna Nusantara", "Tim Peneliti BRIN", "Buku Referensi", "Bahasa Indonesia", 280000, "2024", "Pengadaan Baru (Rak P-02)", 0, "Segera Hadir", "Dokumentasi visual keanekaragaman hayati Indonesia.", "https://images.unsplash.com/photo-1518495973542-4542c06a5843?auto=format&fit=crop&w=400&q=80"},
	}

	stmt, err := conn.Prepare(`
		INSERT INTO books (id, title, author, category, language, price, year, shelf, stock, badge, synopsis, cover_img)
		VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
		ON DUPLICATE KEY UPDATE 
			price = VALUES(price),
			shelf = VALUES(shelf),
			stock = VALUES(stock),
			badge = VALUES(badge)
	`)
	if err != nil {
		return fmt.Errorf("prepare seed books: %w", err)
	}
	defer stmt.Close()

	for _, b := range books {
		_, _ = stmt.Exec(b.ID, b.Title, b.Author, b.Category, b.Language, b.Price, b.Year, b.Shelf, b.Stock, b.Badge, b.Synopsis, b.CoverImg)
	}
	return nil
}

// SeedMembers populates student registration records.
func SeedMembers(conn *sql.DB) error {
	members := []struct {
		NIS       string
		Name      string
		ClassRoom string
		Loans     int
		Status    string
	}{
		{"202610482", "Ahmad Fauzi Rahman", "X-MIPA-1", 1, "Aktif"},
		{"202610219", "Dewi Lestari Putri", "XI-IPS-2", 1, "Ada Denda"},
		{"202610115", "Bima Satria Yudha", "XII-MIPA-3", 0, "Aktif"},
		{"202610334", "Nadia Amelia Az-Zahra", "X-MIPA-4", 1, "Ada Denda"},
		{"202610512", "Rizky Pratama Wijaya", "XI-MIPA-2", 1, "Aktif"},
		{"202610667", "Siti Nurhaliza", "X-IPS-1", 0, "Aktif"},
		{"202610789", "Farhan Muhammad Zaki", "XII-IPS-1", 1, "Ada Denda"},
	}

	stmt, err := conn.Prepare(`
		INSERT INTO members (nis, name, class_room, active_loans, status)
		VALUES (?, ?, ?, ?, ?)
		ON DUPLICATE KEY UPDATE 
			name = VALUES(name),
			class_room = VALUES(class_room),
			active_loans = VALUES(active_loans),
			status = VALUES(status)
	`)
	if err != nil {
		return fmt.Errorf("prepare seed members: %w", err)
	}
	defer stmt.Close()

	for _, m := range members {
		_, _ = stmt.Exec(m.NIS, m.Name, m.ClassRoom, m.Loans, m.Status)
	}
	return nil
}

// SeedTransactions seeds circulation loan logs with fine tracking.
func SeedTransactions(conn *sql.DB) error {
	txs := []struct {
		ID       string
		NIS      string
		Name     string
		Class    string
		BookID   string
		Title    string
		Vol      sql.NullInt64
		Price    int
		Loan     string
		Due      string
		Ret      sql.NullString
		Status   string
		Fine     int
		FinePaid bool
	}{
		{"TRX-2026-089", "202610482", "Ahmad Fauzi Rahman", "X-MIPA-1", "M003", "Goodnight Punpun", sql.NullInt64{Int64: 3, Valid: true}, 245000, "2026-11-14", "2026-11-21", sql.NullString{}, "Dipinjam", 0, true},
		{"TRX-2026-088", "202610219", "Dewi Lestari Putri", "XI-IPS-2", "M001", "Look Back", sql.NullInt64{}, 55000, "2026-11-12", "2026-11-19", sql.NullString{}, "Terlambat", 10000, false},
		{"TRX-2026-087", "202610115", "Bima Satria Yudha", "XII-MIPA-3", "M002", "Goodbye, Eri", sql.NullInt64{}, 55000, "2026-11-10", "2026-11-17", sql.NullString{String: "2026-11-17", Valid: true}, "Kembali", 0, true},
		{"TRX-2026-086", "202610334", "Nadia Amelia Az-Zahra", "X-MIPA-4", "B002", "Bumi Manusia", sql.NullInt64{}, 135000, "2026-11-09", "2026-11-16", sql.NullString{}, "Terlambat", 15000, false},
		{"TRX-2026-085", "202610512", "Rizky Pratama Wijaya", "XI-MIPA-2", "M003", "Goodnight Punpun", sql.NullInt64{Int64: 1, Valid: true}, 245000, "2026-11-15", "2026-11-22", sql.NullString{}, "Dipinjam", 0, true},
		{"TRX-2026-084", "202610667", "Siti Nurhaliza", "X-IPS-1", "B004", "Cosmos: Gagasan Masa Depan", sql.NullInt64{}, 145000, "2026-11-08", "2026-11-15", sql.NullString{String: "2026-11-14", Valid: true}, "Kembali", 0, true},
		{"TRX-2026-083", "202610789", "Farhan Muhammad Zaki", "XII-IPS-1", "M003", "Goodnight Punpun", sql.NullInt64{Int64: 7, Valid: true}, 245000, "2026-11-06", "2026-11-13", sql.NullString{}, "Terlambat", 10000, false},
	}

	stmt, err := conn.Prepare(`
		INSERT INTO transactions (id, nis, student_name, class_room, book_id, book_title, volume_number, price, loan_date, due_date, return_date, status, fine, fine_paid)
		VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
		ON DUPLICATE KEY UPDATE 
			price = VALUES(price),
			status = VALUES(status),
			fine = VALUES(fine),
			fine_paid = VALUES(fine_paid)
	`)
	if err != nil {
		return fmt.Errorf("prepare seed transactions: %w", err)
	}
	defer stmt.Close()

	for _, t := range txs {
		_, _ = stmt.Exec(t.ID, t.NIS, t.Name, t.Class, t.BookID, t.Title, t.Vol, t.Price, t.Loan, t.Due, t.Ret, t.Status, t.Fine, t.FinePaid)
	}
	return nil
}
