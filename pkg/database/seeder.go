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

// SeedBooks seeds only the 3 requested titles (Look Back, Eri, Punpun) without photos.
func SeedBooks(conn *sql.DB) error {
	_, _ = conn.Exec("DELETE FROM books")

	punpunVolumes := []model.Volume{
		{VolumeNumber: 1, VolumeTitle: "Volume 1 (Chapter 1-11)", Stock: 3, CoverImg: "", Description: "Masa kanak-kanak Punpun dan pertemuannya pertama kali dengan Aiko Tanaka di sekolah dasar."},
		{VolumeNumber: 2, VolumeTitle: "Volume 2 (Chapter 12-23)", Stock: 2, CoverImg: "", Description: "Masa liburan musim panas dan perubahan situasi keluarga yang mengubah masa kecil Punpun."},
		{VolumeNumber: 3, VolumeTitle: "Volume 3 (Chapter 24-34)", Stock: 2, CoverImg: "", Description: "Awal masa SMP dan pencarian jati diri Punpun di tengah lingkungan sekolah yang baru."},
		{VolumeNumber: 4, VolumeTitle: "Volume 4 (Chapter 35-46)", Stock: 2, CoverImg: "", Description: "Kisah paman Yuichi dan pergulatan batin para remaja menjelang kelulusan sekolah menengah."},
		{VolumeNumber: 5, VolumeTitle: "Volume 5 (Chapter 47-58)", Stock: 1, CoverImg: "", Description: "Masa SMA dan pertemuan tak terduga dengan kenangan masa lalu yang membekas."},
		{VolumeNumber: 6, VolumeTitle: "Volume 6 (Chapter 59-71)", Stock: 2, CoverImg: "", Description: "Punpun mulai hidup mandiri di Tokyo dan menghadapi tantangan berat dunia kerja pemuda."},
		{VolumeNumber: 7, VolumeTitle: "Volume 7 (Chapter 72-84 Final)", Stock: 2, CoverImg: "", Description: "Puncak dramatis dan konklusi perjalanan hidup Punpun dalam menemukan kedamaian batin."},
	}
	punpunVolJSON, _ := json.Marshal(punpunVolumes)

	books := []struct {
		ID         string
		Title      string
		Author     string
		Category   string
		Genres     []string
		Language   string
		Price      int
		Year       string
		Shelf      string
		Stock      int
		Badge      string
		Synopsis   string
		CoverImg   string
		HasVolumes int
		VolJSON    string
	}{
		{
			ID:         "M001",
			Title:      "Look Back",
			Author:     "Tatsuki Fujimoto",
			Category:   "Komik & Manga",
			Genres:     []string{"Drama", "Slice of Life", "Manga", "Seni"},
			Language:   "Bahasa Indonesia",
			Price:      55000,
			Year:       "2021",
			Shelf:      "Rak M-01 (Manga & Komik Edukasi)",
			Stock:      5,
			Badge:      "Manga Pilihan",
			Synopsis:   "Kisah one-shot emosional tentang dua siswi sekolah dasar, Fujino dan Kyomoto, yang disatukan oleh kecintaan mendalam menggambar manga.",
			CoverImg:   "",
			HasVolumes: 0,
			VolJSON:    "",
		},
		{
			ID:         "M002",
			Title:      "Goodbye, Eri",
			Author:     "Tatsuki Fujimoto",
			Category:   "Komik & Manga",
			Genres:     []string{"Drama", "Misteri", "Sinematik", "Manga"},
			Language:   "Bahasa Indonesia",
			Price:      55000,
			Year:       "2022",
			Shelf:      "Rak M-01 (Manga & Komik Edukasi)",
			Stock:      4,
			Badge:      "Sinematik Populer",
			Synopsis:   "Yuta merekam hari-hari terakhir ibunya sebagai tugas film sekolah. Setelah karyanya dikritik, ia bertemu gadis misterius bernama Eri.",
			CoverImg:   "",
			HasVolumes: 0,
			VolJSON:    "",
		},
		{
			ID:         "M003",
			Title:      "Goodnight Punpun",
			Author:     "Inio Asano",
			Category:   "Komik & Manga",
			Genres:     []string{"Psikologis", "Drama", "Coming of Age", "Seinen", "Manga"},
			Language:   "Bahasa Inggris",
			Price:      245000,
			Year:       "2007",
			Shelf:      "Rak M-02 (Koleksi Khusus / Remaja)",
			Stock:      7,
			Badge:      "Serial Multi-Volume",
			Synopsis:   "Eksplorasi psikologis masa pendewasaan Onodera Punpun yang digambarkan dalam bentuk burung sederhana, menghadapi dinamika kehidupan modern.",
			CoverImg:   "",
			HasVolumes: 1,
			VolJSON:    string(punpunVolJSON),
		},
	}

	query := `
		INSERT INTO books (
			id, title, author, category, language, price, year, shelf, stock,
			badge, synopsis, cover_img, has_volumes, volumes_json, genres_json
		) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
			b.Badge, b.Synopsis, b.CoverImg, b.HasVolumes, volVal, string(genJSON),
		)
		if err != nil {
			return fmt.Errorf("exec seed buku %s: %w", b.ID, err)
		}
	}
	return nil
}

// SeedMembers empties student registration records so user can register their own.
func SeedMembers(conn *sql.DB) error {
	_, err := conn.Exec("DELETE FROM members")
	return err
}

// SeedTransactions empties loan records so user can start fresh.
func SeedTransactions(conn *sql.DB) error {
	_, err := conn.Exec("DELETE FROM transactions")
	return err
}
