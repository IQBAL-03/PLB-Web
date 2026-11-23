// Package reviews manages reader ratings and commentary in TiDB.
package reviews

import (
	"database/sql"
	"fmt"
	"strings"
	"time"

	"sisperpus/pkg/model"
)

// Repository executes SQL operations on the book_reviews table.
type Repository struct {
	db *sql.DB
}

// NewRepository constructs a reviews repository instance.
func NewRepository(db *sql.DB) *Repository {
	return &Repository{db: db}
}

// ListByBook retrieves all reviews for a specific book ID ordered by latest.
func (r *Repository) ListByBook(bookID string) ([]model.BookReview, error) {
	query := `
		SELECT id, book_id, nis, student_name, rating, review_text, created_at, COALESCE(updated_at, created_at)
		FROM book_reviews
		WHERE book_id = ?
		ORDER BY created_at DESC
	`
	rows, err := r.db.Query(query, strings.TrimSpace(bookID))
	if err != nil {
		return nil, fmt.Errorf("query reviews: %w", err)
	}
	defer rows.Close()

	var list []model.BookReview
	for rows.Next() {
		var rev model.BookReview
		var createdAt, updatedAt string
		if err := rows.Scan(&rev.ID, &rev.BookID, &rev.NIS, &rev.StudentName, &rev.Rating, &rev.ReviewText, &createdAt, &updatedAt); err != nil {
			return nil, fmt.Errorf("scan review: %w", err)
		}
		rev.CreatedAt = createdAt
		rev.UpdatedAt = updatedAt
		list = append(list, rev)
	}

	if list == nil {
		list = []model.BookReview{}
	}
	return list, nil
}

// GetByBookAndNIS finds a specific student's existing review for a book.
func (r *Repository) GetByBookAndNIS(bookID, nis string) (*model.BookReview, error) {
	query := `
		SELECT id, book_id, nis, student_name, rating, review_text, created_at, COALESCE(updated_at, created_at)
		FROM book_reviews
		WHERE book_id = ? AND nis = ?
		LIMIT 1
	`
	var rev model.BookReview
	var createdAt, updatedAt string
	err := r.db.QueryRow(query, strings.TrimSpace(bookID), strings.TrimSpace(nis)).Scan(
		&rev.ID, &rev.BookID, &rev.NIS, &rev.StudentName, &rev.Rating, &rev.ReviewText, &createdAt, &updatedAt,
	)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}
		return nil, fmt.Errorf("query review by nis: %w", err)
	}

	rev.CreatedAt = createdAt
	rev.UpdatedAt = updatedAt
	return &rev, nil
}

// CreateOrUpdate inserts a new review or updates an existing one by (book_id, nis), then recalculates book ratings.
func (r *Repository) CreateOrUpdate(req model.CreateReviewReq) (*model.BookReview, error) {
	tx, err := r.db.Begin()
	if err != nil {
		return nil, fmt.Errorf("begin review tx: %w", err)
	}
	defer tx.Rollback()

	if req.Rating < 1 {
		req.Rating = 1
	}
	if req.Rating > 5 {
		req.Rating = 5
	}

	// Auto-lookup student name if empty
	if req.StudentName == "" {
		var name string
		if err := tx.QueryRow("SELECT name FROM members WHERE nis = ?", req.NIS).Scan(&name); err == nil && name != "" {
			req.StudentName = name
		} else {
			req.StudentName = "Siswa " + req.NIS
		}
	}

	revID := fmt.Sprintf("REV-%d", time.Now().UnixNano()%10000000)

	upsertQuery := `
		INSERT INTO book_reviews (id, book_id, nis, student_name, rating, review_text)
		VALUES (?, ?, ?, ?, ?, ?)
		ON DUPLICATE KEY UPDATE
			rating = VALUES(rating),
			review_text = VALUES(review_text),
			student_name = IF(VALUES(student_name) != '', VALUES(student_name), student_name),
			updated_at = CURRENT_TIMESTAMP(3)
	`
	_, err = tx.Exec(upsertQuery, revID, req.BookID, req.NIS, req.StudentName, req.Rating, req.ReviewText)
	if err != nil {
		return nil, fmt.Errorf("upsert review: %w", err)
	}

	// Recalculate average rating and reviews_count
	if err := r.recalculateRatingInTx(tx, req.BookID); err != nil {
		return nil, err
	}

	if err := tx.Commit(); err != nil {
		return nil, fmt.Errorf("commit review: %w", err)
	}

	return r.GetByBookAndNIS(req.BookID, req.NIS)
}

// Delete removes a student's review and updates the book's overall rating.
func (r *Repository) Delete(bookID, nis string) error {
	tx, err := r.db.Begin()
	if err != nil {
		return fmt.Errorf("begin delete review tx: %w", err)
	}
	defer tx.Rollback()

	_, err = tx.Exec("DELETE FROM book_reviews WHERE book_id = ? AND nis = ?", strings.TrimSpace(bookID), strings.TrimSpace(nis))
	if err != nil {
		return fmt.Errorf("delete review: %w", err)
	}

	if err := r.recalculateRatingInTx(tx, bookID); err != nil {
		return err
	}

	return tx.Commit()
}

func (r *Repository) recalculateRatingInTx(tx *sql.Tx, bookID string) error {
	var count int
	var avgRating float64

	calcQuery := `
		SELECT COUNT(*), COALESCE(ROUND(AVG(rating), 1), 0.0)
		FROM book_reviews
		WHERE book_id = ?
	`
	if err := tx.QueryRow(calcQuery, bookID).Scan(&count, &avgRating); err != nil {
		return fmt.Errorf("calculate review stats: %w", err)
	}

	var finalRating float64
	if count == 0 {
		finalRating = 5.0
	} else {
		finalRating = avgRating
	}

	updateBookQuery := `
		UPDATE books
		SET rating = ?, reviews_count = ?, updated_at = CURRENT_TIMESTAMP(3)
		WHERE id = ?
	`
	_, err := tx.Exec(updateBookQuery, finalRating, count, bookID)
	if err != nil {
		return fmt.Errorf("update book rating: %w", err)
	}
	return nil
}
