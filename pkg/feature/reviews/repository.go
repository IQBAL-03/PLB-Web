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
		SELECT id, book_id, nis, student_name, rating, review_text, created_at
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
		var createdAt string
		if err := rows.Scan(&rev.ID, &rev.BookID, &rev.NIS, &rev.StudentName, &rev.Rating, &rev.ReviewText, &createdAt); err != nil {
			return nil, fmt.Errorf("scan review: %w", err)
		}
		rev.CreatedAt = createdAt
		list = append(list, rev)
	}

	if list == nil {
		list = []model.BookReview{}
	}
	return list, nil
}

// Create inserts a new book review and automatically recalculates the book's overall rating and review count.
func (r *Repository) Create(req model.CreateReviewReq) (*model.BookReview, error) {
	tx, err := r.db.Begin()
	if err != nil {
		return nil, fmt.Errorf("begin review: %w", err)
	}
	defer tx.Rollback()

	if req.Rating < 1 {
		req.Rating = 1
	}
	if req.Rating > 5 {
		req.Rating = 5
	}

	revID := fmt.Sprintf("REV-%d", time.Now().UnixNano()%1000000)
	nowStr := time.Now().Format("2006-01-02 15:04:05")

	insertQuery := `
		INSERT INTO book_reviews (id, book_id, nis, student_name, rating, review_text)
		VALUES (?, ?, ?, ?, ?, ?)
	`
	_, err = tx.Exec(insertQuery, revID, req.BookID, req.NIS, req.StudentName, req.Rating, req.ReviewText)
	if err != nil {
		return nil, fmt.Errorf("insert review: %w", err)
	}

	// Recalculate average rating and reviews_count for the book
	var avgRating float64
	var count int
	calcQuery := `
		SELECT COALESCE(AVG(rating), 5.0), COUNT(*)
		FROM book_reviews
		WHERE book_id = ?
	`
	if err := tx.QueryRow(calcQuery, req.BookID).Scan(&avgRating, &count); err == nil {
		updateBookQuery := `
			UPDATE books
			SET rating = ?, reviews_count = ?
			WHERE id = ?
		`
		_, _ = tx.Exec(updateBookQuery, avgRating, count, req.BookID)
	}

	if err := tx.Commit(); err != nil {
		return nil, fmt.Errorf("commit review: %w", err)
	}

	return &model.BookReview{
		ID:          revID,
		BookID:      req.BookID,
		NIS:         req.NIS,
		StudentName: req.StudentName,
		Rating:      req.Rating,
		ReviewText:  req.ReviewText,
		CreatedAt:   nowStr,
	}, nil
}
