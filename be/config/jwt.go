package config

import (
	"os"

	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
)

var JwtKey = []byte(os.Getenv("JWT_SECRET"))

func GetJwtKey() []byte {
	secret := os.Getenv("JWT_SECRET")
	if secret == "" {
		secret = "interlogs_jwt_secret_key_secure_2026"
	}
	return []byte(secret)
}

type Claims struct {
	ID          uuid.UUID  `json:"id"`
	NID         string     `json:"nid"`
	Name        string     `json:"name"`
	Email       string     `json:"email"`
	RoleID      uuid.UUID  `json:"role_id"`
	RoleCode    string     `json:"role_code"`
	RoleName    string     `json:"role_name"`
	StructureID *uuid.UUID `json:"structure_id,omitempty"`
	jwt.RegisteredClaims
}
