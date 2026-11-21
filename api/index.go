// Package api exposes the Vercel Serverless Function entry point for SISPERPUS.
package api

import (
	"net/http"
	"strings"

	"sisperpus/pkg/config"
	"sisperpus/pkg/database"
	"sisperpus/pkg/feature/auth"
	"sisperpus/pkg/feature/books"
	"sisperpus/pkg/feature/upload"
	"sisperpus/pkg/middleware"
	"sisperpus/pkg/response"
)

// Handler serves incoming HTTP requests for Vercel Serverless runtime.
func Handler(w http.ResponseWriter, r *http.Request) {
	cfg := config.Load()

	db, err := database.Get(cfg)
	if err != nil {
		response.DBError(w, err)
		return
	}

	// Repositories & Services
	authRepo := auth.NewRepository(db)
	booksRepo := books.NewRepository(db)
	uploadSvc := upload.NewService(cfg)

	// Handlers
	authH := auth.NewHandler(cfg, authRepo)
	booksH := books.NewHandler(cfg, booksRepo)
	uploadH := upload.NewHandler(cfg, uploadSvc)

	mux := http.NewServeMux()

	wrap := func(h http.HandlerFunc) http.HandlerFunc {
		return middleware.Chain(cfg, h)
	}

	// Authentication Endpoints
	mux.HandleFunc("/api/auth/login", wrap(authH.Login))
	mux.HandleFunc("/api/auth/register", wrap(authH.Register))
	mux.HandleFunc("/api/auth/register/request-otp", wrap(authH.RegisterRequestOTP))
	mux.HandleFunc("/api/auth/register/verify-otp", wrap(authH.RegisterVerifyOTP))
	mux.HandleFunc("/api/auth/otp/verify", wrap(authH.VerifyOTP))
	mux.HandleFunc("/api/auth/otp/resend", wrap(authH.ResendOTP))
	mux.HandleFunc("/api/auth/me", wrap(authH.Me))

	// Book Catalog & TiDB Persistence Endpoints
	mux.HandleFunc("/api/books", wrap(func(w http.ResponseWriter, r *http.Request) {
		switch r.Method {
		case http.MethodGet:
			booksH.List(w, r)
		case http.MethodPost:
			booksH.Create(w, r)
		case http.MethodPut:
			booksH.Update(w, r)
		case http.MethodDelete:
			booksH.Delete(w, r)
		default:
			response.Error(w, http.StatusMethodNotAllowed, "Metode tidak diizinkan")
		}
	}))
	mux.HandleFunc("/api/books/update", wrap(booksH.Update))
	mux.HandleFunc("/api/books/delete", wrap(booksH.Delete))

	// Cloudinary Upload Endpoints (Cover Buku & Berkas)
	mux.HandleFunc("/api/upload/cover", wrap(uploadH.UploadCover))
	mux.HandleFunc("/api/upload", wrap(uploadH.UploadCover))

	// Root & Health Check Endpoints
	rootHandler := wrap(func(w http.ResponseWriter, r *http.Request) {
		response.JSON(w, http.StatusOK, map[string]any{
			"status":  "ok",
			"system":  "SISPERPUS Digital Library API",
			"version": "1.0.0",
		})
	})
	mux.HandleFunc("/api", rootHandler)
	mux.HandleFunc("/api/", rootHandler)
	mux.HandleFunc("/api/health", rootHandler)

	// If request path was rewritten by Vercel to /api, recover the original path
	origPath := r.URL.Path
	if r.URL.Path == "/api" || r.URL.Path == "/api/" {
		if matched := r.Header.Get("x-matched-path"); matched != "" && matched != "/api" {
			r.URL.Path = matched
		} else if orig := r.Header.Get("x-forwarded-uri"); orig != "" && orig != "/api" {
			r.URL.Path = strings.Split(orig, "?")[0]
		} else if r.RequestURI != "" && r.RequestURI != "/api" && r.RequestURI != "/api/" {
			r.URL.Path = strings.Split(r.RequestURI, "?")[0]
		}
	}

	mux.ServeHTTP(w, r)
	r.URL.Path = origPath
}
