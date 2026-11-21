// Package database handles connection pooling, schema migration, and data seeding for TiDB.
package database

import (
	"database/sql"
	"fmt"
)

// Migrate checks and initializes tables required by the SISPERPUS digital library system.
func Migrate(conn *sql.DB) error {
	// 1. Users Table (Admin & Library Staff)
	_, err := conn.Exec(`
		CREATE TABLE IF NOT EXISTS users (
			id            INT AUTO_INCREMENT PRIMARY KEY,
			username      VARCHAR(50)  DEFAULT NULL,
			name          VARCHAR(100) NOT NULL,
			email         VARCHAR(150) DEFAULT NULL,
			password_hash VARCHAR(255) NOT NULL,
			role          VARCHAR(20)  NOT NULL DEFAULT 'admin',
			auth_provider VARCHAR(20)  NOT NULL DEFAULT 'local',
			is_verified   TINYINT(1)   NOT NULL DEFAULT 1,
			created_at    DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
		)
	`)
	if err != nil {
		return fmt.Errorf("migrasi tabel users: %w", err)
	}

	addColumnIfNotExists(conn, "users", "username", "VARCHAR(50) DEFAULT NULL")
	addColumnIfNotExists(conn, "users", "role", "VARCHAR(20) NOT NULL DEFAULT 'admin'")
	addUniqueIndexIfNotExists(conn, "users", "uq_user_username", "username")

	// 2. Books Table (Catalog & Cover Storage)
	_, err = conn.Exec(`
		CREATE TABLE IF NOT EXISTS books (
			id                   VARCHAR(50)  PRIMARY KEY,
			title                VARCHAR(255) NOT NULL,
			author               VARCHAR(255) NOT NULL,
			category             VARCHAR(100) NOT NULL,
			language             VARCHAR(50)  NOT NULL DEFAULT 'Bahasa Indonesia',
			price                INT          NOT NULL DEFAULT 0,
			year                 VARCHAR(10)  NOT NULL DEFAULT '',
			shelf                VARCHAR(100) NOT NULL DEFAULT '',
			stock                INT          NOT NULL DEFAULT 0,
			rating               DOUBLE       NOT NULL DEFAULT 4.9,
			reviews_count        INT          NOT NULL DEFAULT 0,
			badge                VARCHAR(100) NOT NULL DEFAULT '',
			synopsis             TEXT,
			cover_img            VARCHAR(500) NOT NULL DEFAULT '',
			cloudinary_public_id VARCHAR(255) NOT NULL DEFAULT '',
			is_popular           TINYINT(1)   NOT NULL DEFAULT 0,
			is_spotlight         TINYINT(1)   NOT NULL DEFAULT 0,
			has_volumes          TINYINT(1)   NOT NULL DEFAULT 0,
			volumes_json         TEXT,
			genres_json          TEXT,
			created_at           DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
			updated_at           DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)
		)
	`)
	if err != nil {
		return fmt.Errorf("migrasi tabel books: %w", err)
	}

	addColumnIfNotExists(conn, "books", "volumes_json", "TEXT")
	addColumnIfNotExists(conn, "books", "genres_json", "TEXT")

	// 3. Members Table (Students & School Staff)
	_, err = conn.Exec(`
		CREATE TABLE IF NOT EXISTS members (
			nis          VARCHAR(50)  PRIMARY KEY,
			name         VARCHAR(150) NOT NULL,
			class_room   VARCHAR(50)  NOT NULL,
			active_loans INT          NOT NULL DEFAULT 0,
			status       VARCHAR(20)  NOT NULL DEFAULT 'Aktif',
			created_at   DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
			updated_at   DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)
		)
	`)
	if err != nil {
		return fmt.Errorf("migrasi tabel members: %w", err)
	}

	// 4. Transactions Table (Circulation, Due Dates, and Fines)
	_, err = conn.Exec(`
		CREATE TABLE IF NOT EXISTS transactions (
			id            VARCHAR(50)  PRIMARY KEY,
			nis           VARCHAR(50)  NOT NULL,
			student_name  VARCHAR(150) NOT NULL,
			class_room    VARCHAR(50)  NOT NULL,
			book_id       VARCHAR(50)  NOT NULL,
			book_title    VARCHAR(255) NOT NULL,
			volume_number INT          DEFAULT NULL,
			price         INT          NOT NULL DEFAULT 0,
			loan_date     DATE         NOT NULL,
			due_date      DATE         NOT NULL,
			return_date   DATE         DEFAULT NULL,
			status        VARCHAR(30)  NOT NULL DEFAULT 'Dipinjam',
			fine          INT          NOT NULL DEFAULT 0,
			fine_paid     TINYINT(1)   NOT NULL DEFAULT 1,
			created_at    DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
			updated_at    DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
			INDEX idx_trx_dates (loan_date, due_date),
			INDEX idx_trx_nis (nis)
		)
	`)
	if err != nil {
		return fmt.Errorf("migrasi tabel transactions: %w", err)
	}

	return nil
}

// Reset drops library application tables and executes a fresh migration with seeding.
func Reset(conn *sql.DB) error {
	tables := []string{
		"transactions",
		"members",
		"books",
	}

	for _, table := range tables {
		if _, err := conn.Exec(fmt.Sprintf("DROP TABLE IF EXISTS %s", table)); err != nil {
			return fmt.Errorf("gagal menghapus tabel %s: %w", table, err)
		}
	}

	return Migrate(conn)
}

func addColumnIfNotExists(conn *sql.DB, table, column, colDef string) {
	var count int
	err := conn.QueryRow(`
		SELECT COUNT(*) 
		FROM information_schema.COLUMNS 
		WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?
	`, table, column).Scan(&count)
	if err == nil && count == 0 {
		_, _ = conn.Exec(fmt.Sprintf("ALTER TABLE %s ADD COLUMN %s %s", table, column, colDef))
	}
}

func addUniqueIndexIfNotExists(conn *sql.DB, table, indexName, colName string) {
	var count int
	err := conn.QueryRow(`
		SELECT COUNT(*) 
		FROM information_schema.STATISTICS 
		WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND INDEX_NAME = ?
	`, table, indexName).Scan(&count)
	if err == nil && count == 0 {
		_, _ = conn.Exec(fmt.Sprintf("ALTER TABLE %s ADD UNIQUE KEY %s (%s)", table, indexName, colName))
	}
}
