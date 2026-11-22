// Package members manages student membership data and verification status in TiDB.
package members

import (
	"database/sql"
	"fmt"
	"strings"

	"sisperpus/pkg/model"
)

// Repository executes SQL operations on the members table.
type Repository struct {
	db *sql.DB
}

// NewRepository constructs a members repository instance.
func NewRepository(db *sql.DB) *Repository {
	return &Repository{db: db}
}

// List retrieves all registered members with optional search query and status filter.
func (r *Repository) List(query, status string) ([]model.Member, error) {
	q := strings.TrimSpace(query)
	var sb strings.Builder
	var args []interface{}

	sb.WriteString("SELECT nis, name, class_room, active_loans, status, created_at, updated_at FROM members WHERE 1=1")

	if status != "" && status != "Semua" {
		sb.WriteString(" AND status = ?")
		args = append(args, status)
	}

	if q != "" {
		sb.WriteString(" AND (nis LIKE ? OR name LIKE ? OR class_room LIKE ?)")
		pattern := "%" + q + "%"
		args = append(args, pattern, pattern, pattern)
	}

	sb.WriteString(" ORDER BY created_at DESC")

	rows, err := r.db.Query(sb.String(), args...)
	if err != nil {
		return nil, fmt.Errorf("query members: %w", err)
	}
	defer rows.Close()

	var list []model.Member
	for rows.Next() {
		var m model.Member
		var createdAt, updatedAt string
		if err := rows.Scan(&m.NIS, &m.Name, &m.ClassRoom, &m.ActiveLoans, &m.Status, &createdAt, &updatedAt); err != nil {
			return nil, fmt.Errorf("scan member: %w", err)
		}
		m.CreatedAt = createdAt
		m.UpdatedAt = updatedAt
		list = append(list, m)
	}

	if list == nil {
		list = []model.Member{}
	}
	return list, nil
}

// GetByNIS fetches a single member by their student identifier.
func (r *Repository) GetByNIS(nis string) (*model.Member, error) {
	query := "SELECT nis, name, class_room, active_loans, status, created_at, updated_at FROM members WHERE nis = ?"
	var m model.Member
	var createdAt, updatedAt string
	err := r.db.QueryRow(query, strings.TrimSpace(nis)).Scan(
		&m.NIS, &m.Name, &m.ClassRoom, &m.ActiveLoans, &m.Status, &createdAt, &updatedAt,
	)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}
		return nil, fmt.Errorf("get member by nis: %w", err)
	}
	m.CreatedAt = createdAt
	m.UpdatedAt = updatedAt
	return &m, nil
}

// Create registers a new student member record.
func (r *Repository) Create(m model.Member) error {
	status := m.Status
	if status == "" {
		status = "Menunggu Verifikasi"
	}

	query := `
		INSERT INTO members (nis, name, class_room, active_loans, status)
		VALUES (?, ?, ?, ?, ?)
	`
	_, err := r.db.Exec(query, m.NIS, m.Name, m.ClassRoom, m.ActiveLoans, status)
	if err != nil {
		return fmt.Errorf("insert member: %w", err)
	}
	return nil
}

// UpdateStatus changes a member's status (e.g. from 'Menunggu Verifikasi' to 'Aktif').
func (r *Repository) UpdateStatus(nis, status string) error {
	query := "UPDATE members SET status = ? WHERE nis = ?"
	_, err := r.db.Exec(query, status, strings.TrimSpace(nis))
	if err != nil {
		return fmt.Errorf("update member status: %w", err)
	}
	return nil
}

// Delete removes a member entry.
func (r *Repository) Delete(nis string) error {
	query := "DELETE FROM members WHERE nis = ?"
	_, err := r.db.Exec(query, strings.TrimSpace(nis))
	if err != nil {
		return fmt.Errorf("delete member: %w", err)
	}
	return nil
}
