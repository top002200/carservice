// ISubmission.ts

export interface SubmissionData {
    submission_id?: number;
    heading_id: number;
    user_id: string; // ตรวจสอบให้แน่ใจว่าตรงกับประเภทที่ใช้
    status: "ยังไม่ส่ง" | "ส่งแล้ว";
    content: string;
    submitted_at?: string; // เพิ่มฟิลด์นี้เพื่อรองรับเวลา
}
