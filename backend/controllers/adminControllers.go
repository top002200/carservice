package controllers

import (
	"net/http"

	"github.com/top002200/carservice/config"
	"github.com/top002200/carservice/models"

	"github.com/gin-gonic/gin"

	"gorm.io/gorm"
)

// ฟังก์ชันสำหรับเข้ารหัสรหัสผ่าน

// CreateAdmin - Controller to create a new admin
func CreateAdmin(c *gin.Context) {
	var admin models.Admin
	if err := c.ShouldBindJSON(&admin); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"status": "error", "message": err.Error()})
		return
	}

	// Check if the email is already in use
	if err := config.DB.Where("email = ?", admin.Email).First(&admin).Error; err == nil {
		c.JSON(http.StatusConflict, gin.H{"status": "error", "message": "Email already in use"})
		return
	}

	// เข้ารหัสรหัสผ่านก่อนบันทึก
	hashedPassword, err := hashPassword(admin.Password)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"status": "error", "message": "Failed to hash password"})
		return
	}
	admin.Password = hashedPassword

	// บันทึกข้อมูล admin ลงในฐานข้อมูล
	if err := config.DB.Create(&admin).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"status": "error", "message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"status": "success", "message": "Admin created successfully", "data": admin})
}

// GetAdminByID - Get a single admin by ID
func GetAdminByID(c *gin.Context) {
	adminID := c.Param("id")

	var admin models.Admin
	if err := config.DB.Preload("Headings").First(&admin, "admin_id = ?", adminID).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"status": "error", "message": "Admin not found"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"status": "error", "message": "Error retrieving admin details"})
		}
		return
	}

	c.JSON(http.StatusOK, gin.H{"status": "success", "data": admin})
}

// GetAllAdmins - Retrieve all admins
func GetAllAdmins(c *gin.Context) {
	var admins []models.Admin
	// Preload the associated Headings only
	if err := config.DB.Preload("Headings").Find(&admins).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"status": "error", "message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"status": "success", "data": admins})
}

// UpdateAdmin - Update admin details
func UpdateAdmin(c *gin.Context) {
	adminID := c.Param("id")

	var admin models.Admin
	if err := config.DB.First(&admin, "admin_id = ?", adminID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"status": "error", "message": "Admin not found"})
		return
	}

	if err := c.ShouldBindJSON(&admin); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"status": "error", "message": err.Error()})
		return
	}

	// Update the admin details in the database
	if err := config.DB.Save(&admin).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"status": "error", "message": "Failed to update admin details"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"status": "success", "message": "Admin updated successfully", "data": admin})
}

// DeleteAdmin - Delete an admin by ID
func DeleteAdmin(c *gin.Context) {
	adminID := c.Param("id")

	var admin models.Admin
	if err := config.DB.First(&admin, "admin_id = ?", adminID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"status": "error", "message": "Admin not found"})
		return
	}

	if err := config.DB.Delete(&admin).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"status": "error", "message": "Failed to delete admin"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"status": "success", "message": "Admin deleted successfully"})
}
