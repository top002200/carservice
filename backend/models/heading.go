package models

import (
	"time"
)

type Heading struct {
	HeadingID        uint         `gorm:"primaryKey;autoIncrement" json:"heading_id"`
	HeadingName      string       `json:"heading_name"`
	Details          string       `json:"heading_details"`
	TimeStart        time.Time    `json:"time_start"`
	TimeEnd          time.Time    `json:"time_end"`
	CreatedByAdminID string       `json:"created_by_admin_id"`
	Submissions      []Submission `gorm:"foreignKey:HeadingID;references:HeadingID" json:"submissions"`
	IsHidden         bool         `json:"is_hidden"`
}
