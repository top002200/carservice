import React from "react";

interface Bill {
  [key: string]: any;
}

interface Props {
  data: Bill[];
  selectedMonthName: string;
  selectedYearText: string;
  formatDate: (date: string) => string;
}

const EditPDF: React.FC<Props> = ({
  data,
  selectedMonthName,
  selectedYearText,
  formatDate,
}) => {
  const rowsPerPage = 15;

  const toNumber = (v: any): number => {
    if (v === null || v === undefined || v === "") return 0;
    const n = Number(String(v).replace(/,/g, "").trim());
    return Number.isFinite(n) ? n : 0;
  };

  const formatNumber = (value: number) =>
    value.toLocaleString(undefined, { minimumFractionDigits: 2 });

  const cellStyle: React.CSSProperties = {
    textAlign: "center",
    verticalAlign: "top",
    padding: "4px",
    whiteSpace: "pre-line",
    borderBottom: "1px solid #ccc",
  };

  const rightAlignStyle: React.CSSProperties = {
    textAlign: "right",
    verticalAlign: "top",
    padding: "4px",
    whiteSpace: "pre-line",
    borderBottom: "1px solid #ccc",
  };

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

  const renderTable = (bills: Bill[]) => {
    if (!bills.length) return null;

    // ✅ เรียงตามเลขที่บิล (ถ้าเป็นตัวเลขก็แปลง)
    const sortedData = [...bills].sort(
      (a, b) =>
        Number(a.bill_number) - Number(b.bill_number) ||
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );

    const pageCount = Math.ceil(sortedData.length / rowsPerPage);
    const pages = Array.from({ length: pageCount }, (_, i) =>
      sortedData.slice(i * rowsPerPage, (i + 1) * rowsPerPage)
    );

    const totalAll = bills.reduce((sum, item) => sum + toNumber(item.total), 0);

    return pages.map((pageData, pageIndex) => (
      <div
        key={pageIndex}
        style={{
          pageBreakAfter: pageIndex < pageCount - 1 ? "always" : "auto",
          marginBottom: "20px",
        }}
      >
        <h2 style={{ textAlign: "center", marginBottom: "20px" }}>
          รายงานข้อมูลบิล: {selectedMonthName} {selectedYearText}
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
              <th style={cellStyle}>วันที่</th>
              <th style={cellStyle}>เลขที่บิล</th>
              <th style={cellStyle}>พนักงานออกบิล</th>
              <th style={cellStyle}>ทะเบียน</th>
              <th style={cellStyle}>ตรวจ</th>
              <th style={cellStyle}>พรบ</th>
              <th style={cellStyle}>ภาษี</th>
              <th style={cellStyle}>ค่าฝากต่อ</th>
              <th style={cellStyle}>บริการเสริม</th>
              <th style={cellStyle}>เพิ่มเติม</th>
              <th style={cellStyle}>ประกัน</th>
              <th style={cellStyle}>เงินสด</th>
              <th style={cellStyle}>โอน</th>
              <th style={rightAlignStyle}>ทั้งหมด</th>
            </tr>
          </thead>
          <tbody>
            {pageData.map((item, index) => {
              const styleRow = getRowStyle(index);

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

              // ✅ แยกเป็นคอลัมน์ เงินสด กับ โอน
              const isCash = item.payment_method === "cash";
              const isTransfer =
                item.payment_method === "transfer" ||
                item.payment_method === "credit";

              return (
                <tr key={index}>
                  <td style={{ ...cellStyle, ...styleRow }}>
                    {formatDate(item.created_at)}
                  </td>
                  <td style={{ ...cellStyle, ...styleRow }}>
                    {item.bill_number || item.id}
                  </td>
                  <td style={{ ...cellStyle, ...styleRow }}>
                    {item.user?.user_name
                      ? `(${item.user.user_name})`
                      : `(${item.created_by})`}
                  </td>
                  <td style={{ ...cellStyle, ...styleRow }}>
                    {carRegs.length ? carRegs : "-"}
                  </td>
                  <td style={{ ...cellStyle, ...styleRow }}>
                    {checks.length ? checks : "-"}
                  </td>
                  <td style={{ ...cellStyle, ...styleRow }}>
                    {amounts.length ? amounts : "-"}
                  </td>
                  <td style={{ ...cellStyle, ...styleRow }}>
                    {taxes.length ? taxes : "-"}
                  </td>
                  <td style={{ ...cellStyle, ...styleRow }}>
                    {taxgos.length ? taxgos : "-"}
                  </td>
                  <td style={{ ...cellStyle, ...styleRow }}>
                    {extensionNames.length ? extensionNames : "-"}
                  </td>
                  <td style={{ ...cellStyle, ...styleRow }}>
                    {extensionPrices.length ? extensionPrices : "-"}
                  </td>
                  <td style={{ ...cellStyle, ...styleRow }}>
                    {typeRefers.length ? typeRefers : "-"}
                  </td>
                  <td style={{ ...cellStyle, ...styleRow }}>
                    {isCash ? "เงินสด" : "-"}
                  </td>
                  <td style={{ ...cellStyle, ...styleRow }}>
                    {isTransfer ? "โอน" : "-"}
                  </td>
                  <td style={{ ...rightAlignStyle, ...styleRow }}>
                    {toNumber(item.total).toLocaleString()}
                  </td>
                </tr>
              );
            })}

            {pageIndex === pageCount - 1 && (
              <tr>
                <td
                  colSpan={13}
                  style={{
                    textAlign: "right",
                    fontWeight: "bold",
                    padding: "4px",
                    borderTop: "2px solid black",
                  }}
                >
                  รวมทั้งหมด
                </td>
                <td
                  style={{
                    ...rightAlignStyle,
                    borderTop: "2px solid black",
                  }}
                >
                  {formatNumber(totalAll)}
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
