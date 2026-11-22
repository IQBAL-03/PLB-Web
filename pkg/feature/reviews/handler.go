// Package reviews provides HTTP endpoints for reader ratings and reviews.
package reviews

import (
	"encoding/json"
	"net/http"
	"strings"

	"sisperpus/pkg/config"
	"sisperpus/pkg/model"
	"sisperpus/pkg/response"
)

// Handler processes review HTTP requests.
type Handler struct {
	cfg  config.Config
	repo *Repository
}

// NewHandler constructs a reviews handler instance.
func NewHandler(cfg config.Config, repo *Repository) *Handler {
	return &Handler{cfg: cfg, repo: repo}
}

// List retrieves reviews for a specified book.
func (h *Handler) List(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		response.Error(w, http.StatusMethodNotAllowed, "Metode harus GET")
		return
	}

	bookID := r.URL.Query().Get("book_id")
	if bookID == "" {
		bookID = r.URL.Query().Get("id")
	}

	if bookID == "" {
		response.Error(w, http.StatusBadRequest, "ID buku (book_id) wajib disertakan")
		return
	}

	list, err := h.repo.ListByBook(bookID)
	if err != nil {
		response.DBError(w, err)
		return
	}

	response.JSON(w, http.StatusOK, map[string]interface{}{
		"ok":      true,
		"reviews": list,
		"total":   len(list),
	})
}

// Create submits a new student rating and review.
func (h *Handler) Create(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		response.Error(w, http.StatusMethodNotAllowed, "Metode harus POST")
		return
	}

	var req model.CreateReviewReq
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.Error(w, http.StatusBadRequest, "Format JSON tidak valid")
		return
	}

	req.BookID = strings.TrimSpace(req.BookID)
	req.NIS = strings.TrimSpace(req.NIS)
	req.StudentName = strings.TrimSpace(req.StudentName)
	req.ReviewText = strings.TrimSpace(req.ReviewText)

	if req.BookID == "" || req.NIS == "" || req.ReviewText == "" {
		response.Error(w, http.StatusBadRequest, "ID Buku, NIS pengulas, dan teks ulasan wajib diisi")
		return
	}

	if req.Rating < 1 || req.Rating > 5 {
		req.Rating = 5
	}

	rev, err := h.repo.Create(req)
	if err != nil {
		response.DBError(w, err)
		return
	}

	response.JSON(w, http.StatusCreated, map[string]interface{}{
		"ok":      true,
		"message": "Ulasan berhasil disimpan dan nilai rating buku diperbarui di basis data TiDB.",
		"review":  rev,
	})
}
