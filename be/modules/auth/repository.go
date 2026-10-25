package auth

import (
	"os"
	"template/config"
	"template/modules/user"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"gorm.io/gorm"
)

type AuthRepository interface {
	FindByEmailOrNID(identifier string) (*user.User, error)
	FindByEmail(email string) (*user.User, error)
	FindByNID(nid string) (*user.User, error)
	JwtToken(u *user.User) (string, error)
}

type authRepository struct {
	db *gorm.DB
}

func NewAuthRepository(db *gorm.DB) AuthRepository {
	return &authRepository{db: db}
}

func (r *authRepository) FindByEmailOrNID(identifier string) (*user.User, error) {
	var u user.User
	if err := r.db.Preload("Role").Preload("Structure").
		Where("email = ? OR nid = ?", identifier, identifier).
		First(&u).Error; err != nil {
		return nil, err
	}
	return &u, nil
}

func (r *authRepository) FindByEmail(email string) (*user.User, error) {
	var u user.User
	if err := r.db.Preload("Role").Preload("Structure").Where("email = ?", email).First(&u).Error; err != nil {
		return nil, err
	}
	return &u, nil
}

func (r *authRepository) FindByNID(nid string) (*user.User, error) {
	var u user.User
	if err := r.db.Preload("Role").Preload("Structure").Where("nid = ?", nid).First(&u).Error; err != nil {
		return nil, err
	}
	return &u, nil
}

func (r *authRepository) JwtToken(u *user.User) (string, error) {
	expirationTime := time.Now().Add(24 * time.Hour)

	claims := &config.Claims{
		ID:          u.ID,
		NID:         u.NID,
		Name:        u.Name,
		Email:       u.Email,
		RoleID:      u.RoleID,
		RoleCode:    u.Role.Code,
		RoleName:    u.Role.Name,
		StructureID: u.StructureID,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(expirationTime),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			Issuer:    os.Getenv("APP_NAME"),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, err := token.SignedString(config.GetJwtKey())
	if err != nil {
		return "", err
	}
	return tokenString, nil
}
