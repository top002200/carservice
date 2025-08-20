import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { useNavigate } from "react-router-dom";
import { ExpenseBillData } from "../../interface/IExpenseBill";
import { createExpenseBill } from "../../services/api";
import Swal from "sweetalert2";

import "react-datepicker/dist/react-datepicker.css";
import { registerLocale } from "react-datepicker";
import { th } from "date-fns/locale/th";
registerLocale("th", th);

const ExpenseBillAdd = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<ExpenseBillData>({
    title: "",
    description: "",
    amount: 0,
    date: new Date().toISOString().replace(/\.\d{3}Z$/, "+07:00"),
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "amount" ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.amount || formData.amount <= 0) {
      Swal.fire({
        icon: "warning",
        title: "ข้อมูลไม่ครบถ้วน",
        text: "กรุณาระบุชื่อหัวข้อและจำนวนเงิน",
      });
      return;
    }

    try {
      const payload = {
        ...formData,
      };

      const res = await createExpenseBill(payload);

      if (res.status) {
        Swal.fire({
          icon: "success",
          title: "บันทึกสำเร็จ",
          text: `เพิ่มบิลจ่ายหัวข้อ: ${formData.title}`,
        }).then(() => {
          navigate("/user/expense-bill-print", {
            state: { expenseBillData: { ...formData, ...res.data } },
          });
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "เกิดข้อผิดพลาด",
          text: res.message || "ไม่สามารถเพิ่มบิลจ่ายได้",
        });
      }
    } catch (error: any) {
      Swal.fire({
        icon: "error",
        title: "เกิดข้อผิดพลาด",
        text: error.message || "ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้",
      });
    }
  };

  return (
    <div style={{ backgroundColor: "#f8f9fa", minHeight: "100vh" }}>
      {/* Main Form */}
      <main
        className="container"
        style={{
          paddingTop: "100px",
          maxWidth: "700px",
          border: "2px solid black", // ✅ กรอบสีดำ
          borderRadius: "12px", // ✅ มุมมน
          padding: "30px", // ✅ ระยะห่างภายใน
          backgroundColor: "white", // ✅ พื้นหลังขาว
          boxShadow: "0 4px 12px rgba(0,0,0,0.05)", // ✅ เงาเบาๆ
        }}
      >
        <form
          className="bg-white rounded shadow-sm p-4"
          onSubmit={handleSubmit}
        >
          <h3 className="text-center text-purple mb-4">ฟอร์มบันทึกบิลรับ-จ่าย</h3>

          {/* ชื่อหัวข้อ */}
          <div className="mb-3">
            <label className="form-label fw-bold">ชื่อหัวข้อ *</label>
            <input
              type="text"
              className="form-control"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="เช่น ค่าเช่า, ค่าซ่อม"
              required
            />
          </div>

          {/* รายละเอียด */}
          <div className="mb-3">
            <label className="form-label fw-bold">รายละเอียดเพิ่มเติม</label>
            <textarea
              className="form-control"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              placeholder="เช่น จ่ายค่าซ่อมแอร์ห้องทำงาน"
            />
          </div>

          {/* จำนวนเงิน */}
          <div className="mb-3">
            <label className="form-label fw-bold">จำนวนเงิน (บาท) *</label>
            <input
              type="number"
              className="form-control"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              placeholder="0.00"
              min="0"
              required
            />
          </div>

          {/* วันที่ออกบิล */}
          <div className="mb-3">
            <label className="form-label fw-bold">วันที่ออกบิล *</label>
            <input
              type="text"
              className="form-control"
              value={new Date().toLocaleDateString("th-TH")}
              readOnly
            />
          </div>

          {/* ปุ่มบันทึก */}
          <div className="d-flex justify-content-between mt-4">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => navigate("/user/ExpenseBillList")}
            >
              ยกเลิก
            </button>
            <button type="submit" className="btn btn-success">
              บันทึกบิลรับ-จ่าย
            </button>
          </div>
        </form>
      </main>
    </div>
  );
};

export default ExpenseBillAdd;
