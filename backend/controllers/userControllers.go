package controllers

import (
	"github.com/top002200/carservice/config"
	"github.com/top002200/carservice/models"

	"net/http"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// CreateUser - Controller สำหรับสร้างผู้ใช้ใหม่
func CreateUser(c *gin.Context) {
	var user models.User
	if err := c.ShouldBindJSON(&user); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"status": "error", "message": "Invalid input: " + err.Error()})
		return
	}

	// Check if email already exists in the database
	var existingUser models.User
	if err := config.DB.Where("email = ?", user.Email).First(&existingUser).Error; err != nil {
		if err != gorm.ErrRecordNotFound {
			// If there's another type of error, return an internal server error
			c.JSON(http.StatusInternalServerError, gin.H{"status": "error", "message": "Database error"})
			return
		}
		// If the error is ErrRecordNotFound, it means the email is available, so proceed to create the user
	} else {
		// If no error, it means the email is already in use
		c.JSON(http.StatusConflict, gin.H{"status": "error", "message": "Email already in use"})
		return
	}

	hashedPassword, err := hashPassword(user.Password)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"status": "error", "message": "Failed to hash password"})
		return
	}
	user.Password = hashedPassword

	// Save the new user to the database
	if err := config.DB.Create(&user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"status": "error", "message": "Failed to save user"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"status": "success", "message": "User created successfully", "data": user})
}

// GetUserByID - ดึงข้อมูลผู้ใช้ตาม ID
func GetUserByID(c *gin.Context) {
	userID := c.Param("id")

	var user models.User
	if err := config.DB.Preload("Admins").First(&user, "user_id = ?", userID).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"status": "error", "message": "User not found"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"status": "error", "message": "Error retrieving user details"})
		}
		return
	}

	c.JSON(http.StatusOK, gin.H{"status": "success", "data": user})
}

// GetAllUsers - ดึงข้อมูลผู้ใช้ทั้งหมดพร้อม submissions
func GetAllUsers(c *gin.Context) {
	var users []models.User
	if err := config.DB.Preload("Submissions").Find(&users).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"status": "error", "message": "Error retrieving users", "error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"status": "success", "data": users})
}

// UpdateUser - อัปเดตข้อมูลผู้ใช้
func UpdateUser(c *gin.Context) {
	userID := c.Param("id")

	var user models.User
	if err := config.DB.First(&user, "user_id = ?", userID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"status": "error", "message": "User not found"})
		return
	}

	if err := c.ShouldBindJSON(&user); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"status": "error", "message": err.Error()})
		return
	}

	// อัปเดตข้อมูล user ในฐานข้อมูล
	if err := config.DB.Save(&user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"status": "error", "message": "Failed to update user details"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"status": "success", "message": "User updated successfully", "data": user})
}

// DeleteUser - ลบผู้ใช้ตาม ID
func DeleteUser(c *gin.Context) {
	userID := c.Param("id")

	var user models.User
	if err := config.DB.First(&user, "user_id = ?", userID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"status": "error", "message": "User not found"})
		return
	}

	if err := config.DB.Delete(&user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"status": "error", "message": "Failed to delete user"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"status": "success", "message": "User deleted successfully"})
}
