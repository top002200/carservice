import React, { useState, useEffect, useRef } from "react";
import { Table, Button, Modal, Form, Pagination } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCircleInfo,
  faEdit,
  faFileExcel,
  faFilePdf,
  faPlus,
  faTrashCan,
} from "@fortawesome/free-solid-svg-icons";
import { getAllBills } from "../../services/api";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import moment from "moment";
import EditPDF from "./EditPDF";
import html2pdf from "html2pdf.js";

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
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;
  const navigate = useNavigate();
  const [pdfVisible, setPdfVisible] = useState(false);
  const pdfRef = useRef<HTMLDivElement>(null);
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

  const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedMonth(e.target.value);
  };

  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedYear(e.target.value);
  };

  const filteredData = bills
    .filter((bill) => {
      if (!bill.created_at) return false;
      const date = new Date(bill.created_at);
      const itemMonth = date.getMonth() + 1;
      const itemYear = date.getFullYear();
      const isMonthMatched =
        selectedMonth === "" || itemMonth === parseInt(selectedMonth);
      const isYearMatched =
        selectedYear === "" || itemYear === parseInt(selectedYear);
      return isMonthMatched && isYearMatched;
    })
    .filter(
      (bill) =>
        bill.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bill.phone.includes(searchTerm)
    )
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
    <div className="equipment-info-content">
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
        <b>ข้อมูลบิล</b>
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
        {/* Dropdown สำหรับเลือกเดือน และปี */}
        <div style={{ display: "flex", gap: "10px" }}>
          {/* Dropdown สำหรับเลือกเดือน */}
          <Form.Select
            aria-label="เลือกเดือน"
            onChange={handleMonthChange}
            value={selectedMonth}
            style={{ width: "200px" }}
          >
            <option value="">เลือกเดือน</option>
            <option value="1">มกราคม</option>
            <option value="2">กุมภาพันธ์</option>
            <option value="3">มีนาคม</option>
            <option value="4">เมษายน</option>
            <option value="5">พฤษภาคม</option>
            <option value="6">มิถุนายน</option>
            <option value="7">กรกฎาคม</option>
            <option value="8">สิงหาคม</option>
            <option value="9">กันยายน</option>
            <option value="10">ตุลาคม</option>
            <option value="11">พฤศจิกายน</option>
            <option value="12">ธันวาคม</option>
          </Form.Select>

          {/* Dropdown สำหรับเลือกปี */}
          <Form.Select
            aria-label="เลือกปี"
            onChange={handleYearChange}
            value={selectedYear}
            style={{ width: "200px" }}
          >
            <option value="">เลือกปี</option>
            {Array.from(
              new Set(
                bills
                  .filter((item) => {
                    if (selectedMonth) {
                      const itemMonth =
                        new Date(item.created_at).getMonth() + 1;
                      return itemMonth === parseInt(selectedMonth);
                    }
                    return true;
                  })
                  .filter((item) => item.created_at)
                  .map((item) => new Date(item.created_at).getFullYear())
              )
            )
              .sort()
              .map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
          </Form.Select>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          {/* Search Input */}
          <Form.Control
            type="text"
            placeholder="ค้นหาด้วยชื่อลูกค้าหรือเบอร์โทร"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: "300px" }}
          />

          {/* Button Group สำหรับปุ่มดาวน์โหลด PDF และ Excel */}
          <div
            className="btn-group"
            role="group"
            aria-label="Export Buttons"
            style={{
              borderRadius: "8px",
              overflow: "hidden",
              boxShadow: "0px 2px 5px rgba(0, 0, 0, 0.1)",
            }}
          >
            {/* ปุ่มดาวน์โหลด PDF */}
            <button
              type="button"
              className="btn btn-danger"
              onClick={exportToPDF}
              title="ดาวน์โหลดรายงาน PDF"
              style={{ fontSize: "20px" }}
            >
              <FontAwesomeIcon icon={faFilePdf} />
            </button>
          </div>

          {/* ปุ่มเพิ่มข้อมูล */}
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => navigate("/user/addbill")}
            title="เพิ่มบิลใหม่"
            style={{
              color: "white",
              marginLeft: "10px",
              padding: "10px 15px",
              fontSize: "14px",
              borderRadius: "8px",
              boxShadow: "0px 2px 5px rgba(0, 0, 0, 0.1)",
            }}
          >
            <FontAwesomeIcon icon={faPlus} /> เพิ่มบิล
          </button>

          {/* ปุ่ม Logout */}
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleLogout}
            title="ออกจากระบบ"
            style={{
              marginLeft: "10px",
              padding: "10px 15px",
              fontSize: "14px",
              borderRadius: "8px",
              boxShadow: "0px 2px 5px rgba(0, 0, 0, 0.1)",
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
            <th style={{ width: 150 }}>การดำเนินการ</th>
          </tr>
        </thead>
        <tbody>
          {paginatedData.map((item, index) => (
            <tr key={item.id} className="align-middle text-center">
              <td>{item.id}</td>
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
                <Button
                  variant="outline-primary"
                  className="me-2"
                  style={{ width: "40px" }}
                  onClick={() => navigate(`/user/editbill/${item.id}`)}
                >
                  <FontAwesomeIcon icon={faEdit} />
                </Button>
                <Button
                  variant="outline-danger"
                  onClick={() => {
                    Swal.fire({
                      title: "คุณแน่ใจหรือไม่ที่จะลบข้อมูลนี้?",
                      text: "ข้อมูลจะถูกลบไปและไม่สามารถกู้คืนได้",
                      icon: "warning",
                      showCancelButton: true,
                      confirmButtonText: "ลบ",
                      cancelButtonText: "ยกเลิก",
                    }).then((result) => {
                      if (result.isConfirmed) {
                        // Here you would call your delete API
                        Swal.fire(
                          "ลบสำเร็จ!",
                          "ข้อมูลบิลได้ถูกลบเรียบร้อยแล้ว.",
                          "success"
                        );
                      }
                    });
                  }}
                >
                  <FontAwesomeIcon icon={faTrashCan} />
                </Button>
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

      {/* Detail Modal */}
      <Modal show={showModal} onHide={closeModal} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title className="text-center w-100">
            <b>รายละเอียดบิลเลขที่ {selectedBill?.id}</b>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedBill ? (
            <div className="container">
              {/* ข้อมูลลูกค้า */}
              <div className="mb-4">
                <h5 className="border-bottom pb-2 text-secondary fw-bold">
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
                      <b>วันที่สร้าง :</b> {formatDate(selectedBill.created_at)}
                    </p>
                  </div>
                </div>
              </div>

              {/* ข้อมูลการชำระเงิน */}
              <div className="mb-4">
                <h5 className="border-bottom pb-2 text-secondary fw-bold">
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
                <h5 className="border-bottom pb-2 text-secondary fw-bold">
                  รายการบริการ
                </h5>
                <Table bordered hover>
                  <thead>
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
                            <td>{i}</td>
                            <td>{selectedBill[`name${i}`]}</td>
                            <td style={{ textAlign: "right" }}>
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
                <h5 className="border-bottom pb-2 text-secondary fw-bold">
                  ข้อมูลรถ
                </h5>
                <Table bordered hover>
                  <thead>
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
                            <td>{i}</td>
                            <td>{selectedBill[`car_registration${i}`]}</td>
                            <td>
                              {selectedBill[`check${i}`] === 60
                                ? "มอไซค์"
                                : selectedBill[`check${i}`] === 200
                                ? "รถยนต์"
                                : "-"}
                            </td>
                            <td style={{ textAlign: "right" }}>
                              {selectedBill[`check${i}`]?.toLocaleString()}
                            </td>
                            <td style={{ textAlign: "right" }}>
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
                <h5 className="border-bottom pb-2 text-secondary fw-bold">
                  ภาษีและฝากต่อ
                </h5>
                <Table bordered hover>
                  <thead>
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
                            <td>{i}</td>
                            <td>
                              {selectedBill[`car_registration${i}`] || "-"}
                            </td>
                            <td style={{ textAlign: "right" }}>
                              {selectedBill[`tax${i}`]?.toLocaleString() || "-"}
                            </td>
                            <td style={{ textAlign: "right" }}>
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
                <h5 className="border-bottom pb-2 text-secondary fw-bold">
                  บริการเสริม
                </h5>
                <Table bordered hover>
                  <thead>
                    <tr>
                      <th>รายการ</th>
                      <th>ค่าบริการ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[1, 3].map((i) =>
                      selectedBill[`extension${i}`] &&
                      selectedBill[`extension${i + 1}`] ? (
                        <tr key={i}>
                          <td>{selectedBill[`extension${i}`]}</td>
                          <td>{selectedBill[`extension${i + 1}`]}</td>
                        </tr>
                      ) : null
                    )}
                  </tbody>
                </Table>
              </div>

              {/* ยอดรวมทั้งหมด */}
              <div className="mb-4 p-3 bg-light rounded">
                <div className="d-flex justify-content-between">
                  <h5 className="fw-bold">ยอดรวมทั้งหมด:</h5>
                  <h5 className="fw-bold text-primary">
                    {selectedBill.total?.toLocaleString()} บาท
                  </h5>
                </div>
              </div>

              {/* วันที่นัดรับ */}
              {selectedBill.date && (
                <div className="mb-4 p-3 border rounded">
                  <div className="d-flex justify-content-between align-items-center">
                    <h5 className="fw-bold text-danger">วันที่นัดรับ:</h5>
                    <h5 className="fw-bold text-danger">
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
        <Modal.Footer>
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
              }, 1000); // 1 วินาที
            }}
          >
            พิมพ์บิล
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default User;
