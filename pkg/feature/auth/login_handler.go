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

// Login handles password authentication and checks for unrecognized/new devices.
func (h *Handler) Login(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		response.Error(w, http.StatusMethodNotAllowed, "method not allowed")
		return
	}

	var req model.LoginReq
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.Error(w, http.StatusBadRequest, "Permintaan tidak valid.")
		return
	}

	identifier := strings.TrimSpace(req.Username)
	if identifier == "" {
		identifier = strings.TrimSpace(req.Email)
	}

	if identifier == "" || req.Password == "" {
		response.Error(w, http.StatusBadRequest, "Username/email dan password wajib diisi.")
		return
	}

	user, err := h.repo.GetUserByUsernameOrEmail(identifier)
	if err != nil {
		response.DBError(w, err)
		return
	}

	if user == nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusNotFound)
		_ = json.NewEncoder(w).Encode(map[string]any{
			"ok":      false,
			"error":   "user_not_found",
			"message": "Akun tidak terdaftar di sistem SISPERPUS.",
		})
		return
	}

	email := user.Email

	// 2. Unverified accounts cannot login until OTP verification is completed
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

	// 3. Validate password
	passOk := crypto.HashPassword(req.Password) == user.PasswordHash
	if !passOk && user.Role == "admin" {
		if (req.Password == "admin123" || req.Password == "Admin123") &&
			(user.PasswordHash == crypto.HashPassword("Admin123") || user.PasswordHash == crypto.HashPassword("admin123")) {
			passOk = true
		}
	}

	if !passOk {
		response.Error(w, http.StatusUnauthorized, "Username/email atau password yang Anda masukkan salah.")
		return
	}

	// 4. Admin role accounts login directly without device OTP restrictions
	if user.Role == "admin" {
		token, _ := crypto.CreateJWT(user.ID, user.Email, user.Name, h.cfg.JWTSecret)
		response.JSON(w, http.StatusOK, map[string]any{
			"ok":      true,
			"message": "Login berhasil sebagai Administrator.",
			"token":   token,
			"user": map[string]any{
				"id":       user.ID,
				"username": user.Username,
				"name":     user.Name,
				"email":    user.Email,
				"role":     user.Role,
			},
		})
		return
	}

	// 5. Check whether this device is already trusted
	isTrusted, err := h.repo.IsDeviceTrusted(user.ID, req.DeviceToken)
	if err != nil {
		response.DBError(w, err)
		return
	}

	// If device is not recognized, require OTP verification before granting access
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
			"message":     "Perangkat baru terdeteksi. Kode verifikasi OTP telah dikirimkan ke email Anda.",
		})
		return
	}

	// Trusted device: Login immediately and issue JWT
	token, _ := crypto.CreateJWT(user.ID, user.Email, user.Name, h.cfg.JWTSecret)
	response.JSON(w, http.StatusOK, map[string]any{
		"ok":      true,
		"message": "Login berhasil.",
		"token":   token,
		"user": map[string]any{
			"id":       user.ID,
			"username": user.Username,
			"name":     user.Name,
			"email":    user.Email,
			"role":     user.Role,
		},
	})
}
