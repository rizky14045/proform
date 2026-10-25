package owner_estimate

import (
	"fmt"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type OwnerEstimateRepository interface {
	// HPS
	FindAllHPS(search string, status string) ([]OwnerEstimate, error)
	GetHPSByID(id uuid.UUID) (*OwnerEstimate, error)
	CreateHPS(hps *OwnerEstimate) error
	UpdateHPS(hps *OwnerEstimate) error
	DeleteHPS(id uuid.UUID, deletedBy *uuid.UUID) error
	GenerateHPSNumber() (string, error)

	// Tender Event
	FindAllTenderEvents(requestID *uuid.UUID, eventType string) ([]ProcurementTenderEvent, error)
	GetTenderEventByID(id uuid.UUID) (*ProcurementTenderEvent, error)
	CreateTenderEvent(event *ProcurementTenderEvent) error
	UpdateTenderEvent(event *ProcurementTenderEvent) error
	DeleteTenderEvent(id uuid.UUID, deletedBy *uuid.UUID) error
	GenerateEventDocNumber(eventType string) (string, error)
	ReplaceQuotations(eventID uuid.UUID, quotes []TenderVendorQuotation) error
}

type ownerEstimateRepository struct {
	db *gorm.DB
}

func NewOwnerEstimateRepository(db *gorm.DB) OwnerEstimateRepository {
	return &ownerEstimateRepository{db: db}
}

func (r *ownerEstimateRepository) FindAllHPS(search string, status string) ([]OwnerEstimate, error) {
	var list []OwnerEstimate
	query := r.db.Preload("HPE.Request").Preload("Creator").Order("created_at desc")

	if search != "" {
		query = query.Where("hps_number ILIKE ? OR notes ILIKE ?", "%"+search+"%", "%"+search+"%")
	}
	if status != "" && status != "ALL" {
		query = query.Where("status = ?", status)
	}

	if err := query.Find(&list).Error; err != nil {
		return nil, err
	}
	return list, nil
}

func (r *ownerEstimateRepository) GetHPSByID(id uuid.UUID) (*OwnerEstimate, error) {
	var item OwnerEstimate
	if err := r.db.Preload("HPE.Request.Items").Preload("Creator").First(&item, "id = ?", id).Error; err != nil {
		return nil, err
	}
	return &item, nil
}

func (r *ownerEstimateRepository) CreateHPS(hps *OwnerEstimate) error {
	return r.db.Create(hps).Error
}

func (r *ownerEstimateRepository) UpdateHPS(hps *OwnerEstimate) error {
	return r.db.Save(hps).Error
}

func (r *ownerEstimateRepository) DeleteHPS(id uuid.UUID, deletedBy *uuid.UUID) error {
	if deletedBy != nil {
		_ = r.db.Model(&OwnerEstimate{}).Where("id = ?", id).Update("deleted_by", *deletedBy).Error
	}
	return r.db.Delete(&OwnerEstimate{}, "id = ?", id).Error
}

func (r *ownerEstimateRepository) GenerateHPSNumber() (string, error) {
	var count int64
	year := time.Now().Year()
	r.db.Model(&OwnerEstimate{}).Count(&count)
	return fmt.Sprintf("%04d/HPS/600/UPMT/%d", count+1, year), nil
}

func (r *ownerEstimateRepository) FindAllTenderEvents(requestID *uuid.UUID, eventType string) ([]ProcurementTenderEvent, error) {
	var list []ProcurementTenderEvent
	query := r.db.Preload("Request").Preload("Creator").Preload("Quotations.Supplier").Order("event_date desc")

	if requestID != nil {
		query = query.Where("request_id = ?", *requestID)
	}
	if eventType != "" && eventType != "ALL" {
		query = query.Where("event_type = ?", eventType)
	}

	if err := query.Find(&list).Error; err != nil {
		return nil, err
	}
	return list, nil
}

func (r *ownerEstimateRepository) GetTenderEventByID(id uuid.UUID) (*ProcurementTenderEvent, error) {
	var item ProcurementTenderEvent
	if err := r.db.Preload("Request").Preload("Creator").Preload("Quotations.Supplier").First(&item, "id = ?", id).Error; err != nil {
		return nil, err
	}
	return &item, nil
}

func (r *ownerEstimateRepository) CreateTenderEvent(event *ProcurementTenderEvent) error {
	return r.db.Create(event).Error
}

func (r *ownerEstimateRepository) UpdateTenderEvent(event *ProcurementTenderEvent) error {
	return r.db.Save(event).Error
}

func (r *ownerEstimateRepository) DeleteTenderEvent(id uuid.UUID, deletedBy *uuid.UUID) error {
	if deletedBy != nil {
		_ = r.db.Model(&ProcurementTenderEvent{}).Where("id = ?", id).Update("deleted_by", *deletedBy).Error
		_ = r.db.Model(&TenderVendorQuotation{}).Where("tender_event_id = ?", id).Update("deleted_by", *deletedBy).Error
	}
	_ = r.db.Where("tender_event_id = ?", id).Delete(&TenderVendorQuotation{}).Error
	return r.db.Delete(&ProcurementTenderEvent{}, "id = ?", id).Error
}

func (r *ownerEstimateRepository) GenerateEventDocNumber(eventType string) (string, error) {
	var count int64
	year := time.Now().Year()
	r.db.Model(&ProcurementTenderEvent{}).Where("event_type = ?", eventType).Count(&count)
	return fmt.Sprintf("%04d/%s/600/UPMT/%d", count+1, eventType, year), nil
}

func (r *ownerEstimateRepository) ReplaceQuotations(eventID uuid.UUID, quotes []TenderVendorQuotation) error {
	return r.db.Transaction(func(tx *gorm.DB) error {
		if err := tx.Where("tender_event_id = ?", eventID).Delete(&TenderVendorQuotation{}).Error; err != nil {
			return err
		}
		if len(quotes) > 0 {
			for i := range quotes {
				quotes[i].TenderEventID = eventID
				if quotes[i].ID == uuid.Nil {
					quotes[i].ID = uuid.New()
				}
			}
			if err := tx.Create(&quotes).Error; err != nil {
				return err
			}
		}
		return nil
	})
}
