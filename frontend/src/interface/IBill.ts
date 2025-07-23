export interface BillData {
  id?: number;
  bill_number: string;
  username: string;

  // ผู้สร้างบิล
  created_by?: string;

  user?: {
    user_id: string;
    user_name: string;
    email: string;
    phone_number: string;
  };

  // รายการสินค้า/บริการ
  name1: string;
  amount1: number;
  name2: string;
  amount2: number | null;
  name3: string;
  amount3: number | null;
  name4: string;
  amount4: number | null;

  // ข้อมูลภาษี
  tax1: number | null;
  tax2: number | null;
  tax3: number | null;
  tax4: number | null;
  taxgo1: number | null;
  taxgo2: number | null;
  taxgo3: number | null;
  taxgo4: number | null;

  // ข้อมูลตรวจสอบ
  check1: number | null;
  check2: number | null;
  check3: number | null;
  check4: number | null;

  // ส่วนเสริม
  extension1: string;
  extension2: number | null;
  extension3: string;
  extension4: number | null;

  // ข้อมูลอ้างอิง
  refer1: string;
  refer2: string;
  refer3: string;
  refer4: string;
  typerefer1: string;
  typerefer2: string;
  typerefer3: string;
  typerefer4: string;

  // ข้อมูลทะเบียนรถ
  car_registration1: string;
  car_registration2: string;
  car_registration3: string;
  car_registration4: string;

  // วิธีการชำระเงิน
  payment_method: 'cash' | 'transfer' | 'credit_card' | string;

  // ข้อมูลเพิ่มเติม
  description: string;
  phone: string;

  // ยอดรวมทั้งหมด
  total: number;

  // วันที่
  date: string;
  created_at: string;
  updated_at: string;

  // Optional timestamps
  deleted_at?: string | null;

  // ✅ เพิ่มฟิลด์ใหม่ (Optional ทั้งหมด)
  adjustment_type?: "เพิ่ม" | "ลด";
  adjustment_note?: string;
  adjustment_amount?: number;
}
