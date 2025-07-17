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
  const rowsPerPage = 20;
  const pageCount = Math.ceil(data.length / rowsPerPage);
  const sortedData = [...data].sort(
    (a, b) =>
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );

  const pages = Array.from({ length: pageCount }, (_, i) =>
    sortedData.slice(i * rowsPerPage, (i + 1) * rowsPerPage)
  );

  const totalAll = data.reduce(
    (sum, item) => sum + (parseFloat(item.total) || 0),
    0
  );

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

  const renderLines = (values: any[]) =>
    values
      .filter((v) => {
        if (v === undefined || v === null || v === "") return false;
        const num = parseFloat(v);
        return isNaN(num) ? true : num !== 0;
      })
      .map((v, idx) => (
        <div key={idx}>
          {typeof v === "number"
            ? v.toLocaleString()
            : isNaN(parseFloat(v))
            ? String(v)
            : parseFloat(v).toLocaleString()}
        </div>
      ));

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
      {pages.map((pageData, pageIndex) => (
        <div
          key={pageIndex}
          style={{
            pageBreakAfter: pageIndex < pageCount - 1 ? "always" : "auto",
            marginBottom: "20px",
          }}
        >
          <h2 style={{ textAlign: "center", marginBottom: "20px" }}>
            รายงานข้อมูลบิล: เดือน {selectedMonthName} ปี {selectedYearText}
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
                <th style={cellStyle}>พรบ</th>
                <th style={cellStyle}>ภาษี</th>
                <th style={cellStyle}>ค่าฝากต่อ</th>
                <th style={cellStyle}>หัวข้อเพิ่มเติม</th>
                <th style={cellStyle}>เพิ่มเติม</th>
                <th style={cellStyle}>ประกัน</th>
                <th style={cellStyle}>ประเภทจ่ายเงิน</th>
                <th style={rightAlignStyle}>ทั้งหมด</th>
              </tr>
            </thead>
            <tbody>
              {pageData.map((item, index) => {
                const styleRow = getRowStyle(index);

                const carRegs = renderLines([
                  item.car_registration1,
                  item.car_registration2,
                  item.car_registration3,
                  item.car_registration4,
                ]);

                const amounts = renderLines([
                  item.amount1,
                  item.amount2,
                  item.amount3,
                  item.amount4,
                ]);

                const taxes = renderLines([
                  item.tax1,
                  item.tax2,
                  item.tax3,
                  item.tax4,
                ]);

                const taxgos = renderLines([
                  item.taxgo1,
                  item.taxgo2,
                  item.taxgo3,
                  item.taxgo4,
                ]);

                const extensionNames = renderLines([
                  item.extension1,
                  item.extension3,
                ]);

                const extensionPrices = renderLines([
                  item.extension2,
                  item.extension4,
                ]);

                const typeRefers = renderLines([
                  item.typerefer1,
                  item.typerefer2,
                  item.typerefer3,
                  item.typerefer4,
                ]);

                const paymentType =
                  item.payment_method === "cash"
                    ? "เงินสด"
                    : item.payment_method === "transfer"
                    ? "โอนเงิน"
                    : "บัตรเครดิต";

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
                    <td style={{ ...cellStyle, ...styleRow }}>{paymentType}</td>
                    <td style={{ ...rightAlignStyle, ...styleRow }}>
                      {item.total
                        ? parseFloat(item.total).toLocaleString()
                        : "0.00"}
                    </td>
                  </tr>
                );
              })}

              {pageIndex === pageCount - 1 && (
                <tr>
                  <td
                    colSpan={10}
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
      ))}
    </div>
  );
};

export default EditPDF;
