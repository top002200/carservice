package config

import (
	"fmt"
	"log"
	"os"

	"github.com/top002200/carservice/models"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

var DB *gorm.DB

// hashPassword เข้ารหัสรหัสผ่านด้วย bcrypt
func hashPassword(password string) (string, error) {
	bytes, err := bcrypt.GenerateFromPassword([]byte(password), 14)
	return string(bytes), err
}

// InitDatabase initializes the SQLite database connection, performs schema migrations,
// and creates the first admin if none exists
func InitDatabase() {
	var err error

	// ใช้ DATABASE_PATH environment variable หรือ default เป็น "./test.db"
	dbPath := os.Getenv("DATABASE_PATH")
	if dbPath == "" {
		dbPath = "./test.db"
	}

	// เปิด SQLite database connection
	DB, err = gorm.Open(sqlite.Open(dbPath), &gorm.Config{})
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	} else {
		log.Println("Database connection successful:", dbPath)
	}

	// Run AutoMigrate สำหรับทุก model
	err = DB.AutoMigrate(
		&models.Admin{},
		&models.User{},
		&models.Heading{},
		&models.Submission{},
		&models.UserAdmin{},
		&models.Bill{},
		&models.ExpenseBill{},
	)
	if err != nil {
		log.Fatal("Failed to migrate database schema:", err)
	}

	// สร้าง admin ตัวแรกถ้า table ว่าง
	var count int64
	DB.Model(&models.Admin{}).Count(&count)
	if count == 0 {
		password, _ := hashPassword("123456")
		admin := models.Admin{
			AdminID:   "admin_001",        // กำหนด ID เริ่มต้นเอง
			AdminName: "Admin",
			Email:     "admin@example.com",
			Password:  password,
			PhoneNumber: "",
			ProfilePic:  "",
		}
		if err := DB.Create(&admin).Error; err != nil {
			log.Println("Failed to create initial admin:", err)
		} else {
			fmt.Println("Initial admin created:", admin.Email)
		}
	}
}

// GetDB returns the database instance
func GetDB() *gorm.DB {
	return DB
}
