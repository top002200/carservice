// AdminData.ts
import { HeadingData } from './IHeading';
import { UserData } from './IUser';

export interface AdminData {
  admin_id: string;        // รหัสประจำตัวของผู้ดูแล
  admin_name: string;      // ชื่อของผู้ดูแล
  email: string;           // อีเมลที่ใช้สำหรับเข้าสู่ระบบ
  phone_number: string;    // หมายเลขโทรศัพท์ของผู้ดูแล
  password: string;        // รหัสผ่าน (ควรจัดการด้วยความระมัดระวัง)
  profile_pic: string;     // URL ของรูปโปรไฟล์
  headings: HeadingData[]; // รายการหัวข้อที่ผู้ดูแลเกี่ยวข้อง
  users: UserData[];      // รายการผู้ใช้ที่ผู้ดูแลเกี่ยวข้อง
}
