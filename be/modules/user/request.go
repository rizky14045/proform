package user

import "github.com/google/uuid"

type UserRequest struct {
	NID          string     `json:"nid" binding:"required"`
	NIP          string     `json:"nip"`
	Name         string     `json:"name" binding:"required"`
	Email        string     `json:"email" binding:"required,email"`
	NIK          string     `json:"nik"`
	Password     string     `json:"password" binding:"required"`
	RoleID       uuid.UUID  `json:"role_id" binding:"required"`
	StructureID  *uuid.UUID `json:"structure_id"`
	Phone        string     `json:"phone"`
	Address      string     `json:"address"`
	SignatureURL string     `json:"signature_url"`
	UserImage    string     `json:"user_image"`
	UserType     string     `json:"user_type"`
	IsActive     *bool      `json:"is_active"`
}

type UserUpdateRequest struct {
	NIP          string     `json:"nip"`
	Name         string     `json:"name"`
	Email        string     `json:"email"`
	NIK          string     `json:"nik"`
	Password     string     `json:"password"`
	RoleID       *uuid.UUID `json:"role_id"`
	StructureID  *uuid.UUID `json:"structure_id"`
	Phone        string     `json:"phone"`
	Address      string     `json:"address"`
	SignatureURL string     `json:"signature_url"`
	UserImage    string     `json:"user_image"`
	UserType     string     `json:"user_type"`
	IsActive     *bool      `json:"is_active"`
}
