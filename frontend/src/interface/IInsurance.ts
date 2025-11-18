export interface InsurancePolicy {
    // ------------------------------------
    // General Information (ข้อมูลทั่วไป)
    // ------------------------------------
    /** วันที่รับแจ้ง */
    claim_date: string;
    /** เลขที่รับแจ้ง (Unique) */
    claim_number: string;
    /** ชื่อผู้เอาประกัน */
    insured_name: string;
    /** ที่อยู่ */
    address: string;
    /** ประเภทการประกันภัย4 */
    policy_type: string;
    /** เลขที่บิล */
    bill_number: string;

    // ------------------------------------
    // Premium & Tax (เบี้ยประกันและภาษี)
    // ------------------------------------
    /** เบี้ยประกันเต็มปี */
    full_year_premium: number;
    /** อากร (มีหรือไม่มีก็ได้) */
    duty_stamp: number | null;
    /** ภาษีมูลค่าเพิ่ม */
    vat: number;

    // ------------------------------------
    // Vehicle Details (ข้อมูลรถ)
    // ------------------------------------
    /** รหัส */
    vehicle_code: string;
    /** ยี่ห้อรถ */
    make: string;
    /** เลขทะเบียน */
    registration_number: string;
    /** เลขตัวถัง */
    chassis_number: string;
    /** ปีรุ่น */
    model_year: number;
    /** แบบตัวถัง */
    body_type: string;
    /** ขนาด (เครื่องยนต์) */
    engine_size: string;
    /** ที่นั่ง */
    seating_capacity: number;
    /** น้ำหนัก */
    weight: number;
    /** เริ่มต้นวันที่ */
    start_date: string;

    // ------------------------------------
    // Liability Coverage (ความคุ้มครองความรับผิดต่อบุคคลภายนอก)
    // ------------------------------------
    /** ความเสียหายต่อชีวิตต่อคน */
    liability_life_per_person: number;
    /** ความเสียหายต่อชีวิตต่อครั้ง */
    liability_life_per_occur: number;
    /** ความเสียหายต่อทรัพย์สิน */
    liability_property: number;

    // ------------------------------------
    // Own Damage & Loss Coverage (ความเสียหายต่อตัวรถและสูญหาย/ไฟไหม้)
    // ------------------------------------
    /** ความเสียหายต่อตัวรถ */
    own_damage_amount: number;
    /** ความเสียหายต่อส่วนแรก2.1 (Deductible 1) */
    own_damage_deductible: number | null;
    /** ความเสียหายต่อส่วนแรก2.3 (Deductible 2) */
    own_damage_deductible2: number | null;
    /** รถยนต์สูญหายไฟไหม้ */
    theft_fire_amount: number;
    /** ความคุ้มครองเฉพาะภัย */
    specific_perils_covered: string;

    // ------------------------------------
    // Personal Accident (PA) (รย.1.1 และ รย.1.2)
    // ------------------------------------
    /** รย1.1ผู้ขับขี่ */
    pa_driver_amount: number;
    /** รย1.1ผู้โดยสาร */
    pa_passenger_amount: number;
    /** รย1.1ผู้โดยสารต่อคน */
    pa_passenger_per_person: number;
    /** รย1.2ผู้ขับขี่ต่อสัปดาห์ */
    pa_weekly_driver_amount: number;
    /** รย1.2ผู้โดยสารคน (จำนวนคน) */
    pa_weekly_passenger_count: number;
    /** รย1.2ผู้โดยสารต่อสัปดาห์ (จำนวนเงิน) */
    pa_weekly_passenger_per_week: number;

    // ------------------------------------
    // Medical Expenses & Bail Bond (รย.02 และ รย.03)
    // ------------------------------------
    /** รย.02 รักษาพยาบาล (ยอดรวม) */
    medical_expense_total: number;
    /** รย.02 รักษาพยาบาลต่อคน */
    medical_expense_per_person: number;
    /** รย.03 ประกันตัว */
    bail_bond_amount: number;

    // ----------------------------------------------------
    // ✅ เพิ่ม Index Signature เพื่อป้องกัน Error ในกรณีที่มีการเข้าถึง property ที่ไม่ได้ระบุไว้
    // ----------------------------------------------------
    [key: string]: any; 
}