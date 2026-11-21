// Package model defines application data structures and API payloads.
package model

// Volume represents an individual volume or installment in a multi-part book or manga series.
type Volume struct {
	VolumeNumber int    `json:"volumeNumber"`
	VolumeTitle  string `json:"volumeTitle"`
	CoverImg     string `json:"coverImg"`
	Stock        int    `json:"stock"`
	Description  string `json:"description,omitempty"`
}

// Book represents a library catalog title stored in the TiDB database.
type Book struct {
	ID                 string   `json:"id"`
	Title              string   `json:"title"`
	Author             string   `json:"author"`
	Category           string   `json:"category"`
	Genres             []string `json:"genres,omitempty"`
	Language           string   `json:"language"`
	Price              int      `json:"price"`
	Year               string   `json:"year"`
	Shelf              string   `json:"shelf"`
	Stock              int      `json:"stock"`
	Rating             float64  `json:"rating"`
	ReviewsCount       int      `json:"reviews_count"`
	Badge              string   `json:"badge"`
	Synopsis           string   `json:"synopsis"`
	CoverImg           string   `json:"coverImg"`
	CloudinaryPublicID string   `json:"cloudinary_public_id,omitempty"`
	IsPopular          bool     `json:"isPopular,omitempty"`
	IsSpotlight        bool     `json:"isSpotlight,omitempty"`
	HasVolumes         bool     `json:"hasVolumes"`
	Volumes            []Volume `json:"volumes,omitempty"`
	CreatedAt          string   `json:"createdAt,omitempty"`
	UpdatedAt          string   `json:"updatedAt,omitempty"`
}
