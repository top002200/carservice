package main

import (
	"os"

	"github.com/top002200/carservice/config"
	"github.com/top002200/carservice/controllers"
	"github.com/top002200/carservice/middlewares"

	"github.com/gin-gonic/gin"
)

func main() {
	// สร้าง Gin router
	r := gin.Default()

	// ตั้งค่าการเชื่อมต่อกับฐานข้อมูล
	config.InitDatabase()

	// ใช้ CORS middleware
	r.Use(CORSMiddleware())

	// ✅ endpoint โหลดไฟล์ฐานข้อมูล (debug เท่านั้น!)
	// ใช้ token ใน query string เช่น /download-db?token=secret123
	r.GET("/download-db", func(c *gin.Context) {
		token := c.Query("token")
		if token != "secret123" {
			c.JSON(401, gin.H{"error": "unauthorized"})
			return
		}

		// อ่าน path ของ DB จาก Environment (Render ตั้งไว้แล้วเป็น /var/data/test.db)
		dbPath := os.Getenv("DATABASE_PATH")
		if dbPath == "" {
			dbPath = "./test.db" // fallback
		}

		// บังคับให้ไฟล์ถูกดาวน์โหลดด้วยชื่อ test.db
		c.Header("Content-Description", "File Transfer")
		c.Header("Content-Transfer-Encoding", "binary")
		c.Header("Content-Disposition", "attachment; filename=test.db")
		c.Header("Content-Type", "application/octet-stream")

		c.File(dbPath)
	})

	// Public routes
	publicRoutes := r.Group("/")
	{
		publicRoutes.POST("/login", controllers.Login)
	}

	// Protected routes (ต้องมี AuthMiddleware)
	protectedRoutes := r.Group("/")
	protectedRoutes.Use(middlewares.AuthMiddleware())
	{
		// Admin routes
		protectedRoutes.POST("/admin", controllers.CreateAdmin)
		protectedRoutes.GET("/admin/:id", controllers.GetAdminByID)
		protectedRoutes.GET("/admins", controllers.GetAllAdmins)
		protectedRoutes.PUT("/admin/:id", controllers.UpdateAdmin)
		protectedRoutes.DELETE("/admin/:id", controllers.DeleteAdmin)

		// User routes
		protectedRoutes.POST("/user", controllers.CreateUser)
		protectedRoutes.GET("/user/:id", controllers.GetUserByID)
		protectedRoutes.GET("/users", controllers.GetAllUsers)
		protectedRoutes.PUT("/user/:id", controllers.UpdateUser)
		protectedRoutes.DELETE("/user/:id", controllers.DeleteUser)

		// Heading routes
		protectedRoutes.POST("/heading", controllers.CreateHeading)
		protectedRoutes.GET("/heading/:id", controllers.GetHeadingByID)
		protectedRoutes.GET("/headings", controllers.GetAllHeadings)
		protectedRoutes.PUT("/heading/:id", controllers.UpdateHeading)
		protectedRoutes.DELETE("/heading/:id", controllers.DeleteHeading)

		// Submission routes
		protectedRoutes.POST("/submission", controllers.CreateSubmission)
		protectedRoutes.GET("/submission/:id", controllers.GetSubmissionByID)
		protectedRoutes.GET("/submissions", controllers.GetAllSubmissions)
		protectedRoutes.PUT("/submission/:id", controllers.UpdateSubmission)
		protectedRoutes.DELETE("/submission/:id", controllers.DeleteSubmission)

		// Bill routes
		protectedRoutes.POST("/bill", controllers.CreateBill)
		protectedRoutes.GET("/bill/:id", controllers.GetBillByID) // ✅ ให้ตรงกับ c.Param("id")
		protectedRoutes.GET("/bills", controllers.GetAllBills)
		protectedRoutes.PUT("/bill/:id", controllers.UpdateBill)
		protectedRoutes.DELETE("/bill/:id", controllers.DeleteBill) // ✅ เพิ่มลบ

		// ExpenseBill routes
		protectedRoutes.POST("/expensebill", controllers.CreateExpenseBill)
		protectedRoutes.GET("/expensebills", controllers.GetAllExpenseBills)
		protectedRoutes.GET("/expensebill/:id", controllers.GetExpenseBillByID)
		protectedRoutes.DELETE("/expensebill/:id", controllers.DeleteExpenseBill)
	}

	// Root endpoint
	r.GET("/", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"status":  "success",
			"message": "Backend is running",
		})
	})

	// ตรวจสอบพอร์ต
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	// รันเซิร์ฟเวอร์
	r.Run(":" + port)
}

// CORSMiddleware สำหรับตั้งค่า CORS
func CORSMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		allowedOrigins := []string{
			"http://localhost:5173",
			"https://carservice-klonghad.netlify.app",
		}

		origin := c.Request.Header.Get("Origin")
		for _, allowedOrigin := range allowedOrigins {
			if origin == allowedOrigin {
				c.Writer.Header().Set("Access-Control-Allow-Origin", origin)
				break
			}
		}

		c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, accept, origin, Cache-Control, X-Requested-With")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS, GET, PUT, PATCH, DELETE")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}

		c.Next()
	}
}
