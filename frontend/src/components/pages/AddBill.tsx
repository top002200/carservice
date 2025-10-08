import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { createBill } from "../../services/api";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

// Assuming BillData interface does not contain the payment method fields 
// or that they will be optional/removed there as well.
import { BillData } from "../../interface/IBill"; 
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { registerLocale } from "react-datepicker";
import { th } from "date-fns/locale/th";
registerLocale("th", th);

const AddBill = () => {
  const defaultFormData: BillData = {
    bill_number: "",
    username: "",
    phone: "",

    // รายการสินค้า/บริการ
    name1: "",
    amount1: 0,
    name2: "",
    amount2: null,
    name3: "",
    amount3: null,
    name4: "",
    amount4: null,

    // ข้อมูลภาษี
    tax1: null,
    tax2: null,
    tax3: null,
    tax4: null,
    taxgo1: null,
    taxgo2: null,
    taxgo3: null,
    taxgo4: null,

    // ข้อมูลตรวจสอบ
    check1: null,
    check2: null,
    check3: null,
    check4: null,

    // ส่วนเสริม
    extension1: "",
    extension2: null,
    extension3: "",
    extension4: null,

    // ข้อมูลอ้างอิง/ประกัน
    refer1: "",
    refer2: "",
    refer3: "",
    refer4: "",
    typerefer1: "",
    typerefer2: "",
    typerefer3: "",
    typerefer4: "",

    // ข้อมูลทะเบียนรถ
    car_registration1: "",
    car_registration2: "",
    car_registration3: "",
    car_registration4: "",

    // **[REMOVED]** วิธีการชำระเงิน: payment_method: "cash",

    // ข้อมูลเพิ่มเติม
    description: "",

    // ยอดรวมทั้งหมด
    total: 0,

    // วันที่
    date: new Date().toISOString().split("T")[0],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const [formData, setFormData] = useState<BillData>(defaultFormData);
  const [startDate, setStartDate] = useState<Date | null>(new Date());
  const [showAllServices, setShowAllServices] = useState(false);
  const [showAllCarInfo, setShowAllCarInfo] = useState(false);
  const [showAllReferences, setShowAllReferences] = useState(false);
  const navigate = useNavigate();
  const [customExtension1, setCustomExtension1] = useState(false);
  const [customExtension3, setCustomExtension3] = useState(false);

  // ===== Helper: แปลงเป็นตัวเลขแบบตรง ๆ (ตามที่คุณกำหนด) =====
  const toNumber = (value: any): number => {
    if (value === null || value === undefined || value === "") return 0;
    return Number(value) || 0;
  };

  // ===== คำนวณ total อัตโนมัติ (ตามสูตรที่ให้มา) =====
  useEffect(() => {
    const total =
      toNumber(formData.amount1) +
      toNumber(formData.amount2) +
      toNumber(formData.amount3) +
      toNumber(formData.amount4) +
      toNumber(formData.check1) +
      toNumber(formData.check2) +
      toNumber(formData.check3) +
      toNumber(formData.check4) +
      toNumber(formData.extension2) +
      toNumber(formData.extension4) +
      toNumber(formData.tax1) +
      toNumber(formData.tax2) +
      toNumber(formData.tax3) +
      toNumber(formData.tax4) +
      toNumber(formData.taxgo1) +
      toNumber(formData.taxgo2) +
      toNumber(formData.taxgo3) +
      toNumber(formData.taxgo4) +
      toNumber(formData.typerefer1) +
      toNumber(formData.typerefer2) +
      toNumber(formData.typerefer3) +
      toNumber(formData.typerefer4);

    setFormData((prev) => ({
      ...prev,
      total: parseFloat(total.toFixed(2)),
    }));
  }, [
    formData.amount1,
    formData.amount2,
    formData.amount3,
    formData.amount4,
    formData.check1,
    formData.check2,
    formData.check3,
    formData.check4,
    formData.extension2,
    formData.extension4,
    formData.tax1,
    formData.tax2,
    formData.tax3,
    formData.tax4,
    formData.taxgo1,
    formData.taxgo2,
    formData.taxgo3,
    formData.taxgo4,
    formData.typerefer1,
    formData.typerefer2,
    formData.typerefer3,
    formData.typerefer4,
  ]);

  // ===== onChange: บังคับฟิลด์ตัวเลขทั้งหมดเป็น number (รวม typerefer) =====
  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;

    const isNumericField =
      name.includes("amount") ||
      name.includes("tax") ||
      name.includes("check") ||
      name.includes("taxgo") ||
      name.includes("typerefer"); // << เพิ่มให้ typerefer เป็น number

    setFormData((prev) => ({
      ...prev,
      [name]: isNumericField ? (value === "" ? null : Number(value)) : value,
    }));
  };

  const handleServiceTypeChange = (index: number, value: string) => {
    const checkField = `check${index}` as keyof BillData;
    const amount = value === "มอไซค์" ? 60 : value === "รถยนต์" ? 200 : 0;
    setFormData((prev) => ({ ...prev, [checkField]: amount }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // ล็อกยอดรวมอีกครั้ง (ค่าเดียวกับที่แสดงบนหน้าจอ)
    const lockedTotal =
      toNumber(formData.amount1) +
      toNumber(formData.amount2) +
      toNumber(formData.amount3) +
      toNumber(formData.amount4) +
      toNumber(formData.check1) +
      toNumber(formData.check2) +
      toNumber(formData.check3) +
      toNumber(formData.check4) +
      toNumber(formData.extension2) +
      toNumber(formData.extension4) +
      toNumber(formData.tax1) +
      toNumber(formData.tax2) +
      toNumber(formData.tax3) +
      toNumber(formData.tax4) +
      toNumber(formData.taxgo1) +
      toNumber(formData.taxgo2) +
      toNumber(formData.taxgo3) +
      toNumber(formData.taxgo4) +
      toNumber(formData.typerefer1) +
      toNumber(formData.typerefer2) +
      toNumber(formData.typerefer3) +
      toNumber(formData.typerefer4);

    const lockedTotalFixed = Number(lockedTotal.toFixed(2));

    // เตรียม payload ส่งขึ้น backend (บันทึกเวลา + ยอดรวมตามที่แสดง)
    const nowISO = new Date().toISOString();

    const payload = {
      ...formData,
      // normalize ค่าตัวเลข (กัน null)
      amount1: toNumber(formData.amount1),
      amount2: toNumber(formData.amount2),
      amount3: toNumber(formData.amount3),
      amount4: toNumber(formData.amount4),
      tax1: toNumber(formData.tax1),
      tax2: toNumber(formData.tax2),
      tax3: toNumber(formData.tax3),
      tax4: toNumber(formData.tax4),
      taxgo1: toNumber(formData.taxgo1),
      taxgo2: toNumber(formData.taxgo2),
      taxgo3: toNumber(formData.taxgo3),
      taxgo4: toNumber(formData.taxgo4),
      check1: toNumber(formData.check1),
      check2: toNumber(formData.check2),
      check3: toNumber(formData.check3),
      check4: toNumber(formData.check4),
      extension2:
        formData.extension2 !== null ? toNumber(formData.extension2) : null,
      extension4:
        formData.extension4 !== null ? toNumber(formData.extension4) : null,
      // ถ้าต้องการเก็บ typerefer เป็นตัวเลขจริง ๆ ใน DB
      typerefer1: toNumber(formData.typerefer1) as any,
      typerefer2: toNumber(formData.typerefer2) as any,
      typerefer3: toNumber(formData.typerefer3) as any,
      typerefer4: toNumber(formData.typerefer4) as any,
      
      // **[REMOVED]** payment_method, cash_transfer1, cash_transfer2 (as they were not explicitly used/defined)

      total: lockedTotalFixed, // <<<< บันทึกยอดรวมตามที่แสดง
      date: new Date(formData.date).toISOString(), // วันนัดรับ (ISO)
      created_at: formData.created_at || nowISO, // บันทึกเวลา
      updated_at: nowISO,
    };

    try {
      const result = await createBill(payload);

      if (result.status) {
        const completeBillData = {
          ...formData,
          ...result.data,
          id: result.data.id,
          bill_number: result.data.bill_number,
          total: lockedTotalFixed, // ให้ตรงกับที่บันทึกไป
          created_at: payload.created_at,
          updated_at: payload.updated_at,
        };

        Swal.fire({
          title: "สำเร็จ!",
          text: `สร้างบิลเลขที่ ${result.data.bill_number} เรียบร้อยแล้ว`,
          icon: "success",
        }).then(() => {
          navigate("/user/bill-print", {
            state: { billData: completeBillData },
          });
        });
      } else {
        Swal.fire({
          title: "ผิดพลาด!",
          text: result.message || "ไม่สามารถสร้างบิลได้",
          icon: "error",
        });
      }
    } catch (error: any) {
      console.error("Error creating bill:", error);
      Swal.fire({
        title: "ผิดพลาด!",
        text:
          error?.response?.data?.message ||
          error?.message ||
          "เกิดข้อผิดพลาดในการสร้างบิล",
        icon: "error",
      });
    }
  };

  return (
    <div
      style={{
        backgroundColor: "#f8f9fa",
        minHeight: "100vh",
        padding: "20px",
        border: "2px solid black",
        borderRadius: "12px",
        margin: "10px",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
      }}
    >
      <main className="main-wrapper mx-auto" style={{ paddingTop: "00px" }}>
        <form
          onSubmit={handleSubmit}
          className="p-3 bg-white rounded shadow-sm"
        >
          <h2 className="text-center mb-2 text-purple">แบบฟอร์มออกบิลบริการ</h2>

          {/* 1. ข้อมูลลูกค้า */}
          <div className="card mb-1">
            <div className="card-header bg-purple text-black">
              <h5 className="mb-0">1. ข้อมูลลูกค้า</h5>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">ชื่อลูกค้า *</label>
                  <input
                    type="text"
                    className="form-control"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label">เบอร์โทรศัพท์</label>
                  <input
                    type="text"
                    className="form-control"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 2. รายการบริการ */}
          <div className="card mb-1">
            <div className="card-header bg-purple text-black d-flex justify-content-between align-items-center">
              <h5 className="mb-0">2. รายการบริการ</h5>
              <button
                type="button"
                className="btn btn-sm btn-light"
                onClick={() => setShowAllServices(!showAllServices)}
              >
                {showAllServices ? "ซ่อนรายการ" : "แสดงทั้งหมด"}
              </button>
            </div>
            <div className="card-body">
              <div className="table-responsive">
                <table className="table">
                  <thead>
                    <tr>
                      <th style={{ width: "60%" }}>รายละเอียดบริการ</th>
                      <th style={{ width: "40%" }}>จำนวนเงิน (บาท)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[1, 2, 3, 4].map((item) => (
                      <tr
                        key={item}
                        style={{
                          display:
                            item > 1 && !showAllServices ? "none" : "table-row",
                        }}
                      >
                        <td>
                          <input
                            type="text"
                            className="form-control"
                            name={`name${item}`}
                            value={
                              (formData[
                                `name${item}` as keyof BillData
                              ] as string) || ""
                            }
                            onChange={handleInputChange}
                            placeholder={`รายการบริการที่ ${item}`}
                            required={item === 1}
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            className="form-control"
                            name={`amount${item}`}
                            value={
                              (formData[
                                `amount${item}` as keyof BillData
                              ] as number) ?? ""
                            }
                            onChange={handleInputChange}
                            placeholder="0.00"
                            required={item === 1}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* 3. ข้อมูลรถและค่าบริการ */}
          <div className="card mb-1">
            <div className="card-header bg-purple text-black d-flex justify-content-between align-items-center">
              <h5 className="mb-0">3. ข้อมูลรถและค่าบริการ</h5>
              <button
                type="button"
                className="btn btn-sm btn-light"
                onClick={() => setShowAllCarInfo(!showAllCarInfo)}
              >
                {showAllCarInfo ? "ซ่อนรายการ" : "แสดงทั้งหมด"}
              </button>
            </div>
            <div className="card-body">
              <div className="table-responsive">
                <table className="table">
                  <thead>
                    <tr>
                      <th>ทะเบียนรถ</th>
                      <th>ประเภทบริการ</th>
                      <th>ค่าตรวจ</th>
                      <th>ภาษี/ค่าปรับ</th>
                      <th>ค่าบริการ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[1, 2, 3, 4].map((item) => (
                      <tr
                        key={item}
                        style={{
                          display:
                            item > 1 && !showAllCarInfo ? "none" : "table-row",
                        }}
                      >
                        <td>
                          <input
                            type="text"
                            className="form-control"
                            name={`car_registration${item}`}
                            value={
                              (formData[
                                `car_registration${item}` as keyof BillData
                              ] as string) || ""
                            }
                            onChange={handleInputChange}
                            placeholder={`ทะเบียนรถ ${item}`}
                          />
                        </td>
                        <td>
                          <select
                            className="form-control"
                            onChange={(e) =>
                              handleServiceTypeChange(item, e.target.value)
                            }
                          >
                            <option value="">-- เลือกประเภท --</option>
                            <option value="มอไซค์">มอไซค์</option>
                            <option value="รถยนต์">รถยนต์</option>
                          </select>
                        </td>
                        <td>
                          <input
                            type="number"
                            className="form-control"
                            name={`check${item}`}
                            value={
                              (formData[
                                `check${item}` as keyof BillData
                              ] as number) ?? ""
                            }
                            onChange={handleInputChange}
                            placeholder="ค่าตรวจ"
                            min="0"
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            className="form-control"
                            name={`tax${item}`}
                            value={
                              (formData[
                                `tax${item}` as keyof BillData
                              ] as number) ?? ""
                            }
                            onChange={handleInputChange}
                            placeholder="ภาษี"
                            min="0"
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            className="form-control"
                            name={`taxgo${item}`}
                            value={
                              (formData[
                                `taxgo${item}` as keyof BillData
                              ] as number) ?? ""
                            }
                            onChange={handleInputChange}
                            placeholder="ค่าบริการ"
                            min="0"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* 4. บริการเสริม */}
          <div className="card mb-1">
            <div className="card-header bg-purple text-black">
              <h5 className="mb-0">4. บริการเสริม</h5>
            </div>
            <div className="card-body">
              <div className="row">
                {/* Extension 1 + ราคา */}
                <div className="col-md-6 mb-3">
                  <div className="row">
                    <div className="col-md-8">
                      {customExtension1 ? (
                        <input
                          type="text"
                          className="form-control"
                          name="extension1"
                          placeholder="พิมพ์ชื่อบริการเสริม"
                          value={formData.extension1}
                          onChange={handleInputChange}
                          onBlur={() => {
                            if (!formData.extension1)
                              setCustomExtension1(false);
                          }}
                        />
                      ) : (
                        <select
                          className="form-control"
                          name="extension1"
                          value={formData.extension1}
                          onChange={(e) => {
                            const value = e.target.value;
                            if (value === "__custom__") {
                              setCustomExtension1(true);
                              formData.extension1 = "";
                            } else {
                              handleInputChange(e);
                            }
                          }}
                        >
                          <option value="">-- เลือกบริการเสริม --</option>
                          <option value="N1">N1</option>
                          <option value="N2">N2</option>
                          <option value="N3">N3</option>
                          <option value="N4">N4</option>
                          <option value="กระจก">กระจก</option>
                          <option value="บังโซ่">บังโซ่</option>
                          <option value="__custom__">เพิ่มเติม...</option>
                        </select>
                      )}
                    </div>
                    <div className="col-md-4">
                      <input
                        type="number"
                        className="form-control"
                        name="extension2"
                        value={formData.extension2 ?? undefined}
                        onChange={handleInputChange}
                        placeholder="ราคา"
                        min="0"
                      />
                    </div>
                  </div>
                </div>

                {/* Extension 3 + ราคา */}
                <div className="col-md-6 mb-3">
                  <div className="row">
                    <div className="col-md-8">
                      {customExtension3 ? (
                        <input
                          type="text"
                          className="form-control"
                          name="extension3"
                          placeholder="พิมพ์ชื่อบริการเสริม"
                          value={formData.extension3}
                          onChange={handleInputChange}
                          onBlur={() => {
                            if (!formData.extension3)
                              setCustomExtension3(false);
                          }}
                        />
                      ) : (
                        <select
                          className="form-control"
                          name="extension3"
                          value={formData.extension3}
                          onChange={(e) => {
                            const value = e.target.value;
                            if (value === "__custom__") {
                              setCustomExtension3(true);
                              formData.extension3 = "";
                            } else {
                              handleInputChange(e);
                            }
                          }}
                        >
                          <option value="">-- เลือกบริการเสริม --</option>
                          <option value="N1">N1</option>
                          <option value="N2">N2</option>
                          <option value="N3">N3</option>
                          <option value="N4">N4</option>
                          <option value="กระจก">กระจก</option>
                          <option value="บังโซ่">บังโซ่</option>
                          <option value="__custom__">เพิ่มเติม...</option>
                        </select>
                      )}
                    </div>
                    <div className="col-md-4">
                      <input
                        type="number"
                        className="form-control"
                        name="extension4"
                        value={formData.extension4 ?? undefined}
                        onChange={handleInputChange}
                        placeholder="ราคา"
                        min="0"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 5. ข้อมูลอ้างอิง/ประกัน */}
          <div className="card mb-1">
            <div className="card-header bg-purple text-black d-flex justify-content-between align-items-center">
              <h5 className="mb-0">5. ข้อมูลอ้างอิง</h5>
              <button
                type="button"
                className="btn btn-sm btn-light"
                onClick={() => setShowAllReferences(!showAllReferences)}
              >
                {showAllReferences ? "ซ่อนรายการ" : "แสดงทั้งหมด"}
              </button>
            </div>
            <div className="card-body">
              {[1, 2, 3, 4].map((item) => (
                <div
                  className="row mb-3"
                  key={item}
                  style={{
                    display: item > 1 && !showAllReferences ? "none" : "flex",
                  }}
                >
                  <div className="col-md-8">
                    <label className="form-label">ประกัน {item}</label>
                    <input
                      type="text"
                      className="form-control"
                      name={`refer${item}`}
                      value={
                        (formData[
                          `refer${item}` as keyof BillData
                        ] as string) || ""
                      }
                      onChange={handleInputChange}
                      placeholder={`ข้อมูลประกัน ${item}`}
                    />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label">ยอดเงิน {item}</label>
                    <input
                      type="number"
                      className="form-control"
                      name={`typerefer${item}`}
                      value={
                        (formData[
                          `typerefer${item}` as keyof BillData
                        ] as any) ?? ""
                      }
                      onChange={handleInputChange}
                      placeholder={`จำนวนเงิน ${item}`}
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

        
          {/* 7. รายละเอียดเพิ่มเติม */}
          <div className="card mb-1">
            <div className="card-header bg-purple text-black">
              <h5 className="mb-0">6. รายละเอียดเพิ่มเติม</h5>
            </div>
            <div className="card-body">
              <div className="mb-3">
                <label className="form-label">หมายเหตุ</label>
                <textarea
                  className="form-control"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                />
              </div>
            </div>
          </div>

          {/* 8. วันที่ */}
          <div className="card mb-1">
            <div className="card-header bg-purple text-black">
              <h5 className="mb-0">7. วันที่</h5>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">วันนัดรับ *</label>
                  <DatePicker
                    selected={startDate}
                    onChange={(date: Date | null) => {
                      if (date) {
                        setStartDate(date);
                        setFormData((prev) => ({
                          ...prev,
                          date: date.toISOString().split("T")[0],
                        }));
                      }
                    }}
                    locale="th"
                    dateFormat="dd/MM/yyyy"
                    className="form-control"
                    minDate={new Date()}
                    required
                    placeholderText="เลือกวันนัดรับ"
                  />
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label">วันที่ออกบิล</label>
                  <input
                    type="text"
                    className="form-control"
                    value={new Date().toLocaleDateString("th-TH")}
                    readOnly
                  />
                </div>
              </div>
            </div>
          </div>

          {/* ยอดรวมทั้งหมด (แสดง = ค่าที่จะบันทึก) */}
          <div className="card mb-1">
            <div className="card-body">
              <div className="row">
                <div className="col-md-6">
                  <label className="form-label">ยอดรวม (บาท)</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.total.toLocaleString("th-TH", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                    readOnly
                  />
                </div>
                <div className="col-md-6 d-flex align-items-end">
                  <h4 className="text-purple mb-0">
                    รวมเป็นเงิน:{" "}
                    {formData.total.toLocaleString("th-TH", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}{" "}
                    บาท
                  </h4>
                </div>
              </div>
            </div>
          </div>

          {/* ปุ่มดำเนินการ */}
          <div className="d-flex justify-content-between mt-4">
            <button
              type="button"
              className="btn btn-danger"
              onClick={() => navigate("/user")}
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="btn btn-success"
              style={{ minWidth: "120px" }}
            >
              บันทึกบิล
            </button>
          </div>
        </form>
      </main>
    </div>
  );
};

export default AddBill;