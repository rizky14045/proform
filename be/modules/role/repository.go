package role

import (
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type RoleRepository interface {
	FindAll(search string, status string) ([]Role, error)
	GetByID(id uuid.UUID) (*Role, error)
	GetByCode(code string) (*Role, error)
	Create(role *Role) error
	Update(role *Role) error
	Delete(id uuid.UUID, deletedBy *uuid.UUID) error
}

type roleRepository struct {
	db *gorm.DB
}

func NewRoleRepository(db *gorm.DB) RoleRepository {
	return &roleRepository{db: db}
}

func (r *roleRepository) FindAll(search string, status string) ([]Role, error) {
	var roles []Role
	query := r.db.Order("name asc")

	if search != "" {
		query = query.Where("name ILIKE ? OR code ILIKE ? OR description ILIKE ?", "%"+search+"%", "%"+search+"%", "%"+search+"%")
	}
	if status != "" && status != "ALL" {
		query = query.Where("status = ?", status)
	}

	if err := query.Find(&roles).Error; err != nil {
		return nil, err
	}
	return roles, nil
}

func (r *roleRepository) GetByID(id uuid.UUID) (*Role, error) {
	var role Role
	if err := r.db.First(&role, "id = ?", id).Error; err != nil {
		return nil, err
	}
	return &role, nil
}

func (r *roleRepository) GetByCode(code string) (*Role, error) {
	var role Role
	if err := r.db.Where("code = ?", code).First(&role).Error; err != nil {
		return nil, err
	}
	return &role, nil
}

func (r *roleRepository) Create(role *Role) error {
	return r.db.Create(role).Error
}

func (r *roleRepository) Update(role *Role) error {
	return r.db.Save(role).Error
}

func (r *roleRepository) Delete(id uuid.UUID, deletedBy *uuid.UUID) error {
	if deletedBy != nil {
		_ = r.db.Model(&Role{}).Where("id = ?", id).Update("deleted_by", *deletedBy).Error
	}
	return r.db.Delete(&Role{}, "id = ?", id).Error
}
