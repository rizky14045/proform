package report

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type ReportRepository interface {
	FindRevisionLogs(module string, dateFrom *time.Time, dateTo *time.Time, search string) ([]RevisionLog, error)
	CreateRevisionLog(log *RevisionLog) error

	FindArchiveDocuments(requestNumber string) ([]ArchiveDocument, error)
	CreateArchiveDocument(doc *ArchiveDocument) error
	DeleteArchiveDocument(id uuid.UUID) error
}

type reportRepository struct {
	db *gorm.DB
}

func NewReportRepository(db *gorm.DB) ReportRepository {
	return &reportRepository{db: db}
}

func (r *reportRepository) FindRevisionLogs(module string, dateFrom *time.Time, dateTo *time.Time, search string) ([]RevisionLog, error) {
	var logs []RevisionLog
	query := r.db.Order("revision_date desc")

	if module != "" && module != "ALL" {
		query = query.Where("form_type ILIKE ?", "%"+module+"%")
	}
	if dateFrom != nil {
		query = query.Where("revision_date >= ?", *dateFrom)
	}
	if dateTo != nil {
		query = query.Where("revision_date <= ?", *dateTo)
	}
	if search != "" {
		query = query.Where("form_number ILIKE ? OR staff_name ILIKE ? OR notes ILIKE ?", "%"+search+"%", "%"+search+"%", "%"+search+"%")
	}

	if err := query.Find(&logs).Error; err != nil {
		return nil, err
	}
	return logs, nil
}

func (r *reportRepository) CreateRevisionLog(log *RevisionLog) error {
	return r.db.Create(log).Error
}

func (r *reportRepository) FindArchiveDocuments(requestNumber string) ([]ArchiveDocument, error) {
	var docs []ArchiveDocument
	query := r.db.Order("created_at desc")
	if requestNumber != "" {
		query = query.Where("request_number = ?", requestNumber)
	}
	if err := query.Find(&docs).Error; err != nil {
		return nil, err
	}
	return docs, nil
}

func (r *reportRepository) CreateArchiveDocument(doc *ArchiveDocument) error {
	return r.db.Create(doc).Error
}

func (r *reportRepository) DeleteArchiveDocument(id uuid.UUID) error {
	return r.db.Delete(&ArchiveDocument{}, "id = ?", id).Error
}

