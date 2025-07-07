import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import moment from "moment";
import { HeadingData } from "../../interface/IHeading";
import { updateHeading, getHeadingById } from "../../services/api";
import "bootstrap/dist/css/bootstrap.min.css";
import logo from "../../assets/image/PEA Logo on Violet.png";

const EditHeading: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [headingData, setHeadingData] = useState<Partial<HeadingData>>({
    heading_name: "",
    heading_details: "",
    time_start: "",
    time_end: "",
  });

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchHeading = async () => {
      if (id) {
        try {
          const response = await getHeadingById(id);
          console.log("API Response:", response); // ดูโครงสร้างของ API Response
          if (response.status && response.data && response.data.data) {
            const fetchedData = response.data.data; // อ้างอิง `data` ที่ซ้อนอยู่ใน response.data

            setHeadingData({
              heading_name: fetchedData.heading_name,
              heading_details: fetchedData.heading_details,
              time_start: fetchedData.time_start,
              time_end: fetchedData.time_end,
            });

            console.log("Set Heading Data:", {
              heading_name: fetchedData.heading_name,
              heading_details: fetchedData.heading_details,
              time_start: fetchedData.time_start,
              time_end: fetchedData.time_end,
            }); // ดูค่าที่กำลังจะเซ็ต
          } else {
            Swal.fire(
              "Error",
              response.message || "ไม่สามารถโหลดข้อมูลหัวข้อได้",
              "error"
            );
          }
        } catch (error) {
          console.error("Fetch Error:", error); // ตรวจสอบข้อผิดพลาดหากเกิดขึ้น
          Swal.fire("Error", "ไม่สามารถดึงข้อมูลจากฐานข้อมูลได้", "error");
        } finally {
          setIsLoading(false);
        }
      }
    };
    fetchHeading();
  }, [id]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setHeadingData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleSave = async () => {
    if (!id) return;

    const payload = {
      heading_name: headingData.heading_name,
      heading_details: headingData.heading_details,
      time_start: moment(headingData.time_start).toISOString(),
      time_end: moment(headingData.time_end).toISOString(),
    };

    const response = await updateHeading(id, payload);
    if (response.status) {
      Swal.fire("Success", "แก้ไขหัวข้อสำเร็จ", "success");
      navigate("/dashboard");
    } else {
      Swal.fire("Error", response.message || "แก้ไขหัวข้อไม่สำเร็จ", "error");
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div
      className="vh-100 d-flex flex-column"
      style={{ width: "100vw", maxWidth: "100%" }}
    >
      <header
        className="header d-flex justify-content-between align-items-center p-3 text-white"
        style={{
          width: "100%",
          backgroundColor: "purple",
          position: "fixed",
          top: 0,
          left: 0,
          zIndex: 1000,
        }}
      >
        <div className="d-flex align-items-center">
          <img
            src={logo}
            alt="PEA Logo"
            style={{ width: "auto", height: "50px", marginRight: "10px" }}
          />
        </div>
        <div className="ms-auto">
          <button className="btn btn-light" onClick={() => navigate("/")}>
            Logout
          </button>
        </div>
      </header>

      <div className="container mt-5 pt-5">
        <h5 className="text-center mb-4" style={{ color: "purple" }}>
          แก้ไขหัวข้อ: {headingData.heading_name || ""}
        </h5>
        <form
          className="p-4 border border-primary rounded"
          style={{
            backgroundColor: "#f4e6ff",
            maxWidth: "800px", // ขยายฟอร์มให้กว้างขึ้น
            margin: "0 auto",
            borderColor: "purple",
          }}
        >
          <div className="mb-3">
            <label
              htmlFor="heading_name"
              className="form-label"
              style={{ color: "purple" }}
            >
              ชื่อหัวข้อ
            </label>
            <input
              type="text"
              className="form-control"
              id="heading_name"
              name="heading_name"
              value={headingData.heading_name || ""}
              onChange={handleInputChange}
              required
              style={{
                height: "60px",
                fontSize: "1.2rem",
              }}
            />
          </div>
          <div className="mb-3">
            <label
              htmlFor="heading_details"
              className="form-label"
              style={{ color: "purple" }}
            >
              รายละเอียด
            </label>
            <textarea
              className="form-control"
              id="heading_details"
              name="heading_details"
              value={headingData.heading_details || ""}
              onChange={handleInputChange}
              required
              style={{
                height: "150px",
                fontSize: "1.2rem",
                resize: "none",
              }}
            />
          </div>
          <div className="mb-3">
            <label
              htmlFor="time_start"
              className="form-label"
              style={{ color: "purple" }}
            >
              เวลาเริ่ม
            </label>
            <input
              type="datetime-local"
              className="form-control"
              id="time_start"
              name="time_start"
              value={moment(headingData.time_start).format("YYYY-MM-DDTHH:mm")}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="mb-3">
            <label
              htmlFor="time_end"
              className="form-label"
              style={{ color: "purple" }}
            >
              เวลาสิ้นสุด
            </label>
            <input
              type="datetime-local"
              className="form-control"
              id="time_end"
              name="time_end"
              value={moment(headingData.time_end).format("YYYY-MM-DDTHH:mm")}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="d-flex justify-content-end">
            <button
              type="button"
              className="btn btn-success me-2"
              onClick={handleSave}
            
            >
              บันทึก
            </button>
            <button
              type="button"
              className="btn btn-danger"
              onClick={() => navigate("/dashboard")}
            >
              ยกเลิก
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditHeading;
