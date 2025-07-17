package models

type User struct {
	UserID      string       `gorm:"primaryKey" json:"user_id"`
	UserName    string       `json:"user_name"`
	Email       string       `gorm:"unique" json:"email"`
	PhoneNumber string       `json:"phone_number"`
	Password    string       `json:"password"`
	Checkbox    bool         `json:"checkbox"`

	// ความสัมพันธ์กับ Admins และ Submissions เดิม
	Admins      []Admin      `gorm:"many2many:user_admin" json:"admins"`
	Submissions []Submission `gorm:"foreignKey:UserID" json:"submissions"`

	// เพิ่มความสัมพันธ์กับบิลที่ผู้ใช้สร้าง
	CreatedBills []Bill `gorm:"foreignKey:CreatedBy" json:"created_bills"`
}
