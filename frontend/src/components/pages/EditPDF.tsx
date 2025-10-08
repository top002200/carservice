import React from "react";

interface Bill {
  [key: string]: any;
}

interface Props {
  data: Bill[];
  selectedMonthName: string; // ไม่ใช้แล้ว แต่คง prop ไว้เผื่อส่วนอื่นอ้างอิง
  selectedYearText: string; // ไม่ใช้แล้ว แต่คง prop ไว้เผื่อส่วนอื่นอ้างอิง
  formatDate: (date: string) => string;
}

const EditPDF: React.FC<Props> = ({ data, formatDate }) => {
  const rowsPerPage = 15;

  // --- ฟังก์ชันสำหรับแสดงวันที่และเวลาดาวน์โหลด ---
  const getDownloadDateTime = () => {
    const now = new Date();
    const dateOptions: Intl.DateTimeFormatOptions = {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    };
    const timeOptions: Intl.DateTimeFormatOptions = {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    };
    const formattedDate = now.toLocaleDateString("th-TH", dateOptions);
    const formattedTime = now.toLocaleTimeString("th-TH", timeOptions);

    return `วันที่/เวลาดาวน์โหลด: ${formattedDate} เวลา ${formattedTime} น.`;
  };
  // ----------------------------------------------------

  const toNumber = (v: any): number => {
    if (v === null || v === undefined || v === "") return 0;
    const n = Number(String(v).replace(/,/g, "").trim());
    return Number.isFinite(n) ? n : 0;
  };

  const formatNumber = (value: number) =>
    value.toLocaleString(undefined, { minimumFractionDigits: 2 });

  // *** ปรับปรุง BASE STYLES ***
  const borderStyle = "1px solid #ccc";
  const borderRed = "3px solid red"; // สำหรับ เงินสด, โอน
  const borderPurple = "3px solid purple"; // สำหรับ ทั้งหมด

  const baseCellStyle: React.CSSProperties = {
    textAlign: "center",
    verticalAlign: "top",
    padding: "4px",
    whiteSpace: "pre-line",
    borderBottom: borderStyle,
    borderRight: borderStyle,
  };

  const baseRightAlignStyle: React.CSSProperties = {
    ...baseCellStyle,
    textAlign: "right",
  };

  // *** กำหนด Style สำหรับ HEADERS (TH) ***
  const thCashStyle: React.CSSProperties = {
    ...baseCellStyle,
    borderLeft: borderRed, // เริ่มกรอบแดงด้านซ้ายที่ 'เงินสด'
    borderTop: borderRed,
    borderBottom: borderRed,
    // borderRight: borderStyle, // ถูกแทนที่ด้วย borderRed ในการแก้ไขนี้
    borderRight: borderRed, // *** แก้ไข: เส้นกั้นระหว่าง เงินสด กับ โอน เป็นสีแดง ***
  };

  const thTransferStyle: React.CSSProperties = {
    ...baseCellStyle,
    borderTop: borderRed, // เชื่อมต่อกรอบด้านบนสีแดง
    borderBottom: borderRed, // เชื่อมต่อกรอบด้านล่างสีแดง
    // borderRight: borderStyle, // ถูกแทนที่ด้วย borderRed ในการแก้ไขนี้
    borderRight: borderRed, // *** แก้ไข: เส้นกั้นระหว่าง โอน กับ ทั้งหมด เป็นสีแดง ***
  };

  const thTotalStyle: React.CSSProperties = {
    ...baseRightAlignStyle,
    borderRight: borderPurple, // ปิดกรอบม่วงด้านขวาที่ 'ทั้งหมด'
    borderTop: borderPurple,
    borderBottom: borderPurple,
  };

  // *** กำหนด Style สำหรับ DATA CELLS (TD) ภายใน tbody ***

  // สไตล์สำหรับคอลัมน์ทั่วไปที่อยู่หน้า 'เงินสด'
  const generalCellStyleData = (index: number): React.CSSProperties => ({
    ...baseCellStyle,
    ...getRowStyle(index),
  });

  // สไตล์สำหรับคอลัมน์ 'เงินสด' (ขอบซ้าย/บน/ล่างเป็นสีแดง)
  const tdCashStyleData = (index: number): React.CSSProperties => ({
    ...baseRightAlignStyle,
    ...getRowStyle(index),
    borderLeft: borderRed,
    borderTop: "none", // ใช้ borderBottom ปกติ
    borderBottom: borderRed,
    // borderRight: borderStyle, // ถูกแทนที่ด้วย borderRed ในการแก้ไขนี้
    borderRight: borderRed, // *** แก้ไข: เส้นกั้นระหว่าง เงินสด กับ โอน เป็นสีแดง ***
  });

  // สไตล์สำหรับคอลัมน์ 'โอน' (ขอบบน/ล่างเป็นสีแดง)
  const tdTransferStyleData = (index: number): React.CSSProperties => ({
    ...baseRightAlignStyle,
    ...getRowStyle(index),
    borderTop: "none", // ใช้ borderBottom ปกติ
    borderBottom: borderRed, // เชื่อมต่อกรอบด้านล่างสีแดง
    // borderRight: borderStyle, // ถูกแทนที่ด้วย borderRed ในการแก้ไขนี้
    borderRight: borderRed, // *** แก้ไข: เส้นกั้นระหว่าง โอน กับ ทั้งหมด เป็นสีแดง ***
  });

  // สไตล์สำหรับคอลัมน์ 'ทั้งหมด' (ขอบขวา/บน/ล่างเป็นสีม่วง)
  const tdTotalStyleData = (index: number): React.CSSProperties => ({
    ...baseRightAlignStyle,
    ...getRowStyle(index),
    borderRight: borderPurple,
    borderTop: "none", // ใช้ borderBottom ปกติ
    borderBottom: borderPurple,
  });

  const getRowStyle = (index: number): React.CSSProperties => ({
    backgroundColor: index % 2 === 0 ? "#ffffff" : "#e0e0e0",
  });

  const renderLines = (values: any[], isNumber = false) =>
    values
      .filter((v) => {
        if (v === undefined || v === null || v === "") return false;
        const s = String(v).trim();
        if (!isNumber) return s !== "0";
        const n = toNumber(s);
        return n !== 0;
      })
      .map((v, idx) => (
        <div key={idx}>
          {isNumber ? toNumber(v).toLocaleString() : String(v)}
        </div>
      ));

  // ---- แยกยอดเงินสด/โอน ต่อบิล (สำหรับสรุปท้ายรายงาน) ----
  const getCashAmount = (b: Bill) => {
    const pm = String(b.payment_method || "").toLowerCase();
    if (pm === "cash+transfer") return toNumber(b.cash_transfer1);
    if (pm === "cash") return toNumber(b.total);
    return 0;
  };

  const getTransferAmount = (b: Bill) => {
    const pm = String(b.payment_method || "").toLowerCase();
    if (pm === "cash+transfer") return toNumber(b.cash_transfer2);
    if (pm === "transfer" || pm === "credit" || pm === "credit_card") {
      return toNumber(b.total);
    }
    return 0;
  };

  const renderTable = (bills: Bill[]) => {
    if (!bills.length) return null;

    // --- จัดเรียงข้อมูลก่อน ---
    const sortedData = [...bills].sort(
      (a, b) =>
        Number(a.bill_number) - Number(b.bill_number) ||
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );

    // --- หาวันแรกและวันสุดท้ายจากชุดข้อมูลที่จัดเรียงแล้ว ---
    const firstDateRaw = sortedData[0]?.created_at;
    const lastDateRaw = sortedData[sortedData.length - 1]?.created_at;

    const firstDateText =
      typeof firstDateRaw === "string" && firstDateRaw
        ? formatDate(firstDateRaw)
        : "-";
    const lastDateText =
      typeof lastDateRaw === "string" && lastDateRaw
        ? formatDate(lastDateRaw)
        : "-";

    // --- จัดหน้า ---
    const pageCount = Math.ceil(sortedData.length / rowsPerPage);
    const pages = Array.from({ length: pageCount }, (_, i) =>
      sortedData.slice(i * rowsPerPage, (i + 1) * rowsPerPage)
    );

    // --- คำนวณยอดรวมทั้งรายงาน (อัปเดตให้รองรับเงินสด+โอน) ---
    const totalCash = bills.reduce((sum, b) => sum + getCashAmount(b), 0);
    const totalTransfer = bills.reduce(
      (sum, b) => sum + getTransferAmount(b),
      0
    );
    const totalAll = bills.reduce((sum, b) => sum + toNumber(b.total), 0);

    return pages.map((pageData, pageIndex) => (
      <div
        key={pageIndex}
        style={{
          pageBreakAfter: pageIndex < pageCount - 1 ? "always" : "auto",
          marginBottom: "20px",
        }}
      >
        {/* ส่วนที่เพิ่ม: วันที่และเวลาดาวน์โหลด */}
        <div
          style={{
            textAlign: "right",
            fontSize: "14px",
            marginBottom: "10px",
          }}
        >
          {getDownloadDateTime()}
        </div>
        {/* หัวข้อรายงาน: แสดงช่วงวันที่เหมือนกันทุกหน้า */}
        <h2 style={{ textAlign: "center", marginBottom: "20px" }}>
          รายงานข้อมูลบิล : {firstDateText} - {lastDateText}
        </h2>

        <table
          style={{
            width: "100%",
            fontSize: "16px",
            borderCollapse: "collapse",
          }}
          border={1}
        >
          <thead>
            <tr style={{ backgroundColor: "#d0d0d0" }}>
              <th style={baseCellStyle}>วันที่</th>
              <th style={baseCellStyle}>เลขที่บิล</th>
              <th style={baseCellStyle}>พนักงานออกบิล</th>
              <th style={baseCellStyle}>ทะเบียน</th>
              <th style={baseCellStyle}>ตรวจ</th>
              <th style={baseCellStyle}>พรบ</th>
              <th style={baseCellStyle}>ภาษี</th>
              <th style={baseCellStyle}>ค่าฝากต่อ</th>
              <th style={baseCellStyle}>บริการเสริม</th>
              <th style={baseCellStyle}>เพิ่มเติม</th>
              {/* คอลัมน์ 'ประกัน' กลับไปใช้สไตล์ปกติ */}
              <th style={baseCellStyle}>ประกัน</th>
              {/* คอลัมน์ 'เงินสด' เริ่มกรอบแดงและมีเส้นกั้นขวาเป็นสีแดง */}
              <th style={thCashStyle}>เงินสด</th>
              {/* คอลัมน์ 'โอน' มีเส้นกั้นขวาเป็นสีแดง */}
              <th style={thTransferStyle}>โอน</th>
              {/* คอลัมน์ 'ทั้งหมด' ปิดกรอบม่วง */}
              <th style={thTotalStyle}>ทั้งหมด</th>
            </tr>
          </thead>
          <tbody>
            {pageData.map((item, index) => {
              const carRegs = renderLines(
                [
                  item.car_registration1,
                  item.car_registration2,
                  item.car_registration3,
                  item.car_registration4,
                ],
                false
              );

              const checks = renderLines(
                [item.check1, item.check2, item.check3, item.check4],
                true
              );

              const amounts = renderLines(
                [item.amount1, item.amount2, item.amount3, item.amount4],
                true
              );

              const taxes = renderLines(
                [item.tax1, item.tax2, item.tax3, item.tax4],
                true
              );

              const taxgos = renderLines(
                [item.taxgo1, item.taxgo2, item.taxgo3, item.taxgo4],
                true
              );

              const extensionNames = renderLines(
                [item.extension1, item.extension3],
                false
              );

              const extensionPrices = renderLines(
                [item.extension2, item.extension4],
                true
              );

              const typeRefers = renderLines(
                [
                  item.typerefer1,
                  item.typerefer2,
                  item.typerefer3,
                  item.typerefer4,
                ],
                false
              );

              // --- แสดงค่าตามวิธีชำระ ---
              const pm = String(item.payment_method || "").toLowerCase();
              const isCashOnly = pm === "cash";
              const isTransferOnly =
                pm === "transfer" || pm === "credit" || pm === "credit_card";
              const isSplit = pm === "cash+transfer";

              const cashDisplay = isSplit
                ? toNumber(item.cash_transfer1).toLocaleString()
                : isCashOnly
                ? toNumber(item.total).toLocaleString()
                : "-";

              const transferDisplay = isSplit
                ? toNumber(item.cash_transfer2).toLocaleString()
                : isTransferOnly
                ? toNumber(item.total).toLocaleString()
                : "-";

              // *** กำหนดสไตล์ในแถวข้อมูลโดยใช้ index ***
              const styleRowIndex = index;

              return (
                <tr key={index}>
                  <td style={generalCellStyleData(styleRowIndex)}>
                    {item.created_at ? formatDate(item.created_at) : "-"}
                  </td>
                  <td style={generalCellStyleData(styleRowIndex)}>
                    {item.bill_number || item.id}
                  </td>
                  <td style={generalCellStyleData(styleRowIndex)}>
                    {item.user?.user_name || item.created_by || "-"}
                  </td>
                  <td style={generalCellStyleData(styleRowIndex)}>
                    {carRegs.length ? carRegs : "-"}
                  </td>
                  <td style={generalCellStyleData(styleRowIndex)}>
                    {checks.length ? checks : "-"}
                  </td>
                  <td style={generalCellStyleData(styleRowIndex)}>
                    {amounts.length ? amounts : "-"}
                  </td>
                  <td style={generalCellStyleData(styleRowIndex)}>
                    {taxes.length ? taxes : "-"}
                  </td>
                  <td style={generalCellStyleData(styleRowIndex)}>
                    {taxgos.length ? taxgos : "-"}
                  </td>
                  <td style={generalCellStyleData(styleRowIndex)}>
                    {extensionNames.length ? extensionNames : "-"}
                  </td>
                  <td style={generalCellStyleData(styleRowIndex)}>
                    {extensionPrices.length ? extensionPrices : "-"}
                  </td>
                  {/* คอลัมน์ 'ประกัน' ใช้สไตล์ปกติ */}
                  <td style={generalCellStyleData(styleRowIndex)}>
                    {typeRefers.length ? typeRefers : "-"}
                  </td>
                  {/* คอลัมน์ 'เงินสด' เริ่มกรอบแดงและมีเส้นกั้นขวาเป็นสีแดง */}
                  <td style={tdCashStyleData(styleRowIndex)}>{cashDisplay}</td>
                  {/* คอลัมน์ 'โอน' มีเส้นกั้นขวาเป็นสีแดง */}
                  <td style={tdTransferStyleData(styleRowIndex)}>
                    {transferDisplay}
                  </td>
                  {/* คอลัมน์ 'ทั้งหมด' ปิดกรอบม่วง */}
                  <td style={tdTotalStyleData(styleRowIndex)}>
                    {toNumber(item.total).toLocaleString()}
                  </td>
                </tr>
              );
            })}

            {/* สรุปยอดรวมเฉพาะหน้าสุดท้าย */}
            {pageIndex === pageCount - 1 && (
              <tr>
                <td colSpan={14} style={{ padding: 0, border: "none" }}>
                  <div
                    style={{
                      width: "100%",
                      textAlign: "right",
                      fontWeight: "bold",
                      padding: "8px 4px",
                      borderTop: "2px solid black",
                    }}
                  >
                    เงินสด: {formatNumber(totalCash)} | โอน:{" "}
                    {formatNumber(totalTransfer)} | รวม:{" "}
                    {formatNumber(totalAll)}
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    ));
  };

  return (
    <div
      id="pdf-content"
      style={{
        width: "1122px",
        minHeight: "794px",
        backgroundColor: "white",
        padding: "20px",
        fontFamily: "THSarabunNew, sans-serif",
        fontSize: "16px",
        boxSizing: "border-box",
        margin: "0 auto",
      }}
    >
      {renderTable(data)}
    </div>
  );
};

export default EditPDF;