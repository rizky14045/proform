package warehouse

import (
	"net/http"
	"template/helper"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type WarehouseHandler struct {
	service WarehouseService
}

func NewWarehouseHandler(service WarehouseService) *WarehouseHandler {
	return &WarehouseHandler{service: service}
}

// Receipts Handlers
func (h *WarehouseHandler) IndexReceipts(c *gin.Context) {
	search := c.Query("search")
	status := c.Query("status")
	page, limit, _ := helper.GetPaginationParams(c)

	list, total, err := h.service.FindAllReceipts(search, status, page, limit)
	if err != nil {
		helper.JsonResponse(c, false, "Failed to retrieve goods receipts", nil, err.Error(), http.StatusInternalServerError)
		return
	}
	pagination := helper.BuildPagination(page, limit, total)
	helper.JsonPaginatedResponse(c, true, "Goods receipts retrieved successfully", list, pagination, nil, http.StatusOK)
}

func (h *WarehouseHandler) ShowReceipt(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		helper.JsonResponse(c, false, "Invalid ID", nil, err.Error(), http.StatusBadRequest)
		return
	}

	item, err := h.service.GetReceiptByID(id)
	if err != nil {
		helper.JsonResponse(c, false, "Goods receipt not found", nil, err.Error(), http.StatusNotFound)
		return
	}
	helper.JsonResponse(c, true, "Goods receipt retrieved successfully", item, nil, http.StatusOK)
}

func (h *WarehouseHandler) CreateReceipt(c *gin.Context) {
	rawUserID, exists := c.Get("user_id")
	if !exists {
		helper.JsonResponse(c, false, "Unauthorized", nil, "User ID not found in context", http.StatusUnauthorized)
		return
	}
	inspectorID := rawUserID.(uuid.UUID)

	var req GoodsReceiptRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		helper.JsonResponse(c, false, "Validation failed", nil, err.Error(), http.StatusBadRequest)
		return
	}

	created, err := h.service.CreateReceipt(inspectorID, &inspectorID, req)
	if err != nil {
		helper.JsonResponse(c, false, err.Error(), nil, err.Error(), http.StatusBadRequest)
		return
	}
	helper.JsonResponse(c, true, "Goods receipt created successfully", created, nil, http.StatusCreated)
}

func (h *WarehouseHandler) UpdateReceipt(c *gin.Context) {
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

	var req GoodsReceiptRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		helper.JsonResponse(c, false, "Validation failed", nil, err.Error(), http.StatusBadRequest)
		return
	}

	updated, err := h.service.UpdateReceipt(id, userID, req)
	if err != nil {
		helper.JsonResponse(c, false, err.Error(), nil, err.Error(), http.StatusBadRequest)
		return
	}
	helper.JsonResponse(c, true, "Goods receipt updated successfully", updated, nil, http.StatusOK)
}

func (h *WarehouseHandler) DestroyReceipt(c *gin.Context) {
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

	if err := h.service.DeleteReceipt(id, userID); err != nil {
		helper.JsonResponse(c, false, "Failed to delete goods receipt", nil, err.Error(), http.StatusInternalServerError)
		return
	}
	helper.JsonResponse(c, true, "Goods receipt deleted successfully", nil, nil, http.StatusOK)
}

// Inspection Acts Handlers (BAPHB / BAST)
func (h *WarehouseHandler) IndexActs(c *gin.Context) {
	actType := c.Query("act_type")
	status := c.Query("status")
	page, limit, _ := helper.GetPaginationParams(c)

	list, total, err := h.service.FindAllActs(actType, status, page, limit)
	if err != nil {
		helper.JsonResponse(c, false, "Failed to retrieve inspection acts", nil, err.Error(), http.StatusInternalServerError)
		return
	}
	pagination := helper.BuildPagination(page, limit, total)
	helper.JsonPaginatedResponse(c, true, "Inspection acts retrieved successfully", list, pagination, nil, http.StatusOK)
}

func (h *WarehouseHandler) ShowAct(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		helper.JsonResponse(c, false, "Invalid ID", nil, err.Error(), http.StatusBadRequest)
		return
	}

	item, err := h.service.GetActByID(id)
	if err != nil {
		helper.JsonResponse(c, false, "Inspection act not found", nil, err.Error(), http.StatusNotFound)
		return
	}
	helper.JsonResponse(c, true, "Inspection act retrieved successfully", item, nil, http.StatusOK)
}

func (h *WarehouseHandler) CreateAct(c *gin.Context) {
	var userID *uuid.UUID
	if rawID, exists := c.Get("user_id"); exists {
		if uid, ok := rawID.(uuid.UUID); ok {
			userID = &uid
		}
	}

	var req InspectionActRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		helper.JsonResponse(c, false, "Validation failed", nil, err.Error(), http.StatusBadRequest)
		return
	}

	created, err := h.service.CreateAct(userID, req)
	if err != nil {
		helper.JsonResponse(c, false, err.Error(), nil, err.Error(), http.StatusBadRequest)
		return
	}
	helper.JsonResponse(c, true, "Inspection act created successfully", created, nil, http.StatusCreated)
}

func (h *WarehouseHandler) UpdateAct(c *gin.Context) {
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

	var req InspectionActRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		helper.JsonResponse(c, false, "Validation failed", nil, err.Error(), http.StatusBadRequest)
		return
	}

	updated, err := h.service.UpdateAct(id, userID, req)
	if err != nil {
		helper.JsonResponse(c, false, err.Error(), nil, err.Error(), http.StatusBadRequest)
		return
	}
	helper.JsonResponse(c, true, "Inspection act updated successfully", updated, nil, http.StatusOK)
}

func (h *WarehouseHandler) DestroyAct(c *gin.Context) {
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

	if err := h.service.DeleteAct(id, userID); err != nil {
		helper.JsonResponse(c, false, "Failed to delete inspection act", nil, err.Error(), http.StatusInternalServerError)
		return
	}
	helper.JsonResponse(c, true, "Inspection act deleted successfully", nil, nil, http.StatusOK)
}
