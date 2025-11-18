package controllers

import (
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/top002200/carservice/config" // สมมติว่าไฟล์ config และ DB ถูกจัดการที่นี่
	"github.com/top002200/carservice/models" // ใช้ struct InsurancePolicy ที่คุณสร้างขึ้น
	"gorm.io/gorm"
)


func getFloat64Value(p *float64) float64 {
	if p == nil {
		return 0
	}
	return *p
}

// --- Controller Functions ---

// CreateInsurancePolicy handles the creation of a new insurance policy record.
func CreateInsurancePolicy(c *gin.Context) {
	var policy models.InsurancePolicy

	// 1. Bind JSON data from the request body to the struct
	if err := c.ShouldBindJSON(&policy); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"status": "error",
			"error":  "Invalid request data",
			"details": err.Error(),
		})
		return
	}

	// NOTE: ในการสร้างจริง, ควรมีการ Validate ข้อมูล,
	//       Generate BillNumber และ ClaimNumber ถ้าจำเป็น
	
	// 2. Set creation timestamp (GORM usually handles this automatically, but setting explicitly is safe)
	policy.ClaimDate = time.Now()
	// NOTE: หาก policy.ClaimNumber/BillNumber มาจาก client ต้องตรวจสอบความ unique
	
	// 3. Save the record to the database
	result := config.DB.Create(&policy)
	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"status":  "error",
			"error":   "Failed to create insurance policy",
			"details": result.Error.Error(),
		})
		return
	}

	// 4. Respond with success
	c.JSON(http.StatusCreated, gin.H{
		"status": "success",
		"message": "Insurance policy created successfully",
		"data": policy,
	})
}

// GetAllInsurancePolicies retrieves a list of all insurance policies.
func GetAllInsurancePolicies(c *gin.Context) {
	var policies []models.InsurancePolicy
	
	// 1. Fetch all records (consider pagination for large datasets)
	if err := config.DB.Find(&policies).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"status":  "error",
			"message": "Error retrieving insurance policies",
			"error":   err.Error(),
		})
		return
	}

	// 2. Respond with the list
	c.JSON(http.StatusOK, gin.H{
		"status": "success",
		"data":   policies,
		"count":  len(policies),
	})
}

// GetInsurancePolicyByID retrieves a single insurance policy by its ClaimNumber.
func GetInsurancePolicyByID(c *gin.Context) {
	claimNumber := c.Param("claim_number") // สมมติว่าใช้ ClaimNumber เป็นพารามิเตอร์

	var policy models.InsurancePolicy
	
	// 1. Find the record
	if err := config.DB.First(&policy, "claim_number = ?", claimNumber).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{
				"status":  "error",
				"message": "Insurance policy not found",
			})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{
				"status":  "error",
				"message": "Error retrieving policy details",
				"error":   err.Error(),
			})
		}
		return
	}

	// 2. Respond with the policy data
	c.JSON(http.StatusOK, gin.H{
		"status": "success",
		"data":   policy,
	})
}

// UpdateInsurancePolicy updates an existing insurance policy record.
func UpdateInsurancePolicy(c *gin.Context) {
	claimNumber := c.Param("claim_number")
	
	var existingPolicy models.InsurancePolicy
	var updateData map[string]interface{} // ใช้ map เพื่อรับการอัปเดตแบบ partial (patch/put)

	// 1. Find the existing record
	if err := config.DB.First(&existingPolicy, "claim_number = ?", claimNumber).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"status":  "error",
			"message": "Insurance policy not found",
		})
		return
	}

	// 2. Bind JSON data for update (to a map for dynamic updates)
	if err := c.ShouldBindJSON(&updateData); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"status":  "error",
			"message": "Invalid update data",
			"details": err.Error(),
		})
		return
	}

	// 3. Perform the update using map (will update only provided fields)
	// NOTE: GORM's Updates method on a map does NOT automatically set UpdatedAt
	//       ดังนั้น ควรจัดการฟิลด์ที่ต้องการอัปเดตพิเศษเอง หากใช้ Update(map)
	result := config.DB.Model(&existingPolicy).Where("claim_number = ?", claimNumber).Updates(updateData)
	
	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"status":  "error",
			"message": "Failed to update insurance policy",
			"error":   result.Error.Error(),
		})
		return
	}
	
	// 4. Reload the updated record (optional, but recommended to return fresh data)
	config.DB.First(&existingPolicy, "claim_number = ?", claimNumber)

	// 5. Respond with success
	c.JSON(http.StatusOK, gin.H{
		"status":  "success",
		"message": "Insurance policy updated successfully",
		"data":    existingPolicy,
	})
}

// DeleteInsurancePolicy deletes an insurance policy record by its ClaimNumber.
func DeleteInsurancePolicy(c *gin.Context) {
	claimNumber := c.Param("claim_number")

	// 1. Perform the soft delete (or hard delete, depending on your GORM setup)
	result := config.DB.Delete(&models.InsurancePolicy{}, "claim_number = ?", claimNumber)
	
	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"status":  "error",
			"message": "Failed to delete insurance policy",
			"error":   result.Error.Error(),
		})
		return
	}

	// 2. Check if any rows were affected
	if result.RowsAffected == 0 {
		c.JSON(http.StatusNotFound, gin.H{
			"status":  "error",
			"message": "Insurance policy not found",
		})
		return
	}

	// 3. Respond with success
	c.JSON(http.StatusOK, gin.H{
		"status":  "success",
		"message": "Insurance policy deleted successfully",
	})
}