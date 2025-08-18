import React from "react";
import { ExpenseBillData } from "../../interface/IExpenseBill";
import moment from "moment";

interface Props {
  bills: ExpenseBillData[];
}

const PdfExpense: React.FC<Props> = ({ bills }) => {
  if (!bills || bills.length === 0) {
    return <div style={{ padding: 20 }}>ไม่มีข้อมูลบิลสำหรับแสดงผล</div>;
  }

  const formatCurrency = (amount?: number) => {
    return amount ? amount.toLocaleString("th-TH", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "0.00";
  };

  const formatDate = (date?: string) => {
    return date ? moment(date).format("DD/MM/YYYY") : "-";
  };

  const totalAmount = bills.reduce((sum, b) => sum + (b.amount || 0), 0);

  

  return (
    <div>

      <div
        id="pdf-table"
        style={{
          width: "1122px",
          minHeight: "794px",
          backgroundColor: "white",
          padding: "40px",
          fontFamily: "THSarabunNew, sans-serif",
          fontSize: "16px",
          boxSizing: "border-box",
        }}
      >
        <h2 style={{ textAlign: "center", fontSize: "24px", marginBottom: "20px" }}>
          รายงานบิลค่าใช้จ่าย
        </h2>

        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            fontSize: "16px",
            tableLayout: "fixed",
          }}
          border={1}
        >
          <thead>
            <tr style={{ backgroundColor: "#f0f0f0" }}>
              <th style={cell}>เลขที่บิล</th>
              <th style={cell}>วันที่</th>
              <th style={cell}>ชื่อรายการ</th>
              <th style={cell}>จำนวนเงิน</th>
              <th style={cell}>รายละเอียด</th>
            </tr>
          </thead>
          <tbody>
            {bills.map((bill, idx) => (
              <tr key={bill.id ?? idx} style={{ backgroundColor: idx % 2 === 0 ? "#ffffff" : "#f9f9f9" }}>
                <td style={cell}>{idx + 1}</td>
                <td style={cell}>{formatDate(bill.date)}</td>
                <td style={{ ...cell, textAlign: "left" }}>{bill.title}</td>
                <td style={{ ...cell, textAlign: "right" }}>{formatCurrency(bill.amount)}</td>
                <td style={{ ...cell, textAlign: "left" }}>{bill.description || "-"}</td>
              </tr>
            ))}
            <tr>
              <td colSpan={3} style={{ textAlign: "right", fontWeight: "bold", padding: "8px", backgroundColor: "#f0f0f0" }}>
                รวมทั้งหมด
              </td>
              <td style={{ textAlign: "right", fontWeight: "bold", padding: "8px" }}>
                {formatCurrency(totalAmount)}
              </td>
              <td></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

const cell: React.CSSProperties = {
  padding: "8px",
  textAlign: "center",
  verticalAlign: "top",
  whiteSpace: "pre-line",
};

export default PdfExpense;
