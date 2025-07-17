package models

import "time"

type ExpenseBill struct {
	ID          uint      `gorm:"primaryKey;autoIncrement" json:"id"`
	Title       string    `gorm:"not null" json:"title"`        // ชื่อหัวข้อ เช่น ค่าเช่า, ค่าซ่อม
	Description string    `json:"description,omitempty"`        // รายละเอียดเพิ่มเติม
	Amount      float64   `gorm:"not null" json:"amount"`       // จำนวนเงินที่จ่าย
	BillDate    time.Time `gorm:"autoCreateTime" json:"date"`   // วันที่ออกบิล

	// Timestamp สำหรับบันทึกเวลาสร้าง/อัปเดต
	CreatedAt time.Time `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt time.Time `gorm:"autoUpdateTime" json:"updated_at"`
}
