package purchase_order

import (
	"net/http"
	"template/helper"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type PurchaseOrderHandler struct {
	service PurchaseOrderService
}

func NewPurchaseOrderHandler(service PurchaseOrderService) *PurchaseOrderHandler {
	return &PurchaseOrderHandler{service: service}
}

// PO Handlers
func (h *PurchaseOrderHandler) IndexPO(c *gin.Context) {
	search := c.Query("search")
	status := c.Query("status")
	page, limit, _ := helper.GetPaginationParams(c)

	list, total, err := h.service.FindAllPO(search, status, page, limit)
	if err != nil {
		helper.JsonResponse(c, false, "Failed to retrieve PO list", nil, err.Error(), http.StatusInternalServerError)
		return
	}
	pagination := helper.BuildPagination(page, limit, total)
	helper.JsonPaginatedResponse(c, true, "PO list retrieved successfully", list, pagination, nil, http.StatusOK)
}

func (h *PurchaseOrderHandler) ShowPO(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		helper.JsonResponse(c, false, "Invalid ID", nil, err.Error(), http.StatusBadRequest)
		return
	}

	item, err := h.service.GetPOByID(id)
	if err != nil {
		helper.JsonResponse(c, false, "PO not found", nil, err.Error(), http.StatusNotFound)
		return
	}
	helper.JsonResponse(c, true, "PO retrieved successfully", item, nil, http.StatusOK)
}

func (h *PurchaseOrderHandler) CreatePO(c *gin.Context) {
	var userID *uuid.UUID
	if rawID, exists := c.Get("user_id"); exists {
		if uid, ok := rawID.(uuid.UUID); ok {
			userID = &uid
		}
	}

	var req PurchaseOrderRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		helper.JsonResponse(c, false, "Validation failed", nil, err.Error(), http.StatusBadRequest)
		return
	}

	created, err := h.service.CreatePO(userID, req)
	if err != nil {
		helper.JsonResponse(c, false, err.Error(), nil, err.Error(), http.StatusBadRequest)
		return
	}
	helper.JsonResponse(c, true, "PO created successfully", created, nil, http.StatusCreated)
}

func (h *PurchaseOrderHandler) UpdatePO(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		helper.JsonResponse(c, false, "Invalid ID", nil, err.Error(), http.StatusBadRequest)
		return
	}

	var userID *uuid.UUID
	if rawID, exists := c.Get("user_id"); exists {
		if uid, ok := rawID.(uuid.UUID); ok {
			userID = &uid
		}
	}

	var req PurchaseOrderRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		helper.JsonResponse(c, false, "Validation failed", nil, err.Error(), http.StatusBadRequest)
		return
	}

	updated, err := h.service.UpdatePO(id, userID, req)
	if err != nil {
		helper.JsonResponse(c, false, err.Error(), nil, err.Error(), http.StatusBadRequest)
		return
	}
	helper.JsonResponse(c, true, "PO updated successfully", updated, nil, http.StatusOK)
}

func (h *PurchaseOrderHandler) DestroyPO(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		helper.JsonResponse(c, false, "Invalid ID", nil, err.Error(), http.StatusBadRequest)
		return
	}

	var userID *uuid.UUID
	if rawID, exists := c.Get("user_id"); exists {
		if uid, ok := rawID.(uuid.UUID); ok {
			userID = &uid
		}
	}

	if err := h.service.DeletePO(id, userID); err != nil {
		helper.JsonResponse(c, false, "Failed to delete PO", nil, err.Error(), http.StatusInternalServerError)
		return
	}
	helper.JsonResponse(c, true, "PO deleted successfully", nil, nil, http.StatusOK)
}

// BG Handlers
func (h *PurchaseOrderHandler) IndexBG(c *gin.Context) {
	search := c.Query("search")
	status := c.Query("status")

	list, err := h.service.FindAllBG(search, status)
	if err != nil {
		helper.JsonResponse(c, false, "Failed to retrieve Bank Guarantee list", nil, err.Error(), http.StatusInternalServerError)
		return
	}
	helper.JsonResponse(c, true, "Bank Guarantee list retrieved successfully", list, nil, http.StatusOK)
}

func (h *PurchaseOrderHandler) ShowBG(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		helper.JsonResponse(c, false, "Invalid ID", nil, err.Error(), http.StatusBadRequest)
		return
	}

	item, err := h.service.GetBGByID(id)
	if err != nil {
		helper.JsonResponse(c, false, "Bank Guarantee not found", nil, err.Error(), http.StatusNotFound)
		return
	}
	helper.JsonResponse(c, true, "Bank Guarantee retrieved successfully", item, nil, http.StatusOK)
}

func (h *PurchaseOrderHandler) CreateBG(c *gin.Context) {
	var userID *uuid.UUID
	if rawID, exists := c.Get("user_id"); exists {
		if uid, ok := rawID.(uuid.UUID); ok {
			userID = &uid
		}
	}

	var req BankGuaranteeRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		helper.JsonResponse(c, false, "Validation failed", nil, err.Error(), http.StatusBadRequest)
		return
	}

	created, err := h.service.CreateBG(userID, req)
	if err != nil {
		helper.JsonResponse(c, false, err.Error(), nil, err.Error(), http.StatusBadRequest)
		return
	}
	helper.JsonResponse(c, true, "Bank Guarantee created successfully", created, nil, http.StatusCreated)
}

func (h *PurchaseOrderHandler) UpdateBG(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		helper.JsonResponse(c, false, "Invalid ID", nil, err.Error(), http.StatusBadRequest)
		return
	}

	var userID *uuid.UUID
	if rawID, exists := c.Get("user_id"); exists {
		if uid, ok := rawID.(uuid.UUID); ok {
			userID = &uid
		}
	}

	var req BankGuaranteeRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		helper.JsonResponse(c, false, "Validation failed", nil, err.Error(), http.StatusBadRequest)
		return
	}

	updated, err := h.service.UpdateBG(id, userID, req)
	if err != nil {
		helper.JsonResponse(c, false, err.Error(), nil, err.Error(), http.StatusBadRequest)
		return
	}
	helper.JsonResponse(c, true, "Bank Guarantee updated successfully", updated, nil, http.StatusOK)
}

func (h *PurchaseOrderHandler) DestroyBG(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		helper.JsonResponse(c, false, "Invalid ID", nil, err.Error(), http.StatusBadRequest)
		return
	}

	var userID *uuid.UUID
	if rawID, exists := c.Get("user_id"); exists {
		if uid, ok := rawID.(uuid.UUID); ok {
			userID = &uid
		}
	}

	if err := h.service.DeleteBG(id, userID); err != nil {
		helper.JsonResponse(c, false, "Failed to delete Bank Guarantee", nil, err.Error(), http.StatusInternalServerError)
		return
	}
	helper.JsonResponse(c, true, "Bank Guarantee deleted successfully", nil, nil, http.StatusOK)
}

func (h *PurchaseOrderHandler) IndexChecklist(c *gin.Context) {
	search := c.Query("search")
	page, limit, _ := helper.GetPaginationParams(c)

	list, total, err := h.service.FindAllChecklist(search, page, limit)
	if err != nil {
		helper.JsonResponse(c, false, "Gagal mengambil data checklist supplier", nil, err.Error(), http.StatusInternalServerError)
		return
	}
	pagination := helper.BuildPagination(page, limit, total)
	helper.JsonPaginatedResponse(c, true, "Data checklist supplier berhasil diambil", list, pagination, nil, http.StatusOK)
}

func (h *PurchaseOrderHandler) CreateChecklist(c *gin.Context) {
	var req ChecklistSupplier
	if err := c.ShouldBindJSON(&req); err != nil {
		helper.JsonResponse(c, false, "Input tidak valid", nil, err.Error(), http.StatusBadRequest)
		return
	}

	if err := h.service.CreateChecklist(&req); err != nil {
		helper.JsonResponse(c, false, "Gagal menyimpan checklist supplier", nil, err.Error(), http.StatusInternalServerError)
		return
	}
	helper.JsonResponse(c, true, "Checklist supplier berhasil disimpan", req, nil, http.StatusCreated)
}

