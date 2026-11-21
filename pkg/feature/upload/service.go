// Package upload provides Cloudinary media integration and secure asset signing for SISPERPUS.
package upload

import (
	"bytes"
	"crypto/sha1"
	"encoding/hex"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"mime/multipart"
	"net/http"
	"time"

	"sisperpus/pkg/config"
)

// UploadResult stores the parsed Cloudinary response after successful upload.
type UploadResult struct {
	PublicID  string `json:"public_id"`
	SecureURL string `json:"secure_url"`
	Format    string `json:"format"`
	Width     int    `json:"width"`
	Height    int    `json:"height"`
	Bytes     int64  `json:"bytes"`
}

// Service communicates with Cloudinary REST API.
type Service struct {
	cfg        config.Config
	httpClient *http.Client
}

// NewService constructs an instance of the Cloudinary upload service.
func NewService(cfg config.Config) *Service {
	return &Service{
		cfg:        cfg,
		httpClient: &http.Client{Timeout: 30 * time.Second},
	}
}

// UploadImage signs and transmits image bytes to the specified Cloudinary folder.
func (s *Service) UploadImage(fileBytes []byte, filename, folder string) (*UploadResult, error) {
	if s.cfg.CloudinaryCloudName == "" || s.cfg.CloudinaryAPIKey == "" || s.cfg.CloudinaryAPISecret == "" {
		return nil, errors.New("konfigurasi Cloudinary belum lengkap (CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET)")
	}

	if folder == "" {
		folder = "sisperpus/covers"
	}
	if filename == "" {
		filename = "cover.png"
	}

	timestamp := fmt.Sprintf("%d", time.Now().Unix())
	toSign := fmt.Sprintf("folder=%s&timestamp=%s%s", folder, timestamp, s.cfg.CloudinaryAPISecret)

	h := sha1.New()
	h.Write([]byte(toSign))
	signature := hex.EncodeToString(h.Sum(nil))

	var body bytes.Buffer
	writer := multipart.NewWriter(&body)
	_ = writer.WriteField("api_key", s.cfg.CloudinaryAPIKey)
	_ = writer.WriteField("timestamp", timestamp)
	_ = writer.WriteField("folder", folder)
	_ = writer.WriteField("signature", signature)

	part, err := writer.CreateFormFile("file", filename)
	if err != nil {
		return nil, fmt.Errorf("membuat multipart file: %w", err)
	}
	if _, err := part.Write(fileBytes); err != nil {
		return nil, fmt.Errorf("menulis byte file: %w", err)
	}
	_ = writer.Close()

	uploadURL := fmt.Sprintf("https://api.cloudinary.com/v1_1/%s/image/upload", s.cfg.CloudinaryCloudName)
	req, err := http.NewRequest("POST", uploadURL, &body)
	if err != nil {
		return nil, fmt.Errorf("membuat request cloudinary: %w", err)
	}
	req.Header.Set("Content-Type", writer.FormDataContentType())

	resp, err := s.httpClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("koneksi ke api cloudinary gagal: %w", err)
	}
	defer resp.Body.Close()

	respBody, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("membaca respons cloudinary: %w", err)
	}

	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		var errResp struct {
			Error struct {
				Message string `json:"message"`
			} `json:"error"`
		}
		_ = json.Unmarshal(respBody, &errResp)
		if errResp.Error.Message != "" {
			return nil, fmt.Errorf("cloudinary error: %s", errResp.Error.Message)
		}
		return nil, fmt.Errorf("cloudinary upload gagal dengan status code %d", resp.StatusCode)
	}

	var result UploadResult
	if err := json.Unmarshal(respBody, &result); err != nil {
		return nil, fmt.Errorf("parsing respons cloudinary: %w", err)
	}

	return &result, nil
}
