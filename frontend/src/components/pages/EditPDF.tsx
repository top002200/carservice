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
  const pages = Array.from({ length: pageCount }, (_, i) =>
    data.slice(i * rowsPerPage, (i + 1) * rowsPerPage)
  );

  const totalAll = data.reduce(
    (sum, item) => sum + (parseFloat(item.total) || 0),
    0
  );

  const formatNumber = (value: number) =>
    value.toLocaleString(undefined, { minimumFractionDigits: 2 });

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
              fontSize: "14px",
              borderCollapse: "collapse",
            }}
            border={1}
          >
            <thead>
              <tr style={{ backgroundColor: "#f0f0f0", textAlign: "center" }}>
                <th>วันที่</th>
                <th>เลขที่บิล</th>
                <th>ชื่อ</th>
                <th>เบอร์</th>
                <th>ทะเบียน</th>
                <th>พรบ</th>
                <th>ภาษี</th>
                <th>ค่าฝากต่อ</th>
                <th>บริการเสริม</th>
                <th>ประกัน</th>
                <th>ประเภทจ่ายเงิน</th>
                <th>ทั้งหมด</th>
              </tr>
            </thead>
            <tbody>
              {pageData.map((item, index) => {
                const formatArray = (keys: string[]) =>
                  keys
                    .map((key) => item[key])
                    .filter(Boolean)
                    .join(", ");

                const formatNumberArray = (keys: string[]) =>
                  keys
                    .map((key) =>
                      item[key] ? parseFloat(item[key]).toLocaleString() : ""
                    )
                    .filter(Boolean)
                    .join(", ");

                const carRegs = formatArray([
                  "car_registration1",
                  "car_registration2",
                  "car_registration3",
                  "car_registration4",
                ]);

                const amounts = formatNumberArray([
                  "amount1",
                  "amount2",
                  "amount3",
                  "amount4",
                ]);

                const taxes = formatNumberArray([
                  "tax1",
                  "tax2",
                  "tax3",
                  "tax4",
                ]);
                const taxgos = formatNumberArray([
                  "taxgo1",
                  "taxgo2",
                  "taxgo3",
                  "taxgo4",
                ]);

                const extensions = formatNumberArray([
                  "extension2",
                  "extension4",
                ]);

                const typeRefers = formatArray([
                  "typerefer1",
                  "typerefer2",
                  "typerefer3",
                  "typerefer4",
                ]);

                const paymentType =
                  item.payment_method === "cash"
                    ? "เงินสด"
                    : item.payment_method === "transfer"
                    ? "โอนเงิน"
                    : "บัตรเครดิต";

                return (
                  <tr key={index}>
                    <td>{formatDate(item.created_at)}</td>
                    <td>{item.bill_number || item.id}</td>
                    <td>{item.username}</td>
                    <td>{item.phone}</td>
                    <td>{carRegs || "-"}</td>
                    <td>{amounts || "-"}</td>
                    <td>{taxes || "-"}</td>
                    <td>{taxgos || "-"}</td>
                    <td>{extensions || "-"}</td>
                    <td>{typeRefers || "-"}</td>
                    <td>{paymentType}</td>
                    <td style={{ textAlign: "right" }}>
                      {item.total
                        ? parseFloat(item.total).toLocaleString()
                        : "0.00"}
                    </td>
                  </tr>
                );
              })}

              {/* ✅ สรุปยอดเฉพาะหน้าสุดท้าย */}
              {pageIndex === pageCount - 1 && (
                <tr>
                  <td
                    colSpan={11}
                    style={{ textAlign: "right", fontWeight: "bold" }}
                  >
                    รวมทั้งหมด
                  </td>
                  <td style={{ textAlign: "right", fontWeight: "bold" }}>
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
