import React, { useEffect, useState } from "react";
import { Table, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { getAllBills } from "../../services/api";
import { BillData } from "../../interface/IBill";
import html2pdf from "html2pdf.js";
import PDFRefund from "./PDFRefund"; // ปรับ path ให้ตรง

import { createRoot } from "react-dom/client";

const RefundReport: React.FC = () => {
  const [bills, setBills] = useState<BillData[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBills = async () => {
      try {
        const response = await getAllBills();
        if (response.status && response.data) {
          const filtered = response.data.filter(
            (bill: BillData) =>
              bill.adjustment_type !== undefined &&
              bill.adjustment_type !== null
          );
          setBills(filtered);
        }
      } catch (error) {
        console.error("Error fetching bills:", error);
      }
    };

    fetchBills();
  }, []);

  const formatCurrency = (amount: number | null | undefined) => {
    if (amount == null) return "-";
    return amount.toLocaleString("th-TH", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };
  const handleBack = () => {
    const role = sessionStorage.getItem("role");
    if (role === "admin") {
      navigate("/dashboard");
    } else {
      navigate("/user");
    }
  };

  const exportToPDF = () => {
    const container = document.createElement("div");
    document.body.appendChild(container);
    const root = createRoot(container);
    root.render(<PDFRefund bills={bills} />);

    setTimeout(() => {
      html2pdf()
        .set({
          margin: 0.2,
          filename: "รายงานเงินเพิ่มลด.pdf",
          image: { type: "jpeg", quality: 0.98 },
          html2canvas: { scale: 2 },
          jsPDF: { unit: "in", format: "a4", orientation: "landscape" }, // ✅ แนวนอน
        })
        .from(container)
        .save()
        .then(() => {
          document.body.removeChild(container);
        });
    }, 500); // ให้เวลา render
  };

  return (
    <div className="container mt-5">
      <div className="card shadow-sm">
        <div className="card-header bg-warning text-dark d-flex justify-content-between align-items-center">
          <h5 className="mb-0">📋 รายงานเงินเพิ่ม/ลด</h5>
          <div>
            <Button
              variant="outline-dark"
              className="me-2"
              onClick={exportToPDF}
            >
              📤 Export PDF
            </Button>
            <Button variant="dark" onClick={handleBack}>
              🔙 กลับแดชบอร์ด
            </Button>
          </div>
        </div>

        <div className="card-body">
          {bills.length === 0 ? (
            <p className="text-muted text-center">ไม่มีรายการที่ถูกบันทึก</p>
          ) : (
            <Table striped bordered hover responsive>
              <thead className="table-secondary text-center align-middle">
                <tr>
                  <th>เลขที่บิล</th>
                  <th>ประเภทการปรับ</th>
                  <th>จำนวนเงิน</th>
                  <th>หมายเหตุ</th>
                  <th>ยอดรวมเดิม</th>
                </tr>
              </thead>
              <tbody className="align-middle text-center">
                {bills.map((bill) => (
                  <tr key={bill.id}>
                    <td>{bill.bill_number}</td>
                    <td>
                      <span
                        className={`badge ${
                          bill.adjustment_type === "เพิ่ม"
                            ? "bg-success"
                            : "bg-danger"
                        }`}
                      >
                        {bill.adjustment_type}
                      </span>
                    </td>
                    <td className="text-end">
                      {formatCurrency(bill.adjustment_amount)}
                    </td>
                    <td className="text-start">
                      {bill.adjustment_note || "-"}
                    </td>
                    <td className="text-end">{formatCurrency(bill.total)}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </div>
      </div>
    </div>
  );
};

export default RefundReport;
