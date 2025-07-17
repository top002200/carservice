import React, { useState, useEffect } from "react";
import { Table, Button, Modal, Pagination } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPrint,
  faCircleInfo,
  faPlus,
} from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import moment from "moment";
import { getAllExpenseBills } from "../../services/api";
import { ExpenseBillData } from "../../interface/IExpenseBill";
import Swal from "sweetalert2";

const ExpenseBillList: React.FC = () => {
  const [expenseBills, setExpenseBills] = useState<ExpenseBillData[]>([]);
  const [selectedBill, setSelectedBill] = useState<ExpenseBillData | null>(
    null
  );
  const [showModal, setShowModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  const navigate = useNavigate();

  useEffect(() => {
    fetchExpenseBills();
  }, []);

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

  const formatDate = (dateString: string) => {
    return moment(dateString).format("DD/MM/YYYY");
  };

  const formatCurrency = (amount: number | null | undefined) => {
    if (!amount || amount === 0) return "0.00";
    return amount.toLocaleString("th-TH", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const handlePrint = (bill: ExpenseBillData) => {
    navigate("/user/expense-bill-print", { state: { expenseBillData: bill } });
  };

  // Pagination Logic
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = expenseBills.slice(indexOfFirstRow, indexOfLastRow);
  const totalPages = Math.ceil(expenseBills.length / rowsPerPage);

  return (
    <div
      className="container mt-4"
      style={{
        border: "2px solid black",
        borderRadius: "12px",
        padding: "20px",
        backgroundColor: "white",
        boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
      }}
    >
      <h4
        style={{
          color: "#000",
          fontWeight: "bold",
          textAlign: "center",
          marginBottom: "20px",
        }}
      >
        ตารางบิลจ่าย
      </h4>

      <div className="d-flex justify-content-end align-items-center mb-3">
        <Button variant="success" onClick={() => navigate("/user/add-expense")}>
          <FontAwesomeIcon icon={faPlus} className="me-2" />
          เพิ่มบิลจ่าย
        </Button>
      </div>

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
                <Button
                  variant="info"
                  onClick={() => {
                    setSelectedBill(bill);
                    setShowModal(true);
                  }}
                >
                  <FontAwesomeIcon icon={faCircleInfo} />
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* Pagination */}
      <Pagination className="justify-content-center">
        <Pagination.Prev
          disabled={currentPage === 1}
          onClick={() => setCurrentPage(currentPage - 1)}
        />
        {[...Array(totalPages)].map((_, index) => (
          <Pagination.Item
            key={index + 1}
            active={index + 1 === currentPage}
            onClick={() => setCurrentPage(index + 1)}
          >
            {index + 1}
          </Pagination.Item>
        ))}
        <Pagination.Next
          disabled={currentPage === totalPages}
          onClick={() => setCurrentPage(currentPage + 1)}
        />
      </Pagination>

      {/* Modal แสดงรายละเอียด */}
      <Modal
        show={showModal}
        onHide={() => setShowModal(false)}
        size="lg"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>รายละเอียดบิลจ่าย</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedBill && (
            <div>
              <p>
                <b>วันที่:</b> {formatDate(selectedBill.date || "")}
              </p>
              <p>
                <b>ชื่อรายการ:</b> {selectedBill.title}
              </p>
              <p>
                <b>จำนวนเงิน:</b> {formatCurrency(selectedBill.amount)} บาท
              </p>
              <p>
                <b>รายละเอียดเพิ่มเติม:</b> {selectedBill.description || "-"}
              </p>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            ปิด
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ExpenseBillList;
