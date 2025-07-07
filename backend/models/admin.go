// models/admin.go
package models

type Admin struct {
	AdminID     string     `gorm:"primaryKey" json:"admin_id"`
	AdminName   string     `json:"admin_name"`
	Email       string     `json:"email"`
	PhoneNumber string     `json:"phone_number"`
	Password    string     `json:"password"`
	ProfilePic  string     `json:"profile_pic"`
	Users       []User     `gorm:"many2many:user_admin" json:"users"`
	Headings    []Heading  `gorm:"foreignKey:CreatedByAdminID" json:"headings"`
}
