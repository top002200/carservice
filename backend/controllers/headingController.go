package controllers

import (
	"net/http"
	"time"

	"github.com/top002200/carservice/config"
	"github.com/top002200/carservice/models"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// CreateHeading - Controller to create a new heading
// CreateHeading - Controller to create a new heading
func CreateHeading(c *gin.Context) {
	var heading models.Heading
	if err := c.ShouldBindJSON(&heading); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"status": "error", "message": err.Error()})
		return
	}

	// Set default values for time fields if not provided
	if heading.TimeStart.IsZero() {
		heading.TimeStart = time.Now()
	}
	if heading.TimeEnd.IsZero() {
		heading.TimeEnd = time.Now().Add(1 * time.Hour) // default to 1 hour after start
	}

	// Get the latest heading_id and increment it by 1
	var latestHeading models.Heading
	if err := config.DB.Order("heading_id desc").First(&latestHeading).Error; err != nil {
		// If there is an error fetching the latest heading, it means no headings exist. We start from 1.
		if err == gorm.ErrRecordNotFound {
			heading.HeadingID = 1 // Start with ID 1 if there are no existing headings.
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"status": "error", "message": "Failed to retrieve latest heading ID"})
			return
		}
	} else {
		// Increment the latest heading_id by 1 for the new heading
		heading.HeadingID = latestHeading.HeadingID + 1
	}

	// Create the new heading in the database
	if err := config.DB.Create(&heading).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"status": "error", "message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"status": "success", "message": "Heading created successfully", "data": heading})
}

// GetHeadingByID - Get a single heading by ID

func GetHeadingByID(c *gin.Context) {
	headingID := c.Param("id")

	var heading models.Heading

	if err := config.DB.First(&heading, "heading_id = ?", headingID).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"status": "error", "message": "Heading not found"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"status": "error", "message": "Error retrieving heading details"})
		}
		return
	}

	c.JSON(http.StatusOK, gin.H{"status": "success", "data": heading})
}

// GetAllHeadings - Retrieve all headings with their submissions
func GetAllHeadings(c *gin.Context) {
	var headings []models.Heading
	if err := config.DB.Preload("Submissions").Find(&headings).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"status": "error", "message": "Error retrieving headings"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"status": "success", "data": headings})
}

// UpdateHeading - Update heading details (excluding status updates)
func UpdateHeading(c *gin.Context) {
	headingID := c.Param("id")

	// Fetch the existing heading
	var heading models.Heading
	if err := config.DB.First(&heading, "heading_id = ?", headingID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"status": "error", "message": "Heading not found"})
		return
	}

	// Bind JSON input to a map to handle partial updates
	var updateData map[string]interface{}
	if err := c.ShouldBindJSON(&updateData); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"status": "error", "message": err.Error()})
		return
	}

	// Update the heading fields if they exist in the payload
	if headingName, exists := updateData["heading_name"]; exists {
		heading.HeadingName = headingName.(string)
	}
	if headingDetails, exists := updateData["heading_details"]; exists {
		heading.Details = headingDetails.(string)
	}
	if timeStart, exists := updateData["time_start"]; exists {
		// Convert the time format to time.Time (RFC3339 format)
		parsedTimeStart, err := time.Parse(time.RFC3339, timeStart.(string))
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"status": "error", "message": "Invalid time_start format"})
			return
		}
		heading.TimeStart = parsedTimeStart
	}
	if timeEnd, exists := updateData["time_end"]; exists {
		// Convert the time format to time.Time (RFC3339 format)
		parsedTimeEnd, err := time.Parse(time.RFC3339, timeEnd.(string))
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"status": "error", "message": "Invalid time_end format"})
			return
		}
		heading.TimeEnd = parsedTimeEnd
	}

	// If the 'is_hidden' value is provided, update it as well
	if isHidden, exists := updateData["is_hidden"]; exists {
		// Update 'is_hidden' based on the provided value (bool, number, or string)
		switch v := isHidden.(type) {
		case bool:
			heading.IsHidden = v
		case float64: // JSON numbers are decoded as float64
			heading.IsHidden = v != 0
		case string:
			heading.IsHidden = v == "true" || v == "1"
		default:
			c.JSON(http.StatusBadRequest, gin.H{"status": "error", "message": "Invalid value for is_hidden"})
			return
		}
	}

	// Save the updated heading
	if err := config.DB.Save(&heading).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"status": "error", "message": "Failed to update heading details"})
		return
	}

	// Respond with the updated heading data
	c.JSON(http.StatusOK, gin.H{"status": "success", "message": "Heading updated successfully", "data": heading})
}

// DeleteHeading - Delete a heading by ID
func DeleteHeading(c *gin.Context) {
	headingID := c.Param("id")

	var heading models.Heading
	if err := config.DB.First(&heading, "heading_id = ?", headingID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"status": "error", "message": "Heading not found"})
		return
	}

	if err := config.DB.Delete(&heading).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"status": "error", "message": "Failed to delete heading"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"status": "success", "message": "Heading deleted successfully"})
}
