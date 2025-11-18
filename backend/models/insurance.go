package models

import "time"

// InsurancePolicy represents an insurance policy or claim data structure.
type InsurancePolicy struct {
	// ------------------------------------
	// General Information (ข้อมูลทั่วไป)
	// ------------------------------------
	ClaimDate         time.Time `json:"claim_date"`          // วันที่รับแจ้ง
	ClaimNumber       string    `gorm:"unique;not null" json:"claim_number"` // เลขที่รับแจ้ง
	InsuredName       string    `json:"insured_name"`        // ชื่อผู้เอาประกัน
	Address           string    `json:"address"`             // ที่อยู่
	PolicyType        string    `json:"policy_type"`         // ประเภทการประกันภัย4
	BillNumber        string    `json:"bill_number"`         // เลขที่บิล

	// ------------------------------------
	// Premium & Tax (เบี้ยประกันและภาษี)
	// ------------------------------------
	FullYearPremium float64  `json:"full_year_premium"` // เบี้ยประกันเต็มปี
	DutyStamp       *float64 `json:"duty_stamp,omitempty"` // อากร (มีหรือไม่มีก็ได้)
	VAT             *float64  `json:"vat"`                 // ภาษีมูลค่าเพิ่ม

	// ------------------------------------
	// Vehicle Details (ข้อมูลรถ)
	// ------------------------------------
	VehicleCode       *string `json:"vehicle_code"`        // รหัส
	Make              *string `json:"make"`                // ยี่ห้อรถ
	RegistrationNumber *string `json:"registration_number"` // เลขทะเบียน
	ChassisNumber     *string `json:"chassis_number"`      // เลขตัวถัง
	ModelYear         *int    `json:"model_year"`          // ปีรุ่น
	BodyType          *string `json:"body_type"`           // แบบตัวถัง
	EngineSize        *string `json:"engine_size"`         // ขนาด (เครื่องยนต์)
	SeatingCapacity   *int    `json:"seating_capacity"`    // ที่นั่ง
	Weight            *float64 `json:"weight"`              // น้ำหนัก
	StartDate         *time.Time `json:"start_date"`          // เริ่มต้นวันที่

	// ------------------------------------
	// Liability Coverage (ความคุ้มครองความรับผิดต่อบุคคลภายนอก)
	// ------------------------------------
	LiabilityLifePerPerson float64 `json:"liability_life_per_person"` // ความเสียหายต่อชีวิตต่อคน
	LiabilityLifePerOccur  float64 `json:"liability_life_per_occur"`  // ความเสียหายต่อชีวิตต่อครั้ง
	LiabilityProperty      float64 `json:"liability_property"`        // ความเสียหายต่อทรัพย์สิน

	// ------------------------------------
	// Own Damage & Loss Coverage (ความเสียหายต่อตัวรถและสูญหาย/ไฟไหม้)
	// ------------------------------------
	OwnDamageAmount       float64  `json:"own_damage_amount"`         // ความเสียหายต่อตัวรถ
	OwnDamageDeductible   *float64 `json:"own_damage_deductible,omitempty"` // ความเสียหายต่อส่วนแรก2.1
	OwnDamageDeductible2  *float64 `json:"own_damage_deductible2,omitempty"`// ความเสียหายต่อส่วนแรก2.3
	TheftFireAmount       float64  `json:"theft_fire_amount"`         // รถยนต์สูญหายไฟไหม้
	SpecificPerilsCovered string   `json:"specific_perils_covered"`   // ความคุ้มครองเฉพาะภัย

	// ------------------------------------
	// Personal Accident (PA) (รย.1.1 และ รย.1.2)
	// ------------------------------------
	PA_DriverAmount           float64 `json:"pa_driver_amount"`              // รย1.1ผู้ขับขี่
	PA_PassengerAmount        float64 `json:"pa_passenger_amount"`           // รย1.1ผู้โดยสาร
	PA_PassengerPerPerson     float64 `json:"pa_passenger_per_person"`       // รย1.1ผู้โดยสารต่อคน
	PA_WeeklyDriverAmount     float64 `json:"pa_weekly_driver_amount"`       // รย1.2ผู้ขับขี่ต่อสัปดาห์
	PA_WeeklyPassengerCount   int     `json:"pa_weekly_passenger_count"`     // รย1.2ผู้โดยสารคน (จำนวนคน)
	PA_WeeklyPassengerPerWeek float64 `json:"pa_weekly_passenger_per_week"`  // รย1.2ผู้โดยสารต่อสัปดาห์ (จำนวนเงิน)

	// ------------------------------------
	// Medical Expenses & Bail Bond (รย.02 และ รย.03)
	// ------------------------------------
	MedicalExpenseTotal       float64 `json:"medical_expense_total"`       // รย.02 รักษาพยาบาล
	MedicalExpensePerPerson   float64 `json:"medical_expense_per_person"`  // รย.02 รักษาพยาบาลต่อคน
	BailBondAmount            float64 `json:"bail_bond_amount"`            // รย.03 ประกันตัว
}