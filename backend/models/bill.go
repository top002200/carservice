package models

import (
	"time"
)

type Bill struct {
	ID         uint   `gorm:"primaryKey;autoIncrement" json:"id"`
	BillNumber string `gorm:"unique;not null" json:"bill_number"`
	Username   string `json:"username"` // เปลี่ยนจาก Usern เป็น Username เพื่อความชัดเจน

	// รายการสินค้า/บริการ
	Name1   string   `json:"name1"`
	Amount1 float64  `json:"amount1"`
	Name2   string   `json:"name2"`
	Amount2 *float64 `json:"amount2,omitempty"` // ใช้ pointer เพื่อให้เป็น null ได้เมื่อไม่กรอก
	Name3   string   `json:"name3"`
	Amount3 *float64 `json:"amount3,omitempty"`
	Name4   string   `json:"name4"`
	Amount4 *float64 `json:"amount4,omitempty"`

	// ข้อมูลภาษี
	Tax1   *float64 `json:"tax1,omitempty"`
	Tax2   *float64 `json:"tax2,omitempty"`
	Tax3   *float64 `json:"tax3,omitempty"`
	Tax4   *float64 `json:"tax4,omitempty"`
	Taxgo1 *float64 `json:"taxgo1,omitempty"` // ค่าฝากต่อภาษี
	Taxgo2 *float64 `json:"taxgo2,omitempty"` // ค่าฝากต่อภาษี
	Taxgo3 *float64 `json:"taxgo3,omitempty"` // ค่าฝากต่อภาษี
	Taxgo4 *float64 `json:"taxgo4,omitempty"` // ค่าฝากต่อภาษี

	// ข้อมูลตรวจสอบ
	Check1 *float64 `json:"check1,omitempty"`
	Check2 *float64 `json:"check2,omitempty"`
	Check3 *float64 `json:"check3,omitempty"`
	Check4 *float64 `json:"check4,omitempty"`


// ส่วนเสริม
Extension1 string   `json:"extension1,omitempty"`           // ประเภทงานเสริม (เช่น N1, N2)
Extension2 *float64 `json:"extension2,omitempty"`           // จำนวนเงินงานเสริม (เปลี่ยนเป็น pointer float64)
Extension3 string   `json:"extension3,omitempty"`           // ประเภทงานเสริมตัวที่ 2
Extension4 *float64 `json:"extension4,omitempty"`           // จำนวนเงินงานเสริมตัวที่ 2 (เปลี่ยนเป็น pointer float64)

	// ข้อมูลอ้างอิง
	Refer1 string `json:"refer1,omitempty"`
	Refer2 string `json:"refer2,omitempty"`
	Refer3 string `json:"refer3,omitempty"`
	Refer4 string `json:"refer4,omitempty"`

	TypeRefer1 string `json:"typerefer1,omitempty"`
	TypeRefer2 string `json:"typerefer2,omitempty"`
	TypeRefer3 string `json:"typerefer3,omitempty"`
	TypeRefer4 string `json:"typerefer4,omitempty"`

	// ข้อมูลทะเบียนรถ
	CarRegistration1 string `json:"car_registration1,omitempty"`
	CarRegistration2 string `json:"car_registration2,omitempty"`
	CarRegistration3 string `json:"car_registration3,omitempty"`
	CarRegistration4 string `json:"car_registration4,omitempty"`

	// วิธีการชำระเงิน
	PaymentMethod string `json:"payment_method"` // cash, transfer, credit_card

	// วันที่และคำอธิบาย
	Date        time.Time `gorm:"autoCreateTime" json:"date"`
	Description string    `json:"description"`     // แก้ไขการสะกดจาก Descrition เป็น Description
	Phone       string    `json:"phone,omitempty"` // เปลี่ยนจาก float64 เป็น string

	Total 		float64 `json:"total,omitempty"`
	// Timestamps
	CreatedAt time.Time `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt time.Time `gorm:"autoUpdateTime" json:"updated_at"`
}
