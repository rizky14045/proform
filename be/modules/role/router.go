package role

import (
	"template/middleware"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func SetupRoutes(router *gin.RouterGroup, db *gorm.DB) {
	if err := MigrateRole(db); err != nil {
		panic("failed to migrate role table: " + err.Error())
	}

	repo := NewRoleRepository(db)
	service := NewRoleService(repo)
	handler := NewRoleHandler(service)

	register := func(app *gin.RouterGroup) {
		app.Use(middleware.JWTMiddleware())

		// Static sub-routes MUST be declared BEFORE wildcard /:id
		app.GET("/user-roles", handler.IndexUserRoles)
		app.GET("/user-roles/:id", handler.ShowUserRole)
		app.POST("/user-roles", handler.CreateUserRole)
		app.PUT("/user-roles/:id", handler.UpdateUserRole)
		app.DELETE("/user-roles/:id", handler.DeleteUserRole)

		// Base collection
		app.GET("", handler.Index)
		app.GET("/", handler.Index)
		app.POST("", handler.Create)
		app.POST("/", handler.Create)
		app.POST("/create", handler.Create)

		// Wildcards LAST
		app.GET("/:id", handler.Show)
		app.PUT("/:id", handler.Update)
		app.PATCH("/:id", handler.Update)
		app.PATCH("/update/:id", handler.Update)
		app.DELETE("/:id", handler.Destroy)
		app.DELETE("/destroy/:id", handler.Destroy)
	}

	register(router.Group("/role"))
	register(router.Group("/roles"))

	userRoleRoutes := router.Group("/user-roles")
	userRoleRoutes.Use(middleware.JWTMiddleware())
	{
		userRoleRoutes.GET("", handler.IndexUserRoles)
		userRoleRoutes.GET("/", handler.IndexUserRoles)
		userRoleRoutes.GET("/:id", handler.ShowUserRole)
		userRoleRoutes.POST("", handler.CreateUserRole)
		userRoleRoutes.POST("/", handler.CreateUserRole)
		userRoleRoutes.PUT("/:id", handler.UpdateUserRole)
		userRoleRoutes.DELETE("/:id", handler.DeleteUserRole)
	}
}

