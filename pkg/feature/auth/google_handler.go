package auth

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strings"
	"time"

	"sisperpus/pkg/crypto"
	"sisperpus/pkg/mailer"
	"sisperpus/pkg/model"
	"sisperpus/pkg/response"
)

// Google handles Google OAuth login and registration dispatching.
func (h *Handler) Google(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		response.Error(w, http.StatusMethodNotAllowed, "method not allowed")
		return
	}

	var req model.GoogleAuthReq
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil || strings.TrimSpace(req.Email) == "" {
		response.Error(w, http.StatusBadRequest, "Data profil Google tidak valid.")
		return
	}

	email := strings.ToLower(strings.TrimSpace(req.Email))
	name := strings.TrimSpace(req.Name)
	if name == "" {
		name = strings.Split(email, "@")[0]
	}

	user, err := h.repo.GetUserByEmail(email)
	if err != nil {
		response.DBError(w, err)
		return
	}

	if user == nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusNotFound)
		_ = json.NewEncoder(w).Encode(map[string]any{
			"ok":          false,
			"error":       "user_not_found",
			"message":     "Akun Google ini belum terdaftar di sistem. Silakan selesaikan proses registrasi.",
			"google_user": map[string]string{"email": email, "name": name},
		})
		return
	}

	if !user.IsVerified {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusForbidden)
		_ = json.NewEncoder(w).Encode(map[string]any{
			"ok":      false,
			"error":   "unverified_account",
			"message": "Akun Anda belum menyelesaikan verifikasi OTP. Silakan selesaikan pendaftaran Anda.",
			"email":   email,
		})
		return
	}

	isTrusted, err := h.repo.IsDeviceTrusted(user.ID, req.DeviceToken)
	if err != nil {
		response.DBError(w, err)
		return
	}

	if !isTrusted {
		allowed, waitSec, err := h.repo.CheckOTPRateLimit(email)
		if err != nil {
			response.DBError(w, err)
			return
		}
		if !allowed {
			response.Error(w, http.StatusTooManyRequests, fmt.Sprintf("Mohon tunggu %d detik sebelum meminta kode verifikasi baru.", waitSec))
			return
		}

		otpCode := mailer.GenerateOTP()
		otpHash := crypto.HashOTP(otpCode)
		metaJSON, _ := json.Marshal(map[string]any{
			"user_id":      user.ID,
			"device_token": req.DeviceToken,
			"device_name":  req.DeviceName,
		})

		expiresAt := time.Now().Add(5 * time.Minute).UTC()
		if err := h.repo.SaveOTP(email, otpHash, "login_new_device", string(metaJSON), expiresAt); err != nil {
			response.DBError(w, err)
			return
		}

		if err := mailer.SendOTP(h.cfg, email, otpCode); err != nil {
			response.Error(w, http.StatusInternalServerError, "Gagal mengirim email OTP: "+err.Error())
			return
		}

		response.JSON(w, http.StatusOK, map[string]any{
			"ok":          true,
			"require_otp": true,
			"purpose":     "login_new_device",
			"email":       email,
			"message":     "Perangkat baru terdeteksi. Kode verifikasi telah dikirim ke email Anda.",
		})
		return
	}

	token, _ := crypto.CreateJWT(user.ID, user.Email, user.Name, h.cfg.JWTSecret)
	response.JSON(w, http.StatusOK, map[string]any{
		"ok":      true,
		"message": "Login Google berhasil.",
		"token":   token,
		"user": map[string]any{
			"id":    user.ID,
			"name":  user.Name,
			"email": user.Email,
		},
	})
}
