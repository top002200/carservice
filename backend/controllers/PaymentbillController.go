package controllers

import (
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/top002200/carservice/config"
	"github.com/top002200/carservice/models"
	"gorm.io/gorm"
)

// CreateExpenseBill สร้างบิลจ่ายใหม่
func CreateExpenseBill(c *gin.Context) {
	var bill models.ExpenseBill
	if err := c.ShouldBindJSON(&bill); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"status":  "error",
			"message": "Invalid input",
			"error":   err.Error(),
		})
		return
	}

	if bill.Title == "" || bill.Amount == 0 {
		c.JSON(http.StatusBadRequest, gin.H{
			"status":  "error",
			"message": "Title and Amount are required",
		})
		return
	}

	// ตั้งเวลาวันที่ออกบิลถ้ายังไม่ระบุ
	if bill.BillDate.IsZero() {
		bill.BillDate = time.Now()
	}
	bill.CreatedAt = time.Now()
	bill.UpdatedAt = time.Now()

	if err := config.DB.Create(&bill).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"status":  "error",
			"message": "Failed to create expense bill",
			"error":   err.Error(),
		})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"status": "success",
		"data":   bill,
	})
}

// GetAllExpenseBills ดึงบิลจ่ายทั้งหมด
func GetAllExpenseBills(c *gin.Context) {
	var bills []models.ExpenseBill
	if err := config.DB.Find(&bills).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"status":  "error",
			"message": "Failed to retrieve expense bills",
			"error":   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"status": "success",
		"data":   bills,
		"count":  len(bills),
	})
}

// GetExpenseBillByID ดึงบิลจ่ายตาม ID
func GetExpenseBillByID(c *gin.Context) {
	id := c.Param("id")
	var bill models.ExpenseBill
	if err := config.DB.First(&bill, id).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{
				"status":  "error",
				"message": "Expense bill not found",
			})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{
				"status":  "error",
				"message": "Error retrieving expense bill",
				"error":   err.Error(),
			})
		}
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"status": "success",
		"data":   bill,
	})
}

// DeleteExpenseBill ลบบิลจ่ายตาม ID
func DeleteExpenseBill(c *gin.Context) {
	id := c.Param("id")
	result := config.DB.Delete(&models.ExpenseBill{}, id)

	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"status":  "error",
			"message": "Failed to delete expense bill",
			"error":   result.Error.Error(),
		})
		return
	}

	if result.RowsAffected == 0 {
		c.JSON(http.StatusNotFound, gin.H{
			"status":  "error",
			"message": "Expense bill not found",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"status":  "success",
		"message": "Expense bill deleted successfully",
	})
}
