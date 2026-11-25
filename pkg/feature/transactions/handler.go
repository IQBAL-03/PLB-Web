// Package transactions provides HTTP endpoints for book circulation, borrowing, and returns.
package transactions

import (
	"encoding/json"
	"net/http"
	"strings"

	"sisperpus/pkg/config"
	"sisperpus/pkg/model"
	"sisperpus/pkg/response"
)

// Handler processes loan circulation HTTP requests.
type Handler struct {
	cfg  config.Config
	repo *Repository
}

// NewHandler constructs a transactions handler instance.
func NewHandler(cfg config.Config, repo *Repository) *Handler {
	return &Handler{cfg: cfg, repo: repo}
}

// List handles retrieval of circulation transactions.
func (h *Handler) List(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		response.Error(w, http.StatusMethodNotAllowed, "Metode harus GET")
		return
	}

	nis := r.URL.Query().Get("nis")
	status := r.URL.Query().Get("status")

	list, err := h.repo.List(nis, status)
	if err != nil {
		response.DBError(w, err)
		return
	}

	response.JSON(w, http.StatusOK, map[string]interface{}{
		"ok":           true,
		"transactions": list,
		"total":        len(list),
	})
}

// Borrow processes a new book checkout request for a verified student member.
func (h *Handler) Borrow(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		response.Error(w, http.StatusMethodNotAllowed, "Metode harus POST")
		return
	}

	var req model.BorrowReq
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.Error(w, http.StatusBadRequest, "Format JSON tidak valid")
		return
	}

	req.NIS = strings.TrimSpace(req.NIS)
	req.BookID = strings.TrimSpace(req.BookID)
	req.StudentName = strings.TrimSpace(req.StudentName)

	if req.NIS == "" || req.BookID == "" {
		response.Error(w, http.StatusBadRequest, "NIS peminjam dan ID buku wajib diisi")
		return
	}

	trx, err := h.repo.CreateBorrow(req)
	if err != nil {
		response.Error(w, http.StatusBadRequest, err.Error())
		return
	}

	response.JSON(w, http.StatusCreated, map[string]interface{}{
		"ok":          true,
		"message":     "Peminjaman buku berhasil dicatat.",
		"transaction": trx,
	})
}

// Return handles book return and overdue fine calculation.
func (h *Handler) Return(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost && r.Method != http.MethodPut {
		response.Error(w, http.StatusMethodNotAllowed, "Metode harus POST atau PUT")
		return
	}

	var req model.ReturnLoanReq
	_ = json.NewDecoder(r.Body).Decode(&req)

	id := r.URL.Query().Get("id")
	if id == "" {
		id = req.ID
	}

	if id == "" {
		response.Error(w, http.StatusBadRequest, "ID transaksi wajib disertakan")
		return
	}

	fine, err := h.repo.ReturnLoan(id, req.Condition, req.Fine)
	if err != nil {
		response.Error(w, http.StatusBadRequest, err.Error())
		return
	}

	response.JSON(w, http.StatusOK, map[string]interface{}{
		"ok":      true,
		"fine":    fine,
		"message": "Buku berhasil dikembalikan dan dicatat.",
	})
}

// PayFine marks an outstanding transaction fine as paid in TiDB.
func (h *Handler) PayFine(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost && r.Method != http.MethodPut {
		response.Error(w, http.StatusMethodNotAllowed, "Metode harus POST atau PUT")
		return
	}
	id := r.URL.Query().Get("id")
	if id == "" {
		var req model.ReturnLoanReq
		_ = json.NewDecoder(r.Body).Decode(&req)
		id = req.ID
	}
	if id == "" {
		response.Error(w, http.StatusBadRequest, "ID transaksi wajib disertakan")
		return
	}
	if err := h.repo.PayFine(id); err != nil {
		response.DBError(w, err)
		return
	}
	response.JSON(w, http.StatusOK, map[string]interface{}{
		"ok":      true,
		"message": "Denda transaksi berhasil dilunasi.",
	})
}
