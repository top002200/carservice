import { useLocation, useNavigate } from "react-router-dom";
import { BillData } from "../../interface/IBill";

import { Button } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPrint, faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import peaLogo from "../../assets/image/PEA Logo on Violet.png";

const BillPrint = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const billData: BillData = (location.state as any)?.billData;

  if (!billData) {
    navigate("/user");
    return null;
  }

  const state = (location.state as any) || {};
  const dateStartRaw: string | null =
    state.dateStart || (billData as any).filter_start || null;
  const dateEndRaw: string | null =
    state.dateEnd || (billData as any).filter_end || null;

  const handlePrint = () => {
    window.print();
  };

  const handleBack = () => {
    navigate("/user");
  };

  const formatCurrency = (amount: number | null) => {
    if (amount === null || amount === 0) return "0.00";
    return amount.toLocaleString("th-TH", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("th-TH", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const formatTime = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleTimeString("th-TH", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // ฟังก์ชันช่วย: แปลง Date -> สตริงวันที่ไทย (พ.ศ.)
  const formatDateTH = (date: Date) =>
    date.toLocaleDateString("th-TH", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

  // ป้ายวันที่ที่จะแสดงทุกหน้า
  const dateLabel = (() => {
    const today = new Date();
    if (!dateStartRaw && !dateEndRaw) {
      return formatDateTH(today);
    }
    if (dateStartRaw && !dateEndRaw) {
      return formatDateTH(new Date(dateStartRaw));
    }
    if (!dateStartRaw && dateEndRaw) {
      return formatDateTH(new Date(dateEndRaw));
    }
    const s = formatDateTH(new Date(dateStartRaw as string));
    const e = formatDateTH(new Date(dateEndRaw as string));
    return s === e ? s : `${s} - ${e}`;
  })();

  // 1) รายการบริการ พ.ร.บ. (แสดงเมื่อมีชื่อ + จำนวนเงิน)
  const renderServiceItems = () => {
    const items = [];
    for (let i = 1; i <= 4; i++) {
      const name = billData[`name${i}` as keyof BillData] as string;
      const amount = billData[`amount${i}` as keyof BillData] as number | null;
      if (name && amount && amount > 0) {
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

  // 2) รายการตรวจสภาพ (โชว์แม้ไม่มีทะเบียน ถ้ามี check > 0)
  const renderInspectionItems = () => {
    const items = [];
    for (let i = 1; i <= 4; i++) {
      const carReg = billData[
        `car_registration${i}` as keyof BillData
      ] as string;
      const check = billData[`check${i}` as keyof BillData] as number | null;

      if (check !== null && check !== undefined && check > 0) {
        items.push(
          <div
            key={`inspection-${i}`}
            className="d-flex justify-content-between"
          >
            <span>{carReg && carReg.trim() !== "" ? carReg : "-"}</span>
            <span>{formatCurrency(check)}</span>
          </div>
        );
      }
    }
    return items.length > 0 ? items : <div>-</div>;
  };

  // 3) ภาษีและฝากต่อ (โชว์แม้ไม่มีทะเบียน ถ้ามีตัวเลข > 0)
  const renderTaxItems = () => {
    const items = [];
    for (let i = 1; i <= 4; i++) {
      const carReg = billData[
        `car_registration${i}` as keyof BillData
      ] as string;
      const tax = billData[`tax${i}` as keyof BillData] as number | null;
      const taxgo = billData[`taxgo${i}` as keyof BillData] as number | null;

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

  // 4) บริการเสริม/หมายเหตุแนวคู่ (แสดงเป็นคู่ๆ)
  const renderExtensionItems = () => {
    const items: JSX.Element[] = [];
    const extensions: string[] = [];

    for (let i = 1; i <= 4; i++) {
      const extension = billData[`extension${i}` as keyof BillData] as string;
      if (extension) extensions.push(extension);
    }

    for (let i = 0; i < extensions.length; i += 2) {
      if (extensions[i + 1]) {
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

  // 5) ประกัน (แสดงเมื่อมีทั้ง refer และ typerefer)
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
      {/* ปุ่มคำสั่ง */}
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

      {/* พื้นที่พิมพ์ */}
      <div
        id="bill-to-print"
        style={{
          width: "80mm",
          margin: "0 auto",
          padding: "5px 6px 10px",
          fontFamily: "'TH Sarabun New', sans-serif",
          fontSize: "14px",
          position: "relative",
        }}
      >
        {/* หัวบิล (จะทำให้ติดทุกหน้าตอนพิมพ์) */}
        <div className="print-header">
          <div className="text-center mb-1">
            <img
              src={peaLogo}
              alt="PEA Logo"
              style={{ height: "90px", marginBottom: "0px" }}
            />
          </div>
          <h5
            className="text-center"
            style={{
              margin: "5px 0 2px",
              color: "#000080",
              fontSize: "16px",
              fontWeight: "bold",
            }}
          >
            สถานตรวจสภาพรถคลองหาด
          </h5>

          <div
            style={{
              marginBottom: "6px",
              textAlign: "center",
              lineHeight: 1.2,
            }}
          >
            <div>เลขที่บิล: {billData.bill_number || "-"}</div>
            <div>Tel: 083-066-2661, 081-715-8683</div>
            <div className="print-date">วันที่: {dateLabel}</div>
          </div>

          <hr style={{ borderColor: "#74045f", margin: "5px 0" }} />
        </div>

        {/* เนื้อหา (เริ่มหลังหัวบิล) */}
        <div className="print-body">
          {/* ข้อมูลลูกค้า */}
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

          {/* สรุปค่าใช้จ่าย */}
          <div style={{ marginBottom: "8px" }}>
            <div className="text-center" style={{ fontWeight: "bold" }}>
              สรุปค่าใช้จ่ายทั้งหมด
            </div>

            {/* พ.ร.บ. */}
            <div style={{ margin: "5px 0" }}>
              <div style={{ fontWeight: "bold", marginBottom: "3px" }}>
                รายการพรบ
              </div>
              {renderServiceItems()}
            </div>

            {/* ตรวจสภาพ */}
            <div style={{ margin: "5px 0" }}>
              <div style={{ fontWeight: "bold", marginBottom: "3px" }}>
                รายการตรวจสภาพ
              </div>
              {renderInspectionItems()}
            </div>

            {/* ภาษีและฝากต่อ */}
            <div style={{ margin: "5px 0" }}>
              <div style={{ fontWeight: "bold", marginBottom: "3px" }}>
                ภาษีและฝากต่อ
              </div>
              {renderTaxItems()}
              {renderExtensionItems()}
            </div>

            {/* ประกัน */}
            <div style={{ margin: "5px 0" }}>
              <div style={{ fontWeight: "bold", marginBottom: "3px" }}>
                ประกัน
              </div>
              {renderInsuranceItems()}
            </div>

            {/* วันที่นัดรับ */}
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

            {/* หมายเหตุ */}
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

          {/* ยอดรวม / วิธีชำระ */}
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
            </div>
          </div>

          {/* ท้ายบิล */}
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
      </div>

      {/* สไตล์พิมพ์ */}
      <style>
        {`
        @media print {
  body * {
    visibility: hidden;
    margin: 0;
    padding: 0;
  }
  #bill-to-print, #bill-to-print * {
    visibility: visible;
  }

  /* หัวบิล */
  #bill-to-print .print-header {
    position: relative;   /* ❌ ไม่ต้อง fixed แล้ว */
    top: 0;
    left: 0;
    width: 100%;
    background: white;
    margin-bottom: 4px;   /* ✅ เว้นเล็กน้อยพอ */
  }

  #bill-to-print .print-body {
    padding-top: 0 !important; /* ❌ ตัด padding-top ทิ้ง */
  }

  #bill-to-print {
    position: relative;
    left: 0;
    top: 0;
    width: 80mm;
    margin: 0 auto;
    padding: 0;
    border: none;
    box-shadow: none;
    font-size: 14px;
  }

  .no-print {
    display: none !important;
  }

  @page {
    size: 80mm auto;
    margin: 4mm; /* ✅ เว้นนิดเดียวรอบๆ */
  }
}

        `}
      </style>
    </div>
  );
};

export default BillPrint;
