package owner_estimate

import (
	"net/http"
	"template/helper"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type OwnerEstimateHandler struct {
	service OwnerEstimateService
}

func NewOwnerEstimateHandler(service OwnerEstimateService) *OwnerEstimateHandler {
	return &OwnerEstimateHandler{service: service}
}

// HPS Handlers
func (h *OwnerEstimateHandler) IndexHPS(c *gin.Context) {
	search := c.Query("search")
	status := c.Query("status")

	list, err := h.service.FindAllHPS(search, status)
	if err != nil {
		helper.JsonResponse(c, false, "Failed to retrieve HPS records", nil, err.Error(), http.StatusInternalServerError)
		return
	}
	helper.JsonResponse(c, true, "HPS records retrieved successfully", list, nil, http.StatusOK)
}

func (h *OwnerEstimateHandler) ShowHPS(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		helper.JsonResponse(c, false, "Invalid ID", nil, err.Error(), http.StatusBadRequest)
		return
	}

	item, err := h.service.GetHPSByID(id)
	if err != nil {
		helper.JsonResponse(c, false, "HPS record not found", nil, err.Error(), http.StatusNotFound)
		return
	}
	helper.JsonResponse(c, true, "HPS record retrieved successfully", item, nil, http.StatusOK)
}

func (h *OwnerEstimateHandler) CreateHPS(c *gin.Context) {
	var userID *uuid.UUID
	if rawID, exists := c.Get("user_id"); exists {
		if uid, ok := rawID.(uuid.UUID); ok {
			userID = &uid
		}
	}

	var req OwnerEstimateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		helper.JsonResponse(c, false, "Validation failed", nil, err.Error(), http.StatusBadRequest)
		return
	}

	created, err := h.service.CreateHPS(userID, req)
	if err != nil {
		helper.JsonResponse(c, false, err.Error(), nil, err.Error(), http.StatusBadRequest)
		return
	}
	helper.JsonResponse(c, true, "HPS created successfully", created, nil, http.StatusCreated)
}

func (h *OwnerEstimateHandler) UpdateHPS(c *gin.Context) {
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

	var req OwnerEstimateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		helper.JsonResponse(c, false, "Validation failed", nil, err.Error(), http.StatusBadRequest)
		return
	}

	updated, err := h.service.UpdateHPS(id, userID, req)
	if err != nil {
		helper.JsonResponse(c, false, err.Error(), nil, err.Error(), http.StatusBadRequest)
		return
	}
	helper.JsonResponse(c, true, "HPS updated successfully", updated, nil, http.StatusOK)
}

func (h *OwnerEstimateHandler) DestroyHPS(c *gin.Context) {
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

	if err := h.service.DeleteHPS(id, userID); err != nil {
		helper.JsonResponse(c, false, "Failed to delete HPS", nil, err.Error(), http.StatusInternalServerError)
		return
	}
	helper.JsonResponse(c, true, "HPS deleted successfully", nil, nil, http.StatusOK)
}

// Tender Events Handlers
func (h *OwnerEstimateHandler) IndexTenderEvents(c *gin.Context) {
	eventType := c.Query("event_type")
	var reqID *uuid.UUID
	if r := c.Query("request_id"); r != "" {
		if p, err := uuid.Parse(r); err == nil {
			reqID = &p
		}
	}

	list, err := h.service.FindAllTenderEvents(reqID, eventType)
	if err != nil {
		helper.JsonResponse(c, false, "Failed to retrieve tender events", nil, err.Error(), http.StatusInternalServerError)
		return
	}
	helper.JsonResponse(c, true, "Tender events retrieved successfully", list, nil, http.StatusOK)
}

func (h *OwnerEstimateHandler) ShowTenderEvent(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		helper.JsonResponse(c, false, "Invalid ID", nil, err.Error(), http.StatusBadRequest)
		return
	}

	item, err := h.service.GetTenderEventByID(id)
	if err != nil {
		helper.JsonResponse(c, false, "Tender event not found", nil, err.Error(), http.StatusNotFound)
		return
	}
	helper.JsonResponse(c, true, "Tender event retrieved successfully", item, nil, http.StatusOK)
}

func (h *OwnerEstimateHandler) CreateTenderEvent(c *gin.Context) {
	var userID *uuid.UUID
	if rawID, exists := c.Get("user_id"); exists {
		if uid, ok := rawID.(uuid.UUID); ok {
			userID = &uid
		}
	}

	var req TenderEventRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		helper.JsonResponse(c, false, "Validation failed", nil, err.Error(), http.StatusBadRequest)
		return
	}

	created, err := h.service.CreateTenderEvent(userID, req)
	if err != nil {
		helper.JsonResponse(c, false, err.Error(), nil, err.Error(), http.StatusBadRequest)
		return
	}
	helper.JsonResponse(c, true, "Tender event created successfully", created, nil, http.StatusCreated)
}

func (h *OwnerEstimateHandler) UpdateTenderEvent(c *gin.Context) {
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

	var req TenderEventRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		helper.JsonResponse(c, false, "Validation failed", nil, err.Error(), http.StatusBadRequest)
		return
	}

	updated, err := h.service.UpdateTenderEvent(id, userID, req)
	if err != nil {
		helper.JsonResponse(c, false, err.Error(), nil, err.Error(), http.StatusBadRequest)
		return
	}
	helper.JsonResponse(c, true, "Tender event updated successfully", updated, nil, http.StatusOK)
}

func (h *OwnerEstimateHandler) DestroyTenderEvent(c *gin.Context) {
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

	if err := h.service.DeleteTenderEvent(id, userID); err != nil {
		helper.JsonResponse(c, false, "Failed to delete tender event", nil, err.Error(), http.StatusInternalServerError)
		return
	}
	helper.JsonResponse(c, true, "Tender event deleted successfully", nil, nil, http.StatusOK)
}
