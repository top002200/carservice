package models

import (
	"time"
)

type Bill struct {
	ID         uint   `gorm:"primaryKey;autoIncrement" json:"id"`
	BillNumber string `gorm:"unique;not null" json:"bill_number"`
	Username   string `json:"username"`

	// เชื่อมกับพนักงานที่ออกบิล
	CreatedBy string `json:"created_by"`
	User      User   `gorm:"foreignKey:CreatedBy" json:"user"`

	// รายการสินค้า/บริการ
	Name1   string   `json:"name1"`
	Amount1 float64  `json:"amount1"`
	Name2   string   `json:"name2"`
	Amount2 *float64 `json:"amount2,omitempty"`
	Name3   string   `json:"name3"`
	Amount3 *float64 `json:"amount3,omitempty"`
	Name4   string   `json:"name4"`
	Amount4 *float64 `json:"amount4,omitempty"`

	// ข้อมูลภาษี
	Tax1   *float64 `json:"tax1,omitempty"`
	Tax2   *float64 `json:"tax2,omitempty"`
	Tax3   *float64 `json:"tax3,omitempty"`
	Tax4   *float64 `json:"tax4,omitempty"`
	Taxgo1 *float64 `json:"taxgo1,omitempty"`
	Taxgo2 *float64 `json:"taxgo2,omitempty"`
	Taxgo3 *float64 `json:"taxgo3,omitempty"`
	Taxgo4 *float64 `json:"taxgo4,omitempty"`

	// ข้อมูลตรวจสอบ
	Check1 *float64 `json:"check1,omitempty"`
	Check2 *float64 `json:"check2,omitempty"`
	Check3 *float64 `json:"check3,omitempty"`
	Check4 *float64 `json:"check4,omitempty"`

	// ส่วนเสริม
	Extension1 string   `json:"extension1,omitempty"`
	Extension2 *float64 `json:"extension2,omitempty"`
	Extension3 string   `json:"extension3,omitempty"`
	Extension4 *float64 `json:"extension4,omitempty"`

	// ข้อมูลอ้างอิง
	Refer1 string `json:"refer1,omitempty"`
	Refer2 string `json:"refer2,omitempty"`
	Refer3 string `json:"refer3,omitempty"`
	Refer4 string `json:"refer4,omitempty"`

	// แทน string ด้วย *float64
	TypeRefer1 *float64 `json:"typerefer1,omitempty"`
	TypeRefer2 *float64 `json:"typerefer2,omitempty"`
	TypeRefer3 *float64 `json:"typerefer3,omitempty"`
	TypeRefer4 *float64 `json:"typerefer4,omitempty"`

	// ข้อมูลทะเบียนรถ
	CarRegistration1 string `json:"car_registration1,omitempty"`
	CarRegistration2 string `json:"car_registration2,omitempty"`
	CarRegistration3 string `json:"car_registration3,omitempty"`
	CarRegistration4 string `json:"car_registration4,omitempty"`

	// วิธีการชำระเงิน
	PaymentMethod string `json:"payment_method"`

	// ✅ ฟิลด์ใหม่: เก็บจำนวนเงินสด และจำนวนเงินโอน (ไม่มีทศนิยม)
	CashTransfer1 int `json:"cash_transfer1,omitempty"`
	CashTransfer2 int `json:"cash_transfer2,omitempty"`

	// วันที่และคำอธิบาย
	Date        time.Time `gorm:"autoCreateTime" json:"date"`
	Description string    `json:"description"`
	Phone       string    `json:"phone,omitempty"`

	Total float64 `json:"total,omitempty"`

	// ✅ ฟิลด์ใหม่ (optional ทั้งหมด)
	AdjustmentType   *string  `json:"adjustment_type,omitempty"`
	AdjustmentNote   *string  `json:"adjustment_note,omitempty"`
	AdjustmentAmount *float64 `json:"adjustment_amount,omitempty"`

	CreatedAt time.Time `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt time.Time `gorm:"autoUpdateTime" json:"updated_at"`
}
