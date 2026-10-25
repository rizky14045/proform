package middleware

import (
	"net/http"
	"strings"
	"template/config"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
)

func JWTMiddleware() gin.HandlerFunc {
	return func(context *gin.Context) {
		authHeader := context.GetHeader("Authorization")
		if authHeader == "" || !strings.HasPrefix(authHeader, "Bearer ") {
			context.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{
				"status":  false,
				"message": "Authorization header missing or invalid.",
				"data":    nil,
				"error":   "Authorization header missing or invalid",
			})
			return
		}

		tokenStr := strings.TrimPrefix(authHeader, "Bearer ")

		claims := &config.Claims{}

		token, err := jwt.ParseWithClaims(tokenStr, claims, func(token *jwt.Token) (interface{}, error) {
			return config.GetJwtKey(), nil
		}, jwt.WithValidMethods([]string{"HS256"}))

		if err != nil || !token.Valid {
			context.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{
				"status":  false,
				"message": "Invalid Token.",
				"data":    nil,
				"error":   "Invalid Token",
			})
			return
		}

		// Simpan user info ke context
		context.Set("user_id", claims.ID)
		context.Set("user_nid", claims.NID)
		context.Set("user_name", claims.Name)
		context.Set("email", claims.Email)
		context.Set("role_id", claims.RoleID)
		context.Set("role_code", claims.RoleCode)
		context.Set("role_name", claims.RoleName)
		if claims.StructureID != nil {
			context.Set("structure_id", *claims.StructureID)
		}
		context.Next()
	}
}
