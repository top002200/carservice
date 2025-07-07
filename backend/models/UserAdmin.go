package models

// UserAdmin represents the join table for Users and Admins
type UserAdmin struct {
    UserID  string `gorm:"primaryKey"`
    AdminID string `gorm:"primaryKey"`
    User    User   `gorm:"foreignKey:UserID;constraint:OnDelete:CASCADE"`
    Admin   Admin  `gorm:"foreignKey:AdminID;constraint:OnDelete:CASCADE"`
}
