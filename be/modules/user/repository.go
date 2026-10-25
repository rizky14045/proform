package user

import (
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type UserRepository interface {
	FindAll(search string, status string) ([]User, error)
	GetByID(id uuid.UUID) (*User, error)
	GetByNID(nid string) (*User, error)
	GetByEmail(email string) (*User, error)
	Create(user *User) error
	Update(user *User) error
	Delete(id uuid.UUID, deletedBy *uuid.UUID) error
}

type userRepository struct {
	db *gorm.DB
}

func NewUserRepository(db *gorm.DB) UserRepository {
	return &userRepository{db: db}
}

func (r *userRepository) FindAll(search string, status string) ([]User, error) {
	var users []User
	query := r.db.Preload("Role").Preload("Structure").Order("created_at desc")

	if search != "" {
		query = query.Where("name ILIKE ? OR nid ILIKE ? OR email ILIKE ?", "%"+search+"%", "%"+search+"%", "%"+search+"%")
	}
	if status == "ACTIVE" {
		query = query.Where("is_active = ?", true)
	} else if status == "INACTIVE" {
		query = query.Where("is_active = ?", false)
	}

	if err := query.Find(&users).Error; err != nil {
		return nil, err
	}
	return users, nil
}

func (r *userRepository) GetByID(id uuid.UUID) (*User, error) {
	var user User
	if err := r.db.Preload("Role").Preload("Structure").First(&user, "id = ?", id).Error; err != nil {
		return nil, err
	}
	return &user, nil
}

func (r *userRepository) GetByNID(nid string) (*User, error) {
	var user User
	if err := r.db.Preload("Role").Preload("Structure").First(&user, "nid = ?", nid).Error; err != nil {
		return nil, err
	}
	return &user, nil
}

func (r *userRepository) GetByEmail(email string) (*User, error) {
	var user User
	if err := r.db.Preload("Role").Preload("Structure").First(&user, "email = ?", email).Error; err != nil {
		return nil, err
	}
	return &user, nil
}

func (r *userRepository) Create(user *User) error {
	return r.db.Create(user).Error
}

func (r *userRepository) Update(user *User) error {
	return r.db.Save(user).Error
}

func (r *userRepository) Delete(id uuid.UUID, deletedBy *uuid.UUID) error {
	if deletedBy != nil {
		_ = r.db.Model(&User{}).Where("id = ?", id).Update("deleted_by", *deletedBy).Error
	}
	return r.db.Delete(&User{}, "id = ?", id).Error
}
