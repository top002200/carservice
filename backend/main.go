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

	// Public routes
	publicRoutes := r.Group("/")
	{
		publicRoutes.POST("/login", controllers.Login)
		// publicRoutes.POST("/signup", controllers.Signup) // หากต้องการเพิ่ม signup
	}

	// Protected routes (Routes ที่ต้องการการยืนยันตัวตน)
	protectedRoutes := r.Group("/")
	protectedRoutes.Use(middlewares.AuthMiddleware())
	{
		// Routes สำหรับ Admin
		protectedRoutes.POST("/admin", controllers.CreateAdmin)
		protectedRoutes.GET("/admin/:id", controllers.GetAdminByID)
		protectedRoutes.GET("/admins", controllers.GetAllAdmins)
		protectedRoutes.PUT("/admin/:id", controllers.UpdateAdmin)
		protectedRoutes.DELETE("/admin/:id", controllers.DeleteAdmin)

		// Routes สำหรับ User
		protectedRoutes.POST("/user", controllers.CreateUser)
		protectedRoutes.GET("/user/:id", controllers.GetUserByID)
		protectedRoutes.GET("/users", controllers.GetAllUsers)
		protectedRoutes.PUT("/user/:id", controllers.UpdateUser)
		protectedRoutes.DELETE("/user/:id", controllers.DeleteUser)

		// Routes สำหรับ Heading
		protectedRoutes.POST("/heading", controllers.CreateHeading)
		protectedRoutes.GET("/heading/:id", controllers.GetHeadingByID)
		protectedRoutes.GET("/headings", controllers.GetAllHeadings)
		protectedRoutes.PUT("/heading/:id", controllers.UpdateHeading)
		protectedRoutes.DELETE("/heading/:id", controllers.DeleteHeading)

		// Routes สำหรับ Submission
		protectedRoutes.POST("/submission", controllers.CreateSubmission)
		protectedRoutes.GET("/submission/:id", controllers.GetSubmissionByID)
		protectedRoutes.GET("/submissions", controllers.GetAllSubmissions)
		protectedRoutes.PUT("/submission/:id", controllers.UpdateSubmission)
		protectedRoutes.DELETE("/submission/:id", controllers.DeleteSubmission)

		// Routes สำหรับ Bill
		protectedRoutes.POST("/bill", controllers.CreateBill)
		protectedRoutes.GET("/bill/:bill_id", controllers.GetBillByID)
		protectedRoutes.GET("/bills", controllers.GetAllBills)
		protectedRoutes.PUT("/bill/:id", controllers.UpdateBill) // ✅ เพิ่มตรงนี้


		// ✅ Routes สำหรับ ExpenseBill (บิลจ่าย)
		protectedRoutes.POST("/expensebill", controllers.CreateExpenseBill)
		protectedRoutes.GET("/expensebills", controllers.GetAllExpenseBills)
		protectedRoutes.GET("/expensebill/:id", controllers.GetExpenseBillByID)
		protectedRoutes.DELETE("/expensebill/:id", controllers.DeleteExpenseBill)
	}

	// ตรวจสอบพอร์ตที่จะใช้ในการรันเซิร์ฟเวอร์
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	// รันเซิร์ฟเวอร์
	r.Run(":" + port)
}

// CORSMiddleware เป็น middleware ที่ใช้สำหรับการตั้งค่า CORS
func CORSMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		allowedOrigins := []string{
			"http://localhost:5173",
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
