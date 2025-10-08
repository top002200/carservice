import React, { useState, useEffect, useRef } from "react";
import { Table, Button, Modal, Form, Pagination } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCircleInfo,
  faFilePdf,
  faPlus,
  faCreditCard,
} from "@fortawesome/free-solid-svg-icons";
import { getAllBills, updateBill } from "../../services/api";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import moment from "moment";
import EditPDF from "./EditPDF";
import html2pdf from "html2pdf.js";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import ModalPay from "./ModalPay";
import { BillData } from "../../interface/IBill.ts";

interface Bill {
  id?: number;
  username: string;
  phone: string;
  created_at: string;
  payment_method: string;
  description: string;
  [key: string]: any;
}

const User: React.FC = () => {
  const [bills, setBills] = useState<Bill[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMonth] = useState("");
  const [selectedYear] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 9;
  const navigate = useNavigate();
  const [pdfVisible, setPdfVisible] = useState(false);
  const pdfRef = useRef<HTMLDivElement>(null);
  const [todayOnly, setTodayOnly] = useState(false);
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({
    start: "",
    end: "",
  });
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [adjustType] = useState<"เพิ่ม" | "ลด" | null>(null);
  const [adjustNote, setAdjustNote] = useState("");
  const [adjustAmount, setAdjustAmount] = useState<number | null>(null);
  const [adjustTargetId] = useState<number | null>(null);
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [billToPay, setBillToPay] = useState<BillData | null>(null);

  const fetchBills = async () => {
    try {
      const response = await getAllBills();
      if (response.status && response.data) {
        const sortedBills = response.data.sort((a: Bill, b: Bill) => {
          return (
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );
        });
        setBills(sortedBills);
      }
    } catch (error) {
      console.error("Error fetching bills:", error);
      Swal.fire("Error", "Failed to fetch bills", "error");
    }
  };

  useEffect(() => {
    fetchBills();
  }, []);

  const filteredData = bills
    .filter((bill) => {
      if (!bill.created_at) return false;

      const date = new Date(bill.created_at);
      const itemDateStr = date.toISOString().slice(0, 10);

      // ถ้าเลือกวันนี้
      if (todayOnly) {
        const todayStr = new Date().toISOString().slice(0, 10);
        return itemDateStr === todayStr;
      }

      // ถ้าเลือกช่วงเวลา
      if (dateRange.start && dateRange.end) {
        return itemDateStr >= dateRange.start && itemDateStr <= dateRange.end;
      }

      // ถ้าไม่เลือกวันนี้/ช่วง → ใช้เดือน+ปี
      const itemMonth = date.getMonth() + 1;
      const itemYear = date.getFullYear();
      const isMonthMatched =
        selectedMonth === "" || itemMonth === parseInt(selectedMonth);
      const isYearMatched =
        selectedYear === "" || itemYear === parseInt(selectedYear);

      return isMonthMatched && isYearMatched;
    })
    .filter((bill) => {
      const search = searchTerm.toLowerCase();
      return (
        bill.bill_number?.toLowerCase().includes(search) ||
        bill.username?.toLowerCase().includes(search) ||
        bill.car_registration1?.toLowerCase().includes(search) ||
        bill.car_registration2?.toLowerCase().includes(search) ||
        bill.car_registration3?.toLowerCase().includes(search) ||
        bill.car_registration4?.toLowerCase().includes(search)
      );
    })

    .sort((a, b) => {
      const dateA = new Date(a.created_at || "");
      const dateB = new Date(b.created_at || "");
      return dateB.getTime() - dateA.getTime();
    });

  const totalPages = Math.ceil(filteredData.length / rowsPerPage);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  const openBillDetail = (bill: Bill) => {
    setSelectedBill(bill);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedBill(null);
  };

  const formatDate = (dateString: string) => {
    return moment(dateString).format("DD/MM/YYYY");
  };

  const handleLogout = () => {
    Swal.fire({
      title: "ออกจากระบบ",
      text: "คุณต้องการออกจากระบบหรือไม่?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "ออกจากระบบ",
      cancelButtonText: "ยกเลิก",
    }).then((result) => {
      if (result.isConfirmed) {
        sessionStorage.removeItem("access_token");
        navigate("/");
      }
    });
  };

  const monthNames = [
    "มกราคม",
    "กุมภาพันธ์",
    "มีนาคม",
    "เมษายน",
    "พฤษภาคม",
    "มิถุนายน",
    "กรกฎาคม",
    "สิงหาคม",
    "กันยายน",
    "ตุลาคม",
    "พฤศจิกายน",
    "ธันวาคม",
  ];
  const handleOpenPayModal = (bill: BillData) => {
    // <--- แก้ไขตรงนี้: ใช้ BillData แทน Bill
    setBillToPay(bill); // ตอนนี้จะไม่มี error แล้ว เพราะ bill เป็น BillData
    setIsPayModalOpen(true);
  };

  const selectedMonthName =
    selectedMonth !== "" ? monthNames[parseInt(selectedMonth) - 1] : "ทั้งหมด";

  const selectedYearText = selectedYear || "ทั้งหมด";

  const exportToPDF = () => {
    setPdfVisible(true); // แสดง EditPDF ก่อน export

    setTimeout(() => {
      const element = document.getElementById("pdf-content");
      if (!element) {
        console.error("ไม่พบ #pdf-content");
        return;
      }

      // ✅ Force ขนาด DOM ให้เท่ากับขนาดแนวนอน
      element.style.width = "1122px";
      element.style.minHeight = "794px";

      html2pdf()
        .set({
          margin: 0,
          filename: `รายงานข้อมูลบิล_${selectedMonthName}_${selectedYearText}.pdf`,
          html2canvas: { scale: 2 },
          jsPDF: {
            unit: "mm",
            format: "a4",
            orientation: "landscape", // ✅ บังคับแนวนอนชัวร์
          },
        })
        .from(element)
        .save()
        .then(() => {
          setPdfVisible(false); // ซ่อน component หลัง export เสร็จ
        });
    }, 200); // เผื่อเวลาให้ render เสร็จ (100–200ms)
  };

  return (
    <div
      style={{
        backgroundColor: "#f8f9fa",
        minHeight: "100vh",
        padding: "0px",
        overflowX: "hidden", // ✅ ป้องกันล้นขวา
      }}
    >
      <div
        className="main-wrapper mx-auto"
        style={{
          maxWidth: "100%",
          overflowX: "auto",
          paddingBottom: "30px",
          border: "2px solid black", // ✅ เพิ่มกรอบสีดำ
          borderRadius: "12px", // ✅ มุมโค้งนิดหน่อย
          padding: "20px", // ✅ เพิ่ม padding ภายในกรอบ
          backgroundColor: "white", // ✅ ตัดกับสีพื้นหลังนอกสุด
        }}
      >
        {pdfVisible && (
          <div
            ref={pdfRef}
            style={{ opacity: 0, position: "absolute", pointerEvents: "none" }}
          >
            <EditPDF
              data={filteredData}
              selectedMonthName={selectedMonthName}
              selectedYearText={selectedYearText}
              formatDate={formatDate}
            />
          </div>
        )}

        <h4
          className="text-center"
          style={{ color: "#74045f", textDecoration: "underline" }}
        >
          <b>รายงานสถานตรวจสภาพรถท็อป - นิว</b>
        </h4>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 15,
            padding: "0 20px",
          }}
        >
          <div
            className="d-flex align-items-center gap-3 flex-wrap shadow-sm"
            style={{
              backgroundColor: "#f0f0f0", // พื้นหลังเทาอ่อน
              padding: "8px 5px",
              borderRadius: "16px",
              border: "1px solid #ddd",
              marginBottom: "20px",
            }}
          >
            {/* Checkbox วันนี้ */}
            <div
              className="d-flex align-items-center px-3 py-2"
              style={{
                backgroundColor: "#fff",
                borderRadius: "12px",
                border: "1px solid #ccc",
                boxShadow: "0 2px 6px rgba(0, 0, 0, 0.05)",
              }}
            >
              <Form.Check
                type="checkbox"
                id="todayCheck"
                label={
                  <span style={{ fontWeight: "bold", color: "#6a1b9a" }}>
                    📆 วันนี้
                  </span>
                }
                checked={todayOnly}
                onChange={(e) => setTodayOnly(e.target.checked)}
              />
            </div>

            {/* DatePicker เริ่มต้น */}
            <div
              className="d-flex flex-column"
              style={{
                backgroundColor: "#fff",
                padding: "5px 12px",
                borderRadius: "6px",
                border: "1px solid #ccc",
                boxShadow: "0 2px 6px rgba(0, 0, 0, 0.05)",
              }}
            >
              <DatePicker
                selected={dateRange.start ? new Date(dateRange.start) : null}
                onChange={(date) => {
                  const d = date ? date.toISOString().slice(0, 10) : "";
                  setDateRange({ ...dateRange, start: d });
                }}
                dateFormat="yyyy-MM-dd"
                placeholderText="📅เลือกวันที่เริ่มต้น"
                className="form-control"
              />
            </div>

            {/* DatePicker สิ้นสุด */}
            <div
              className="d-flex flex-column"
              style={{
                backgroundColor: "#fff",
                padding: "8px 12px",
                borderRadius: "12px",
                border: "1px solid #ccc",
                boxShadow: "0 2px 6px rgba(0, 0, 0, 0.05)",
              }}
            >
              <DatePicker
                selected={dateRange.end ? new Date(dateRange.end) : null}
                onChange={(date) => {
                  const d = date ? date.toISOString().slice(0, 10) : "";
                  setDateRange({ ...dateRange, end: d });
                }}
                dateFormat="yyyy-MM-dd"
                placeholderText="📅เลือกวันที่สิ้นสุด"
                className="form-control"
              />
            </div>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px", // ลดช่องว่างให้ชิดกัน
              padding: "10px 15px",
              background: "#f8f9fa",
              borderRadius: "10px",
              boxShadow: "0 2px 6px rgba(0, 0, 0, 0.08)",
              flexWrap: "wrap",
              justifyContent: "start",
            }}
          >
            {/* Search Input */}
            <Form.Control
              type="text"
              placeholder="🔍 ค้นหา"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: "180px",
                height: "38px",
                borderRadius: "6px",
                fontSize: "14px",
                paddingLeft: "10px",
              }}
            />

            {/* Export PDF Button */}
            <button
              type="button"
              className="btn"
              onClick={exportToPDF}
              title="ดาวน์โหลด PDF"
              style={{
                backgroundColor: "#dc3545",
                color: "#fff",
                height: "38px",
                padding: "0 12px",
                fontSize: "14px",
                borderRadius: "6px",
                boxShadow: "0px 2px 5px rgba(220, 53, 69, 0.3)",
              }}
            >
              <FontAwesomeIcon icon={faFilePdf} /> PDF
            </button>

            {/* Add Bill Button */}
            <button
              type="button"
              className="btn"
              onClick={() => navigate("/user/addbill")}
              title="เพิ่มบิลใหม่"
              style={{
                background: "linear-gradient(135deg, #4e54c8, #8f94fb)",
                color: "white",
                height: "38px",
                padding: "0 14px",
                fontSize: "14px",
                fontWeight: 500,
                borderRadius: "6px",
                boxShadow: "0 2px 5px rgba(78, 84, 200, 0.3)",
              }}
            >
              <FontAwesomeIcon icon={faPlus} /> เพิ่มบิล
            </button>

            {/* Logout Button */}
            <button
              type="button"
              className="btn"
              onClick={handleLogout}
              title="ออกจากระบบ"
              style={{
                backgroundColor: "#6c757d",
                color: "white",
                height: "38px",
                padding: "0 14px",
                fontSize: "14px",
                fontWeight: 500,
                borderRadius: "6px",
                boxShadow: "0px 2px 5px rgba(108, 117, 125, 0.2)",
              }}
            >
              ออกจากระบบ
            </button>
          </div>
        </div>

        {/* Table */}
        <Table bordered hover responsive>
          <thead>
            <tr className="align-middle text-center">
              <th>เลขที่บิล</th>
              <th>ชื่อลูกค้า</th>
              <th>เลขทะเบียน</th>
              <th>เบอร์โทร</th>
              <th>วันที่สร้าง</th>
              <th style={{ width: 100 }}>รายละเอียด</th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((item) => (
              <tr key={item.id} className="align-middle text-center">
                <td>{item.bill_number}</td>
                <td>{item.username}</td>
                <td>
                  {[1, 2, 3, 4]
                    .map((i) => item[`car_registration${i}`])
                    .filter(Boolean)
                    .map((reg, idx) => (
                      <div key={idx}>{reg}</div>
                    ))}
                </td>

                <td>{item.phone}</td>
                <td>{formatDate(item.created_at)}</td>
                <td>
                  {/* 💡 ใช้ d-flex และ gap-2 เพื่อจัดให้อยู่ในแถวเดียวกันและมีช่องว่างระหว่างปุ่ม */}
                  <div className="d-flex justify-content-center">
                    {/* ปุ่ม 1: รายละเอียดบิล */}
                    <Button
                      variant="outline-info"
                      size="sm" // ปรับขนาดให้เป็น sm เพื่อความสวยงามถ้าต้องการ
                      onClick={() => openBillDetail(item)}
                      className="me-2" // 💡 เพิ่มระยะห่างด้านขวาเล็กน้อย
                      title="ดูรายละเอียดบิล"
                    >
                      <FontAwesomeIcon icon={faCircleInfo} />
                    </Button>

                    {/* ปุ่ม 2: บันทึกการชำระเงิน */}
                    <Button
                      variant="outline-success"
                      size="sm"
                      onClick={() => handleOpenPayModal(item as BillData)}
                      title="บันทึกการชำระเงิน"
                    >
                      <FontAwesomeIcon icon={faCreditCard} />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
        <ModalPay
          show={isPayModalOpen}
          onHide={() => setIsPayModalOpen(false)}
          bill={billToPay}
          onSave={() => {
            setIsPayModalOpen(false); // ปิด Modal หลังจากบันทึก
            fetchBills(); // โหลดข้อมูลใหม่ทั้งหมด
          }}
        />

        <Pagination className="justify-content-center">
          <Pagination.Prev
            disabled={currentPage === 1}
            onClick={() => handlePageChange(currentPage - 1)}
          />

          {/* Calculate the range of pages to display */}
          {Array.from({ length: Math.min(totalPages, 10) }, (_, i) => {
            let startPage;
            if (currentPage <= 5) {
              startPage = 1;
            } else if (currentPage > totalPages - 5) {
              startPage = totalPages - 9;
            } else {
              startPage = currentPage - 4;
            }

            // Ensure startPage is not less than 1
            startPage = Math.max(1, startPage);

            const pageNumber = startPage + i;

            // Don't render if the page number exceeds the total number of pages
            if (pageNumber > totalPages) return null;

            return (
              <Pagination.Item
                key={pageNumber}
                active={pageNumber === currentPage}
                onClick={() => handlePageChange(pageNumber)}
              >
                {pageNumber}
              </Pagination.Item>
            );
          })}

          <Pagination.Next
            disabled={currentPage === totalPages}
            onClick={() => handlePageChange(currentPage + 1)}
          />
        </Pagination>
        <Modal
          show={showAdjustModal}
          onHide={() => setShowAdjustModal(false)}
          centered
        >
          <Modal.Header closeButton>
            <Modal.Title>บันทึกเงิน{adjustType}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>จำนวนเงิน</Form.Label>
                <Form.Control
                  type="number"
                  placeholder="กรอกจำนวนเงิน"
                  value={adjustAmount ?? ""}
                  onChange={(e) => setAdjustAmount(parseFloat(e.target.value))}
                />
              </Form.Group>
              <Form.Group>
                <Form.Label>หมายเหตุ</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={2}
                  placeholder="กรอกหมายเหตุ"
                  value={adjustNote}
                  onChange={(e) => setAdjustNote(e.target.value)}
                />
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant="secondary"
              onClick={() => setShowAdjustModal(false)}
            >
              ยกเลิก
            </Button>
            <Button
              variant="primary"
              onClick={async () => {
                if (!adjustTargetId || adjustAmount === null) {
                  Swal.fire("กรุณากรอกข้อมูลให้ครบ", "", "warning");
                  return;
                }
                try {
                  const res = await updateBill(adjustTargetId, {
                    adjustment_type: adjustType || undefined,
                    adjustment_note: adjustNote,
                    adjustment_amount: adjustAmount,
                  });

                  if (res.status) {
                    Swal.fire(
                      "สำเร็จ",
                      `บันทึกเงิน${adjustType}แล้ว`,
                      "success"
                    );
                    fetchBills();
                  } else {
                    Swal.fire("ผิดพลาด", res.message, "error");
                  }
                } catch (err) {
                  Swal.fire(
                    "เกิดข้อผิดพลาด",
                    "ไม่สามารถอัปเดตข้อมูลได้",
                    "error"
                  );
                } finally {
                  setShowAdjustModal(false);
                }
              }}
            >
              บันทึก
            </Button>
          </Modal.Footer>
        </Modal>

        {/* Detail Modal (ใหม่) */}
        <Modal
          show={showModal}
          onHide={closeModal}
          size="lg"
          centered
          dialogClassName="border-0 shadow rounded-4"
          contentClassName="rounded-4"
        >
          <Modal.Header closeButton className="bg-light rounded-top-4">
            <Modal.Title className="text-center w-100 fw-bold text-primary">
              รายละเอียดบิล
            </Modal.Title>
          </Modal.Header>

          <Modal.Body
            style={{
              maxHeight: "70vh",
              overflowY: "auto",
              padding: "24px",
              backgroundColor: "#fdfdfd",
              fontFamily: "THSarabunNew, sans-serif",
              fontSize: 16,
            }}
          >
            {selectedBill ? (
              <div className="container">
                {/* ===== Header ใบเสร็จ ===== */}
                <div className="text-center mb-3">
                  <h5 className="fw-bold mb-1">สถานตรวจสภาพรถคลองหาด</h5>
                  <div>Tel: 083-066-2661, 081-715-8683</div>
                </div>

                <div className="row g-2 mb-3">
                  <div className="col-md-4">
                    <b>เลขที่บิล:</b> {selectedBill.bill_number || "-"}
                  </div>
                  <div className="col-md-4">
                    <b>วันที่:</b>{" "}
                    {moment(selectedBill.created_at).format("DD/MM/YYYY HH:mm")}
                  </div>
                  <div className="col-md-4">
                    <b>พนักงานออกบิล:</b>{" "}
                    {selectedBill.user?.user_name ||
                      selectedBill.created_by ||
                      "-"}
                  </div>
                  <div className="col-md-6">
                    <b>ลูกค้า:</b> {selectedBill.username || "-"}
                  </div>
                  <div className="col-md-6">
                    <b>โทร:</b> {selectedBill.phone || "-"}
                  </div>
                </div>

                <hr className="my-3" />

                {/* ===== สรุปค่าใช้จ่ายทั้งหมด ===== */}
                {(() => {
                  const toNum = (v: any) => {
                    if (v === null || v === undefined || v === "") return 0;
                    const n = Number(String(v).replace(/,/g, "").trim());
                    return Number.isFinite(n) ? n : 0;
                  };
                  const money = (n: number) =>
                    n.toLocaleString(undefined, { minimumFractionDigits: 2 });
                  const notZero = (v: any) => toNum(v) !== 0;

                  const payTH =
                    selectedBill.payment_method === "cash"
                      ? "เงินสด"
                      : selectedBill.payment_method === "transfer"
                      ? "โอนเงิน"
                      : selectedBill.payment_method === "cash+transfer"
                      ? "เงินสดและเงินโอน"
                      : "บัตรเครดิต";

                  const renderItem = (
                    label: string,
                    name: string,
                    amount: number | null
                  ) =>
                    notZero(amount) ? (
                      <div
                        className="d-flex justify-content-between align-items-center p-2 mb-2 border rounded-3"
                        key={name}
                        style={{ backgroundColor: "#f9f9f9" }}
                      >
                        <div>
                          <b>{label}</b>: {name}
                        </div>
                        <div>{money(toNum(amount))} บาท</div>
                      </div>
                    ) : null;

                  return (
                    <div>
                      <h6 className="fw-bold mb-3">สรุปค่าใช้จ่ายทั้งหมด</h6>

                      {/* รายการพรบ */}
                      {renderItem(
                        "รายการพรบ",
                        selectedBill.name1,
                        selectedBill.amount1
                      )}
                      {renderItem(
                        "รายการพรบ",
                        selectedBill.name2,
                        selectedBill.amount2
                      )}
                      {renderItem(
                        "รายการพรบ",
                        selectedBill.name3,
                        selectedBill.amount3
                      )}
                      {renderItem(
                        "รายการพรบ",
                        selectedBill.name4,
                        selectedBill.amount4
                      )}

                      {/* ตรวจสภาพรถ */}
                      {[1, 2, 3, 4].map((i) => {
                        const reg = (selectedBill as any)[
                          `car_registration${i}`
                        ];
                        const chk = (selectedBill as any)[`check${i}`];
                        return notZero(chk) ? (
                          <div
                            className="d-flex justify-content-between align-items-center p-2 mb-2 border rounded-3"
                            key={`check-${i}`}
                          >
                            <div>
                              <b>ตรวจสภาพ {reg || "-"}</b>
                            </div>
                            <div>{money(toNum(chk))} บาท</div>
                          </div>
                        ) : null;
                      })}

                      {/* ภาษีและฝากต่อ */}
                      {[1, 2, 3, 4].map((i) => {
                        const reg = (selectedBill as any)[
                          `car_registration${i}`
                        ];
                        const tax = (selectedBill as any)[`tax${i}`];
                        const taxgo = (selectedBill as any)[`taxgo${i}`];
                        if (!notZero(tax) && !notZero(taxgo)) return null;
                        return (
                          <div
                            className="d-flex justify-content-between align-items-center p-2 mb-2 border rounded-3"
                            key={`tax-${i}`}
                            style={{ backgroundColor: "#eaf5ff" }}
                          >
                            <div>
                              {notZero(tax) && (
                                <div>
                                  ค่าภาษี {reg || "-"}: {money(toNum(tax))} บาท
                                </div>
                              )}
                              {notZero(taxgo) && (
                                <div>ค่าฝากต่อ: {money(toNum(taxgo))} บาท</div>
                              )}
                            </div>
                          </div>
                        );
                      })}

                      {/* ประกัน / refer */}
                      {[1, 2, 3, 4].map((i) => {
                        const ref = (selectedBill as any)[`refer${i}`];
                        const type = (selectedBill as any)[`typerefer${i}`];
                        if (!ref && !type) return null;
                        return (
                          <div
                            className="d-flex justify-content-between align-items-center p-2 mb-2 border rounded-3"
                            key={`refer-${i}`}
                            style={{ backgroundColor: "#fff4e5" }}
                          >
                            <div>{type || ref}</div>
                            <div>-</div>
                          </div>
                        );
                      })}

                      {/* รายละเอียดเพิ่มเติม */}
                      {selectedBill.description && (
                        <div
                          className="border rounded-3 p-2 mb-3"
                          style={{ backgroundColor: "#f5f5f5" }}
                        >
                          <b>รายละเอียดเพิ่มเติม:</b> {selectedBill.description}
                        </div>
                      )}

                      <hr className="my-3" />

                      {/* ยอดรวม & วิธีชำระ */}
                      <div
                        className="d-flex justify-content-between align-items-center p-2 border rounded-3"
                        style={{ backgroundColor: "#dff0d8" }}
                      >
                        <h5 className="fw-bold mb-0">
                          ยอดรวมทั้งสิ้น: {money(toNum(selectedBill.total))} บาท
                        </h5>
                        <div>
                          <b>ชำระโดย:</b> {payTH}
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            ) : (
              <p className="text-danger text-center">ไม่พบข้อมูล</p>
            )}
          </Modal.Body>

          <Modal.Footer className="bg-light rounded-bottom-4">
            <Button variant="secondary" onClick={closeModal}>
              ปิด
            </Button>
            <Button
              variant="warning"
              style={{ minWidth: 140, fontWeight: "bold", textAlign: "center" }}
              onClick={() => {
                setTimeout(() => {
                  navigate("/user/bill-print", {
                    state: { billData: selectedBill },
                  });
                  setShowModal(false);
                }, 300);
              }}
            >
              พิมพ์บิล
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    </div>
  );
};

export default User;
