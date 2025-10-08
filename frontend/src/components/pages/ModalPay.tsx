import React, { useState, useEffect } from "react";
import { Modal, Button, Form, ButtonGroup, Alert } from "react-bootstrap";
import Swal from "sweetalert2";
import { updateBill } from "../../services/api"; // ต้องแน่ใจว่า path นี้ถูกต้อง

// ใช้อินเทอร์เฟซ BillData ที่คุณให้มา
interface BillData {
  id?: number;
  bill_number: string;
  username: string;
  payment_method:
    | "cash"
    | "transfer"
    | "credit_card"
    | "cash+transfer"
    | "unpaid"
    | string;
  cash_transfer1?: number; // จำนวนเงินสด
  cash_transfer2?: number; // จำนวนเงินโอน
  description: string;
  phone: string;
  total: number;
  bill_date?: string; // ✅ เพิ่มเพื่อใช้ตรวจสอบเวลา (เช่น "2025-08-10")
  [key: string]: any;
}

interface ModalPayProps {
  show: boolean;
  onHide: () => void;
  bill: BillData | null;
  onSave: () => void;
}

const ModalPay: React.FC<ModalPayProps> = ({ show, onHide, bill, onSave }) => {
  const [selectedMethod, setSelectedMethod] = useState<
    "cash" | "transfer" | "cash+transfer" | ""
  >("");
  const [cashAmount, setCashAmount] = useState<number | "">(""); // cash_transfer1
  const [transferAmount, setTransferAmount] = useState<number | "">(""); // cash_transfer2
  const [note, setNote] = useState("");
  const billTotal = bill?.total || 0;

  // 💡 ตรวจสอบว่ามีการบันทึกการชำระเงินแล้วหรือไม่
  const isPaymentSettled = bill
    ? !!bill.payment_method &&
      bill.payment_method !== "" &&
      bill.payment_method.toLowerCase() !== "unpaid" &&
      bill.payment_method.toLowerCase() !== "credit_card"
    : false;

  // ✅ เพิ่มฟังก์ชันตรวจสอบว่าเกินเวลา 05:15 แล้วหรือยัง
  const isTimeLocked = (() => {
    if (!bill?.bill_date) return false;
    try {
      const cutoffTime = new Date(`${bill.bill_date}T05:15:00`);
      const now = new Date();
      return now > cutoffTime;
    } catch (e) {
      console.error("Time parse error:", e);
      return false;
    }
  })();

  useEffect(() => {
    if (show && bill) {
      setSelectedMethod(
        isPaymentSettled
          ? (bill.payment_method as any)
          : bill.payment_method === "credit_card"
          ? ""
          : (bill.payment_method as any) || ""
      );
      setCashAmount(bill.cash_transfer1 || "");
      setTransferAmount(bill.cash_transfer2 || "");
      setNote(bill.payment_note || "");
    } else if (!show) {
      setSelectedMethod("");
      setCashAmount("");
      setTransferAmount("");
      setNote("");
    }
  }, [show, bill, isPaymentSettled]);

  const toNum = (v: any): number => {
    const n = Number(String(v).replace(/,/g, "").trim());
    return Number.isFinite(n) ? n : 0;
  };

  const currentCash = toNum(cashAmount);
  const currentTransfer = toNum(transferAmount);

  const paidTotal =
    selectedMethod === "cash+transfer"
      ? currentCash + currentTransfer
      : selectedMethod === "cash"
      ? currentCash
      : selectedMethod === "transfer"
      ? currentTransfer
      : 0;

  const isOverpaid = paidTotal > billTotal;
  const remainingDue = billTotal - paidTotal;
  const isPaid = paidTotal >= billTotal;

  const handleMethodChange = (
    method: "cash" | "transfer" | "cash+transfer"
  ) => {
    if (isPaymentSettled || isTimeLocked) return; // ✅ เพิ่มเงื่อนไขเวลา

    setSelectedMethod(method);

    if (method === "cash") {
      setCashAmount(billTotal);
      setTransferAmount("");
    } else if (method === "transfer") {
      setCashAmount("");
      setTransferAmount(billTotal);
    } else if (method === "cash+transfer") {
      setCashAmount(0);
      setTransferAmount(0);
    }
  };

  const handleUpdatePayment = async () => {
    if (isPaymentSettled || isTimeLocked) return; // ✅ เพิ่มเงื่อนไขเวลา

    if (!bill || !bill.id || !selectedMethod) {
      Swal.fire("เตือน", "กรุณาเลือกช่องทางการชำระเงิน", "warning");
      return;
    }
    if (paidTotal <= 0) {
      Swal.fire("เตือน", "กรุณากรอกจำนวนเงินที่ชำระ", "warning");
      return;
    }
    if (isOverpaid) {
      Swal.fire("เตือน", "ยอดชำระรวมห้ามเกินยอดรวมบิล", "warning");
      return;
    }

    const updateData: Partial<BillData> = {
      payment_method: selectedMethod,
      cash_transfer1:
        selectedMethod === "cash+transfer" || selectedMethod === "cash"
          ? currentCash
          : 0,
      cash_transfer2:
        selectedMethod === "cash+transfer" || selectedMethod === "transfer"
          ? currentTransfer
          : 0,
      payment_note: note,
      payment_status: isPaid ? "paid" : "partial",
    };

    if (selectedMethod === "cash") {
      updateData.cash_transfer1 = currentCash;
      updateData.cash_transfer2 = 0;
    } else if (selectedMethod === "transfer") {
      updateData.cash_transfer1 = 0;
      updateData.cash_transfer2 = currentTransfer;
    }

    try {
      const res = await updateBill(bill.id, updateData);

      if (res.status) {
        Swal.fire(
          "สำเร็จ",
          `อัปเดตช่องทางชำระเงินเป็น ${selectedMethod} เรียบร้อย`,
          "success"
        );
        onSave();
      } else {
        Swal.fire(
          "ผิดพลาด",
          res.message || "ไม่สามารถบันทึกการชำระเงินได้",
          "error"
        );
      }
    } catch (err) {
      console.error("Payment update error:", err);
      Swal.fire("เกิดข้อผิดพลาด", "ไม่สามารถอัปเดตข้อมูลได้", "error");
    }
  };

  const handleNumChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: React.Dispatch<React.SetStateAction<number | "">>
  ) => {
    if (isPaymentSettled || isTimeLocked) return; // ✅ เพิ่มเงื่อนไขเวลา

    const value = e.target.value.trim();
    if (value === "") {
      setter("");
    } else {
      const num = parseFloat(value);
      if (!isNaN(num)) {
        setter(num);
      } else {
        setter((prev) => (typeof prev === "number" ? prev : ""));
      }
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton className="bg-success text-white">
        <Modal.Title>
          {isPaymentSettled ? "รายละเอียดการชำระเงิน" : "บันทึกการชำระเงิน"}
          <small className="ms-2 opacity-75">
            (บิลเลขที่: {bill?.bill_number || "-"})
          </small>
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {isPaymentSettled && (
          <Alert variant="info" className="text-center">
            บิลนี้มีการบันทึกช่องทางการชำระเงินเรียบร้อยแล้ว ไม่สามารถแก้ไขได้
          </Alert>
        )}

        {/* ✅ เพิ่มแจ้งเตือนถ้าเกินเวลา */}
        {isTimeLocked && (
          <Alert variant="warning" className="text-center">
            หมดเวลาบันทึกการชำระเงินแล้ว (หลังเวลา 05:15 ของวันที่{" "}
            {bill?.bill_date || "-"})
          </Alert>
        )}

        {bill ? (
          <Form>
            <h5 className="mb-3 text-center text-danger fw-bold">
              ยอดรวมบิล:{" "}
              {billTotal.toLocaleString("th-TH", { minimumFractionDigits: 2 })}{" "}
              บาท
            </h5>

            <Form.Group className="mb-3">
              <Form.Label className="fw-bold">
                เลือกช่องทางการชำระเงิน
              </Form.Label>
              <ButtonGroup className="d-flex">
                <Button
                  variant={
                    selectedMethod === "cash" ? "primary" : "outline-primary"
                  }
                  onClick={() => handleMethodChange("cash")}
                  disabled={isPaymentSettled || isTimeLocked} // ✅ เพิ่ม
                >
                  เงินสด
                </Button>
                <Button
                  variant={
                    selectedMethod === "transfer"
                      ? "success"
                      : "outline-success"
                  }
                  onClick={() => handleMethodChange("transfer")}
                  disabled={isPaymentSettled || isTimeLocked} // ✅ เพิ่ม
                >
                  เงินโอน
                </Button>
                <Button
                  variant={
                    selectedMethod === "cash+transfer"
                      ? "warning"
                      : "outline-warning"
                  }
                  onClick={() => handleMethodChange("cash+transfer")}
                  disabled={isPaymentSettled || isTimeLocked} // ✅ เพิ่ม
                >
                  เงินสด + เงินโอน
                </Button>
              </ButtonGroup>
            </Form.Group>

            {(selectedMethod === "cash" ||
              selectedMethod === "cash+transfer") && (
              <Form.Group className="mb-3" controlId="cashAmount">
                <Form.Label>จำนวนเงินสด (cash_transfer1)</Form.Label>
                <Form.Control
                  type="number"
                  placeholder="กรอกจำนวนเงินสด"
                  value={cashAmount}
                  onChange={(e) => handleNumChange(e, setCashAmount)}
                  min={0}
                  max={billTotal}
                  disabled={isPaymentSettled || isTimeLocked} // ✅ เพิ่ม
                />
              </Form.Group>
            )}

            {(selectedMethod === "transfer" ||
              selectedMethod === "cash+transfer") && (
              <Form.Group className="mb-3" controlId="transferAmount">
                <Form.Label>จำนวนเงินโอน (cash_transfer2)</Form.Label>
                <Form.Control
                  type="number"
                  placeholder="กรอกจำนวนเงินโอน"
                  value={transferAmount}
                  onChange={(e) => handleNumChange(e, setTransferAmount)}
                  min={0}
                  max={billTotal}
                  disabled={isPaymentSettled || isTimeLocked} // ✅ เพิ่ม
                />
              </Form.Group>
            )}

            {selectedMethod && paidTotal > 0 && (
              <Alert
                variant={isOverpaid ? "danger" : isPaid ? "success" : "info"}
                className="mt-3"
              >
                <p className="mb-0 fw-bold">
                  ยอดชำระรวม:{" "}
                  {paidTotal.toLocaleString("th-TH", {
                    minimumFractionDigits: 2,
                  })}{" "}
                  บาท
                </p>
                <p className="mb-0">
                  {isOverpaid
                    ? "🚨 ยอดชำระเกินบิล! กรุณาแก้ไข"
                    : remainingDue > 0
                    ? `ยอดค้างชำระ: ${remainingDue.toLocaleString("th-TH", {
                        minimumFractionDigits: 2,
                      })} บาท`
                    : "✅ ชำระครบถ้วนแล้ว"}
                </p>
              </Alert>
            )}
          </Form>
        ) : (
          <p className="text-center text-danger">
            ไม่พบบิลที่ต้องการบันทึกการชำระเงิน
          </p>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          {isPaymentSettled ? "ปิด" : "ยกเลิก"}
        </Button>
        <Button
          variant="success"
          onClick={handleUpdatePayment}
          disabled={
            !bill ||
            !selectedMethod ||
            paidTotal <= 0 ||
            isOverpaid ||
            isPaymentSettled ||
            isTimeLocked // ✅ เพิ่ม
          }
        >
          {isPaymentSettled
            ? "ชำระเงินแล้ว"
            : isTimeLocked
            ? "หมดเวลาบันทึก"
            : "อัปเดตช่องทางการชำระเงิน"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ModalPay;
