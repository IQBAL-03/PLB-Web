// Package members provides HTTP handlers for student membership and verification.
package members

import (
	"encoding/json"
	"net/http"
	"strings"

	"sisperpus/pkg/config"
	"sisperpus/pkg/model"
	"sisperpus/pkg/response"
)

// Handler processes membership HTTP requests.
type Handler struct {
	cfg  config.Config
	repo *Repository
}

// NewHandler constructs a members handler instance.
func NewHandler(cfg config.Config, repo *Repository) *Handler {
	return &Handler{cfg: cfg, repo: repo}
}

// List handles retrieval of members with optional filtering.
func (h *Handler) List(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		response.Error(w, http.StatusMethodNotAllowed, "Metode harus GET")
		return
	}

	q := r.URL.Query().Get("q")
	status := r.URL.Query().Get("status")
	nis := r.URL.Query().Get("nis")

	if nis != "" {
		m, err := h.repo.GetByNIS(nis)
		if err != nil {
			response.DBError(w, err)
			return
		}
		if m == nil {
			response.Error(w, http.StatusNotFound, "Anggota dengan NIS tersebut tidak ditemukan")
			return
		}
		response.JSON(w, http.StatusOK, map[string]interface{}{
			"ok":     true,
			"member": m,
		})
		return
	}

	list, err := h.repo.List(q, status)
	if err != nil {
		response.DBError(w, err)
		return
	}

	response.JSON(w, http.StatusOK, map[string]interface{}{
		"ok":      true,
		"members": list,
		"total":   len(list),
	})
}

// Create handles student member registration (self-registration or admin add).
func (h *Handler) Create(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		response.Error(w, http.StatusMethodNotAllowed, "Metode harus POST")
		return
	}

	var req model.CreateMemberReq
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.Error(w, http.StatusBadRequest, "Format JSON tidak valid")
		return
	}

	req.NIS = strings.TrimSpace(req.NIS)
	req.Name = strings.TrimSpace(req.Name)
	req.ClassRoom = strings.TrimSpace(req.ClassRoom)

	if req.NIS == "" || req.Name == "" || req.ClassRoom == "" {
		response.Error(w, http.StatusBadRequest, "NIS, Nama, dan Kelas wajib diisi")
		return
	}

	existing, err := h.repo.GetByNIS(req.NIS)
	if err != nil {
		response.DBError(w, err)
		return
	}
	if existing != nil {
		response.Error(w, http.StatusConflict, "Anggota dengan NIS ini sudah terdaftar sebelumnya")
		return
	}

	status := req.Status
	if status == "" {
		status = "Menunggu Verifikasi"
	}

	m := model.Member{
		NIS:         req.NIS,
		Name:        req.Name,
		ClassRoom:   req.ClassRoom,
		ActiveLoans: 0,
		Status:      status,
	}

	if err := h.repo.Create(m); err != nil {
		response.DBError(w, err)
		return
	}

	response.JSON(w, http.StatusCreated, map[string]interface{}{
		"ok":      true,
		"message": "Pendaftaran anggota berhasil dicatat di basis data TiDB.",
		"member":  m,
	})
}

// UpdateStatus changes a member's status (e.g. admin verifies student).
func (h *Handler) UpdateStatus(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPut && r.Method != http.MethodPost {
		response.Error(w, http.StatusMethodNotAllowed, "Metode harus PUT atau POST")
		return
	}

	var req model.UpdateMemberStatusReq
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.Error(w, http.StatusBadRequest, "Format JSON tidak valid")
		return
	}

	req.NIS = strings.TrimSpace(req.NIS)
	req.Status = strings.TrimSpace(req.Status)
	if req.NIS == "" || req.Status == "" {
		response.Error(w, http.StatusBadRequest, "NIS dan status baru wajib disertakan")
		return
	}

	if err := h.repo.UpdateStatus(req.NIS, req.Status); err != nil {
		response.DBError(w, err)
		return
	}

	response.JSON(w, http.StatusOK, map[string]interface{}{
		"ok":      true,
		"message": "Status anggota berhasil diperbarui.",
	})
}

// Delete removes a member entry.
func (h *Handler) Delete(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodDelete && r.Method != http.MethodPost {
		response.Error(w, http.StatusMethodNotAllowed, "Metode harus DELETE atau POST")
		return
	}

	nis := r.URL.Query().Get("nis")
	if nis == "" {
		var req struct {
			NIS string `json:"nis"`
		}
		_ = json.NewDecoder(r.Body).Decode(&req)
		nis = req.NIS
	}

	if nis == "" {
		response.Error(w, http.StatusBadRequest, "NIS anggota wajib disertakan")
		return
	}

	if err := h.repo.Delete(nis); err != nil {
		response.DBError(w, err)
		return
	}

	response.JSON(w, http.StatusOK, map[string]interface{}{
		"ok":      true,
		"message": "Anggota berhasil dihapus dari basis data TiDB.",
	})
}
