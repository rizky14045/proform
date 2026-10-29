package report

import (
	"net/http"
	"time"
	"template/helper"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type ReportHandler struct {
	service ReportService
}

func NewReportHandler(service ReportService) *ReportHandler {
	return &ReportHandler{service: service}
}

func (h *ReportHandler) RevisionLogs(c *gin.Context) {
	module := c.Query("module")
	search := c.Query("search")
	dateFromStr := c.Query("date_from")
	dateToStr := c.Query("date_to")

	var dateFrom, dateTo *time.Time
	if dateFromStr != "" {
		if t, err := time.Parse("2006-01-02", dateFromStr); err == nil {
			dateFrom = &t
		}
	}
	if dateToStr != "" {
		if t, err := time.Parse("2006-01-02", dateToStr); err == nil {
			dateTo = &t
		}
	}

	logs, err := h.service.GetRevisionLogs(module, dateFrom, dateTo, search)
	if err != nil {
		helper.JsonResponse(c, false, "Gagal mengambil laporan revisi", nil, err.Error(), http.StatusInternalServerError)
		return
	}
	helper.JsonResponse(c, true, "Laporan revisi berhasil diambil", logs, nil, http.StatusOK)
}

func (h *ReportHandler) CreateRevisionLog(c *gin.Context) {
	var req RevisionLog
	if err := c.ShouldBindJSON(&req); err != nil {
		helper.JsonResponse(c, false, "Input tidak valid", nil, err.Error(), http.StatusBadRequest)
		return
	}

	res, err := h.service.AddRevisionLog(&req)
	if err != nil {
		helper.JsonResponse(c, false, "Gagal mencatat log revisi", nil, err.Error(), http.StatusInternalServerError)
		return
	}
	helper.JsonResponse(c, true, "Log revisi berhasil disimpan", res, nil, http.StatusCreated)
}

func (h *ReportHandler) ArchiveDocuments(c *gin.Context) {
	requestNumber := c.Query("request_number")
	docs, err := h.service.GetArchiveDocuments(requestNumber)
	if err != nil {
		helper.JsonResponse(c, false, "Gagal mengambil arsip berkas", nil, err.Error(), http.StatusInternalServerError)
		return
	}
	helper.JsonResponse(c, true, "Arsip berkas berhasil diambil", docs, nil, http.StatusOK)
}

func (h *ReportHandler) CreateArchiveDocument(c *gin.Context) {
	var req ArchiveDocument
	if err := c.ShouldBindJSON(&req); err != nil {
		helper.JsonResponse(c, false, "Input tidak valid", nil, err.Error(), http.StatusBadRequest)
		return
	}

	if rawID, exists := c.Get("user_id"); exists {
		if uid, ok := rawID.(uuid.UUID); ok {
			req.UploadedByID = &uid
		}
	}

	res, err := h.service.AddArchiveDocument(&req)
	if err != nil {
		helper.JsonResponse(c, false, "Gagal menyimpan arsip berkas", nil, err.Error(), http.StatusInternalServerError)
		return
	}
	helper.JsonResponse(c, true, "Berkas berhasil diarsipkan", res, nil, http.StatusCreated)
}

func (h *ReportHandler) DeleteArchiveDocument(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		helper.JsonResponse(c, false, "ID berkas tidak valid", nil, err.Error(), http.StatusBadRequest)
		return
	}

	if err := h.service.DeleteArchiveDocument(id); err != nil {
		helper.JsonResponse(c, false, "Gagal menghapus berkas arsip", nil, err.Error(), http.StatusInternalServerError)
		return
	}
	helper.JsonResponse(c, true, "Berkas arsip berhasil dihapus", nil, nil, http.StatusOK)
}

