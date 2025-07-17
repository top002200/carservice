export interface ExpenseBillData {
  id?: number;

  // ชื่อหัวข้อ เช่น ค่าเช่า, ค่าซ่อม
  title: string;

  // รายละเอียดเพิ่มเติม
  description?: string;

  // จำนวนเงินที่จ่าย
  amount: number;

  // วันที่ออกบิล
  date?: string;

  // เวลาที่ระบบสร้างและอัปเดต
  created_at?: string;
  updated_at?: string;

  // Optional: รองรับการลบแบบ soft delete ถ้าใช้ GORM soft delete
  deleted_at?: string | null;
}
