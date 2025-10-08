import { AdminData } from "../interface/IAdmin";
import { UserData } from "../interface/IUser"; // Assuming you have a User interface
import { HeadingData } from "../interface/IHeading";
import { SubmissionData } from "../interface/ISubmission";
import { BillData } from "../interface/IBill";
import { ExpenseBillData } from "../interface/IExpenseBill";

// const apiURL = "http://localhost:8080";
const apiURL = "https://carservice-j2jl.onrender.com";


const getAuthHeaders = () => {
  const token = sessionStorage.getItem("access_token") || "";
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};

// Admin API Functions

// Create Admin
async function createAdmin(data: AdminData) {
  try {
    const response = await fetch(`${apiURL}/admin`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });

    const res = await response.json();

    if (response.ok) {
      return { status: true, message: res.message, data: res.data };
    } else {
      return { status: false, message: res.error || "Failed to create admin" };
    }
  } catch (error: any) {
    console.error("Error creating admin:", error);
    return { status: false, message: error.message || "An error occurred" };
  }
}

// Get All Admins
async function getAllAdmins() {
  try {
    const response = await fetch(`${apiURL}/admins`, {
      method: "GET",
      headers: getAuthHeaders(),
    });

    if (response.ok) {
      const data = await response.json();
      return { status: true, data };
    } else {
      const error = await response.json();
      return {
        status: false,
        message: error.message || "Failed to fetch admins",
      };
    }
  } catch (error) {
    console.error("Error fetching admins:", error);
    return { status: false, message: "An unexpected error occurred" };
  }
}

// Get Admin by ID
async function getAdminById(adminId: string) {
  try {
    const response = await fetch(`${apiURL}/admin/${adminId}`, {
      method: "GET",
      headers: getAuthHeaders(),
    });

    if (response.ok) {
      const data = await response.json();
      return { status: true, data };
    } else {
      const error = await response.json();
      return {
        status: false,
        message: error.message || "Failed to fetch admin",
      };
    }
  } catch (error) {
    console.error("Error fetching admin by ID:", error);
    return { status: false, message: "An unexpected error occurred" };
  }
}

// Update Admin
async function updateAdmin(adminId: string, data: AdminData) {
  try {
    const response = await fetch(`${apiURL}/admin/${adminId}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });

    const res = await response.json();

    if (response.ok) {
      return { status: true, message: res.message, data: res.data };
    } else {
      return { status: false, message: res.error || "Failed to update admin" };
    }
  } catch (error: any) {
    console.error("Error updating admin:", error);
    return { status: false, message: error.message || "An error occurred" };
  }
}

// Delete Admin
async function deleteAdmin(adminId: string) {
  try {
    const response = await fetch(`${apiURL}/admin/${adminId}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });

    if (response.ok) {
      return { status: true, message: "Admin deleted successfully" };
    } else {
      const error = await response.json();
      return {
        status: false,
        message: error.message || "Failed to delete admin",
      };
    }
  } catch (error) {
    console.error("Error deleting admin:", error);
    return { status: false, message: "An unexpected error occurred" };
  }
}

// User API Functions

// Create User
async function createUser(data: UserData) {
  try {
    const response = await fetch(`${apiURL}/user`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });

    const res = await response.json();

    if (response.ok) {
      return { status: true, message: res.message, data: res.data };
    } else {
      return { status: false, message: res.error || "Failed to create user" };
    }
  } catch (error: any) {
    console.error("Error creating user:", error);
    return { status: false, message: error.message || "An error occurred" };
  }
}

// Get All Users
async function getAllUsers() {
  try {
    const response = await fetch(`${apiURL}/users`, {
      method: "GET",
      headers: getAuthHeaders(),
    });

    if (response.ok) {
      const data = await response.json();
      return { status: true, data };
    } else {
      const error = await response.json();
      return {
        status: false,
        message: error.message || "Failed to fetch users",
      };
    }
  } catch (error) {
    console.error("Error fetching users:", error);
    return { status: false, message: "An unexpected error occurred" };
  }
}

// Get User by ID
async function getUserById(userId: string) {
  try {
    const response = await fetch(`${apiURL}/user/${userId}`, {
      method: "GET",
      headers: getAuthHeaders(),
    });

    if (response.ok) {
      const data = await response.json();
      return { status: true, data };
    } else {
      const error = await response.json();
      return {
        status: false,
        message: error.message || "Failed to fetch user",
      };
    }
  } catch (error) {
    console.error("Error fetching user by ID:", error);
    return { status: false, message: "An unexpected error occurred" };
  }
}

// Update User
async function updateUser(userId: string, data: UserData) {
  try {
    const response = await fetch(`${apiURL}/user/${userId}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });

    const res = await response.json();

    if (response.ok) {
      return { status: true, message: res.message, data: res.data };
    } else {
      return { status: false, message: res.error || "Failed to update user" };
    }
  } catch (error: any) {
    console.error("Error updating user:", error);
    return { status: false, message: error.message || "An error occurred" };
  }
}

// Delete User
async function deleteUser(userId: string) {
  try {
    const response = await fetch(`${apiURL}/user/${userId}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });

    if (response.ok) {
      return { status: true, message: "User deleted successfully" };
    } else {
      const error = await response.json();
      return {
        status: false,
        message: error.message || "Failed to delete user",
      };
    }
  } catch (error) {
    console.error("Error deleting user:", error);
    return { status: false, message: "An unexpected error occurred" };
  }
}

// Heading API Functions

// Create Heading
async function createHeading(data: Omit<HeadingData, "heading_id">) {
  try {
    const response = await fetch(`${apiURL}/heading`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });

    const res = await response.json();

    if (response.ok) {
      return { status: true, message: res.message, data: res.data };
    } else {
      return {
        status: false,
        message: res.error || "Failed to create heading",
      };
    }
  } catch (error: any) {
    console.error("Error creating heading:", error);
    return { status: false, message: error.message || "An error occurred" };
  }
}

// Get All Headings
async function getAllHeadings() {
  try {
    const response = await fetch(`${apiURL}/headings`, {
      method: "GET",
      headers: getAuthHeaders(),
    });

    if (response.ok) {
      const data = await response.json();
      return { status: true, data };
    } else {
      const error = await response.json();
      return {
        status: false,
        message: error.message || "Failed to fetch headings",
      };
    }
  } catch (error) {
    console.error("Error fetching headings:", error);
    return { status: false, message: "An unexpected error occurred" };
  }
}

// Get Heading by ID
async function getHeadingById(headingId: string) {
  try {
    const response = await fetch(`${apiURL}/heading/${headingId}`, {
      method: "GET",
      headers: getAuthHeaders(),
    });

    if (response.ok) {
      const data = await response.json();
      return { status: true, data };
    } else {
      const error = await response.json();
      return {
        status: false,
        message: error.message || "Failed to fetch heading",
      };
    }
  } catch (error) {
    console.error("Error fetching heading by ID:", error);
    return { status: false, message: "An unexpected error occurred" };
  }
}

async function updateHeading(headingId: string, data: Partial<HeadingData>) {
  try {
    console.log("Payload being sent to API:", JSON.stringify(data)); // ตรวจสอบ payload
    const response = await fetch(`${apiURL}/heading/${headingId}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });

    console.log("Raw Response:", response); // ตรวจสอบ response
    const resText = await response.text();
    console.log("Response Text:", resText); // แสดง raw text ของ response

    const res = response.ok ? JSON.parse(resText) : null;

    if (response.ok) {
      return {
        status: true,
        message: res?.message || "Success",
        data: res?.data,
      };
    } else {
      return {
        status: false,
        message: res?.error || "Failed to update heading",
      };
    }
  } catch (error: any) {
    console.error("Error updating heading:", error);
    return { status: false, message: error.message || "An error occurred" };
  }
}

// Delete Heading
async function deleteHeading(headingId: string) {
  try {
    const response = await fetch(`${apiURL}/heading/${headingId}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });

    if (response.ok) {
      return { status: true, message: "Heading deleted successfully" };
    } else {
      const error = await response.json();
      return {
        status: false,
        message: error.message || "Failed to delete heading",
      };
    }
  } catch (error) {
    console.error("Error deleting heading:", error);
    return { status: false, message: "An unexpected error occurred" };
  }
}

// Login

async function login(email: string, password: string) {
  try {
    const response = await fetch(`${apiURL}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const res = await response.json();

    if (response.ok && res.status === "success" && res.token) {
      sessionStorage.setItem("access_token", res.token);
      sessionStorage.setItem("user_data", JSON.stringify(res.user || {})); // ตรวจสอบให้ res.user ไม่เป็น undefined
      return { status: true, message: res.message, data: res.user }; // res.user ควรมีข้อมูล role
    } else {
      return { status: false, message: res.message || "Login failed" };
    }
  } catch (error: any) {
    console.error("Error logging in:", error);
    return { status: false, message: error.message || "An error occurred" };
  }
}

async function createSubmission(data: SubmissionData) {
  try {
    // Log each field to check values and types
    console.log("Data to send:", {
      heading_id: data.heading_id,
      user_id: data.user_id,
      status: data.status,
      content: data.content || "",
    });

    const response = await fetch(`${apiURL}/submission`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({
        ...data,
        content: data.content || "", // Ensure content is a string
      }),
    });

    const res = await response.json();
    console.log("Server response:", res);

    if (response.ok) {
      return { status: true, message: res.message, data: res.data };
    } else {
      console.error(
        "Submission Error:",
        res.error || "Failed to create submission"
      );
      return {
        status: false,
        message: res.error || "Failed to create submission",
      };
    }
  } catch (error: any) {
    console.error("Error creating submission:", error);
    return { status: false, message: error.message || "An error occurred" };
  }
}

// Get All Submissions

// Get Submission by ID
async function getSubmissionById(submissionId: string) {
  try {
    const response = await fetch(`${apiURL}/submission/${submissionId}`, {
      method: "GET",
      headers: getAuthHeaders(),
    });

    if (response.ok) {
      const data = await response.json();
      return { status: true, data };
    } else {
      const error = await response.json();
      return {
        status: false,
        message: error.message || "Failed to fetch submission",
      };
    }
  } catch (error) {
    console.error("Error fetching submission by ID:", error);
    return { status: false, message: "An unexpected error occurred" };
  }
}

// Update Submission
async function updateSubmission(submissionId: string, data: SubmissionData) {
  try {
    const response = await fetch(`${apiURL}/submission/${submissionId}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });

    const res = await response.json();

    if (response.ok) {
      return { status: true, message: res.message, data: res.data };
    } else {
      return {
        status: false,
        message: res.error || "Failed to update submission",
      };
    }
  } catch (error: any) {
    console.error("Error updating submission:", error);
    return { status: false, message: error.message || "An error occurred" };
  }
}

// Delete Submission
async function deleteSubmission(submissionId: string) {
  try {
    const response = await fetch(`${apiURL}/submission/${submissionId}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });

    if (response.ok) {
      return { status: true, message: "Submission deleted successfully" };
    } else {
      const error = await response.json();
      return {
        status: false,
        message: error.message || "Failed to delete submission",
      };
    }
  } catch (error) {
    console.error("Error deleting submission:", error);
    return { status: false, message: "An unexpected error occurred" };
  }
}

// เพิ่มฟังก์ชัน updateHeadingStatus
async function updateHeadingStatus(headingId: string, status: string) {
  try {
    const response = await fetch(`${apiURL}/heading/${headingId}/status`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify({ status }), // ส่งเฉพาะ status ใหม่ใน request body
    });

    const res = await response.json();
    if (response.ok) {
      return { status: true, message: res.message, data: res.data };
    } else {
      return {
        status: false,
        message: res.error || "Failed to update heading status",
      };
    }
  } catch (error: any) {
    console.error("Error updating heading status:", error);
    return { status: false, message: error.message || "An error occurred" };
  }
}

// Bill API Functions

// สร้างบิลใหม่
export const createBill = async (billData: BillData) => {
  try {
    console.log("Sending bill data:", JSON.stringify(billData, null, 2));

    const response = await fetch(`${apiURL}/bill`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getAuthToken()}`,
      },
      body: JSON.stringify(billData),
    });

    console.log("Response status:", response.status);

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Error details:", errorData);
      throw new Error(errorData.message || "Failed to create bill");
    }

    return await response.json();
  } catch (error: any) {
    console.error("Error creating bill:", error);
    throw error; // ส่ง error ต่อไปให้ component จัดการ
  }
};
// ดึงข้อมูลบิลทั้งหมด
export async function getAllBills() {
  try {
    const response = await fetch(`${apiURL}/bills`, {
      method: "GET",
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return Promise.reject(errorData);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching bills:", error);
    return { status: false, message: "An error occurred" };
  }
}
// ดึงบิลตาม ID
export async function getBillById(billId: string) {
  try {
    const response = await fetch(`${apiURL}/bill/${billId}`, {
      method: "GET",
      headers: getAuthHeaders(),
    });

    return response.ok
      ? await response.json()
      : Promise.reject(await response.json());
  } catch (error) {
    console.error("Error fetching bill:", error);
    return { status: false, message: "An error occurred" };
  }
}

// อัปเดตบิล
export async function updateBill(
  billId: number | string,
  data: Partial<BillData>
) {
  try {
    const response = await fetch(`${apiURL}/bill/${billId}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });

    // 💡 อ่าน Response เป็น JSON เสมอ เพื่อให้ได้ Message/Error แม้ว่า !response.ok
    const res = await response.json(); 

    if (response.ok) {
      // 🟢 กรณีสำเร็จ: ส่งคืนตามรูปแบบที่คาดหวัง { status: true, message, data }
      return { 
        status: true, 
        message: res.message || "อัปเดตบิลสำเร็จ", 
        data: res.data || res // ใช้ res.data หรือ res ถ้าเซิร์ฟเวอร์ส่งข้อมูลบิลมาตรงๆ
      };
    } else {
      // 🔴 กรณีมีข้อผิดพลาด (เช่น 400, 500): ส่งคืนข้อความ Error จากเซิร์ฟเวอร์
      console.error(`API Error updating bill ${billId}:`, res);
      return { 
        status: false, 
        message: res.error || res.message || `ไม่สามารถอัปเดตบิลได้ (HTTP ${response.status})` 
      };
    }
  } catch (error: any) {
    // 🟠 กรณีเกิดข้อผิดพลาดทาง Network หรือ JSON Parse Error
    console.error("Network/Parsing Error updating bill:", error);
    return { 
      status: false, 
      message: error.message || "เกิดข้อผิดพลาดในการเชื่อมต่อ/ประมวลผลข้อมูล" 
    };
  }
}
// ลบบิล
export async function deleteBill(billId: string) {
  try {
    const response = await fetch(`${apiURL}/bill/${billId}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });

    return response.ok
      ? { status: true, message: "Bill deleted successfully" }
      : Promise.reject(await response.json());
  } catch (error) {
    console.error("Error deleting bill:", error);
    return { status: false, message: "An error occurred" };
  }
}

// ดึงบิลตามช่วงเวลา
export async function getBillsByDateRange(startDate: string, endDate: string) {
  try {
    const response = await fetch(
      `${apiURL}/bills?start_date=${startDate}&end_date=${endDate}`,
      {
        method: "GET",
        headers: getAuthHeaders(),
      }
    );

    return response.ok
      ? await response.json()
      : Promise.reject(await response.json());
  } catch (error) {
    console.error("Error fetching bills by date range:", error);
    return { status: false, message: "An error occurred" };
  }
}

// Create Expense Bill
export async function createExpenseBill(data: ExpenseBillData) {
  try {
    const response = await fetch(`${apiURL}/expensebill`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });

    const res = await response.json();
    if (response.ok) {
      return {
        status: true,
        data: res.data,
        message: res.message || "สร้างบิลจ่ายสำเร็จ",
      };
    } else {
      return {
        status: false,
        message: res.error || "ไม่สามารถสร้างบิลจ่ายได้",
      };
    }
  } catch (error: any) {
    console.error("Error creating expense bill:", error);
    return { status: false, message: error.message || "เกิดข้อผิดพลาด" };
  }
}

// Get All Expense Bills
export async function getAllExpenseBills() {
  try {
    const response = await fetch(`${apiURL}/expensebills`, {
      method: "GET",
      headers: getAuthHeaders(),
    });

    const res = await response.json();
    if (response.ok) {
      return { status: true, data: res.data };
    } else {
      return {
        status: false,
        message: res.error || "ไม่สามารถโหลดข้อมูลบิลจ่ายได้",
      };
    }
  } catch (error: any) {
    console.error("Error fetching expense bills:", error);
    return { status: false, message: error.message || "เกิดข้อผิดพลาด" };
  }
}

// Get Expense Bill by ID
export async function getExpenseBillById(id: string) {
  try {
    const response = await fetch(`${apiURL}/expensebill/${id}`, {
      method: "GET",
      headers: getAuthHeaders(),
    });

    const res = await response.json();
    if (response.ok) {
      return { status: true, data: res.data };
    } else {
      return { status: false, message: res.error || "ไม่พบข้อมูลบิลจ่าย" };
    }
  } catch (error: any) {
    console.error("Error fetching expense bill by ID:", error);
    return { status: false, message: error.message || "เกิดข้อผิดพลาด" };
  }
}

export async function deleteExpenseBill(id: string) {
  try {
    const response = await fetch(`${apiURL}/expensebill/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });

    if (response.ok) {
      return { status: true, message: "ลบบิลจ่ายสำเร็จ" };
    } else {
      const res = await response.json();
      return { status: false, message: res.error || "ลบบิลจ่ายไม่สำเร็จ" };
    }
  } catch (error: any) {
    console.error("Error deleting expense bill:", error);
    return { status: false, message: error.message || "เกิดข้อผิดพลาด" };
  }
}

function getAuthToken() {
  return sessionStorage.getItem("access_token") || "";
}

export {
  login,
  createAdmin,
  getAllAdmins,
  getAdminById,
  updateAdmin,
  deleteAdmin,
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  createHeading,
  getAllHeadings,
  getHeadingById,
  updateHeading,
  deleteHeading,
  getAuthToken,
  createSubmission,
  getSubmissionById,
  updateSubmission,
  deleteSubmission,
  updateHeadingStatus,
 
};
