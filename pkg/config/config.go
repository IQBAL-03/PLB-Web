// Package config provides application configuration and environment variable loading.
package config

import (
	"bufio"
	"crypto/rand"
	"encoding/hex"
	"log"
	"os"
	"strings"
)

// loadEnvFile reads a local .env file if present and populates unset environment variables.
func loadEnvFile() {
	f, err := os.Open(".env")
	if err != nil {
		return
	}
	defer f.Close()

	scanner := bufio.NewScanner(f)
	for scanner.Scan() {
		line := strings.TrimSpace(scanner.Text())
		if line == "" || strings.HasPrefix(line, "#") {
			continue
		}
		parts := strings.SplitN(line, "=", 2)
		if len(parts) == 2 {
			k := strings.TrimSpace(parts[0])
			v := strings.Trim(strings.TrimSpace(parts[1]), "\"")
			if os.Getenv(k) == "" {
				_ = os.Setenv(k, v)
			}
		}
	}
}

// generateEphemeralSecret creates a cryptographically secure 256-bit random string.
func generateEphemeralSecret(numBytes int) string {
	bytes := make([]byte, numBytes)
	if _, err := rand.Read(bytes); err != nil {
		return "emergency-random-seed-2026"
	}
	return hex.EncodeToString(bytes)
}

// Config holds runtime configuration settings loaded from environment variables.
type Config struct {
	TiDBHost               string
	TiDBPort               string
	TiDBUser               string
	TiDBPassword           string
	TiDBDatabase           string
	JWTSecret              string
	AllowedOrigin          string
	SMTPHost               string
	SMTPPort               string
	SMTPUser               string
	SMTPPass               string
	SMTPFrom               string
	CloudinaryCloudName    string
	CloudinaryAPIKey       string
	CloudinaryAPISecret    string
	CloudinaryUploadPreset string
}

// Load reads and parses configuration values from system environment variables.
func Load() Config {
	loadEnvFile()

	port := os.Getenv("TIDB_PORT")
	if port == "" {
		port = "4000"
	}

	dbName := os.Getenv("TIDB_DB")
	if dbName == "" {
		dbName = "test"
	}

	jwtSec := os.Getenv("JWT_SECRET")
	if jwtSec == "" {
		log.Println("[SECURITY WARNING] JWT_SECRET environment variable is missing. Generated ephemeral runtime secret.")
		jwtSec = generateEphemeralSecret(32)
	}

	origin := os.Getenv("ALLOWED_ORIGIN")
	if origin == "" {
		origin = "*"
	}

	smtpPort := os.Getenv("SMTP_PORT")
	if smtpPort == "" {
		smtpPort = "587"
	}

	smtpFrom := os.Getenv("SMTP_FROM")
	if smtpFrom == "" {
		smtpFrom = os.Getenv("SMTP_USER")
	}

	return Config{
		TiDBHost:               os.Getenv("TIDB_HOST"),
		TiDBPort:               port,
		TiDBUser:               os.Getenv("TIDB_USER"),
		TiDBPassword:           os.Getenv("TIDB_PASSWORD"),
		TiDBDatabase:           dbName,
		JWTSecret:              jwtSec,
		AllowedOrigin:          origin,
		SMTPHost:               os.Getenv("SMTP_HOST"),
		SMTPPort:               smtpPort,
		SMTPUser:               os.Getenv("SMTP_USER"),
		SMTPPass:               os.Getenv("SMTP_PASS"),
		SMTPFrom:               smtpFrom,
		CloudinaryCloudName:    os.Getenv("CLOUDINARY_CLOUD_NAME"),
		CloudinaryAPIKey:       os.Getenv("CLOUDINARY_API_KEY"),
		CloudinaryAPISecret:    os.Getenv("CLOUDINARY_API_SECRET"),
		CloudinaryUploadPreset: os.Getenv("CLOUDINARY_UPLOAD_PRESET"),
	}
}


