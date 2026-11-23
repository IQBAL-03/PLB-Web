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

// List retrieves reviews for a specified book and optionally returns current student review.
func (h *Handler) List(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		response.Error(w, http.StatusMethodNotAllowed, "Metode harus GET")
		return
	}

	bookID := strings.TrimSpace(r.URL.Query().Get("book_id"))
	if bookID == "" {
		bookID = strings.TrimSpace(r.URL.Query().Get("id"))
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

	var userRev *model.BookReview
	nis := strings.TrimSpace(r.URL.Query().Get("nis"))
	if nis != "" {
		userRev, _ = h.repo.GetByBookAndNIS(bookID, nis)
	}

	var sum int
	for _, rev := range list {
		sum += rev.Rating
	}
	var avg float64
	if len(list) > 0 {
		avg = float64(sum) / float64(len(list))
	} else {
		avg = 0.0
	}

	response.JSON(w, http.StatusOK, map[string]interface{}{
		"ok":             true,
		"reviews":        list,
		"total":          len(list),
		"average_rating": avg,
		"user_review":    userRev,
	})
}

// Create submits or updates a student rating and review.
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

	if req.BookID == "" || req.NIS == "" {
		response.Error(w, http.StatusBadRequest, "ID Buku dan NIS pengulas wajib diisi")
		return
	}

	if len(req.ReviewText) < 3 {
		response.Error(w, http.StatusBadRequest, "Teks ulasan minimal harus 3 karakter")
		return
	}

	if len(req.ReviewText) > 1000 {
		response.Error(w, http.StatusBadRequest, "Teks ulasan maksimal 1000 karakter")
		return
	}

	if req.Rating < 1 || req.Rating > 5 {
		response.Error(w, http.StatusBadRequest, "Rating bintang harus antara 1 sampai 5")
		return
	}

	rev, err := h.repo.CreateOrUpdate(req)
	if err != nil {
		response.DBError(w, err)
		return
	}

	response.JSON(w, http.StatusOK, map[string]interface{}{
		"ok":      true,
		"message": "Ulasan dan penilaian buku berhasil disimpan ke database TiDB.",
		"review":  rev,
	})
}

// Delete removes a student review and recalculates book rating.
func (h *Handler) Delete(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodDelete && r.Method != http.MethodPost {
		response.Error(w, http.StatusMethodNotAllowed, "Metode harus DELETE atau POST")
		return
	}

	bookID := strings.TrimSpace(r.URL.Query().Get("book_id"))
	nis := strings.TrimSpace(r.URL.Query().Get("nis"))

	if r.Body != nil && (bookID == "" || nis == "") {
		var req model.DeleteReviewReq
		_ = json.NewDecoder(r.Body).Decode(&req)
		if bookID == "" {
			bookID = strings.TrimSpace(req.BookID)
		}
		if nis == "" {
			nis = strings.TrimSpace(req.NIS)
		}
	}

	if bookID == "" || nis == "" {
		response.Error(w, http.StatusBadRequest, "ID Buku dan NIS wajib disertakan untuk menghapus ulasan")
		return
	}

	if err := h.repo.Delete(bookID, nis); err != nil {
		response.DBError(w, err)
		return
	}

	response.JSON(w, http.StatusOK, map[string]interface{}{
		"ok":      true,
		"message": "Ulasan berhasil dihapus dan rating buku diperbarui.",
	})
}
