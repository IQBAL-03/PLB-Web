// Package model defines application data structures and API payloads.
package model

// BookReview represents a student rating and commentary on a catalog title.
type BookReview struct {
	ID          string `json:"id"`
	BookID      string `json:"book_id"`
	NIS         string `json:"nis"`
	StudentName string `json:"student_name"`
	Rating      int    `json:"rating"`
	ReviewText  string `json:"review_text"`
	CreatedAt   string `json:"created_at"`
	UpdatedAt   string `json:"updated_at,omitempty"`
}

// CreateReviewReq defines the incoming payload when a student submits a review.
type CreateReviewReq struct {
	BookID      string `json:"book_id"`
	NIS         string `json:"nis"`
	StudentName string `json:"student_name"`
	Rating      int    `json:"rating"`
	ReviewText  string `json:"review_text"`
}

// DeleteReviewReq defines the payload to delete a review.
type DeleteReviewReq struct {
	ID     string `json:"id,omitempty"`
	BookID string `json:"book_id"`
	NIS    string `json:"nis"`
}
