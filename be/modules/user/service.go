package user

import (
	"errors"
	"template/helper"

	"github.com/google/uuid"
)

type UserService interface {
	FindAll(search string, status string) ([]User, error)
	GetByID(id uuid.UUID) (*User, error)
	GetByNID(nid string) (*User, error)
	GetByEmail(email string) (*User, error)
	Create(creatorID *uuid.UUID, req UserRequest) (*User, error)
	Update(id uuid.UUID, updaterID *uuid.UUID, req UserUpdateRequest) (*User, error)
	Delete(id uuid.UUID, deletedBy *uuid.UUID) error
}

type userService struct {
	repo UserRepository
}

func NewUserService(repo UserRepository) UserService {
	return &userService{repo: repo}
}

func (s *userService) FindAll(search string, status string) ([]User, error) {
	return s.repo.FindAll(search, status)
}

func (s *userService) GetByID(id uuid.UUID) (*User, error) {
	return s.repo.GetByID(id)
}

func (s *userService) GetByNID(nid string) (*User, error) {
	return s.repo.GetByNID(nid)
}

func (s *userService) GetByEmail(email string) (*User, error) {
	return s.repo.GetByEmail(email)
}

func (s *userService) Create(creatorID *uuid.UUID, req UserRequest) (*User, error) {
	existingNID, _ := s.repo.GetByNID(req.NID)
	if existingNID != nil {
		return nil, errors.New("NID already exists")
	}

	existingEmail, _ := s.repo.GetByEmail(req.Email)
	if existingEmail != nil {
		return nil, errors.New("email already exists")
	}

	hashedPassword, err := helper.HashPassword(req.Password)
	if err != nil {
		return nil, err
	}

	isActive := true
	if req.IsActive != nil {
		isActive = *req.IsActive
	}

	userType := req.UserType
	if userType == "" {
		userType = "USER"
	}

	user := User{
		NID:          req.NID,
		Name:         req.Name,
		Email:        req.Email,
		NIK:          req.NIK,
		Password:     hashedPassword,
		RoleID:       req.RoleID,
		StructureID:  req.StructureID,
		Phone:        req.Phone,
		Address:      req.Address,
		SignatureURL: req.SignatureURL,
		UserImage:    req.UserImage,
		UserType:     userType,
		IsActive:     isActive,
		CreatedByID:  creatorID,
		UpdatedByID:  creatorID,
	}

	if err := s.repo.Create(&user); err != nil {
		return nil, err
	}
	return s.repo.GetByID(user.ID)
}

func (s *userService) Update(id uuid.UUID, updaterID *uuid.UUID, req UserUpdateRequest) (*User, error) {
	user, err := s.repo.GetByID(id)
	if err != nil {
		return nil, err
	}

	if req.Email != "" && req.Email != user.Email {
		existingEmail, _ := s.repo.GetByEmail(req.Email)
		if existingEmail != nil {
			return nil, errors.New("email already exists")
		}
		user.Email = req.Email
	}

	if req.Name != "" {
		user.Name = req.Name
	}
	if req.NIK != "" {
		user.NIK = req.NIK
	}
	if req.Phone != "" {
		user.Phone = req.Phone
	}
	if req.Address != "" {
		user.Address = req.Address
	}
	if req.SignatureURL != "" {
		user.SignatureURL = req.SignatureURL
	}
	if req.UserImage != "" {
		user.UserImage = req.UserImage
	}
	if req.UserType != "" {
		user.UserType = req.UserType
	}
	if req.RoleID != nil {
		user.RoleID = *req.RoleID
	}
	if req.StructureID != nil {
		user.StructureID = req.StructureID
	}
	if req.IsActive != nil {
		user.IsActive = *req.IsActive
	}

	if req.Password != "" {
		hashed, err := helper.HashPassword(req.Password)
		if err != nil {
			return nil, err
		}
		user.Password = hashed
	}
	user.UpdatedByID = updaterID

	if err := s.repo.Update(user); err != nil {
		return nil, err
	}
	return s.repo.GetByID(user.ID)
}

func (s *userService) Delete(id uuid.UUID, deletedBy *uuid.UUID) error {
	return s.repo.Delete(id, deletedBy)
}
