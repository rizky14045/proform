package auth

type LoginRequest struct {
	Identifier string `json:"identifier"` // Can be NID, Email, or Username
	Username   string `json:"username"`
	NID        string `json:"nid"`
	Email      string `json:"email"`
	Password   string `json:"password" binding:"required"`
}
