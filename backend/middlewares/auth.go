package middlewares

import (
    "net/http"
    "strings"

    "github.com/gin-gonic/gin"
    "github.com/golang-jwt/jwt"
)

var jwtSecret = []byte("your_secret_key") // ใช้ Secret Key เดียวกับที่สร้าง Token

// AuthMiddleware เป็น middleware สำหรับตรวจสอบสิทธิ์ด้วย JWT
func AuthMiddleware() gin.HandlerFunc {
    return func(c *gin.Context) {
        authHeader := c.GetHeader("Authorization")
        if authHeader == "" || !strings.HasPrefix(authHeader, "Bearer ") {
            c.JSON(http.StatusUnauthorized, gin.H{"status": "error", "message": "Unauthorized"})
            c.Abort()
            return
        }

        tokenString := strings.TrimPrefix(authHeader, "Bearer ")

        // ตรวจสอบและถอดรหัส token
        token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
            if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
                return nil, jwt.ErrSignatureInvalid
            }
            return jwtSecret, nil
        })
        if err != nil || !token.Valid {
            c.JSON(http.StatusUnauthorized, gin.H{"status": "error", "message": "Unauthorized"})
            c.Abort()
            return
        }

        c.Next()
    }
}
