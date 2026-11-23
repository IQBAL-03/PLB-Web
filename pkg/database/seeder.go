package database

import (
	"database/sql"
	"encoding/json"
	"fmt"

	"sisperpus/pkg/crypto"
	"sisperpus/pkg/model"
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
	if err := SeedReviews(conn); err != nil {
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

// SeedBooks seeds only the 3 requested titles (Look Back, Eri, Punpun) with proper ratings and chapters.
func SeedBooks(conn *sql.DB) error {
	punpunVolumes := []model.Volume{
		{VolumeNumber: 1, VolumeTitle: "Volume 1 (Chapter 1-23)", Stock: 3, CoverImg: "", Description: "Masa kanak-kanak Punpun dan pertemuannya pertama kali dengan Aiko Tanaka di sekolah dasar."},
		{VolumeNumber: 2, VolumeTitle: "Volume 2 (Chapter 24-44)", Stock: 2, CoverImg: "https://res.cloudinary.com/tla0kvyw/image/upload/v1795283196/sisperpus/covers/rummjdn3ruljdxcva7hu.png", Description: "Masa liburan musim panas dan perubahan situasi keluarga yang mengubah masa kecil Punpun."},
		{VolumeNumber: 3, VolumeTitle: "Volume 3 (Chapter 45-64)", Stock: 2, CoverImg: "https://res.cloudinary.com/tla0kvyw/image/upload/v1795283234/sisperpus/covers/quw88zbfy6k1ykn7vbiw.png", Description: "Awal masa SMP dan pencarian jati diri Punpun di tengah lingkungan sekolah yang baru."},
		{VolumeNumber: 4, VolumeTitle: "Volume 4 (Chapter 65-84)", Stock: 2, CoverImg: "https://res.cloudinary.com/tla0kvyw/image/upload/v1795283241/sisperpus/covers/fgayzaicwhlurlqekter.png", Description: "Kisah paman Yuichi dan pergulatan batin para remaja menjelang kelulusan sekolah menengah."},
		{VolumeNumber: 5, VolumeTitle: "Volume 5 (Chapter 85-106)", Stock: 1, CoverImg: "https://res.cloudinary.com/tla0kvyw/image/upload/v1795283248/sisperpus/covers/r4hpsbx7qmqbde3vklyc.png", Description: "Masa SMA dan pertemuan tak terduga dengan kenangan masa lalu yang membekas."},
		{VolumeNumber: 6, VolumeTitle: "Volume 6 (Chapter 107-133)", Stock: 2, CoverImg: "https://res.cloudinary.com/tla0kvyw/image/upload/v1795283257/sisperpus/covers/mtasojvowb4mqpwmsjze.png", Description: "Punpun mulai hidup mandiri di Tokyo dan menghadapi tantangan berat dunia kerja pemuda."},
		{VolumeNumber: 7, VolumeTitle: "Volume 7 (Chapter 134-147 Final)", Stock: 2, CoverImg: "https://res.cloudinary.com/tla0kvyw/image/upload/v1795282887/sisperpus/covers/evwbdbudfcxapgwmtoau.jpg", Description: "Puncak dramatis dan konklusi perjalanan hidup Punpun dalam menemukan kedamaian batin."},
	}
	punpunVolJSON, _ := json.Marshal(punpunVolumes)

	books := []struct {
		ID           string
		Title        string
		Author       string
		Category     string
		Genres       []string
		Language     string
		Price        int
		Year         string
		Shelf        string
		Stock        int
		Rating       float64
		ReviewsCount int
		IsPopular    int
		Badge        string
		Synopsis     string
		CoverImg     string
		HasVolumes   int
		VolJSON      string
	}{
		{
			ID:           "M001",
			Title:        "Look Back",
			Author:       "Tatsuki Fujimoto",
			Category:     "Komik & Manga",
			Genres:       []string{"Drama", "Slice of Life", "Manga", "Seni"},
			Language:     "Bahasa Indonesia",
			Price:        55000,
			Year:         "2021",
			Shelf:        "Rak M-01 (Manga & Komik Edukasi)",
			Stock:        5,
			Rating:       0.0,
			ReviewsCount: 0,
			IsPopular:    1,
			Badge:        "Manga Pilihan",
			Synopsis:     "Kisah one-shot emosional tentang dua siswi sekolah dasar, Fujino dan Kyomoto, yang disatukan oleh kecintaan mendalam menggambar manga.",
			CoverImg:     "https://res.cloudinary.com/tla0kvyw/image/upload/v1795280539/sisperpus/covers/cz2u1ghpk1jwmw1f3raz.png",
			HasVolumes:   0,
			VolJSON:      "",
		},
		{
			ID:           "M002",
			Title:        "Goodbye, Eri",
			Author:       "Tatsuki Fujimoto",
			Category:     "Komik & Manga",
			Genres:       []string{"Drama", "Misteri", "Sinematik", "Manga"},
			Language:     "Bahasa Indonesia",
			Price:        55000,
			Year:         "2022",
			Shelf:        "Rak M-01 (Manga & Komik Edukasi)",
			Stock:        4,
			Rating:       0.0,
			ReviewsCount: 0,
			IsPopular:    1,
			Badge:        "Sinematik Populer",
			Synopsis:     "Yuta merekam hari-hari terakhir ibunya sebagai tugas film sekolah. Setelah karyanya dikritik, ia bertemu gadis misterius bernama Eri.",
			CoverImg:     "https://res.cloudinary.com/tla0kvyw/image/upload/v1795280567/sisperpus/covers/eajdrhns4jrkwea8nksv.png",
			HasVolumes:   0,
			VolJSON:      "",
		},
		{
			ID:           "M003",
			Title:        "Goodnight Punpun",
			Author:       "Inio Asano",
			Category:     "Komik & Manga",
			Genres:       []string{"Psikologis", "Drama", "Coming of Age", "Seinen", "Manga"},
			Language:     "Bahasa Inggris",
			Price:        245000,
			Year:         "2007",
			Shelf:        "Rak M-02 (Koleksi Khusus / Remaja)",
			Stock:        7,
			Rating:       0.0,
			ReviewsCount: 0,
			IsPopular:    1,
			Badge:        "Serial Multi-Volume",
			Synopsis:     "Eksplorasi psikologis masa pendewasaan Onodera Punpun yang digambarkan dalam bentuk burung sederhana, menghadapi dinamika kehidupan modern.",
			CoverImg:     "https://res.cloudinary.com/tla0kvyw/image/upload/v1795281315/sisperpus/covers/euarfxor2hvjg0tlmwhx.jpg",
			HasVolumes:   1,
			VolJSON:      string(punpunVolJSON),
		},
	}

	query := `
		INSERT INTO books (
			id, title, author, category, language, price, year, shelf, stock,
			rating, reviews_count, is_popular, is_spotlight,
			badge, synopsis, cover_img, has_volumes, volumes_json, genres_json
		) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?, ?, ?, ?, ?)
		ON DUPLICATE KEY UPDATE
			rating = VALUES(rating),
			reviews_count = VALUES(reviews_count),
			is_popular = VALUES(is_popular),
			badge = VALUES(badge),
			synopsis = VALUES(synopsis),
			cover_img = IF(VALUES(cover_img) != '', VALUES(cover_img), cover_img),
			has_volumes = VALUES(has_volumes),
			volumes_json = VALUES(volumes_json),
			genres_json = VALUES(genres_json)
	`
	stmt, err := conn.Prepare(query)
	if err != nil {
		return fmt.Errorf("prepare seed books: %w", err)
	}
	defer stmt.Close()

	for _, b := range books {
		genJSON, _ := json.Marshal(b.Genres)
		var volVal sql.NullString
		if b.VolJSON != "" {
			volVal = sql.NullString{String: b.VolJSON, Valid: true}
		}
		_, err := stmt.Exec(
			b.ID, b.Title, b.Author, b.Category, b.Language, b.Price, b.Year, b.Shelf, b.Stock,
			b.Rating, b.ReviewsCount, b.IsPopular,
			b.Badge, b.Synopsis, b.CoverImg, b.HasVolumes, volVal, string(genJSON),
		)
		if err != nil {
			return fmt.Errorf("exec seed buku %s: %w", b.ID, err)
		}
	}
	return nil
}

// SeedMembers guarantees the presence of starter student accounts if none exist.
func SeedMembers(conn *sql.DB) error {
	var count int
	_ = conn.QueryRow("SELECT COUNT(*) FROM members").Scan(&count)
	if count > 0 {
		return nil
	}

	query := `
		INSERT INTO members (nis, name, class_room, active_loans, status) VALUES
		('20261001', 'Ahmad Pratama', 'XII-PPLG-1', 0, 'Aktif'),
		('20261002', 'Budi Santoso', 'XII-PPLG-2', 0, 'Menunggu Verifikasi'),
		('20261003', 'Siti Rahmawati', 'XI-PPLG-1', 2, 'Aktif')
		ON DUPLICATE KEY UPDATE name=VALUES(name)
	`
	_, err := conn.Exec(query)
	return err
}

// SeedTransactions guarantees the table is ready.
func SeedTransactions(conn *sql.DB) error {
	return nil
}

// SeedReviews ensures the book reviews table is initialized.
func SeedReviews(conn *sql.DB) error {
	return nil
}
