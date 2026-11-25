// Package books manages book catalog queries and persistence in the TiDB database.
package books

import (
	"database/sql"
	"encoding/json"
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
		       is_popular, is_spotlight, has_volumes, volumes_json, genres_json, created_at, updated_at
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
		var synopsis, cloudID, volJSON, genJSON sql.NullString
		var isPop, isSpot, hasVol int

		err := rows.Scan(
			&b.ID, &b.Title, &b.Author, &b.Category, &b.Language, &b.Price, &b.Year, &b.Shelf, &b.Stock,
			&b.Rating, &b.ReviewsCount, &b.Badge, &synopsis, &b.CoverImg, &cloudID,
			&isPop, &isSpot, &hasVol, &volJSON, &genJSON, &b.CreatedAt, &b.UpdatedAt,
		)
		if err != nil {
			return nil, fmt.Errorf("scan baris buku: %w", err)
		}

		b.Synopsis = synopsis.String
		b.CloudinaryPublicID = cloudID.String
		if strings.TrimSpace(b.Year) == "" {
			b.Year = "-"
		}
		b.IsPopular = isPop == 1
		b.IsSpotlight = isSpot == 1
		b.HasVolumes = hasVol == 1
		if volJSON.Valid && volJSON.String != "" {
			var vols []model.Volume
			if err := json.Unmarshal([]byte(volJSON.String), &vols); err == nil {
				b.Volumes = vols
				if len(vols) > 0 {
					b.HasVolumes = true
				}
			}
		}
		if genJSON.Valid && genJSON.String != "" {
			var genres []string
			if err := json.Unmarshal([]byte(genJSON.String), &genres); err == nil {
				b.Genres = genres
			}
		}

		list = append(list, b)
	}

	if list == nil {
		list = []model.Book{}
	}
	return list, nil
}

// Create inserts a new book record into the TiDB books table.
func (r *Repository) Create(b model.Book) error {
	var volJSONStr sql.NullString
	if b.HasVolumes && len(b.Volumes) > 0 {
		if data, err := json.Marshal(b.Volumes); err == nil {
			volJSONStr = sql.NullString{String: string(data), Valid: true}
		}
	}

	var genJSONStr sql.NullString
	if len(b.Genres) > 0 {
		capped := b.Genres
		if len(capped) > 10 {
			capped = capped[:10]
		}
		if data, err := json.Marshal(capped); err == nil {
			genJSONStr = sql.NullString{String: string(data), Valid: true}
		}
	}

	if strings.TrimSpace(b.Year) == "" {
		b.Year = "-"
	}
	query := `
		INSERT INTO books (
			id, title, author, category, language, price, year, shelf, stock,
			rating, reviews_count, badge, synopsis, cover_img, cloudinary_public_id,
			is_popular, is_spotlight, has_volumes, volumes_json, genres_json
		) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
	`
	_, err := r.db.Exec(query,
		b.ID, b.Title, b.Author, b.Category, b.Language, b.Price, b.Year, b.Shelf, b.Stock,
		b.Rating, b.ReviewsCount, b.Badge, b.Synopsis, b.CoverImg, b.CloudinaryPublicID,
		boolToInt(b.IsPopular), boolToInt(b.IsSpotlight), boolToInt(b.HasVolumes), volJSONStr, genJSONStr,
	)
	if err != nil {
		return fmt.Errorf("insert buku: %w", err)
	}
	return nil
}

// Update modifies an existing book title and its metadata.
func (r *Repository) Update(id string, b model.Book) error {
	var existingVolJSON sql.NullString
	_ = r.db.QueryRow("SELECT volumes_json FROM books WHERE id = ?", id).Scan(&existingVolJSON)

	if existingVolJSON.Valid && existingVolJSON.String != "" && len(b.Volumes) > 0 {
		var existingVols []model.Volume
		if err := json.Unmarshal([]byte(existingVolJSON.String), &existingVols); err == nil {
			existingMap := make(map[int]string, len(existingVols))
			for _, ev := range existingVols {
				if ev.CoverImg != "" {
					existingMap[ev.VolumeNumber] = ev.CoverImg
				}
			}
			for i, nv := range b.Volumes {
				if nv.CoverImg == "" {
					if cover, ok := existingMap[nv.VolumeNumber]; ok && cover != "" {
						b.Volumes[i].CoverImg = cover
					}
				}
			}
		}
	}

	var volJSONStr sql.NullString
	if b.HasVolumes && len(b.Volumes) > 0 {
		if data, err := json.Marshal(b.Volumes); err == nil {
			volJSONStr = sql.NullString{String: string(data), Valid: true}
		}
	} else if existingVolJSON.Valid && existingVolJSON.String != "" && b.HasVolumes {
		volJSONStr = existingVolJSON
	}

	var genJSONStr sql.NullString
	if len(b.Genres) > 0 {
		capped := b.Genres
		if len(capped) > 10 {
			capped = capped[:10]
		}
		if data, err := json.Marshal(capped); err == nil {
			genJSONStr = sql.NullString{String: string(data), Valid: true}
		}
	}

	if strings.TrimSpace(b.Year) == "" {
		b.Year = "-"
	}
	query := `
		UPDATE books
		SET title = ?, author = ?, category = ?, language = ?, price = ?,
		    year = ?, shelf = ?, stock = ?, synopsis = ?,
		    cover_img = IF(? != '', ?, cover_img),
		    cloudinary_public_id = IF(? != '', ?, cloudinary_public_id),
		    has_volumes = ?, volumes_json = ?, genres_json = ?
		WHERE id = ?
	`
	_, err := r.db.Exec(query,
		b.Title, b.Author, b.Category, b.Language, b.Price,
		b.Year, b.Shelf, b.Stock, b.Synopsis,
		b.CoverImg, b.CoverImg,
		b.CloudinaryPublicID, b.CloudinaryPublicID,
		boolToInt(b.HasVolumes), volJSONStr, genJSONStr, id,
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

// GetSyncVersion calculates the current change version hash for live auto-reload.
func (r *Repository) GetSyncVersion() (int64, int, error) {
	var maxUnix sql.NullFloat64
	var count int
	query := `
		SELECT COALESCE(MAX(UNIX_TIMESTAMP(updated_at)), 0), COUNT(*)
		FROM books
	`
	err := r.db.QueryRow(query).Scan(&maxUnix, &count)
	if err != nil {
		return 0, 0, fmt.Errorf("query sync version: %w", err)
	}
	return int64(maxUnix.Float64 * 1000), count, nil
}

func boolToInt(val bool) int {
	if val {
		return 1
	}
	return 0
}
