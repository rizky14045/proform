package structure

import (
	"net/http"
	"template/helper"

	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
	"github.com/google/uuid"
)

type StructureHandler struct {
	service StructureService
}

func NewStructureHandler(service StructureService) *StructureHandler {
	return &StructureHandler{service: service}
}

func (h *StructureHandler) Index(c *gin.Context) {
	search := c.Query("search")
	status := c.Query("status")

	structures, err := h.service.FindAll(search, status)
	if err != nil {
		helper.JsonResponse(c, false, "Failed to retrieve structures", nil, err.Error(), http.StatusInternalServerError)
		return
	}
	helper.JsonResponse(c, true, "Structures retrieved successfully", structures, nil, http.StatusOK)
}

func (h *StructureHandler) Show(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		helper.JsonResponse(c, false, "Invalid structure ID", nil, err.Error(), http.StatusBadRequest)
		return
	}

	structure, err := h.service.GetByID(id)
	if err != nil {
		helper.JsonResponse(c, false, "Structure not found", nil, err.Error(), http.StatusNotFound)
		return
	}
	helper.JsonResponse(c, true, "Structure retrieved successfully", structure, nil, http.StatusOK)
}

func (h *StructureHandler) Create(c *gin.Context) {
	var userID *uuid.UUID
	if rawID, exists := c.Get("user_id"); exists {
		if uid, ok := rawID.(uuid.UUID); ok {
			userID = &uid
		}
	}

	var req StructureRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		var errMsgs []helper.Error
		if valErrs, ok := err.(validator.ValidationErrors); ok {
			for _, e := range valErrs {
				errMsgs = append(errMsgs, helper.Error{Field: e.Field(), Message: helper.ValidationMessage(e)})
			}
		} else {
			errMsgs = append(errMsgs, helper.Error{Field: "", Message: err.Error()})
		}
		helper.JsonResponse(c, false, "Validation failed", nil, errMsgs, http.StatusBadRequest)
		return
	}

	created, err := h.service.Create(userID, req)
	if err != nil {
		helper.JsonResponse(c, false, err.Error(), nil, err.Error(), http.StatusBadRequest)
		return
	}
	helper.JsonResponse(c, true, "Structure created successfully", created, nil, http.StatusCreated)
}

func (h *StructureHandler) Update(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		helper.JsonResponse(c, false, "Invalid structure ID", nil, err.Error(), http.StatusBadRequest)
		return
	}

	var userID *uuid.UUID
	if rawID, exists := c.Get("user_id"); exists {
		if uid, ok := rawID.(uuid.UUID); ok {
			userID = &uid
		}
	}

	var req StructureRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		var errMsgs []helper.Error
		if valErrs, ok := err.(validator.ValidationErrors); ok {
			for _, e := range valErrs {
				errMsgs = append(errMsgs, helper.Error{Field: e.Field(), Message: helper.ValidationMessage(e)})
			}
		} else {
			errMsgs = append(errMsgs, helper.Error{Field: "", Message: err.Error()})
		}
		helper.JsonResponse(c, false, "Validation failed", nil, errMsgs, http.StatusBadRequest)
		return
	}

	updated, err := h.service.Update(id, userID, req)
	if err != nil {
		helper.JsonResponse(c, false, err.Error(), nil, err.Error(), http.StatusBadRequest)
		return
	}
	helper.JsonResponse(c, true, "Structure updated successfully", updated, nil, http.StatusOK)
}

func (h *StructureHandler) Destroy(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		helper.JsonResponse(c, false, "Invalid structure ID", nil, err.Error(), http.StatusBadRequest)
		return
	}

	var userID *uuid.UUID
	if rawID, exists := c.Get("user_id"); exists {
		if uid, ok := rawID.(uuid.UUID); ok {
			userID = &uid
		}
	}

	if err := h.service.Delete(id, userID); err != nil {
		helper.JsonResponse(c, false, "Failed to delete structure", nil, err.Error(), http.StatusInternalServerError)
		return
	}
	helper.JsonResponse(c, true, "Structure deleted successfully", nil, nil, http.StatusOK)
}
