// Package model defines application data structures and API payloads.
package model

// Member represents a registered school library student or staff member.
type Member struct {
	NIS         string `json:"nis"`
	Name        string `json:"name"`
	ClassRoom   string `json:"class_room"`
	ActiveLoans int    `json:"active_loans"`
	Status      string `json:"status"` // "Aktif", "Menunggu Verifikasi", "Ada Denda", "Non-Aktif"
	CreatedAt   string `json:"created_at,omitempty"`
	UpdatedAt   string `json:"updated_at,omitempty"`
}

// CreateMemberReq defines payload for registering a new student member.
type CreateMemberReq struct {
	NIS       string `json:"nis"`
	Name      string `json:"name"`
	ClassRoom string `json:"class_room"`
	Status    string `json:"status,omitempty"`
}

// UpdateMemberStatusReq defines payload for updating a member's status (e.g. admin verification).
type UpdateMemberStatusReq struct {
	NIS    string `json:"nis"`
	Status string `json:"status"`
}
