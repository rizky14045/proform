package report

import (
	"time"

	"github.com/google/uuid"
)

type ReportService interface {
	GetRevisionLogs(module string, dateFrom *time.Time, dateTo *time.Time, search string) ([]RevisionLog, error)
	AddRevisionLog(input *RevisionLog) (*RevisionLog, error)
	GetArchiveDocuments(requestNumber string) ([]ArchiveDocument, error)
	AddArchiveDocument(input *ArchiveDocument) (*ArchiveDocument, error)
	DeleteArchiveDocument(id uuid.UUID) error
}

type reportService struct {
	repo ReportRepository
}

func NewReportService(repo ReportRepository) ReportService {
	return &reportService{repo: repo}
}

func (s *reportService) GetRevisionLogs(module string, dateFrom *time.Time, dateTo *time.Time, search string) ([]RevisionLog, error) {
	return s.repo.FindRevisionLogs(module, dateFrom, dateTo, search)
}

func (s *reportService) AddRevisionLog(input *RevisionLog) (*RevisionLog, error) {
	if err := s.repo.CreateRevisionLog(input); err != nil {
		return nil, err
	}
	return input, nil
}

func (s *reportService) GetArchiveDocuments(requestNumber string) ([]ArchiveDocument, error) {
	return s.repo.FindArchiveDocuments(requestNumber)
}

func (s *reportService) AddArchiveDocument(input *ArchiveDocument) (*ArchiveDocument, error) {
	if err := s.repo.CreateArchiveDocument(input); err != nil {
		return nil, err
	}
	return input, nil
}

func (s *reportService) DeleteArchiveDocument(id uuid.UUID) error {
	return s.repo.DeleteArchiveDocument(id)
}

