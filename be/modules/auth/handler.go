package auth

import (
	"net/http"
	"template/helper"
	"template/modules/user"

	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
	"github.com/google/uuid"
)

type AuthHandler struct {
	service     AuthService
	userService user.UserService
}

func NewAuthHandler(service AuthService, userService user.UserService) *AuthHandler {
	return &AuthHandler{
		service:     service,
		userService: userService,
	}
}

func (h *AuthHandler) Login(c *gin.Context) {
	var req LoginRequest
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

	u, token, err := h.service.Login(req)
	if err != nil {
		helper.JsonResponse(c, false, err.Error(), nil, err.Error(), http.StatusUnauthorized)
		return
	}

	responseData := gin.H{
		"token": token,
		"user":  u,
	}

	helper.JsonResponse(c, true, "Login successful", responseData, nil, http.StatusOK)
}

func (h *AuthHandler) Profile(c *gin.Context) {
	rawUserID, exists := c.Get("user_id")
	if !exists {
		helper.JsonResponse(c, false, "Unauthorized", nil, "User ID not found in context", http.StatusUnauthorized)
		return
	}

	userID := rawUserID.(uuid.UUID)
	u, err := h.userService.GetByID(userID)
	if err != nil {
		helper.JsonResponse(c, false, "User not found", nil, err.Error(), http.StatusNotFound)
		return
	}

	helper.JsonResponse(c, true, "Profile retrieved successfully", u, nil, http.StatusOK)
}
