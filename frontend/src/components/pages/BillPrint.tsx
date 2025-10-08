import { useLocation, useNavigate } from "react-router-dom";
import { BillData } from "../../interface/IBill";

import { Button } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPrint, faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import peaLogo from "../../assets/image/PEA Logo on Violet.png";

const BillPrint = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const billData: BillData = location.state?.billData;

  if (!billData) {
    navigate("/user");
    return null;
  }

  const handlePrint = () => {
    window.print();
  };

  const handleBack = () => {
    navigate("/user");
  };

  const TH_LOCALE = "th-TH";

  const formatCurrency = (amount: number | null) => {
    if (amount === null || amount === 0) return "0.00";
    return amount.toLocaleString(TH_LOCALE, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString(TH_LOCALE, {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const formatTime = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleTimeString(TH_LOCALE, {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Function to render service items (name + amount)
  const renderServiceItems = () => {
    const items = [];
    for (let i = 1; i <= 4; i++) {
      const name = billData[`name${i}` as keyof BillData] as string;
      const amount = billData[`amount${i}` as keyof BillData] as number;

      if (name && amount) {
        items.push(
          <div key={`service-${i}`} className="d-flex justify-content-between">
            <span>{name}</span>
            <span>{formatCurrency(amount)}</span>
          </div>
        );
      }
    }
    return items.length > 0 ? items : <div>-</div>;
  };

  // Function to render inspection items (car reg + check)
  const renderInspectionItems = () => {
    const items = [];
    for (let i = 1; i <= 4; i++) {
      const carReg = billData[
        `car_registration${i}` as keyof BillData
      ] as string;
      const check = billData[`check${i}` as keyof BillData] as number | null;

      if (carReg) {
        items.push(
          <div
            key={`inspection-${i}`}
            className="d-flex justify-content-between"
          >
            <span>{carReg}</span>
            <span>
              {check !== null && check !== undefined
                ? formatCurrency(check)
                : "0.00"}
            </span>
          </div>
        );
      }
    }
    return items.length > 0 ? items : <div>-</div>;
  };

  // Function to render tax items (แสดงแม้ไม่มีทะเบียน ถ้ามีตัวเลข > 0)
  const renderTaxItems = () => {
    const items = [];
    for (let i = 1; i <= 4; i++) {
      const carReg = billData[
        `car_registration${i}` as keyof BillData
      ] as string;
      const tax = billData[`tax${i}` as keyof BillData] as number | null;
      const taxgo = billData[`taxgo${i}` as keyof BillData] as number | null;

      // แสดงเฉพาะค่าที่มากกว่า 0
      if (tax !== null && tax !== undefined && tax > 0) {
        items.push(
          <div key={`tax-${i}`} className="d-flex justify-content-between">
            <span>ค่าภาษีทะเบียน{carReg ? ` ${carReg}` : ""}</span>
            <span>{formatCurrency(tax)}</span>
          </div>
        );
      }

      if (taxgo !== null && taxgo !== undefined && taxgo > 0) {
        items.push(
          <div key={`taxgo-${i}`} className="d-flex justify-content-between">
            <span>ค่าฝากต่อ{carReg ? ` ${carReg}` : ""}</span>
            <span>{formatCurrency(taxgo)}</span>
          </div>
        );
      }
    }
    return items.length > 0 ? items : <div>-</div>;
  };

  // Function to render extension items
  const renderExtensionItems = () => {
    const items = [];
    const extensions = [];

    // รวบรวม extension ที่มีค่า
    for (let i = 1; i <= 4; i++) {
      const extension = billData[`extension${i}` as keyof BillData] as string;
      if (extension) {
        extensions.push(extension);
      }
    }

    // จัดคู่ extension แสดงแนวนอน
    for (let i = 0; i < extensions.length; i += 2) {
      if (extensions[i + 1]) {
        // มีคู่
        items.push(
          <div
            key={`extension-pair-${i}`}
            className="d-flex justify-content-between"
          >
            <span>บริการ {extensions[i]}</span>
            <span>{extensions[i + 1]}</span>
          </div>
        );
      } else {
        // คี่ (เหลือตัวสุดท้าย)
        items.push(
          <div
            key={`extension-single-${i}`}
            className="d-flex justify-content-between"
          >
            <span>บริการ {extensions[i]}</span>
            <span></span>
          </div>
        );
      }
    }

    return items.length > 0 ? items : null;
  };

  // Function to render insurance items
  const renderInsuranceItems = () => {
    const items = [];
    for (let i = 1; i <= 4; i++) {
      const refer = billData[`refer${i}` as keyof BillData] as string;
      const typeRefer = billData[`typerefer${i}` as keyof BillData] as string;

      if (refer && typeRefer) {
        items.push(
          <div
            key={`insurance-${i}`}
            className="d-flex justify-content-between"
          >
            <span>{refer}</span>
            <span>{typeRefer}</span>
          </div>
        );
      }
    }
    return items.length > 0 ? items : <div>-</div>;
  };

  return (
    <div
      className="container mt-3"
      style={{
        border: "1px solid #ccc",
        borderRadius: "10px",
        padding: "20px",
        backgroundColor: "#f5f5f5",
        boxShadow: "0 2px 6px rgba(0, 0, 0, 0.05)",
      }}
    >
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
        // ✅ เพิ่ม class 'disable-editing' เพื่อให้ CSS ป้องกันการเลือกข้อความมีผล
        className="disable-editing" 
        lang="th"
        translate="no"
        style={{
          width: "80mm",
          margin: "0 auto",
          padding: "5px",
          fontFamily: "'TH Sarabun New', sans-serif",
          fontSize: "14px",
        }}
      >
        {/* Header (เนื้อหาเดิม) */}
        <div className="text-center mb-2">
          <img
            src={peaLogo}
            alt="PEA Logo"
            style={{
              height: "100px",
              marginBottom: "0px",
            }}
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
          <div style={{ marginBottom: "5px" }}>
            <div>เลขที่บิล: {billData.bill_number || "-"}</div>
            <div>
              <div>Tel: 083-066-2661, 081-715-8683</div>
              วันที่: {formatDate(billData.created_at)}{" "}
              {formatTime(billData.created_at)}
            </div>
          </div>
        </div>

        <hr style={{ borderColor: "#74045f", margin: "5px 0" }} />

        {/* Customer info (เนื้อหาเดิม) */}
        <div style={{ marginBottom: "8px" }}>
          <div>
            <strong>ลูกค้า:</strong> {billData.username || "-"}
          </div>
          <div>
            <strong>โทร:</strong> {billData.phone || "-"}
          </div>

          {(billData.car_registration1 ||
            billData.car_registration2 ||
            billData.car_registration3 ||
            billData.car_registration4) && (
            <div>
              <strong>ทะเบียน:</strong>{" "}
              {[
                billData.car_registration1,
                billData.car_registration2,
                billData.car_registration3,
                billData.car_registration4,
              ]
                .filter((reg) => reg && reg.trim() !== "")
                .join(", ")}
            </div>
          )}
        </div>

        <hr style={{ borderColor: "#74045f", margin: "5px 0" }} />

        {/* Expense summary (เนื้อหาเดิม) */}
        <div style={{ marginBottom: "8px" }}>
          <div className="text-center" style={{ fontWeight: "bold" }}>
            สรุปค่าใช้จ่ายทั้งหมด
          </div>

          {/* Service items */}
          <div style={{ margin: "5px 0" }}>
            <div style={{ fontWeight: "bold", marginBottom: "3px" }}>
              รายการพรบ
            </div>
            {renderServiceItems()}
          </div>

          {/* Inspection items */}
          <div style={{ margin: "5px 0" }}>
            <div style={{ fontWeight: "bold", marginBottom: "3px" }}>
              รายการตรวจสภาพ
            </div>
            {renderInspectionItems()}
          </div>

          {/* Tax items */}
          <div style={{ margin: "5px 0" }}>
            <div style={{ fontWeight: "bold", marginBottom: "3px" }}>
              ภาษีและฝากต่อ
            </div>
            {renderTaxItems()}
            {renderExtensionItems()}
          </div>

          {/* Insurance items */}
          <div style={{ margin: "5px 0" }}>
            <div style={{ fontWeight: "bold", marginBottom: "3px" }}>
              ประกัน
            </div>
            {renderInsuranceItems()}
          </div>

          {/* Appointment Date */}
          {billData.date && (
            <div
              style={{
                margin: "5px 0",
                border: "1px solid #74045f",
                padding: "5px",
                borderRadius: "3px",
              }}
            >
              <div
                style={{
                  fontWeight: "bold",
                  color: "red",
                  fontSize: "16px",
                  textAlign: "center",
                }}
              >
                วันที่นัดรับ
              </div>
              <div
                style={{
                  fontSize: "15px",
                  color: "red",
                  fontWeight: "bold",
                  textAlign: "center",
                }}
              >
                {formatDate(billData.date)}
              </div>
            </div>
          )}

          {/* Description */}
          {billData.description && (
            <div style={{ margin: "5px 0" }}>
              <div style={{ fontWeight: "bold", marginBottom: "3px" }}>
                หมายเหตุ
              </div>
              <div>{billData.description}</div>
            </div>
          )}
        </div>

        <hr style={{ borderColor: "#74045f", margin: "5px 0" }} />

        {/* Total and payment method (เนื้อหาเดิม) */}
        <div style={{ marginBottom: "8px" }}>
          <div
            className="d-flex justify-content-between"
            style={{ fontWeight: "bold" }}
          >
            <span>ยอดรวมทั้งสิ้น:</span>
            <span>{formatCurrency(billData.total)} บาท</span>
          </div>
          <div>
            <strong>ชำระโดย:</strong>{" "}
            {billData.payment_method === "cash" && "เงินสด"}
            {billData.payment_method === "transfer" && "โอนเงิน"}
            {billData.payment_method === "credit_card" && "บัตรเครดิต"}
            {billData.payment_method === "cash+transfer" && (
              <>
                เงินสดและเงินโอน
                <div style={{ marginLeft: "10px" }}>
                  เงินสด: {formatCurrency(billData.cash_transfer1 || 0)} บาท
                </div>
                <div style={{ marginLeft: "10px" }}>
                  เงินโอน: {formatCurrency(billData.cash_transfer2 || 0)} บาท
                </div>
              </>
            )}
          </div>
        </div>

        {/* Footer (เนื้อหาเดิม) */}
        <div
          style={{
            marginTop: "10px",
            fontSize: "10px",
            textAlign: "center",
            color: "#666",
          }}
        >
          <div>ขอบคุณที่ใช้บริการ</div>
        </div>
      </div>

      {/* Print styles */}
      <style>
        {`
          /* === START: CSS PURELY FOR PREVENTING EASY EDITING ON SCREEN === */
          /* ต้องใช้ class เพื่อให้มีผลเฉพาะเมื่อแสดงผลบนจอ (ไม่ใช่ตอนสั่งพิมพ์) */
          .disable-editing {
            /* ป้องกันการเลือกข้อความด้วยเมาส์ */
            user-select: none !important; 
            /* ป้องกันไม่ให้เคอร์เซอร์เป็นตัวพิมพ์เมื่อคลิก */
            pointer-events: none !important;
          }
          /* === END: CSS PURELY FOR PREVENTING EASY EDITING ON SCREEN === */


          @media print {
            body * {
              visibility: hidden;
              margin: 0;
              padding: 0;
            }
            #bill-to-print, #bill-to-print * {
              visibility: visible;
              font-family: 'TH Sarabun New', sans-serif !important;
              /* รีเซ็ตการป้องกันเมื่อเข้าสู่โหมดพิมพ์ */
              user-select: auto !important;
              pointer-events: auto !important;
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
export default BillPrint;