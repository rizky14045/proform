package master_document

import (
	"net/http"
	"template/helper"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type MasterDocumentHandler struct {
	service MasterDocumentService
}

func NewMasterDocumentHandler(service MasterDocumentService) *MasterDocumentHandler {
	return &MasterDocumentHandler{service: service}
}

func (h *MasterDocumentHandler) Index(c *gin.Context) {
	search := c.Query("search")
	status := c.Query("status")
	page, limit, _ := helper.GetPaginationParams(c)

	items, total, err := h.service.GetAllPaginated(search, status, page, limit)
	if err != nil {
		helper.JsonResponse(c, false, "Gagal mengambil data template dokumen", nil, err.Error(), http.StatusInternalServerError)
		return
	}
	pagination := helper.BuildPagination(page, limit, total)
	helper.JsonPaginatedResponse(c, true, "Data template dokumen berhasil diambil", items, pagination, nil, http.StatusOK)
}

func (h *MasterDocumentHandler) Show(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		helper.JsonResponse(c, false, "ID tidak valid", nil, err.Error(), http.StatusBadRequest)
		return
	}

	item, err := h.service.GetByID(id)
	if err != nil {
		helper.JsonResponse(c, false, "Data template dokumen tidak ditemukan", nil, err.Error(), http.StatusNotFound)
		return
	}
	helper.JsonResponse(c, true, "Data template dokumen berhasil diambil", item, nil, http.StatusOK)
}

func (h *MasterDocumentHandler) Create(c *gin.Context) {
	var userID *uuid.UUID
	if rawID, exists := c.Get("user_id"); exists {
		if uid, ok := rawID.(uuid.UUID); ok {
			userID = &uid
		}
	}

	var req MasterDocument
	if err := c.ShouldBindJSON(&req); err != nil {
		helper.JsonResponse(c, false, "Input data tidak valid", nil, err.Error(), http.StatusBadRequest)
		return
	}

	res, err := h.service.Create(&req, userID)
	if err != nil {
		helper.JsonResponse(c, false, "Gagal membuat template dokumen", nil, err.Error(), http.StatusInternalServerError)
		return
	}
	helper.JsonResponse(c, true, "Template dokumen berhasil disimpan", res, nil, http.StatusCreated)
}

func (h *MasterDocumentHandler) Update(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		helper.JsonResponse(c, false, "ID tidak valid", nil, err.Error(), http.StatusBadRequest)
		return
	}

	var userID *uuid.UUID
	if rawID, exists := c.Get("user_id"); exists {
		if uid, ok := rawID.(uuid.UUID); ok {
			userID = &uid
		}
	}

	var req MasterDocument
	if err := c.ShouldBindJSON(&req); err != nil {
		helper.JsonResponse(c, false, "Input data tidak valid", nil, err.Error(), http.StatusBadRequest)
		return
	}

	res, err := h.service.Update(id, &req, userID)
	if err != nil {
		helper.JsonResponse(c, false, "Gagal memperbarui template dokumen", nil, err.Error(), http.StatusInternalServerError)
		return
	}
	helper.JsonResponse(c, true, "Template dokumen berhasil diperbarui", res, nil, http.StatusOK)
}

func (h *MasterDocumentHandler) Delete(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		helper.JsonResponse(c, false, "ID tidak valid", nil, err.Error(), http.StatusBadRequest)
		return
	}

	var userID *uuid.UUID
	if rawID, exists := c.Get("user_id"); exists {
		if uid, ok := rawID.(uuid.UUID); ok {
			userID = &uid
		}
	}

	if err := h.service.Delete(id, userID); err != nil {
		helper.JsonResponse(c, false, "Gagal menghapus template dokumen", nil, err.Error(), http.StatusInternalServerError)
		return
	}
	helper.JsonResponse(c, true, "Template dokumen berhasil dihapus", nil, nil, http.StatusOK)
}

