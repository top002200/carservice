import React, { useState, useEffect, useRef } from "react";
import { Table, Button,  Form } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPrint, faCircleInfo, faPlus, faFilePdf } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import moment from "moment";
import { getAllExpenseBills } from "../../services/api";
import { ExpenseBillData } from "../../interface/IExpenseBill";
import Swal from "sweetalert2";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import PdfExpense from "./PdfExpense"; // import PdfExpense

const ExpenseBillList: React.FC = () => {
  const [expenseBills, setExpenseBills] = useState<ExpenseBillData[]>([]);
  const [filteredBills, setFilteredBills] = useState<ExpenseBillData[]>([]);
  const [, setSelectedBill] = useState<ExpenseBillData | null>(null);
  const [, setShowModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [filterType, setFilterType] = useState<"today" | "range">("today");
  const [startDate, setStartDate] = useState<string>(moment().format("YYYY-MM-DD"));
  const [endDate, setEndDate] = useState<string>(moment().format("YYYY-MM-DD"));
  const rowsPerPage = 10;
  const navigate = useNavigate();
  
  const pdfRef = useRef<HTMLDivElement>(null); // ref สำหรับ PdfExpense

  useEffect(() => {
    fetchExpenseBills();
  }, []);

  useEffect(() => {
    applyFilter();
  }, [expenseBills, filterType, startDate, endDate]);

  const fetchExpenseBills = async () => {
    try {
      const res = await getAllExpenseBills();
      if (res.status && res.data) {
        setExpenseBills(res.data);
      }
    } catch (err) {
      Swal.fire("Error", "ไม่สามารถโหลดข้อมูลบิลจ่ายได้", "error");
    }
  };

  const applyFilter = () => {
    if (filterType === "today") {
      const today = moment().format("YYYY-MM-DD");
      setFilteredBills(expenseBills.filter(b => b.date?.startsWith(today)));
    } else {
      const start = moment(startDate);
      const end = moment(endDate);
      setFilteredBills(
        expenseBills.filter(b => {
          const billDate = moment(b.date);
          return billDate.isBetween(start.startOf("day"), end.endOf("day"), undefined, "[]");
        })
      );
    }
    setCurrentPage(1);
  };

  const formatDate = (dateString: string) => moment(dateString).format("DD/MM/YYYY");

  const formatCurrency = (amount: number | null | undefined) => {
    if (!amount || amount === 0) return "0.00";
    return amount.toLocaleString("th-TH", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const handlePrint = (bill: ExpenseBillData) => {
    navigate("/user/expense-bill-print", { state: { expenseBillData: bill } });
  };

  // Pagination
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = filteredBills.slice(indexOfFirstRow, indexOfLastRow);


  // ดาวน์โหลด PDF จาก PdfExpense
  const handleDownloadPDF = async () => {
    if (!pdfRef.current) return;

    const canvas = await html2canvas(pdfRef.current, { scale: 2 });
    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF({
      orientation: "landscape",
      unit: "px",
      format: "a4",
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const imgHeight = (canvas.height * pageWidth) / canvas.width;

    pdf.addImage(imgData, "PNG", 0, 0, pageWidth, imgHeight);
    pdf.save(`expense_report_${moment().format("YYYYMMDD_HHmm")}.pdf`);
  };

  return (
    <div className="container mt-4" style={{ border: "2px solid black", borderRadius: "12px", padding: "20px", backgroundColor: "white" }}>
      <h4 style={{ color: "#000", fontWeight: "bold", textAlign: "center", marginBottom: "20px" }}>
        ตารางบิลรับ-จ่าย
      </h4>

      <div className="d-flex justify-content-between align-items-center mb-3">
        <div className="d-flex align-items-center gap-2">
          <Form.Check
            type="radio"
            label="วันนี้"
            name="filterDate"
            checked={filterType === "today"}
            onChange={() => setFilterType("today")}
          />
          <Form.Check
            type="radio"
            label="ช่วงเวลา"
            name="filterDate"
            checked={filterType === "range"}
            onChange={() => setFilterType("range")}
          />
          {filterType === "range" && (
            <>
              <Form.Control type="date" value={startDate} onChange={e => setStartDate(e.target.value)} style={{ width: "150px" }} />
              <Form.Control type="date" value={endDate} onChange={e => setEndDate(e.target.value)} style={{ width: "150px" }} />
            </>
          )}
          <Button variant="primary" onClick={applyFilter}>ตกลง</Button>
        </div>

        <div className="d-flex align-items-center gap-2">
          <Button variant="success" onClick={() => navigate("/user/add-expense")}>
            <FontAwesomeIcon icon={faPlus} className="me-2" /> เพิ่มบิลรับ-จ่าย
          </Button>
          <Button variant="danger" onClick={handleDownloadPDF}>
            <FontAwesomeIcon icon={faFilePdf} className="me-2" /> ดาวน์โหลด PDF
          </Button>
        </div>
      </div>

      {/* ตารางปกติ */}
      <div>
        <Table bordered hover responsive>
          <thead className="text-center">
            <tr>
              <th>เลขที่บิล</th>
              <th>วันที่</th>
              <th>ชื่อรายการ</th>
              <th>จำนวนเงิน</th>
              <th>พิมพ์</th>
              <th>รายละเอียด</th>
            </tr>
          </thead>
          <tbody>
            {currentRows.map((bill, index) => (
              <tr key={bill.id} className="text-center align-middle">
                <td>{indexOfFirstRow + index + 1}</td>
                <td>{formatDate(bill.date || "")}</td>
                <td>{bill.title}</td>
                <td>{formatCurrency(bill.amount)}</td>
                <td>
                  <Button variant="primary" onClick={() => handlePrint(bill)}>
                    <FontAwesomeIcon icon={faPrint} />
                  </Button>
                </td>
                <td>
                  <Button variant="info" onClick={() => { setSelectedBill(bill); setShowModal(true); }}>
                    <FontAwesomeIcon icon={faCircleInfo} />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>

      {/* ซ่อน PdfExpense เพื่อทำ PDF */}
      <div style={{ position: "absolute", left: "-9999px" }}>
        <div ref={pdfRef}>
          <PdfExpense bills={filteredBills} />
        </div>
      </div>
    </div>
  );
};

export default ExpenseBillList;
