package stock_code

import (
	"net/http"
	"template/helper"

	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
	"github.com/google/uuid"
)

type StockCodeHandler struct {
	service StockCodeService
}

func NewStockCodeHandler(service StockCodeService) *StockCodeHandler {
	return &StockCodeHandler{service: service}
}

func (h *StockCodeHandler) Index(c *gin.Context) {
	search := c.Query("search")
	status := c.Query("status")

	list, err := h.service.FindAll(search, status)
	if err != nil {
		helper.JsonResponse(c, false, "Failed to retrieve stock codes", nil, err.Error(), http.StatusInternalServerError)
		return
	}
	helper.JsonResponse(c, true, "Stock codes retrieved successfully", list, nil, http.StatusOK)
}

func (h *StockCodeHandler) Show(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		helper.JsonResponse(c, false, "Invalid ID", nil, err.Error(), http.StatusBadRequest)
		return
	}

	item, err := h.service.GetByID(id)
	if err != nil {
		helper.JsonResponse(c, false, "Stock code not found", nil, err.Error(), http.StatusNotFound)
		return
	}
	helper.JsonResponse(c, true, "Stock code retrieved successfully", item, nil, http.StatusOK)
}

func (h *StockCodeHandler) Create(c *gin.Context) {
	var userID *uuid.UUID
	if rawID, exists := c.Get("user_id"); exists {
		if uid, ok := rawID.(uuid.UUID); ok {
			userID = &uid
		}
	}

	var req StockCodeRequest
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
	helper.JsonResponse(c, true, "Stock code created successfully", created, nil, http.StatusCreated)
}

func (h *StockCodeHandler) Update(c *gin.Context) {
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

	var req StockCodeRequest
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
	helper.JsonResponse(c, true, "Stock code updated successfully", updated, nil, http.StatusOK)
}

func (h *StockCodeHandler) Destroy(c *gin.Context) {
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

	if err := h.service.Delete(id, userID); err != nil {
		helper.JsonResponse(c, false, "Failed to delete stock code", nil, err.Error(), http.StatusInternalServerError)
		return
	}
	helper.JsonResponse(c, true, "Stock code deleted successfully", nil, nil, http.StatusOK)
}
