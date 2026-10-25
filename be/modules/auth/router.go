package auth

import (
	"template/middleware"
	"template/modules/user"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func SetupRoutes(router *gin.RouterGroup, db *gorm.DB) {
	authRepo := NewAuthRepository(db)
	authService := NewAuthService(authRepo)
	userRepo := user.NewUserRepository(db)
	userService := user.NewUserService(userRepo)
	handler := NewAuthHandler(authService, userService)

	app := router.Group("/auth")
	{
		app.POST("/login", handler.Login)
		app.GET("/profile", middleware.JWTMiddleware(), handler.Profile)
	}
}
