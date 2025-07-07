package controllers

import (
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt"
	"github.com/top002200/carservice/config"
	"github.com/top002200/carservice/models"
	"golang.org/x/crypto/bcrypt"
)

// กำหนด Secret Key สำหรับการเข้ารหัส Token
var jwtSecret = []byte("your_secret_key") // เปลี่ยนเป็น Secret Key จริง

// ฟังก์ชันสำหรับเข้ารหัสรหัสผ่าน
func hashPassword(password string) (string, error) {
	bytes, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	return string(bytes), err
}

// ฟังก์ชันสำหรับตรวจสอบรหัสผ่าน
func checkPassword(hashedPassword, password string) error {
	return bcrypt.CompareHashAndPassword([]byte(hashedPassword), []byte(password))
}

// ฟังก์ชันสำหรับสร้าง JWT Token
func generateToken(userID, role string) (string, error) {
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"user_id": userID,
		"role":    role,
		"exp":     time.Now().Add(time.Hour * 24).Unix(), // Token หมดอายุใน 24 ชั่วโมง
	})
	return token.SignedString(jwtSecret)
}

// Login - Controller function สำหรับการเข้าสู่ระบบ
func Login(c *gin.Context) {
	var loginReq struct {
		Email    string `json:"email"`
		Password string `json:"password"`
	}

	if err := c.ShouldBindJSON(&loginReq); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"status": "error", "message": "Invalid input"})
		return
	}

	// ค้นหาผู้ใช้ในฐานข้อมูลตาม email
	var admin models.Admin
	var user models.User
	db := config.GetDB()

	// ตรวจสอบว่า email เป็นของ Admin หรือ User
	if err := db.Where("email = ?", loginReq.Email).First(&admin).Error; err == nil {
		// พบ email ใน Admin
		if err := checkPassword(admin.Password, loginReq.Password); err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"status": "error", "message": "Email or password incorrect"})
			return
		}
		token, err := generateToken(admin.AdminID, "admin")
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"status": "error", "message": "Failed to generate token"})
			return
		}
		c.JSON(http.StatusOK, gin.H{
			"status":  "success",
			"message": "Login successful",
			"token":   token,
			"user": gin.H{
				"id":         admin.AdminID,
				"role":       "admin",
				"email":      admin.Email,
				"name":       admin.AdminName,
				"phone":      admin.PhoneNumber,
				"profilePic": admin.ProfilePic,
			},
		})
		return
	} else if err := db.Where("email = ?", loginReq.Email).First(&user).Error; err == nil {
		// พบ email ใน User
		if err := checkPassword(user.Password, loginReq.Password); err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"status": "error", "message": "Email or password incorrect"})
			return
		}
		token, err := generateToken(user.UserID, "user")
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"status": "error", "message": "Failed to generate token"})
			return
		}
		c.JSON(http.StatusOK, gin.H{
			"status":  "success",
			"message": "Login successful",
			"token":   token,
			"user": gin.H{
				"id":    user.UserID,
				"role":  "user",
				"email": user.Email,
				"name":  user.UserName,
				"phone": user.PhoneNumber,
			},
		})
		return
	}

	// ไม่พบ email ในฐานข้อมูล
	c.JSON(http.StatusUnauthorized, gin.H{"status": "error", "message": "Email or password incorrect"})
}
