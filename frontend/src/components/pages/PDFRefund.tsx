import React from "react";
import { BillData } from "../../interface/IBill";

interface Props {
  bills: BillData[];
}

const PDFRefund: React.FC<Props> = ({ bills }) => {
  if (!bills || bills.length === 0) {
    return <div style={{ padding: 20 }}>ไม่มีข้อมูลบิลสำหรับแสดงผล</div>;
  }

  const formatCurrency = (amount: number | null | undefined) => {
    if (amount == null) return "-";
    return amount.toLocaleString("th-TH", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const totalAdjustment = bills.reduce(
    (sum, b) => sum + (b.adjustment_amount || 0),
    0
  );

  return (
    <div
      id="pdf-content"
      style={{
        width: "1122px", // A4 แนวนอน = 1122px x 794px
        minHeight: "794px",
        backgroundColor: "white",
        padding: "40px",
        fontFamily: "THSarabunNew, sans-serif",
        fontSize: "16px",
        boxSizing: "border-box",
      }}
    >
      <h2
        style={{
          textAlign: "center",
          fontSize: "24px",
          marginBottom: "20px",
        }}
      >
        รายงานการปรับยอดเงิน (เพิ่ม/ลด)
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
            <th style={cell}>ประเภทการปรับ</th>
            <th style={cell}>จำนวนเงิน</th>
            <th style={cell}>หมายเหตุ</th>
            <th style={cell}>ยอดรวมเดิม</th>
          </tr>
        </thead>
        <tbody>
          {bills.map((bill, idx) => (
            <tr
              key={bill.id}
              style={{
                backgroundColor: idx % 2 === 0 ? "#ffffff" : "#f9f9f9",
              }}
            >
              <td style={cell}>{bill.bill_number || "-"}</td>
              <td style={cell}>{bill.adjustment_type || "-"}</td>
              <td style={{ ...cell, textAlign: "right" }}>
                {formatCurrency(bill.adjustment_amount)}
              </td>
              <td style={{ ...cell, textAlign: "left" }}>
                {bill.adjustment_note || "-"}
              </td>
              <td style={{ ...cell, textAlign: "right" }}>
                {formatCurrency(bill.total)}
              </td>
            </tr>
          ))}

          <tr>
            <td
              colSpan={2}
              style={{
                textAlign: "right",
                fontWeight: "bold",
                padding: "8px",
                backgroundColor: "#f0f0f0",
              }}
            >
              รวมทั้งหมด
            </td>
            <td
              style={{
                textAlign: "right",
                fontWeight: "bold",
                padding: "8px",
              }}
            >
              {formatCurrency(totalAdjustment)}
            </td>
            <td colSpan={2}></td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

const cell: React.CSSProperties = {
  padding: "8px",
  textAlign: "center",
  verticalAlign: "top",
  whiteSpace: "pre-line",
};

export default PDFRefund;
