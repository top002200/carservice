import React, { useState, useEffect } from "react";
import { Modal, Button, Form, ButtonGroup, Alert } from "react-bootstrap";
import Swal from "sweetalert2";
import { updateBill } from "../../services/api"; // ต้องแน่ใจว่า path นี้ถูกต้อง


// ใช้อินเทอร์เฟซ BillData ฉบับสมบูรณ์ที่คุณให้มา
export interface BillData {
  id?: number;
  bill_number: string;
  username: string;

  // ผู้สร้างบิล
  created_by?: string;

  user?: {
    user_id: string;
    user_name: string;
    email: string;
    phone_number: string;
  };

  // รายการสินค้า/บริการ
  name1: string | null;
  amount1: number | null;
  name2: string;
  amount2: number | null;
  name3: string;
  amount3: number | null;
  name4: string;
  amount4: number | null;

  // ข้อมูลภาษี
  tax1: number | null;
  tax2: number | null;
  tax3: number | null;
  tax4: number | null;
  taxgo1: number | null;
  taxgo2: number | null;
  taxgo3: number | null;
  taxgo4: number | null;

  // ข้อมูลตรวจสอบ
  check1: number | null;
  check2: number | null;
  check3: number | null;
  check4: number | null;

  // ส่วนเสริม
  extension1: string;
  extension2: number | null;
  extension3: string;
  extension4: number | null;

  // ข้อมูลอ้างอิง
  refer1: string;
  refer2: string;
  refer3: string;
  refer4: string;
  typerefer1: string;
  typerefer2: string;
  typerefer3: string;
  typerefer4: string;

  // ข้อมูลทะเบียนรถ
  car_registration1: string;
  car_registration2: string;
  car_registration3: string;
  car_registration4: string;

  // วิธีการชำระเงิน
  payment_method:
    | "cash"
    | "transfer"
    | "credit_card"
    | "cash+transfer"
    | string;

  // ✅ ฟิลด์ใหม่ (ไม่มีทศนิยม → number)
  cash_transfer1?: number; // จำนวนเงินสด
  cash_transfer2?: number; // จำนวนเงินโอน

  // ข้อมูลเพิ่มเติม
  description: string;
  phone: string;

  // ยอดรวมทั้งหมด
  total: number;

  // วันที่
  date: string;
  created_at: string;
  updated_at: string;
  bill_date?: string; // เพิ่ม bill_date กลับมาเพื่อให้โค้ด ModalPay ทำงานได้

  // Optional timestamps
  deleted_at?: string | null;

  // ✅ ฟิลด์ปรับยอด
  adjustment_type?: "เพิ่ม" | "ลด";
  adjustment_note?: string;
  adjustment_amount?: number;

  // สำหรับ note จาก payment
  payment_note?: string;

  // สำหรับ status
  payment_status?: string;

  [key: string]: any; // ใช้เพื่อให้เข้าถึง property ที่ไม่ได้ระบุไว้ใน Interface
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
    // ใช้ bill.date แทน bill.bill_date เพื่อให้ตรงกับ interface ที่ให้มา
    const dateToUse = bill?.bill_date || bill?.date;
    if (!dateToUse) return false;
    try {
      // สร้างวันที่ cutoff โดยใช้ bill_date/date และเวลา 05:15:00
      const cutoffTime = new Date(`${dateToUse}T05:15:00`);
      const now = new Date();
      return now > cutoffTime;
    } catch (e) {
      console.error("Time parse error:", e);
      return false;
    }
  })();

  useEffect(() => {
    if (show && bill) {
      // ถ้ามีการชำระเงินแล้ว ให้แสดง method ที่บันทึกไว้
      setSelectedMethod(
        isPaymentSettled
          ? (bill.payment_method as any)
          : bill.payment_method === "credit_card"
          ? ""
          : (bill.payment_method as any) || ""
      );
      // ใช้ bill.cash_transfer1 และ bill.cash_transfer2 เพื่อแสดงยอดที่จ่ายไปแล้ว
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
      setTransferAmount(0); // เคลียร์ Transfer เป็น 0
    } else if (method === "transfer") {
      setCashAmount(0); // เคลียร์ Cash เป็น 0
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
      cash_transfer1: currentCash,
      cash_transfer2: currentTransfer,
      payment_note: note,
      payment_status: isPaid ? "paid" : "partial",
    };

    // เนื่องจากค่า currentCash/currentTransfer ถูกกำหนดค่าถูกต้องตาม selectedMethod แล้ว
    // จึงสามารถใช้ค่าเหล่านั้นได้โดยตรง ไม่ต้องมี if/else ซ้ำอีก
    // แต่เพื่อความชัดเจน หากเป็น cash/transfer เดี่ยวๆ ก็สามารถตั้งค่าให้มั่นใจได้
    if (selectedMethod === "cash") {
        updateData.cash_transfer1 = billTotal;
        updateData.cash_transfer2 = 0;
    } else if (selectedMethod === "transfer") {
        updateData.cash_transfer1 = 0;
        updateData.cash_transfer2 = billTotal;
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
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    setter: React.Dispatch<React.SetStateAction<number | "">>
  ) => {
    // ปิดการแก้ไขถ้าเป็น Cash/Transfer เดี่ยวๆ (เพราะค่าถูกกำหนดเป็น billTotal แล้ว)
    // การเช็ค disabled ใน Form.Control ก็เพียงพอ แต่มีเงื่อนไขนี้ไว้ในกรณีฉุกเฉิน
    const isSingleMethodLocked = 
        (selectedMethod === 'cash' || selectedMethod === 'transfer') && 
        (isPaymentSettled || isTimeLocked);

    if (isSingleMethodLocked) return; 

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

  // 💡 ตัวแปรสำหรับควบคุมการปิด/เปิดฟิลด์
  const isCashInputDisabled = 
    isPaymentSettled || 
    isTimeLocked || 
    selectedMethod === 'cash';

  const isTransferInputDisabled = 
    isPaymentSettled || 
    isTimeLocked || 
    selectedMethod === 'transfer';


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
            {bill?.bill_date || bill?.date || "-"})
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
                  // ✅ ปิดการใช้งานฟิลด์
                  disabled={isCashInputDisabled} 
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
                  // ✅ ปิดการใช้งานฟิลด์
                  disabled={isTransferInputDisabled}
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