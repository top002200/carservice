package models

import (
	"time"
)

type Submission struct {
	SubmissionID uint      `gorm:"primaryKey;autoIncrement" json:"submission_id"`
	HeadingID    uint      `json:"heading_id"`      // Foreign key เชื่อมโยงกับ Heading
	UserID       string    `json:"user_id"`         // Foreign key เชื่อมโยงกับ User
	Content      string    `json:"content"`         // เนื้อหาการส่ง
	Status       string    `json:"status"`          // สถานะ เช่น "ส่งแล้ว" หรือ "ยังไม่ส่ง"
	SubmittedAt  time.Time `json:"submitted_at"`    // วันที่และเวลาที่ส่ง
}
