package executive_docket

import (
	"fmt"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type ExecutiveDocketRepository interface {
	FindAll(search string) ([]ExecutiveDocket, error)
	GetByID(id uuid.UUID) (*ExecutiveDocket, error)
	GetByRequestID(requestID uuid.UUID) (*ExecutiveDocket, error)
	Create(docket *ExecutiveDocket) error
	Update(docket *ExecutiveDocket) error
	Delete(id uuid.UUID, deletedBy *uuid.UUID) error
	GenerateDocketNumber() (string, error)

	CreateSignature(sig *BSREDigitalSignature) error
	GetSignaturesByDocketID(docketID uuid.UUID) ([]BSREDigitalSignature, error)
}

type executiveDocketRepository struct {
	db *gorm.DB
}

func NewExecutiveDocketRepository(db *gorm.DB) ExecutiveDocketRepository {
	return &executiveDocketRepository{db: db}
}

func (r *executiveDocketRepository) FindAll(search string) ([]ExecutiveDocket, error) {
	var list []ExecutiveDocket
	query := r.db.Preload("Request").Preload("PO.Supplier").Order("created_at desc")

	if search != "" {
		query = query.Where("docket_number ILIKE ?", "%"+search+"%")
	}

	if err := query.Find(&list).Error; err != nil {
		return nil, err
	}
	return list, nil
}

func (r *executiveDocketRepository) GetByID(id uuid.UUID) (*ExecutiveDocket, error) {
	var item ExecutiveDocket
	if err := r.db.Preload("Request").Preload("PO.Supplier").First(&item, "id = ?", id).Error; err != nil {
		return nil, err
	}
	return &item, nil
}

func (r *executiveDocketRepository) GetByRequestID(requestID uuid.UUID) (*ExecutiveDocket, error) {
	var item ExecutiveDocket
	if err := r.db.Preload("Request").Preload("PO.Supplier").First(&item, "request_id = ?", requestID).Error; err != nil {
		return nil, err
	}
	return &item, nil
}

func (r *executiveDocketRepository) Create(docket *ExecutiveDocket) error {
	return r.db.Create(docket).Error
}

func (r *executiveDocketRepository) Update(docket *ExecutiveDocket) error {
	return r.db.Save(docket).Error
}

func (r *executiveDocketRepository) Delete(id uuid.UUID, deletedBy *uuid.UUID) error {
	if deletedBy != nil {
		r.db.Model(&ExecutiveDocket{}).Where("id = ?", id).Update("deleted_by", *deletedBy)
	}
	return r.db.Delete(&ExecutiveDocket{}, "id = ?", id).Error
}

func (r *executiveDocketRepository) GenerateDocketNumber() (string, error) {
	var count int64
	year := time.Now().Year()
	r.db.Model(&ExecutiveDocket{}).Count(&count)
	return fmt.Sprintf("%04d/DOCKET/600/UPMT/%d", count+1, year), nil
}

func (r *executiveDocketRepository) CreateSignature(sig *BSREDigitalSignature) error {
	return r.db.Create(sig).Error
}

func (r *executiveDocketRepository) GetSignaturesByDocketID(docketID uuid.UUID) ([]BSREDigitalSignature, error) {
	var list []BSREDigitalSignature
	if err := r.db.Preload("Signer").Where("docket_id = ?", docketID).Order("created_at desc").Find(&list).Error; err != nil {
		return nil, err
	}
	return list, nil
}

