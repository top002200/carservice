// HeadingData.ts
import { AdminData } from './IAdmin';

// IHeading.ts
export interface HeadingData {
  [x: string]: any;
    heading_id?: number;
    heading_name: string;
    heading_details: string;
    time_start: string;
    time_end: string;
    admins: AdminData[];
    isHidden?: boolean | number; // รองรับทั้ง boolean และ number
  }
  