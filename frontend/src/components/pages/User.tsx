import React, { useState, useEffect, useRef } from "react";
import { Table, Button, Modal, Form, Pagination } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCircleInfo,
  faFilePdf,
  faPlus,
  faMinus,
} from "@fortawesome/free-solid-svg-icons";
import { getAllBills, updateBill } from "../../services/api";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import moment from "moment";
import EditPDF from "./EditPDF";
import html2pdf from "html2pdf.js";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

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
  const [adjustType, setAdjustType] = useState<"เพิ่ม" | "ลด" | null>(null);
  const [adjustNote, setAdjustNote] = useState("");
  const [adjustAmount, setAdjustAmount] = useState<number | null>(null);
  const [adjustTargetId, setAdjustTargetId] = useState<number | null>(null);

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

  const openAdjustmentModal = (billId: number, type: "เพิ่ม" | "ลด") => {
    setAdjustTargetId(billId);
    setAdjustType(type);
    setAdjustNote("");
    setAdjustAmount(null);
    setShowAdjustModal(true);
  };


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
              <th style={{ width: 150 }}>เงินเพิ่มเงินคืน</th>
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
                  <Button
                    variant="outline-info"
                    onClick={() => openBillDetail(item)}
                  >
                    <FontAwesomeIcon icon={faCircleInfo} />
                  </Button>
                </td>
                <td>
                  {item.adjustment_type ? (
                    <span
                      className="badge bg-secondary px-3 py-2"
                      style={{ fontSize: "14px", borderRadius: "10px" }}
                    >
                      ✅ บันทึกเงิน{item.adjustment_type}แล้ว
                    </span>
                  ) : (
                    <div
                      className="d-flex justify-content-center align-items-center"
                      style={{
                        border: "1px solid #dee2e6",
                        borderRadius: "12px",
                        padding: "8px",
                        minHeight: "45px",
                        gap: "10px",
                        backgroundColor: "#f9f9f9",
                      }}
                    >
                      <Button
                        variant="outline-success"
                        size="sm"
                        title="บันทึกว่าเงินเพิ่ม"
                        onClick={() => openAdjustmentModal(item.id!, "เพิ่ม")}
                        style={{
                          borderRadius: "8px",
                          padding: "6px 10px",
                          fontWeight: "bold",
                          fontSize: "14px",
                          boxShadow: "0 1px 4px rgba(0, 128, 0, 0.2)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <FontAwesomeIcon icon={faPlus} />
                      </Button>

                      <Button
                        variant="outline-danger"
                        size="sm"
                        title="บันทึกว่าเงินลด"
                        onClick={() => openAdjustmentModal(item.id!, "ลด")}
                        style={{
                          borderRadius: "8px",
                          padding: "6px 10px",
                          fontWeight: "bold",
                          fontSize: "14px",
                          boxShadow: "0 1px 4px rgba(220, 53, 69, 0.2)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <FontAwesomeIcon icon={faMinus} />
                      </Button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </Table>

        {/* Pagination Controls */}
        <Pagination className="justify-content-center">
          <Pagination.Prev
            disabled={currentPage === 1}
            onClick={() => handlePageChange(currentPage - 1)}
          />
          {[...Array(totalPages).keys()].map((page) => (
            <Pagination.Item
              key={page + 1}
              active={page + 1 === currentPage}
              onClick={() => handlePageChange(page + 1)}
            >
              {page + 1}
            </Pagination.Item>
          ))}
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

        {/* Detail Modal */}
        <Modal
          show={showModal}
          onHide={closeModal}
          size="xl"
          centered
          dialogClassName="border-0 shadow rounded-4"
          contentClassName="rounded-4"
        >
          <Modal.Header closeButton className="bg-light rounded-top-4">
            <Modal.Title className="text-center w-100 fw-bold text-primary">
              รายละเอียดบิลเลขที่ {selectedBill?.id}
            </Modal.Title>
          </Modal.Header>

          <Modal.Body
            style={{
              maxHeight: "70vh",
              overflowY: "auto",
              padding: "30px",
              backgroundColor: "#fdfdfd",
            }}
          >
            {selectedBill ? (
              <div className="container">
                {/* ข้อมูลลูกค้า */}
                <div className="mb-4">
                  <h5 className="border-bottom pb-2 text-dark fw-bold">
                    ข้อมูลลูกค้า
                  </h5>
                  <div className="row">
                    <div className="col-md-4">
                      <p>
                        <b>ชื่อลูกค้า :</b> {selectedBill.username}
                      </p>
                    </div>
                    <div className="col-md-4">
                      <p>
                        <b>เบอร์โทร :</b> {selectedBill.phone}
                      </p>
                    </div>
                    <div className="col-md-4">
                      <p>
                        <b>วันที่สร้าง :</b>{" "}
                        {formatDate(selectedBill.created_at)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* ข้อมูลการชำระเงิน */}
                <div className="mb-4">
                  <h5 className="border-bottom pb-2 text-dark fw-bold">
                    ข้อมูลการชำระเงิน
                  </h5>
                  <div className="row">
                    <div className="col-md-6">
                      <p>
                        <b>วิธีการชำระเงิน :</b>{" "}
                        {selectedBill.payment_method === "cash"
                          ? "เงินสด"
                          : selectedBill.payment_method === "transfer"
                          ? "โอนเงิน"
                          : "บัตรเครดิต"}
                      </p>
                    </div>
                    <div className="col-md-6">
                      <p>
                        <b>หมายเหตุ :</b> {selectedBill.description || "-"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* รายการบริการ */}
                <div className="mb-4">
                  <h5 className="border-bottom pb-2 text-dark fw-bold">
                    รายการบริการ
                  </h5>
                  <Table bordered hover responsive size="sm">
                    <thead className="table-light text-center">
                      <tr>
                        <th>ลำดับ</th>
                        <th>รายการ</th>
                        <th>จำนวนเงิน (บาท)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[1, 2, 3, 4].map(
                        (i) =>
                          selectedBill[`name${i}`] && (
                            <tr key={i}>
                              <td className="text-center">{i}</td>
                              <td>{selectedBill[`name${i}`]}</td>
                              <td className="text-end">
                                {selectedBill[`amount${i}`]?.toLocaleString()}
                              </td>
                            </tr>
                          )
                      )}
                    </tbody>
                  </Table>
                </div>

                {/* ข้อมูลรถ */}
                <div className="mb-4">
                  <h5 className="border-bottom pb-2 text-dark fw-bold">
                    ข้อมูลรถ
                  </h5>
                  <Table bordered hover responsive size="sm">
                    <thead className="table-light text-center">
                      <tr>
                        <th>ลำดับ</th>
                        <th>ทะเบียนรถ</th>
                        <th>ประเภทบริการ</th>
                        <th>ค่าบริการ</th>
                        <th>ภาษี/ค่าปรับ</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[1, 2, 3, 4].map(
                        (i) =>
                          selectedBill[`car_registration${i}`] && (
                            <tr key={i}>
                              <td className="text-center">{i}</td>
                              <td>{selectedBill[`car_registration${i}`]}</td>
                              <td>
                                {selectedBill[`check${i}`] === 60
                                  ? "มอไซค์"
                                  : selectedBill[`check${i}`] === 200
                                  ? "รถยนต์"
                                  : "-"}
                              </td>
                              <td className="text-end">
                                {selectedBill[`check${i}`]?.toLocaleString()}
                              </td>
                              <td className="text-end">
                                {selectedBill[`tax${i}`]?.toLocaleString()}
                              </td>
                            </tr>
                          )
                      )}
                    </tbody>
                  </Table>
                </div>

                {/* ภาษีและฝากต่อ */}
                <div className="mb-4">
                  <h5 className="border-bottom pb-2 text-dark fw-bold">
                    ภาษีและฝากต่อ
                  </h5>
                  <Table bordered hover responsive size="sm">
                    <thead className="table-light text-center">
                      <tr>
                        <th>ลำดับ</th>
                        <th>ทะเบียนรถ</th>
                        <th>ค่าภาษีทะเบียน</th>
                        <th>ค่าฝากต่อ</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[1, 2, 3, 4].map(
                        (i) =>
                          (selectedBill[`tax${i}`] ||
                            selectedBill[`taxgo${i}`]) && (
                            <tr key={i}>
                              <td className="text-center">{i}</td>
                              <td>
                                {selectedBill[`car_registration${i}`] || "-"}
                              </td>
                              <td className="text-end">
                                {selectedBill[`tax${i}`]?.toLocaleString() ||
                                  "-"}
                              </td>
                              <td className="text-end">
                                {selectedBill[`taxgo${i}`]?.toLocaleString() ||
                                  "-"}
                              </td>
                            </tr>
                          )
                      )}
                    </tbody>
                  </Table>
                </div>

                {/* บริการเสริม */}
                <div className="mb-4">
                  <h5 className="border-bottom pb-2 text-dark fw-bold">
                    บริการเสริม
                  </h5>
                  <Table bordered hover responsive size="sm">
                    <thead className="table-light text-center">
                      <tr>
                        <th>รายการ</th>
                        <th>ค่าบริการ</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[1, 3].map(
                        (i) =>
                          selectedBill[`extension${i}`] &&
                          selectedBill[`extension${i + 1}`] && (
                            <tr key={i}>
                              <td>{selectedBill[`extension${i}`]}</td>
                              <td className="text-end">
                                {selectedBill[
                                  `extension${i + 1}`
                                ]?.toLocaleString()}
                              </td>
                            </tr>
                          )
                      )}
                    </tbody>
                  </Table>
                </div>

                {/* ยอดรวม */}
                <div className="mb-4 p-3 bg-white border rounded shadow-sm">
                  <div className="d-flex justify-content-between align-items-center">
                    <h5 className="fw-bold mb-0">ยอดรวมทั้งหมด:</h5>
                    <h5 className="fw-bold text-success mb-0">
                      {selectedBill.total?.toLocaleString()} บาท
                    </h5>
                  </div>
                </div>

                {/* วันที่นัดรับ */}
                {selectedBill.date && (
                  <div className="mb-4 p-3 border rounded bg-light">
                    <div className="d-flex justify-content-between align-items-center">
                      <h5 className="fw-bold text-danger mb-0">
                        วันที่นัดรับ:
                      </h5>
                      <h5 className="fw-bold text-danger mb-0">
                        {formatDate(selectedBill.date)}
                      </h5>
                    </div>
                  </div>
                )}
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
              style={{
                minWidth: "140px",
                fontWeight: "bold",
                textAlign: "center",
              }}
              onClick={() => {
                setTimeout(() => {
                  navigate("/user/bill-print", {
                    state: { billData: selectedBill },
                  });
                  setShowModal(false);
                }, 1000);
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
