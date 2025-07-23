import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import bcrypt from "bcryptjs"; // Import bcrypt for hashing
import logo from "../../assets/image/PEA Logo on Violet.png";
import {
  getAllUsers,
  updateUser,
  createUser,
  deleteUser,
} from "../../services/api";
import { UserData } from "../../interface/IUser";

const ManageUsers: React.FC = () => {
  const [users, setUsers] = useState<UserData[]>([]);
  const [editingUser, setEditingUser] = useState<UserData | null>(null);
  const [newUser, setNewUser] = useState<UserData>({
    user_id: "",
    user_name: "",
    email: "",
    phone_number: "",
    password: "",
    admins: [],
    submissions: [],
  });
  const [password, setPassword] = useState(""); // State for updating password

  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await getAllUsers();
        if (response.status) {
          setUsers(response.data.data);
        } else {
          console.error("Error fetching users:", response.message);
        }
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };
    fetchUsers();
  }, []);

  const handleLogout = () => {
    Swal.fire({
      title: "คุณแน่ใจหรือไม่?",
      text: "คุณต้องการออกจากระบบ",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "ใช่, ออกจากระบบ!",
      cancelButtonText: "ยกเลิก",
    }).then((result) => {
      if (result.isConfirmed) {
        sessionStorage.removeItem("access_token");
        sessionStorage.removeItem("user_data");
        navigate("/");
      }
    });
  };

  const handleSaveUser = async (user: UserData) => {
    try {
      // Include password in the update only if it's not empty
      const userToUpdate = { ...user };
      if (password) {
        // Hash the password before sending it to the API
        const hashedPassword = await bcrypt.hash(password, 10);
        userToUpdate.password = hashedPassword;
      }

      const response = await updateUser(user.user_id, userToUpdate);
      if (response.status) {
        Swal.fire("สำเร็จ", "ข้อมูลผู้ใช้ถูกอัปเดตแล้ว", "success");
        setEditingUser(null);
        setUsers((prevUsers) =>
          prevUsers.map((u) =>
            u.user_id === user.user_id || u.user_id === editingUser?.user_id
              ? userToUpdate
              : u
          )
        );

        setPassword(""); // Clear password after update
      } else {
        Swal.fire("เกิดข้อผิดพลาด", response.message, "error");
      }
    } catch (error) {
      Swal.fire("เกิดข้อผิดพลาด", "ไม่สามารถอัปเดตผู้ใช้ได้", "error");
      console.error("Error updating user:", error);
    }
  };

  const handleAddUser = async () => {
    try {
      // Calculate the next user_id by finding the highest current number
      const maxId = users.reduce((max, user) => {
        const idNumber = parseInt(user.user_id.replace("user", ""), 10);
        return idNumber > max ? idNumber : max;
      }, 0);
      const nextUserId = `user${maxId + 1}`;

      // Remove bcrypt.hash from here, sending plain text to backend
      const newUserWithId = { ...newUser, user_id: nextUserId };

      const response = await createUser(newUserWithId);
      if (response.status) {
        Swal.fire("สำเร็จ", "เพิ่มผู้ใช้ใหม่เรียบร้อย", "success");
        setUsers([...users, response.data]);
        setNewUser({
          user_id: "",
          user_name: "",
          email: "",
          phone_number: "",
          password: "",
          admins: [],
          submissions: [],
        });
      } else {
        Swal.fire("เกิดข้อผิดพลาด", response.message, "error");
      }
    } catch (error) {
      Swal.fire("เกิดข้อผิดพลาด", "ไม่สามารถเพิ่มผู้ใช้ได้", "error");
      console.error("Error adding user:", error);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      const response = await deleteUser(userId);
      if (response.status) {
        Swal.fire("สำเร็จ", "ลบผู้ใช้เรียบร้อยแล้ว", "success");
        setUsers(users.filter((user) => user.user_id !== userId));
      } else {
        Swal.fire("เกิดข้อผิดพลาด", response.message, "error");
      }
    } catch (error) {
      Swal.fire("เกิดข้อผิดพลาด", "ไม่สามารถลบผู้ใช้ได้", "error");
      console.error("Error deleting user:", error);
    }
  };

  return (
    <div className="container-fluid vh-100 d-flex flex-column">
      <header
        className="header d-flex justify-content-between align-items-center p-3 text-white"
        style={{
          width: "100%",
          backgroundColor: "purple",
          position: "fixed",
          top: 0,
          left: 0,
          zIndex: 1000,
        }}
      >
        <div className="d-flex align-items-center">
          <img
            src={logo}
            alt="PEA Logo"
            style={{ width: "auto", height: "50px", marginRight: "10px" }}
          />
        </div>
        <div className="d-flex ms-auto gap-2">
          <button
            className="btn btn-light"
            onClick={() => navigate("/dashboard")}
          >
            กลับหน้าหลัก
          </button>
          <button className="btn btn-light" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </header>

      <main className="flex-grow-1 mt-5 pt-5">
        <div className="container mt-4">
          <div
            className="p-4 rounded shadow-lg"
            style={{
              backgroundColor: "#f8f3fc",
              border: "2px solid purple",
              borderRadius: "10px",
              boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)",
              padding: "20px",
            }}
          >
            <h2 className="text-center mb-3" style={{ color: "purple" }}>
              <b>จัดการผู้ใช้</b>
            </h2>
            <table className="table table-striped">
              <thead>
                <tr>
                  <th className="text-left">เลขพนักงาน</th>
                  <th className="text-center">ชื่อผู้ใช้</th>{" "}
                  {/* เพิ่มตรงนี้ */}
                  <th className="text-center">ไอดีผู้ใช้งาน</th>
                  <th className="text-center">หมายเลขโทรศัพท์</th>
                  <th className="text-center">รหัสผ่าน</th>
                  <th className="text-center">การดำเนินการ</th>
                </tr>
              </thead>

              <tbody>
                {users.map((user) => (
                  <tr key={user.user_id}>
                    <td>
                      {editingUser?.user_id === user.user_id ? (
                        <input
                          type="text"
                          className="form-control"
                          value={editingUser.user_name}
                          onChange={(e) =>
                            setEditingUser({
                              ...editingUser,
                              user_name: e.target.value,
                            })
                          }
                        />
                      ) : (
                        user.user_name
                      )}
                    </td>
                    <td className="align-middle text-center">
                      {editingUser?.user_id === user.user_id ? (
                        <input
                          type="text"
                          className="form-control"
                          value={editingUser.user_id}
                          onChange={(e) =>
                            setEditingUser({
                              ...editingUser,
                              user_id: e.target.value,
                            })
                          }
                        />
                      ) : (
                        user.user_id
                      )}
                    </td>
                    <td className="align-middle text-center">
                      {editingUser?.user_id === user.user_id ? (
                        <input
                          type="email"
                          className="form-control"
                          value={editingUser.email}
                          onChange={(e) =>
                            setEditingUser({
                              ...editingUser,
                              email: e.target.value,
                            })
                          }
                        />
                      ) : (
                        user.email
                      )}
                    </td>
                    <td className="align-middle text-center">
                      {editingUser?.user_id === user.user_id ? (
                        <input
                          type="tel"
                          className="form-control"
                          value={editingUser.phone_number}
                          onChange={(e) =>
                            setEditingUser({
                              ...editingUser,
                              phone_number: e.target.value,
                            })
                          }
                        />
                      ) : (
                        user.phone_number
                      )}
                    </td>
                    <td className="align-middle text-center">
                      {editingUser?.user_id === user.user_id ? (
                        <input
                          type="password"
                          className="form-control"
                          placeholder="New Password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                        />
                      ) : (
                        "******" // Masked password for security
                      )}
                    </td>
                    <td className="align-middle text-center">
                      {editingUser?.user_id === user.user_id ? (
                        <>
                          <button
                            className="btn btn-success btn-sm"
                            onClick={() => handleSaveUser(editingUser)}
                          >
                            บันทึก
                          </button>
                          <button
                            className="btn btn-danger btn-sm ms-2"
                            onClick={() => setEditingUser(null)}
                          >
                            ยกเลิก
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            className="btn btn-primary btn-sm"
                            onClick={() => setEditingUser(user)}
                          >
                            แก้ไข
                          </button>
                          <button
                            className="btn btn-danger btn-sm ms-2"
                            onClick={() => handleDeleteUser(user.user_id)}
                          >
                            ลบ
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
                <tr>
                  <td>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="ชื่อผู้ใช้"
                      value={newUser.user_name}
                      onChange={(e) =>
                        setNewUser({ ...newUser, user_name: e.target.value })
                      }
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="รหัสผู้ใช้"
                      value={newUser.user_id}
                      onChange={(e) =>
                        setNewUser({ ...newUser, user_id: e.target.value })
                      }
                    />
                  </td>
                  <td>
                    <input
                      type="email"
                      className="form-control"
                      placeholder="เลขประจำตัวพนักงาน"
                      value={newUser.email}
                      onChange={(e) =>
                        setNewUser({ ...newUser, email: e.target.value })
                      }
                    />
                  </td>
                  <td>
                    <input
                      type="tel"
                      className="form-control"
                      placeholder="หมายเลขโทรศัพท์"
                      value={newUser.phone_number}
                      onChange={(e) =>
                        setNewUser({ ...newUser, phone_number: e.target.value })
                      }
                    />
                  </td>
                  <td>
                    <input
                      type="password"
                      className="form-control"
                      placeholder="รหัสผ่าน"
                      value={newUser.password}
                      onChange={(e) =>
                        setNewUser({ ...newUser, password: e.target.value })
                      }
                    />
                  </td>
                  <td>
                    <button
                      className="btn btn-success btn-sm"
                      onClick={handleAddUser}
                    >
                      เพิ่ม
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ManageUsers;
