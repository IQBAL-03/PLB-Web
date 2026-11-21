// Package main provides a standalone CLI tool to run database schema migrations and seeders for SISPERPUS.
package main

import (
	"database/sql"
	"flag"
	"fmt"
	"log"

	"sisperpus/pkg/config"
	"sisperpus/pkg/database"
)

func main() {
	freshFlag := flag.Bool("fresh", false, "Drop existing tables and run fresh migration with seed data")
	flag.Parse()

	cfg := config.Load()
	if cfg.TiDBHost == "" || cfg.TiDBUser == "" {
		log.Fatal("Kredensial TiDB belum dikonfigurasi di file .env (TIDB_HOST dan TIDB_USER wajib diisi).")
	}

	fmt.Println("[MIGRATE] Menghubungkan ke basis data TiDB...")
	db, err := database.Get(cfg)
	if err != nil {
		log.Fatalf("[MIGRATE ERROR] Gagal terhubung ke TiDB: %v", err)
	}
	defer db.Close()

	if *freshFlag {
		fmt.Println("[MIGRATE] Menjalankan RESET (Drop & Re-create tabel perpustakaan)...")
		if err := database.Reset(db); err != nil {
			log.Fatalf("[MIGRATE ERROR] Gagal mereset tabel: %v", err)
		}
		if err := database.Seed(db); err != nil {
			log.Fatalf("[MIGRATE ERROR] Gagal menjalankan seeder setelah reset: %v", err)
		}
		fmt.Println("[MIGRATE SUKSES] Tabel berhasil digenerate ulang dan diisi seeder.")
		printSummary(db)
		return
	}

	fmt.Println("[MIGRATE] Menjalankan migrasi skema tabel SISPERPUS...")
	if err := database.Migrate(db); err != nil {
		log.Fatalf("[MIGRATE ERROR] Gagal migrasi: %v", err)
	}

	fmt.Println("[MIGRATE] Menjalankan seeder akun Admin dan katalog awal...")
	if err := database.Seed(db); err != nil {
		log.Fatalf("[MIGRATE ERROR] Gagal seeding: %v", err)
	}

	fmt.Println("[MIGRATE SUKSES] Skema tabel dan seeder berhasil dieksekusi.")
	printSummary(db)
}

func printSummary(db *sql.DB) {
	fmt.Println("--------------------------------------------------")
	fmt.Println("STATUS TABEL TI-DB:")

	var userCount, bookCount, memberCount, trxCount int
	_ = db.QueryRow("SELECT COUNT(*) FROM users").Scan(&userCount)
	_ = db.QueryRow("SELECT COUNT(*) FROM books").Scan(&bookCount)
	_ = db.QueryRow("SELECT COUNT(*) FROM members").Scan(&memberCount)
	_ = db.QueryRow("SELECT COUNT(*) FROM transactions").Scan(&trxCount)

	fmt.Printf(" - users       : %d baris (Akun 'Admin' role 'admin' siap)\n", userCount)
	fmt.Printf(" - books       : %d judul buku terdaftar\n", bookCount)
	fmt.Printf(" - members     : %d data siswa terdaftar\n", memberCount)
	fmt.Printf(" - transactions: %d riwayat sirkulasi terdaftar\n", trxCount)
	fmt.Println("--------------------------------------------------")
}
