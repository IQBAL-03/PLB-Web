// Package books provides HTTP endpoints for catalog management.
package books

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strings"

	"sisperpus/pkg/config"
	"sisperpus/pkg/model"
	"sisperpus/pkg/response"
)

// Handler processes book CRUD HTTP requests.
type Handler struct {
	cfg  config.Config
	repo *Repository
}

// NewHandler constructs a books HTTP handler instance.
func NewHandler(cfg config.Config, repo *Repository) *Handler {
	return &Handler{
		cfg:  cfg,
		repo: repo,
	}
}

// List handles retrieval of books with optional filters.
func (h *Handler) List(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		response.Error(w, http.StatusMethodNotAllowed, "Metode harus GET")
		return
	}

	q := r.URL.Query().Get("q")
	category := r.URL.Query().Get("category")

	list, err := h.repo.List(q, category)
	if err != nil {
		response.DBError(w, err)
		return
	}

	response.JSON(w, http.StatusOK, map[string]interface{}{
		"ok":    true,
		"books": list,
		"total": len(list),
	})
}

// Create inserts a new book record into the TiDB database.
func (h *Handler) Create(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		response.Error(w, http.StatusMethodNotAllowed, "Metode harus POST")
		return
	}

	var b model.Book
	if err := json.NewDecoder(r.Body).Decode(&b); err != nil {
		response.Error(w, http.StatusBadRequest, "Format JSON tidak valid")
		return
	}

	b.ID = strings.TrimSpace(b.ID)
	b.Title = strings.TrimSpace(b.Title)
	if b.ID == "" || b.Title == "" {
		response.Error(w, http.StatusBadRequest, "ID dan Judul buku wajib diisi")
		return
	}

	if b.Rating < 0 {
		b.Rating = 0
	}

	existing, _ := h.repo.List(b.ID, "")
	for _, eb := range existing {
		if strings.EqualFold(eb.ID, b.ID) {
			response.Error(w, http.StatusConflict, fmt.Sprintf("ID buku %q sudah digunakan oleh buku %q. Gunakan ID lain.", b.ID, eb.Title))
			return
		}
	}

	if err := h.repo.Create(b); err != nil {
		if strings.Contains(strings.ToLower(err.Error()), "duplicate") {
			response.Error(w, http.StatusConflict, fmt.Sprintf("ID buku %q sudah digunakan.", b.ID))
			return
		}
		response.DBError(w, err)
		return
	}

	response.JSON(w, http.StatusCreated, map[string]interface{}{
		"ok":      true,
		"message": "Buku berhasil ditambahkan.",
		"book":    b,
	})
}

// Update edits an existing book title in TiDB.
func (h *Handler) Update(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPut && r.Method != http.MethodPost {
		response.Error(w, http.StatusMethodNotAllowed, "Metode harus PUT atau POST")
		return
	}

	id := r.URL.Query().Get("id")
	var b model.Book
	if err := json.NewDecoder(r.Body).Decode(&b); err != nil {
		response.Error(w, http.StatusBadRequest, "Format JSON tidak valid")
		return
	}

	if id == "" {
		id = b.ID
	}
	if id == "" {
		response.Error(w, http.StatusBadRequest, "ID buku yang akan diubah wajib disertakan")
		return
	}

	if err := h.repo.Update(id, b); err != nil {
		response.DBError(w, err)
		return
	}

	response.JSON(w, http.StatusOK, map[string]interface{}{
		"ok":      true,
		"message": "Data buku berhasil diperbarui.",
	})
}

// Delete removes a book entry from the database.
func (h *Handler) Delete(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodDelete && r.Method != http.MethodPost {
		response.Error(w, http.StatusMethodNotAllowed, "Metode harus DELETE atau POST")
		return
	}

	id := r.URL.Query().Get("id")
	if id == "" {
		var req struct {
			ID string `json:"id"`
		}
		_ = json.NewDecoder(r.Body).Decode(&req)
		id = req.ID
	}

	if id == "" {
		response.Error(w, http.StatusBadRequest, "ID buku yang akan dihapus wajib disertakan")
		return
	}

	if err := h.repo.Delete(id); err != nil {
		response.DBError(w, err)
		return
	}

	response.JSON(w, http.StatusOK, map[string]interface{}{
		"ok":      true,
		"message": "Buku berhasil dihapus.",
	})
}

// SyncVersion provides a lightweight change-detection endpoint for frontend auto-reload.
func (h *Handler) SyncVersion(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		response.Error(w, http.StatusMethodNotAllowed, "Metode harus GET")
		return
	}

	version, count, err := h.repo.GetSyncVersion()
	if err != nil {
		response.DBError(w, err)
		return
	}

	response.JSON(w, http.StatusOK, map[string]interface{}{
		"ok":      true,
		"version": version,
		"count":   count,
		"hash":    fmt.Sprintf("%d-%d", version, count),
	})
}
