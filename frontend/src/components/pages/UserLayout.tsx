// src/layouts/UserLayout.tsx
import React, { useState } from "react";
import { useNavigate, Outlet } from "react-router-dom";
import logo from "../../assets/image/PEA Logo on Violet.png";

import { Button, Offcanvas } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars, faRightFromBracket } from "@fortawesome/free-solid-svg-icons";

const UserLayout: React.FC = () => {
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);
  const toggleMenu = () => setShowMenu((prev) => !prev);

  const handleLogout = () => {
    sessionStorage.clear(); // ลบ token, user_data ออกจาก session
    navigate("/"); // กลับหน้า login
  };

  return (
    <>
      <header
        className="d-flex justify-content-between align-items-center p-3 text-white"
        style={{
          backgroundColor: "#6a1b9a",
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
          height: "70px",
        }}
      >
        {/* ซ้าย: โลโก้ + ชื่อระบบ */}
        <div className="d-flex align-items-center">
          <img
            src={logo}
            alt="PEA Logo"
            style={{
              height: "70px", // ✅ เพิ่มจาก 50px เป็น 70px
              width: "70px", // ✅ เพิ่มความกว้างให้พอดีกับความสูง
              marginRight: "15px", // ปรับให้ห่างตัวหนังสือมากขึ้นเล็กน้อย
            }}
          />
          <h4
            className="mb-0 fw-bold text-white"
            style={{ whiteSpace: "nowrap" }}
          >
            สถานตรวจสภาพรถสาขาคลองหาด
          </h4>
        </div>

        {/* ขวา: ปุ่ม logout และ เมนู */}
        <div className="d-flex align-items-center gap-2">
          <Button variant="danger" onClick={handleLogout}>
            <FontAwesomeIcon icon={faRightFromBracket} className="me-1" />
            ออกจากระบบ
          </Button>
          <Button variant="light" onClick={toggleMenu}>
            <FontAwesomeIcon icon={faBars} />
          </Button>
        </div>
      </header>

      {/* Sidebar Menu */}
      <Offcanvas
        show={showMenu}
        onHide={toggleMenu}
        backdrop={true}
        placement="end"
      >
        <Offcanvas.Header
          closeButton
          className="bg-primary text-white"
          style={{ borderBottom: "2px solid #fff", padding: "20px" }}
        >
          <Offcanvas.Title
            className="fw-bold"
            style={{ fontSize: "20px", letterSpacing: "1px" }}
          >
            📋 เมนูระบบ
          </Offcanvas.Title>
        </Offcanvas.Header>

        <Offcanvas.Body>
          <ul className="list-unstyled">
            <li className="mb-3">
              <Button
                variant="outline-primary"
                className="w-100"
                onClick={() => {
                  navigate("/user");
                  setShowMenu(false);
                }}
              >
                🏠 รายการพรบ
              </Button>
            </li>
            <li className="mb-3">
              <Button
                variant="outline-success"
                className="w-100"
                onClick={() => {
                  navigate("/user/ExpenseBillList");
                  setShowMenu(false);
                }}
              >
                💸 รายการบิลจ่าย
              </Button>
            </li>
           
          </ul>
        </Offcanvas.Body>
      </Offcanvas>

      {/* Main Content */}
      <main style={{ paddingTop: "100px" }} className="container">
        <Outlet />
      </main>
    </>
  );
};

export default UserLayout;
