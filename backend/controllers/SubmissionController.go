package controllers

import (
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/top002200/carservice/config"
	"github.com/top002200/carservice/models"
	"gorm.io/gorm"
)

// CreateSubmission - Controller สำหรับสร้างการส่งงานใหม่
func CreateSubmission(c *gin.Context) {
	var submission models.Submission
	if err := c.ShouldBindJSON(&submission); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"status": "error", "message": "Invalid input"})
		return
	}

	// ตั้งเวลา submitted_at เป็นเวลาปัจจุบันถ้าสถานะเป็น "ส่งแล้ว"
	if submission.Status == "ส่งแล้ว" {
		submission.SubmittedAt = time.Now()
	}

	if err := config.DB.Create(&submission).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"status": "error", "message": "Failed to create submission"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"status": "success", "data": submission})
}

// GetSubmissionByID - ดึงข้อมูล submission ตาม ID
func GetSubmissionByID(c *gin.Context) {
	submissionID := c.Param("id")

	var submission models.Submission
	if err := config.DB.First(&submission, "submission_id = ?", submissionID).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"status": "error", "message": "Submission not found"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"status": "error", "message": "Error retrieving submission details"})
		}
		return
	}

	c.JSON(http.StatusOK, gin.H{"status": "success", "data": submission})
}

// GetAllSubmissions - ดึงข้อมูล submission ทั้งหมด
func GetAllSubmissions(c *gin.Context) {
	var submissions []models.Submission
	if err := config.DB.Find(&submissions).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"status": "error", "message": "Error retrieving submissions", "error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"status": "success", "data": submissions})
}

// UpdateSubmission - อัปเดตข้อมูล submission
func UpdateSubmission(c *gin.Context) {
	submissionID := c.Param("id")

	var submission models.Submission
	if err := config.DB.First(&submission, "submission_id = ?", submissionID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"status": "error", "message": "Submission not found"})
		return
	}

	// เก็บค่าข้อมูลเดิมสำหรับการอัปเดต `submitted_at` ตามเงื่อนไข
	originalStatus := submission.Status

	if err := c.ShouldBindJSON(&submission); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"status": "error", "message": err.Error()})
		return
	}

	// อัปเดต `submitted_at` เป็นเวลาปัจจุบันถ้าสถานะเปลี่ยนเป็น "ส่งแล้ว" จากสถานะอื่น
	if submission.Status == "ส่งแล้ว" && originalStatus != "ส่งแล้ว" {
		submission.SubmittedAt = time.Now()
	}

	// อัปเดตข้อมูล submission ในฐานข้อมูล
	if err := config.DB.Save(&submission).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"status": "error", "message": "Failed to update submission details"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"status": "success", "message": "Submission updated successfully", "data": submission})
}

// DeleteSubmission - ลบ submission ตาม ID
func DeleteSubmission(c *gin.Context) {
	submissionID := c.Param("id")

	var submission models.Submission
	if err := config.DB.First(&submission, "submission_id = ?", submissionID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"status": "error", "message": "Submission not found"})
		return
	}

	if err := config.DB.Delete(&submission).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"status": "error", "message": "Failed to delete submission"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"status": "success", "message": "Submission deleted successfully"})
}
