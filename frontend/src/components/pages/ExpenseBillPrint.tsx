import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ExpenseBillData } from "../../interface/IExpenseBill";
import peaLogo from "../../assets/image/PEA Logo on Violet.png";
import { Button } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPrint, faArrowLeft } from "@fortawesome/free-solid-svg-icons";

const ExpenseBillPrint = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // ลอง log state ที่ส่งเข้ามา
  console.log("Location State:", location.state);

  const billData: ExpenseBillData | undefined = location.state?.expenseBillData;

  // ถ้าไม่มีข้อมูลให้ redirect หลังจาก mount
  useEffect(() => {
    if (!billData) {
    }
  }, [billData, navigate]);

  if (!billData) {
    return (
      <div className="text-center mt-5 text-danger">
        ❌ ไม่พบข้อมูลบิลจ่าย กรุณาเข้าหน้านี้ผ่านระบบ
      </div>
    );
  }

  const handlePrint = () => {
    window.print();
  };

  const handleBack = () => {
    navigate("/user/ExpenseBillList"); // ✅ เปลี่ยนเป็นหน้านี้
  };

  const formatCurrency = (amount: number | null | undefined) => {
    if (!amount || amount === 0) return "0.00";
    return amount.toLocaleString("th-TH", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("th-TH", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  return (
    <div className="container mt-3">
      {/* Action buttons */}
      <div className="d-flex justify-content-between mb-3 no-print">
        <Button variant="outline-secondary" onClick={handleBack}>
          <FontAwesomeIcon icon={faArrowLeft} className="me-2" />
          กลับ
        </Button>
        <Button variant="primary" onClick={handlePrint}>
          <FontAwesomeIcon icon={faPrint} className="me-2" />
          พิมพ์บิล
        </Button>
      </div>

      {/* Printable bill section */}
      <div
        id="bill-to-print"
        style={{
          width: "80mm",
          margin: "0 auto",
          padding: "10px",
          fontFamily: "'TH Sarabun New', sans-serif",
          fontSize: "14px",
        }}
      >
        <div className="text-center mb-2">
          <img
            src={peaLogo}
            alt="PEA Logo"
            style={{ height: "100px", marginBottom: "5px" }}
          />
          <h5
            style={{
              margin: "5px 0",
              color: "#000080",
              fontSize: "16px",
              fontWeight: "bold",
            }}
          >
            สถานตรวจสภาพรถคลองหาด
          </h5>
          <div>Tel: 083-066-2661, 081-715-8683</div>
          <div>วันที่: {formatDate(billData.date)}</div>
        </div>

        <hr style={{ borderColor: "#74045f", margin: "5px 0" }} />

        <div style={{ marginBottom: "8px" }}>
          <div
            style={{
              fontSize: "20px",
              fontWeight: "bold",
              marginBottom: "5px",
              textAlign: "center",
            }}
          >
            บิลจ่ายที่: {billData.id}
          </div>
          <div>
            <strong>รายการ:</strong> {billData.title}
          </div>
          {billData.description && (
            <div>
              <strong>รายละเอียด:</strong> {billData.description}
            </div>
          )}
        </div>

        <hr style={{ borderColor: "#74045f", margin: "5px 0" }} />

        <div
          className="d-flex justify-content-between"
          style={{ fontWeight: "bold" }}
        >
          <span>จำนวนเงิน:</span>
          <span>{formatCurrency(billData.amount)} บาท</span>
        </div>

        <div
          style={{
            marginTop: "10px",
            fontSize: "10px",
            textAlign: "center",
            color: "#666",
          }}
        >
          ขอบคุณที่ใช้บริการ
        </div>
        <div
          style={{
            marginTop: "10px",
            fontSize: "30px",
            textAlign: "left",
            color: "#666",
          }}
        >
          ผู้รับเงิน:____________________
        </div>
      </div>

      {/* Print styles */}
      <style>
        {`
          @media print {
            body * {
              visibility: hidden;
            }
            #bill-to-print, #bill-to-print * {
              visibility: visible;
            }
            #bill-to-print {
              position: absolute;
              left: 0;
              top: 0;
              width: 80mm;
              margin: 0;
              padding: 10px;
              border: none;
              box-shadow: none;
              font-size: 14px;
            }
            .no-print {
              display: none !important;
            }
            @page {
              size: 80mm auto;
              margin: 0;
            }
          }
        `}
      </style>
    </div>
  );
};

export default ExpenseBillPrint;
