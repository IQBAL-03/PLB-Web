// Package model defines application data structures and API payloads.
package model

// Transaction represents a circulation record for a borrowed book title.
type Transaction struct {
	ID           string  `json:"id"`
	NIS          string  `json:"nis"`
	StudentName  string  `json:"student_name"`
	ClassRoom    string  `json:"class_room"`
	BookID       string  `json:"book_id"`
	BookTitle    string  `json:"book_title"`
	VolumeNumber *int    `json:"volume_number,omitempty"`
	Price        int     `json:"price"`
	LoanDate     string  `json:"loan_date"`
	DueDate      string  `json:"due_date"`
	ReturnDate   *string `json:"return_date,omitempty"`
	Status       string  `json:"status"` // "Dipinjam", "Kembali", "Terlambat"
	Fine         int     `json:"fine"`
	FinePaid     bool    `json:"fine_paid"`
	CreatedAt    string  `json:"created_at,omitempty"`
	UpdatedAt    string  `json:"updated_at,omitempty"`
}

// BorrowReq defines incoming payload when an active member borrows a book.
type BorrowReq struct {
	NIS          string `json:"nis"`
	StudentName  string `json:"student_name"`
	ClassRoom    string `json:"class_room"`
	BookID       string `json:"book_id"`
	BookTitle    string `json:"book_title"`
	VolumeNumber *int   `json:"volume_number,omitempty"`
}

// ReturnLoanReq defines payload for returning a borrowed book.
type ReturnLoanReq struct {
	ID        string `json:"id"`
	Condition string `json:"condition,omitempty"`
	Fine      int    `json:"fine,omitempty"`
}
