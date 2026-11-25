// Package transactions manages book loan circulation and return records in TiDB.
package transactions

import (
	"database/sql"
	"fmt"
	"strings"
	"time"

	"sisperpus/pkg/model"
)

// Repository executes SQL operations on the transactions and circulation tables.
type Repository struct {
	db *sql.DB
}

// NewRepository constructs a transactions repository instance.
func NewRepository(db *sql.DB) *Repository {
	return &Repository{db: db}
}

// List retrieves transactions filtered by optional student NIS and loan status.
func (r *Repository) List(nis, status string) ([]model.Transaction, error) {
	var sb strings.Builder
	var args []interface{}

	sb.WriteString(`
		SELECT id, nis, student_name, class_room, book_id, book_title, volume_number,
		       price, loan_date, due_date, return_date, status, fine, fine_paid,
		       created_at, updated_at
		FROM transactions
		WHERE 1=1
	`)

	if nis != "" {
		sb.WriteString(" AND nis = ?")
		args = append(args, strings.TrimSpace(nis))
	}

	if status != "" && status != "Semua" {
		sb.WriteString(" AND status = ?")
		args = append(args, status)
	}

	sb.WriteString(" ORDER BY created_at DESC")

	rows, err := r.db.Query(sb.String(), args...)
	if err != nil {
		return nil, fmt.Errorf("query transactions: %w", err)
	}
	defer rows.Close()

	var list []model.Transaction
	for rows.Next() {
		var t model.Transaction
		var vol sql.NullInt64
		var returnDate sql.NullString
		var finePaid int
		var createdAt, updatedAt string

		err := rows.Scan(
			&t.ID, &t.NIS, &t.StudentName, &t.ClassRoom, &t.BookID, &t.BookTitle, &vol,
			&t.Price, &t.LoanDate, &t.DueDate, &returnDate, &t.Status, &t.Fine, &finePaid,
			&createdAt, &updatedAt,
		)
		if err != nil {
			return nil, fmt.Errorf("scan transaction: %w", err)
		}

		if vol.Valid {
			v := int(vol.Int64)
			t.VolumeNumber = &v
		}
		if returnDate.Valid {
			rd := returnDate.String
			t.ReturnDate = &rd
		}
		t.FinePaid = finePaid == 1
		t.CreatedAt = createdAt
		t.UpdatedAt = updatedAt

		list = append(list, t)
	}

	if list == nil {
		list = []model.Transaction{}
	}
	return list, nil
}

// CreateBorrow inserts a new loan record, updates the member's active loan count, and adjusts book stock.
func (r *Repository) CreateBorrow(req model.BorrowReq) (*model.Transaction, error) {
	tx, err := r.db.Begin()
	if err != nil {
		return nil, fmt.Errorf("begin transaction: %w", err)
	}
	defer tx.Rollback()

	// 1. Verify student membership and status
	var memberStatus string
	var activeLoans int
	var memberClass string
	err = tx.QueryRow("SELECT status, active_loans, class_room FROM members WHERE nis = ?", req.NIS).Scan(&memberStatus, &activeLoans, &memberClass)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("NIS %s belum terdaftar sebagai anggota perpustakaan", req.NIS)
		}
		return nil, fmt.Errorf("cek anggota: %w", err)
	}

	if memberStatus != "Aktif" {
		return nil, fmt.Errorf("keanggotaan berstatus '%s' (belum diverifikasi atau ada kewajiban denda)", memberStatus)
	}

	if activeLoans >= 2 {
		return nil, fmt.Errorf("siswa telah mencapai batas maksimal peminjaman (2 buku aktif)")
	}

	if req.ClassRoom == "" {
		req.ClassRoom = memberClass
	}

	// 2. Insert circulation transaction
	trxID := fmt.Sprintf("TRX-%d", time.Now().UnixNano()%1000000)
	now := time.Now()
	dueDate := now.AddDate(0, 0, 7)
	loanDateStr := now.Format("2006-01-02")
	dueDateStr := dueDate.Format("2006-01-02")

	var volVal sql.NullInt64
	if req.VolumeNumber != nil {
		volVal = sql.NullInt64{Int64: int64(*req.VolumeNumber), Valid: true}
	}

	query := `
		INSERT INTO transactions (
			id, nis, student_name, class_room, book_id, book_title, volume_number,
			price, loan_date, due_date, status, fine, fine_paid
		) VALUES (?, ?, ?, ?, ?, ?, ?, 55000, ?, ?, 'Dipinjam', 0, 1)
	`
	_, err = tx.Exec(query, trxID, req.NIS, req.StudentName, req.ClassRoom, req.BookID, req.BookTitle, volVal, loanDateStr, dueDateStr)
	if err != nil {
		return nil, fmt.Errorf("insert pinjaman: %w", err)
	}

	// 3. Increment active loans for member
	_, err = tx.Exec("UPDATE members SET active_loans = active_loans + 1 WHERE nis = ?", req.NIS)
	if err != nil {
		return nil, fmt.Errorf("update active_loans anggota: %w", err)
	}

	// 4. Decrement book stock if stock > 0
	_, _ = tx.Exec("UPDATE books SET stock = GREATEST(stock - 1, 0) WHERE id = ?", req.BookID)

	if err := tx.Commit(); err != nil {
		return nil, fmt.Errorf("commit pinjaman: %w", err)
	}

	return &model.Transaction{
		ID:           trxID,
		NIS:          req.NIS,
		StudentName:  req.StudentName,
		ClassRoom:    req.ClassRoom,
		BookID:       req.BookID,
		BookTitle:    req.BookTitle,
		VolumeNumber: req.VolumeNumber,
		Price:        55000,
		LoanDate:     loanDateStr,
		DueDate:      dueDateStr,
		Status:       "Dipinjam",
		Fine:         0,
		FinePaid:     true,
	}, nil
}

// ReturnLoan processes book return and calculates fines by overdue days (Rp 1.000/day), lost (book price), or damaged (admin input).
func (r *Repository) ReturnLoan(trxID, condition string, customFine int) (int, error) {
	tx, err := r.db.Begin()
	if err != nil {
		return 0, fmt.Errorf("begin return: %w", err)
	}
	defer tx.Rollback()

	var nis, bookID, dueDateStr, currentStatus string
	var txPrice int
	err = tx.QueryRow("SELECT nis, book_id, price, due_date, status FROM transactions WHERE id = ?", trxID).Scan(&nis, &bookID, &txPrice, &dueDateStr, &currentStatus)
	if err != nil {
		if err == sql.ErrNoRows {
			return 0, fmt.Errorf("transaksi %s tidak ditemukan", trxID)
		}
		return 0, fmt.Errorf("query transaksi: %w", err)
	}

	if currentStatus == "Kembali" {
		return 0, nil
	}

	if txPrice <= 0 {
		_ = tx.QueryRow("SELECT price FROM books WHERE id = ?", bookID).Scan(&txPrice)
	}

	today := time.Now()
	todayStr := today.Format("2006-01-02")
	lateFine := 0
	if len(dueDateStr) >= 10 {
		if dueTime, err := time.Parse("2006-01-02", dueDateStr[:10]); err == nil {
			if today.After(dueTime) {
				daysLate := int(today.Sub(dueTime).Hours() / 24)
				if daysLate > 0 {
					lateFine = daysLate * 1000
				}
			}
		}
	}

	fine := lateFine
	cond := strings.ToLower(strings.TrimSpace(condition))
	switch cond {
	case "hilang":
		fine = txPrice
	case "rusak":
		if customFine > 0 {
			fine = customFine
		} else {
			fine = 0
		}
	}

	finePaid := 1
	if fine > 0 {
		finePaid = 0
	}

	updateQuery := "UPDATE transactions SET return_date = ?, status = 'Kembali', fine = ?, fine_paid = ? WHERE id = ?"
	if _, err = tx.Exec(updateQuery, todayStr, fine, finePaid, trxID); err != nil {
		return 0, fmt.Errorf("update pengembalian: %w", err)
	}

	_, _ = tx.Exec("UPDATE members SET active_loans = GREATEST(active_loans - 1, 0) WHERE nis = ?", nis)
	if cond != "hilang" {
		_, _ = tx.Exec("UPDATE books SET stock = stock + 1 WHERE id = ?", bookID)
	}

	return fine, tx.Commit()
}

// PayFine marks a transaction fine as settled.
func (r *Repository) PayFine(trxID string) error {
	_, err := r.db.Exec("UPDATE transactions SET fine_paid = 1 WHERE id = ?", trxID)
	return err
}
