package role

import (
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type RoleRepository interface {
	FindAll(search string, status string, page int, limit int) ([]Role, int64, error)
	GetByID(id uuid.UUID) (*Role, error)
	GetByCode(code string) (*Role, error)
	Create(role *Role) error
	Update(role *Role) error
	Delete(id uuid.UUID, deletedBy *uuid.UUID) error

	// UserRole methods
	FindUserRoles(search string, page int, limit int) ([]UserRole, int64, error)
	GetUserRoleByID(id uuid.UUID) (*UserRole, error)
	CreateUserRole(ur *UserRole) error
	UpdateUserRole(ur *UserRole) error
	DeleteUserRole(id uuid.UUID) error
}

type roleRepository struct {
	db *gorm.DB
}

func NewRoleRepository(db *gorm.DB) RoleRepository {
	return &roleRepository{db: db}
}

func (r *roleRepository) FindAll(search string, status string, page int, limit int) ([]Role, int64, error) {
	var roles []Role
	var total int64

	query := r.db.Model(&Role{})

	if search != "" {
		query = query.Where("name ILIKE ? OR code ILIKE ? OR description ILIKE ?", "%"+search+"%", "%"+search+"%", "%"+search+"%")
	}
	if status != "" && status != "ALL" {
		query = query.Where("status = ?", status)
	}

	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	offset := (page - 1) * limit
	if limit > 0 {
		query = query.Limit(limit).Offset(offset)
	}

	if err := query.Order("name asc").Find(&roles).Error; err != nil {
		return nil, 0, err
	}
	return roles, total, nil
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

func (r *roleRepository) FindUserRoles(search string, page int, limit int) ([]UserRole, int64, error) {
	var userRoles []UserRole
	var total int64

	query := r.db.Model(&UserRole{}).Preload("Role")
	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	offset := (page - 1) * limit
	if limit > 0 {
		query = query.Limit(limit).Offset(offset)
	}

	if err := query.Order("created_at desc").Find(&userRoles).Error; err != nil {
		return nil, 0, err
	}
	return userRoles, total, nil
}

func (r *roleRepository) GetUserRoleByID(id uuid.UUID) (*UserRole, error) {
	var ur UserRole
	if err := r.db.Preload("Role").First(&ur, "id = ?", id).Error; err != nil {
		return nil, err
	}
	return &ur, nil
}

func (r *roleRepository) CreateUserRole(ur *UserRole) error {
	return r.db.Create(ur).Error
}

func (r *roleRepository) UpdateUserRole(ur *UserRole) error {
	return r.db.Save(ur).Error
}

func (r *roleRepository) DeleteUserRole(id uuid.UUID) error {
	return r.db.Delete(&UserRole{}, "id = ?", id).Error
}

