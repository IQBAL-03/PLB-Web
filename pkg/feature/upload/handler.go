// Package upload handles HTTP endpoints for uploading cover photos and assets to Cloudinary.
package upload

import (
	"encoding/base64"
	"encoding/json"
	"io"
	"net/http"
	"strings"

	"sisperpus/pkg/config"
	"sisperpus/pkg/response"
)

// Handler serves HTTP requests for the upload domain.
type Handler struct {
	cfg     config.Config
	service *Service
}

// NewHandler constructs an upload HTTP handler.
func NewHandler(cfg config.Config, service *Service) *Handler {
	return &Handler{
		cfg:     cfg,
		service: service,
	}
}

const maxUploadSize = 2 << 20 // 2 MB limit for Cloudinary uploads

// UploadCover processes image uploads via multipart form or base64 JSON payload.
func (h *Handler) UploadCover(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		response.Error(w, http.StatusMethodNotAllowed, "Metode harus POST")
		return
	}

	contentType := r.Header.Get("Content-Type")

	// Case 1: JSON payload with base64 data URL
	if strings.HasPrefix(contentType, "application/json") {
		var req struct {
			Image    string `json:"image"`
			Filename string `json:"filename"`
		}
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			response.Error(w, http.StatusBadRequest, "Format JSON tidak valid")
			return
		}

		rawBase64 := req.Image
		if idx := strings.Index(rawBase64, ","); idx != -1 {
			rawBase64 = rawBase64[idx+1:]
		}
		rawBase64 = strings.TrimSpace(rawBase64)

		fileBytes, err := base64.StdEncoding.DecodeString(rawBase64)
		if err != nil {
			response.Error(w, http.StatusBadRequest, "Gagal mendecode base64 gambar")
			return
		}

		if len(fileBytes) > maxUploadSize {
			response.Error(w, http.StatusBadRequest, "Ukuran foto melebihi batas maksimal 2 MB.")
			return
		}

		detectedType := http.DetectContentType(fileBytes)
		if !strings.HasPrefix(detectedType, "image/") {
			response.Error(w, http.StatusBadRequest, "Hanya berkas foto (PNG, JPG, WEBP) yang diizinkan.")
			return
		}

		filename := req.Filename
		if filename == "" {
			filename = "cover.png"
		}

		result, err := h.service.UploadImage(fileBytes, filename, "sisperpus/covers")
		if err != nil {
			response.Error(w, http.StatusInternalServerError, err.Error())
			return
		}

		response.JSON(w, http.StatusOK, map[string]interface{}{
			"success":   true,
			"url":       result.SecureURL,
			"public_id": result.PublicID,
			"format":    result.Format,
			"width":     result.Width,
			"height":    result.Height,
		})
		return
	}

	// Case 2: Multipart form-data
	if err := r.ParseMultipartForm(maxUploadSize); err != nil {
		response.Error(w, http.StatusBadRequest, "Ukuran foto melebihi batas maksimal 2 MB.")
		return
	}

	file, header, err := r.FormFile("cover")
	if err != nil {
		file, header, err = r.FormFile("file")
	}
	if err != nil {
		response.Error(w, http.StatusBadRequest, "Bidang berkas 'cover' atau 'file' wajib disertakan")
		return
	}
	defer file.Close()

	if header.Size > maxUploadSize {
		response.Error(w, http.StatusBadRequest, "Ukuran foto melebihi batas maksimal 2 MB.")
		return
	}

	fileBytes, err := io.ReadAll(file)
	if err != nil {
		response.Error(w, http.StatusInternalServerError, "Gagal membaca berkas yang diunggah")
		return
	}

	if len(fileBytes) > maxUploadSize {
		response.Error(w, http.StatusBadRequest, "Ukuran foto melebihi batas maksimal 2 MB.")
		return
	}

	detectedType := http.DetectContentType(fileBytes)
	if !strings.HasPrefix(detectedType, "image/") {
		response.Error(w, http.StatusBadRequest, "Hanya berkas foto (PNG, JPG, WEBP) yang diizinkan.")
		return
	}

	result, err := h.service.UploadImage(fileBytes, header.Filename, "sisperpus/covers")
	if err != nil {
		response.Error(w, http.StatusInternalServerError, err.Error())
		return
	}

	response.JSON(w, http.StatusOK, map[string]interface{}{
		"success":   true,
		"url":       result.SecureURL,
		"public_id": result.PublicID,
		"format":    result.Format,
		"width":     result.Width,
		"height":    result.Height,
	})
}
