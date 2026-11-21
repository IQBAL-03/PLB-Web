// Package model defines application data structures and API payloads.
package model

// Book represents a library catalog title stored in the TiDB database.
type Book struct {
	ID                 string  `json:"id"`
	Title              string  `json:"title"`
	Author             string  `json:"author"`
	Category           string  `json:"category"`
	Language           string  `json:"language"`
	Price              int     `json:"price"`
	Year               string  `json:"year"`
	Shelf              string  `json:"shelf"`
	Stock              int     `json:"stock"`
	Rating             float64 `json:"rating"`
	ReviewsCount       int     `json:"reviews_count"`
	Badge              string  `json:"badge"`
	Synopsis           string  `json:"synopsis"`
	CoverImg           string  `json:"coverImg"`
	CloudinaryPublicID string  `json:"cloudinary_public_id,omitempty"`
	IsPopular          bool    `json:"isPopular,omitempty"`
	IsSpotlight        bool    `json:"isSpotlight,omitempty"`
	HasVolumes         bool    `json:"hasVolumes,omitempty"`
	CreatedAt          string  `json:"createdAt,omitempty"`
	UpdatedAt          string  `json:"updatedAt,omitempty"`
}
