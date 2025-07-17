package controllers

import (
	"fmt"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/top002200/carservice/config"
	"github.com/top002200/carservice/models"
	"gorm.io/gorm"
)

// GenerateBillNumber generates a unique bill number
func GenerateBillNumber(db *gorm.DB) (string, error) {
	var lastBill models.Bill

	err := db.Order("id DESC").First(&lastBill).Error
	if err != nil && err != gorm.ErrRecordNotFound {
		return "", err
	}

	prefix := 1
	seq := 1

	if err == nil {
		// มีบิลล่าสุด
		var lastPrefix, lastSeq int
		fmt.Sscanf(lastBill.BillNumber, "%d/%04d", &lastPrefix, &lastSeq)

		if lastSeq < 9999 {
			prefix = lastPrefix
			seq = lastSeq + 1
		} else {
			prefix = lastPrefix + 1
			seq = 1
		}
	}

	return fmt.Sprintf("%d/%04d", prefix, seq), nil
}

// calculateTotal computes the total amount for a bill
func calculateTotal(bill *models.Bill) float64 {
	total := bill.Amount1

	// Add amounts from other items if they exist
	if bill.Amount2 != nil {
		total += *bill.Amount2
	}
	if bill.Amount3 != nil {
		total += *bill.Amount3
	}
	if bill.Amount4 != nil {
		total += *bill.Amount4
	}

	// Add taxes if they exist
	if bill.Tax1 != nil {
		total += *bill.Tax1
	}
	if bill.Tax2 != nil {
		total += *bill.Tax2
	}
	if bill.Tax3 != nil {
		total += *bill.Tax3
	}
	if bill.Tax4 != nil {
		total += *bill.Tax4
	}

	return total
}

// CreateBill creates a new bill
func CreateBill(c *gin.Context) {
	var bill models.Bill

	// ✅ ดึง user_id จาก context ที่ AuthMiddleware ใส่ไว้
	userIDVal, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"status": "error", "message": "Unauthorized: user_id missing"})
		return
	}
	userID, ok := userIDVal.(string)
	if !ok {
		c.JSON(http.StatusInternalServerError, gin.H{"status": "error", "message": "Invalid user_id format"})
		return
	}
	bill.CreatedBy = userID // ✅ บันทึกว่าใครเป็นผู้สร้างบิล

	// ✅ รับข้อมูลบิลจาก client
	if err := c.ShouldBindJSON(&bill); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"status":  "error",
			"error":   "Invalid request data",
			"details": err.Error(),
		})
		return
	}

	// ✅ ตรวจสอบ field ที่จำเป็น
	if bill.Name1 == "" || bill.Amount1 == 0 {
		c.JSON(http.StatusBadRequest, gin.H{
			"status": "error",
			"error":  "Name1 and Amount1 are required",
		})
		return
	}

	// ✅ สร้างหมายเลขบิล
	billNumber, err := GenerateBillNumber(config.DB)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"status": "error",
			"error":  "Failed to generate BillNumber: " + err.Error(),
		})
		return
	}
	bill.BillNumber = billNumber

	// ✅ คำนวณยอดรวม
	bill.Total = calculateTotal(&bill)

	// ✅ ตั้งเวลา
	bill.CreatedAt = time.Now()
	bill.UpdatedAt = time.Now()

	// ✅ ตั้งค่าดีฟอลต์ (กัน error กรณี client ไม่ส่ง field)
	if bill.Amount2 == nil {
		var zero float64 = 0
		bill.Amount2 = &zero
	}
	if bill.Tax1 == nil {
		bill.Tax1 = new(float64)
	}
	if bill.Taxgo1 == nil {
		bill.Taxgo1 = new(float64)
	}

	// ✅ บันทึกลงฐานข้อมูล
	result := config.DB.Create(&bill)
	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"status":  "error",
			"error":   "Failed to create bill",
			"details": result.Error.Error(),
		})
		return
	}

	// ✅ ตอบกลับ
	c.JSON(http.StatusCreated, gin.H{
		"status": "success",
		"data": gin.H{
			"bill_number": bill.BillNumber,
			"created_at":  bill.CreatedAt,
			"id":          bill.ID,
			"total":       bill.Total,
			"created_by":  bill.CreatedBy,
		},
	})
}

// GetBillByID retrieves a bill by ID
func GetBillByID(c *gin.Context) {
	billID := c.Param("id")

	var bill models.Bill
	if err := config.DB.First(&bill, "id = ?", billID).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{
				"status":  "error",
				"message": "Bill not found",
			})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{
				"status":  "error",
				"message": "Error retrieving bill details",
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

// GetAllBills retrieves all bills
func GetAllBills(c *gin.Context) {
	var bills []models.Bill
	if err := config.DB.Find(&bills).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"status":  "error",
			"message": "Error retrieving bills",
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

// UpdateBill updates an existing bill
func UpdateBill(c *gin.Context) {
	billID := c.Param("id")

	var existingBill models.Bill
	if err := config.DB.First(&existingBill, "id = ?", billID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"status":  "error",
			"message": "Bill not found",
		})
		return
	}

	var updateData models.Bill
	if err := c.ShouldBindJSON(&updateData); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"status":  "error",
			"message": err.Error(),
		})
		return
	}

	// Update customer information
	if updateData.Username != "" {
		existingBill.Username = updateData.Username
	}
	if updateData.Phone != "" {
		existingBill.Phone = updateData.Phone
	}

	// Update service items
	if updateData.Name1 != "" {
		existingBill.Name1 = updateData.Name1
	}
	if updateData.Amount1 != 0 {
		existingBill.Amount1 = updateData.Amount1
	}
	if updateData.Name2 != "" {
		existingBill.Name2 = updateData.Name2
	}
	if updateData.Amount2 != nil {
		existingBill.Amount2 = updateData.Amount2
	}
	if updateData.Name3 != "" {
		existingBill.Name3 = updateData.Name3
	}
	if updateData.Amount3 != nil {
		existingBill.Amount3 = updateData.Amount3
	}
	if updateData.Name4 != "" {
		existingBill.Name4 = updateData.Name4
	}
	if updateData.Amount4 != nil {
		existingBill.Amount4 = updateData.Amount4
	}

	// Update taxes
	if updateData.Tax1 != nil {
		existingBill.Tax1 = updateData.Tax1
	}
	if updateData.Tax2 != nil {
		existingBill.Tax2 = updateData.Tax2
	}
	if updateData.Tax3 != nil {
		existingBill.Tax3 = updateData.Tax3
	}
	if updateData.Tax4 != nil {
		existingBill.Tax4 = updateData.Tax4
	}
	if updateData.Taxgo1 != nil {
		existingBill.Taxgo1 = updateData.Taxgo1
	}
	if updateData.Taxgo2 != nil {
		existingBill.Taxgo2 = updateData.Taxgo2
	}
	if updateData.Taxgo3 != nil {
		existingBill.Taxgo3 = updateData.Taxgo3
	}
	if updateData.Taxgo4 != nil {
		existingBill.Taxgo4 = updateData.Taxgo4
	}

	// Update check information
	if updateData.Check1 != nil {
		existingBill.Check1 = updateData.Check1
	}
	if updateData.Check2 != nil {
		existingBill.Check2 = updateData.Check2
	}
	if updateData.Check3 != nil {
		existingBill.Check3 = updateData.Check3
	}
	if updateData.Check4 != nil {
		existingBill.Check4 = updateData.Check4
	}

	// Update extensions
	if updateData.Extension1 != "" {
		existingBill.Extension1 = updateData.Extension1
	}
	if updateData.Extension2 != nil {
		existingBill.Extension2 = updateData.Extension2
	}
	if updateData.Extension3 != "" {
		existingBill.Extension3 = updateData.Extension3
	}
	if updateData.Extension4 != nil {
		existingBill.Extension4 = updateData.Extension4
	}

	// Update references
	if updateData.Refer1 != "" {
		existingBill.Refer1 = updateData.Refer1
	}
	if updateData.Refer2 != "" {
		existingBill.Refer2 = updateData.Refer2
	}
	if updateData.Refer3 != "" {
		existingBill.Refer3 = updateData.Refer3
	}
	if updateData.Refer4 != "" {
		existingBill.Refer4 = updateData.Refer4
	}
	if updateData.TypeRefer1 != "" {
		existingBill.TypeRefer1 = updateData.TypeRefer1
	}
	if updateData.TypeRefer2 != "" {
		existingBill.TypeRefer2 = updateData.TypeRefer2
	}
	if updateData.TypeRefer3 != "" {
		existingBill.TypeRefer3 = updateData.TypeRefer3
	}
	if updateData.TypeRefer4 != "" {
		existingBill.TypeRefer4 = updateData.TypeRefer4
	}

	// Update car registrations
	if updateData.CarRegistration1 != "" {
		existingBill.CarRegistration1 = updateData.CarRegistration1
	}
	if updateData.CarRegistration2 != "" {
		existingBill.CarRegistration2 = updateData.CarRegistration2
	}
	if updateData.CarRegistration3 != "" {
		existingBill.CarRegistration3 = updateData.CarRegistration3
	}
	if updateData.CarRegistration4 != "" {
		existingBill.CarRegistration4 = updateData.CarRegistration4
	}

	// Update payment method
	if updateData.PaymentMethod != "" {
		existingBill.PaymentMethod = updateData.PaymentMethod
	}

	// Update description
	if updateData.Description != "" {
		existingBill.Description = updateData.Description
	}

	// Recalculate total after all updates
	existingBill.Total = calculateTotal(&existingBill)
	existingBill.UpdatedAt = time.Now()

	result := config.DB.Save(&existingBill)
	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"status":  "error",
			"message": "Failed to update bill",
			"error":   result.Error.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"status":  "success",
		"message": "Bill updated successfully",
		"data":    existingBill,
	})
}

// DeleteBill deletes a bill
func DeleteBill(c *gin.Context) {
	billID := c.Param("id")

	result := config.DB.Delete(&models.Bill{}, "id = ?", billID)
	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"status":  "error",
			"message": "Failed to delete bill",
			"error":   result.Error.Error(),
		})
		return
	}

	if result.RowsAffected == 0 {
		c.JSON(http.StatusNotFound, gin.H{
			"status":  "error",
			"message": "Bill not found",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"status":  "success",
		"message": "Bill deleted successfully",
	})
}
