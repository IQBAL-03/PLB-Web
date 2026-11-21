// Package books manages book catalog queries and persistence in the TiDB database.
package books

import (
	"database/sql"
	"fmt"
	"strings"

	"sisperpus/pkg/model"
)

// Repository executes SQL operations on the books table.
type Repository struct {
	db *sql.DB
}

// NewRepository constructs a books repository instance.
func NewRepository(db *sql.DB) *Repository {
	return &Repository{db: db}
}

// List retrieves books matching optional search query and category filters.
func (r *Repository) List(query, category string) ([]model.Book, error) {
	q := strings.TrimSpace(query)
	var sb strings.Builder
	var args []interface{}

	sb.WriteString(`
		SELECT id, title, author, category, language, price, year, shelf, stock,
		       rating, reviews_count, badge, synopsis, cover_img, cloudinary_public_id,
		       is_popular, is_spotlight, has_volumes, created_at, updated_at
		FROM books
		WHERE 1=1
	`)

	if category != "" && category != "Semua" && category != "Semua Koleksi" {
		sb.WriteString(" AND category = ?")
		args = append(args, category)
	}

	if q != "" {
		sb.WriteString(" AND (title LIKE ? OR author LIKE ? OR id LIKE ? OR shelf LIKE ?)")
		pattern := "%" + q + "%"
		args = append(args, pattern, pattern, pattern, pattern)
	}

	sb.WriteString(" ORDER BY created_at DESC")

	rows, err := r.db.Query(sb.String(), args...)
	if err != nil {
		return nil, fmt.Errorf("query buku: %w", err)
	}
	defer rows.Close()

	var list []model.Book
	for rows.Next() {
		var b model.Book
		var synopsis, cloudID sql.NullString
		var isPop, isSpot, hasVol int

		err := rows.Scan(
			&b.ID, &b.Title, &b.Author, &b.Category, &b.Language, &b.Price, &b.Year, &b.Shelf, &b.Stock,
			&b.Rating, &b.ReviewsCount, &b.Badge, &synopsis, &b.CoverImg, &cloudID,
			&isPop, &isSpot, &hasVol, &b.CreatedAt, &b.UpdatedAt,
		)
		if err != nil {
			return nil, fmt.Errorf("scan baris buku: %w", err)
		}

		b.Synopsis = synopsis.String
		b.CloudinaryPublicID = cloudID.String
		b.IsPopular = isPop == 1
		b.IsSpotlight = isSpot == 1
		b.HasVolumes = hasVol == 1

		list = append(list, b)
	}

	if list == nil {
		list = []model.Book{}
	}
	return list, nil
}

// Create inserts a new book record into the TiDB books table.
func (r *Repository) Create(b model.Book) error {
	query := `
		INSERT INTO books (
			id, title, author, category, language, price, year, shelf, stock,
			rating, reviews_count, badge, synopsis, cover_img, cloudinary_public_id,
			is_popular, is_spotlight, has_volumes
		) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
	`
	_, err := r.db.Exec(query,
		b.ID, b.Title, b.Author, b.Category, b.Language, b.Price, b.Year, b.Shelf, b.Stock,
		b.Rating, b.ReviewsCount, b.Badge, b.Synopsis, b.CoverImg, b.CloudinaryPublicID,
		boolToInt(b.IsPopular), boolToInt(b.IsSpotlight), boolToInt(b.HasVolumes),
	)
	if err != nil {
		return fmt.Errorf("insert buku: %w", err)
	}
	return nil
}

// Update modifies an existing book title and its metadata.
func (r *Repository) Update(id string, b model.Book) error {
	query := `
		UPDATE books
		SET title = ?, author = ?, category = ?, language = ?, price = ?,
		    year = ?, shelf = ?, stock = ?, synopsis = ?, cover_img = ?,
		    cloudinary_public_id = ?
		WHERE id = ?
	`
	_, err := r.db.Exec(query,
		b.Title, b.Author, b.Category, b.Language, b.Price,
		b.Year, b.Shelf, b.Stock, b.Synopsis, b.CoverImg,
		b.CloudinaryPublicID, id,
	)
	if err != nil {
		return fmt.Errorf("update buku %s: %w", id, err)
	}
	return nil
}

// Delete removes a book entry by identifier.
func (r *Repository) Delete(id string) error {
	_, err := r.db.Exec("DELETE FROM books WHERE id = ?", id)
	if err != nil {
		return fmt.Errorf("delete buku %s: %w", id, err)
	}
	return nil
}

func boolToInt(val bool) int {
	if val {
		return 1
	}
	return 0
}
