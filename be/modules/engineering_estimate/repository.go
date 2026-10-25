package engineering_estimate

import (
	"fmt"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type EngineeringEstimateRepository interface {
	// HPE
	FindAllHPE(search string, status string) ([]EngineeringEstimate, error)
	GetHPEByID(id uuid.UUID) (*EngineeringEstimate, error)
	GetHPEByRequestID(requestID uuid.UUID) (*EngineeringEstimate, error)
	CreateHPE(hpe *EngineeringEstimate) error
	UpdateHPE(hpe *EngineeringEstimate) error
	DeleteHPE(id uuid.UUID, deletedBy *uuid.UUID) error
	GenerateHPENumber() (string, error)

	// RKS
	FindAllRKS(search string, status string) ([]RKSDocument, error)
	GetRKSByID(id uuid.UUID) (*RKSDocument, error)
	CreateRKS(rks *RKSDocument) error
	UpdateRKS(rks *RKSDocument) error
	DeleteRKS(id uuid.UUID, deletedBy *uuid.UUID) error
	GenerateRKSNumber() (string, error)

	// VFM
	FindAllVFM(requestID *uuid.UUID, stage string) ([]ValueForMoneyReview, error)
	GetVFMByID(id uuid.UUID) (*ValueForMoneyReview, error)
	CreateVFM(vfm *ValueForMoneyReview) error
	UpdateVFM(vfm *ValueForMoneyReview) error
	GenerateVFMNumber(stage string) (string, error)
}

type engineeringEstimateRepository struct {
	db *gorm.DB
}

func NewEngineeringEstimateRepository(db *gorm.DB) EngineeringEstimateRepository {
	return &engineeringEstimateRepository{db: db}
}

func (r *engineeringEstimateRepository) FindAllHPE(search string, status string) ([]EngineeringEstimate, error) {
	var list []EngineeringEstimate
	query := r.db.Preload("Request").Preload("Vendor1").Preload("Vendor2").Preload("Vendor3").Preload("Vendor4").Preload("Creator").
		Order("created_at desc")

	if search != "" {
		query = query.Where("hpe_number ILIKE ? OR notes ILIKE ?", "%"+search+"%", "%"+search+"%")
	}
	if status != "" && status != "ALL" {
		query = query.Where("status = ?", status)
	}

	if err := query.Find(&list).Error; err != nil {
		return nil, err
	}
	return list, nil
}

func (r *engineeringEstimateRepository) GetHPEByID(id uuid.UUID) (*EngineeringEstimate, error) {
	var item EngineeringEstimate
	if err := r.db.Preload("Request.Items").Preload("Vendor1").Preload("Vendor2").Preload("Vendor3").Preload("Vendor4").Preload("Creator").
		First(&item, "id = ?", id).Error; err != nil {
		return nil, err
	}
	return &item, nil
}

func (r *engineeringEstimateRepository) GetHPEByRequestID(requestID uuid.UUID) (*EngineeringEstimate, error) {
	var item EngineeringEstimate
	if err := r.db.Preload("Request.Items").Preload("Vendor1").Preload("Vendor2").Preload("Vendor3").Preload("Vendor4").Preload("Creator").
		First(&item, "request_id = ?", requestID).Error; err != nil {
		return nil, err
	}
	return &item, nil
}

func (r *engineeringEstimateRepository) CreateHPE(hpe *EngineeringEstimate) error {
	return r.db.Create(hpe).Error
}

func (r *engineeringEstimateRepository) UpdateHPE(hpe *EngineeringEstimate) error {
	return r.db.Save(hpe).Error
}

func (r *engineeringEstimateRepository) DeleteHPE(id uuid.UUID, deletedBy *uuid.UUID) error {
	if deletedBy != nil {
		_ = r.db.Model(&EngineeringEstimate{}).Where("id = ?", id).Update("deleted_by", *deletedBy).Error
	}
	return r.db.Delete(&EngineeringEstimate{}, "id = ?", id).Error
}

func (r *engineeringEstimateRepository) GenerateHPENumber() (string, error) {
	var count int64
	year := time.Now().Year()
	r.db.Model(&EngineeringEstimate{}).Count(&count)
	return fmt.Sprintf("%04d/HPE/600/UPMT/%d", count+1, year), nil
}

func (r *engineeringEstimateRepository) FindAllRKS(search string, status string) ([]RKSDocument, error) {
	var list []RKSDocument
	query := r.db.Preload("HPE.Request").Preload("Creator").Order("created_at desc")

	if search != "" {
		query = query.Where("rks_number ILIKE ? OR title ILIKE ?", "%"+search+"%", "%"+search+"%")
	}
	if status != "" && status != "ALL" {
		query = query.Where("status = ?", status)
	}

	if err := query.Find(&list).Error; err != nil {
		return nil, err
	}
	return list, nil
}

func (r *engineeringEstimateRepository) GetRKSByID(id uuid.UUID) (*RKSDocument, error) {
	var item RKSDocument
	if err := r.db.Preload("HPE.Request").Preload("Creator").First(&item, "id = ?", id).Error; err != nil {
		return nil, err
	}
	return &item, nil
}

func (r *engineeringEstimateRepository) CreateRKS(rks *RKSDocument) error {
	return r.db.Create(rks).Error
}

func (r *engineeringEstimateRepository) UpdateRKS(rks *RKSDocument) error {
	return r.db.Save(rks).Error
}

func (r *engineeringEstimateRepository) DeleteRKS(id uuid.UUID, deletedBy *uuid.UUID) error {
	if deletedBy != nil {
		_ = r.db.Model(&RKSDocument{}).Where("id = ?", id).Update("deleted_by", *deletedBy).Error
	}
	return r.db.Delete(&RKSDocument{}, "id = ?", id).Error
}

func (r *engineeringEstimateRepository) GenerateRKSNumber() (string, error) {
	var count int64
	year := time.Now().Year()
	r.db.Model(&RKSDocument{}).Count(&count)
	return fmt.Sprintf("%04d/RKS/600/UPMT/%d", count+1, year), nil
}

func (r *engineeringEstimateRepository) FindAllVFM(requestID *uuid.UUID, stage string) ([]ValueForMoneyReview, error) {
	var list []ValueForMoneyReview
	query := r.db.Preload("Request").Preload("Reviewer").Order("created_at desc")

	if requestID != nil {
		query = query.Where("request_id = ?", *requestID)
	}
	if stage != "" && stage != "ALL" {
		query = query.Where("stage = ?", stage)
	}

	if err := query.Find(&list).Error; err != nil {
		return nil, err
	}
	return list, nil
}

func (r *engineeringEstimateRepository) GetVFMByID(id uuid.UUID) (*ValueForMoneyReview, error) {
	var item ValueForMoneyReview
	if err := r.db.Preload("Request").Preload("Reviewer").First(&item, "id = ?", id).Error; err != nil {
		return nil, err
	}
	return &item, nil
}

func (r *engineeringEstimateRepository) CreateVFM(vfm *ValueForMoneyReview) error {
	return r.db.Create(vfm).Error
}

func (r *engineeringEstimateRepository) UpdateVFM(vfm *ValueForMoneyReview) error {
	return r.db.Save(vfm).Error
}

func (r *engineeringEstimateRepository) GenerateVFMNumber(stage string) (string, error) {
	var count int64
	year := time.Now().Year()
	r.db.Model(&ValueForMoneyReview{}).Where("stage = ?", stage).Count(&count)
	return fmt.Sprintf("%04d/VFMPP/600/UPMT/%d", count+1, year), nil
}
