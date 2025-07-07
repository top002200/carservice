// UserData.ts
import { AdminData } from './IAdmin';
import { SubmissionData } from './ISubmission';

export interface UserData {
  user_id: string;            // รหัสประจำตัวของผู้ใช้
  user_name: string;          // ชื่อของผู้ใช้
  email: string;              // อีเมลที่ใช้สำหรับเข้าสู่ระบบ
  phone_number: string;       // หมายเลขโทรศัพท์ของผู้ใช้
  password: string;           // รหัสผ่าน (ควรจัดการด้วยความระมัดระวัง)
  admins: AdminData[];        // รายการผู้ดูแลที่ผู้ใช้นี้เกี่ยวข้อง
  submissions: SubmissionData[]; // เพิ่มฟิลด์ submissions เพื่อเก็บข้อมูลการส่งงานของผู้ใช้
}
