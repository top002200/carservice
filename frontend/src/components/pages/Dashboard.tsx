import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import Swal from "sweetalert2";
import "./Layout.css";
import logo from "../../assets/image/PEA Logo on Violet.png";
import { HeadingData } from "../../interface/IHeading";
import { UserData } from "../../interface/IUser";
import {
  getAllHeadings,
  deleteHeading,
  getAllUsers,
  updateHeading,
} from "../../services/api";
import moment from "moment";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBan, faEdit, faTrashCan } from "@fortawesome/free-solid-svg-icons";
import { Modal } from "react-bootstrap";
import { faRectangleList } from "@fortawesome/free-solid-svg-icons/faRectangleList";
import { useMemo } from "react";


const Dashboard = () => {
  const [headings, setHeadingDatas] = useState<HeadingData[]>([]);
  const [users, setUsers] = useState<UserData[]>([]);
  const [submissionCounts, setSubmissionCounts] = useState<{
    [key: number]: number;
  }>({});
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false); // Modal visibility
  const [showHiddenTopics, setShowHiddenTopics] = useState(false); // State to toggle hidden topics view
  const itemsPerPage = 10;
  const [showHModal, setShowHModal] = useState(false);
  const [selectedHeading, setSelectedHeading] = useState<HeadingData | null>(
    null
  );
  const currentYear = moment().year(); // ปีปัจจุบัน
  const [selectedYear, setSelectedYear] = useState(currentYear); // ปีที่เลือก

  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [headingsResponse, usersResponse] = await Promise.all([
          getAllHeadings(),
          getAllUsers(),
        ]);

        const normalizedHeadings = headingsResponse.data.data.map(
          (heading: HeadingData) => {
            const transformedHeading = {
              ...heading,
              isHidden:
                heading.is_hidden === "0" || heading.is_hidden === 0
                  ? false
                  : heading.is_hidden === "NULL" ||
                    heading.is_hidden === null ||
                    heading.is_hidden === "null"
                    ? null
                    : true,
            };
            return transformedHeading;
          }
        );

        setHeadingDatas(normalizedHeadings);
        setUsers(usersResponse.data.data);

        const counts = usersResponse.data.data.reduce(
          (acc: { [key: number]: number }, user: UserData) => {
            user.submissions?.forEach((submission) => {
              if (
                submission.status === "ส่งแล้ว" &&
                submission.heading_id !== undefined
              ) {
                acc[submission.heading_id] =
                  (acc[submission.heading_id] || 0) + 1;
              }
            });
            return acc;
          },
          {}
        );

        setSubmissionCounts(counts);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getRowClassName = (endTime: string | number | Date) => {
    const now = moment();
    const timeEnd = moment(endTime);
    const timeDiff = timeEnd.diff(now);

    if (timeDiff < 0) {
      return "table-secondary";
    }
    if (timeDiff <= 259163638) {
      return "table-danger";
    }
    if (timeDiff <= 604725313) {
      return "table-warning";
    }
    return "";
  };

  // ฟิลเตอร์ข้อมูลตามปีที่เลือก
  const filteredData = useMemo(() => {
    return headings
      .filter((item) => {
        const startYear = moment(item.time_start).year(); // ดึงปีจาก time_start
        return (
          startYear === selectedYear && // ปีตรงกับที่เลือก
          (item.is_hidden === "0" ||
            item.is_hidden === 0 ||
            item.is_hidden === null ||
            item.is_hidden === false)
        );
      })
      .sort((a, b) => b.heading_id! - a.heading_id!); // Sort by heading_id จากใหญ่ไปเล็ก
  }, [headings, selectedYear]);

  // สร้างรายการปีสำหรับ dropdown
  const yearOptions = useMemo(() => {
    const startYear = 2024; // กำหนดปีเริ่มต้น
    const endYear = currentYear; // ปีปัจจุบัน
    return Array.from({ length: endYear - startYear + 1 }, (_, i) => startYear + i).reverse(); // ปีจากมากไปน้อย
  }, [currentYear]);


  const hiddenHeadings = useMemo(() => {
    const filtered = headings.filter((item) => item.isHidden === true);
    console.log("Filtered hiddenHeadings:", filtered); // Debug filtered hiddenHeadings
    return filtered;
  }, [headings]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  const handleDelete = async (heading_id?: number) => {
    if (heading_id === undefined) {
      Swal.fire("Error", "ไม่พบ heading_id ที่จะลบ", "error");
      return;
    }

    Swal.fire({
      title: "ต้องการลบข้อมูลใช่หรือไม่?",
      text: "คุณจะไม่สามารถกู้คืนข้อมูลนี้ได้!",
      icon: "error",
      showCancelButton: true,
      confirmButtonColor: "green",
      cancelButtonColor: "#d33",
      confirmButtonText: "ใช่ !",
      cancelButtonText: "ยกเลิก",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await deleteHeading(heading_id.toString());
          setHeadingDatas(
            headings.filter((item) => item.heading_id !== heading_id)
          );
          Swal.fire("ลบสำเร็จ!", "ข้อมูลของคุณถูกลบแล้ว.", "success");
        } catch (error) {
          console.error("Error deleting heading:", error);
          Swal.fire("Error", "ไม่สามารถลบหัวข้อได้", "error");
        }
      }
    });
  };

  const fetchHiddenHeadings = async () => {
    try {
      const response = await getAllHeadings(); // ดึงข้อมูลทั้งหมด
      const hiddenHeadingsData = response.data.data.filter(
        (heading: HeadingData) => heading.is_hidden === 1
      );
      console.log("Fetched hidden headings:", hiddenHeadingsData);
      return hiddenHeadingsData; // ส่งกลับเฉพาะหัวข้อที่ซ่อน
    } catch (error) {
      console.error("Error fetching hidden headings:", error);
      Swal.fire("Error", "ไม่สามารถโหลดหัวข้อที่ปิดแล้วได้", "error");
      return [];
    }
  };

  const handleOpenModal = async () => {
    const hiddenHeadingsData = await fetchHiddenHeadings(); // โหลดข้อมูลใหม่
    setHeadingDatas((prevHeadings) =>
      prevHeadings.map((heading) =>
        hiddenHeadingsData.some(
          (hiddenHeading: { heading_id: number | undefined }) =>
            hiddenHeading.heading_id === heading.heading_id
        )
          ? { ...heading, is_hidden: 1 }
          : heading
      )
    );
    setShowModal(true); // แสดง Modal หลังโหลดข้อมูลเสร็จ
  };

  const handleHide = async (headingId?: number) => {
    if (!headingId) return;

    Swal.fire({
      title: "คุณต้องการปิดหัวข้อนี้ใช่หรือไม่?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "green",
      cancelButtonColor: "#d33",
      confirmButtonText: "ใช่ !",
      cancelButtonText: "ยกเลิก",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const payload = { is_hidden: 1 };
          await updateHeading(headingId.toString(), payload);

          // อัปเดต state
          setHeadingDatas((prevHeadings) =>
            prevHeadings.map((heading) =>
              heading.heading_id === headingId
                ? { ...heading, is_hidden: 1 }
                : heading
            )
          );

          Swal.fire("สำเร็จ!", "หัวข้อถูกปิดเรียบร้อย.", "success").then(() => {
            // รีเฟรชหน้าจอ
            window.location.reload();
          });
        } catch (error) {
          console.error("Error hiding heading:", error);
          Swal.fire("Error", "ไม่สามารถปิดหัวข้อได้", "error");
        }
      }
    });
  };


  const handleLogout = () => {
    Swal.fire({
      title: "คุณแน่ใจหรือไม่?",
      text: "คุณต้องการออกจากระบบ",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "ใช่, ออกจากระบบ!",
      cancelButtonText: "ยกเลิก",
    }).then((result) => {
      if (result.isConfirmed) {
        sessionStorage.removeItem("access_token");
        sessionStorage.removeItem("user_data");
        navigate("/");
      }
    });
  };

  const openHModal = (heading: HeadingData) => {
    setSelectedHeading(heading);
    setShowHModal(true);
  };

  const closeHModal = () => {
    setShowHModal(false);
    setSelectedHeading(null);
  };

  // chart
  const headingsFullySubmitted = useMemo(() => {
    return filteredData.filter(
      (heading) =>
        heading.heading_id &&
        submissionCounts[heading.heading_id] === users.length
    ).length;
  }, [filteredData, submissionCounts, users.length]);

  const headingsNotFullySubmitted = useMemo(() => {
    return filteredData.filter(
      (heading) =>
        heading.heading_id &&
        submissionCounts[heading.heading_id] !== users.length
    ).length;
  }, [filteredData, submissionCounts, users.length]);

  // สร้างข้อมูลสำหรับ Donut Chart
  const donutData = {
    labels: ["หัวข้อที่ส่งครบ", "หัวข้อที่ส่งไม่ครบ"],
    datasets: [
      {
        label: "สถานะการส่ง",
        data: [headingsFullySubmitted, headingsNotFullySubmitted],
        backgroundColor: ["#4CAF50", "#FF6384"], // สีเขียวและสีแดง
        borderColor: ["#ffffff", "#ffffff"],
        borderWidth: 2,
      },
    ],
  };

  return (
    <div className="container-fluid vh-100 d-flex flex-column">
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

        <div className="d-flex ms-auto gap-2">
          <button
            className="btn btn-light"
            style={{ width: "120px" }}
            onClick={() => navigate("/dashboard/users")}
          >
            จัดการผู้ใช้
          </button>
          <button
            className="btn btn-light"
            style={{ width: "100px" }}
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      </header>

      <main
        className="flex-grow-5 mt-5 pt-5 justify-content-center"
        style={{ width: "100%" }}
      >
        <div className="container mt-3 d-flex flex-column align-items-center">
          <div
            className="box"
            style={{
              width: "100%",
              border: "3px solid purple",
              padding: "20px",
              borderRadius: "5px",
              overflow: "auto",
            }}
          >
            <h2 className="text-center mb-3">
              <b>ตารางแสดงหัวข้อ</b>
            </h2>
            <div className="d-flex mb-3 align-items-center">
              {/* Search Input */}
              <input
                type="text"
                className="form-control"
                placeholder="ค้นหาหัวข้อ"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ maxWidth: "250px", border: "3px solid purple" }}
              />

              {/* Closed Topics Button */}
              <button
                className="btn btn-secondary ms-2"
                style={{ width: "130px", color: "white", backgroundColor: "gray" }}
                onClick={() => setShowModal(true)}
              >
                หัวข้อที่ปิดแล้ว
              </button>

              {/* Add Heading Button */}
              <button
                className="btn btn-success ms-auto"
                style={{ width: "110px" }}
                onClick={() => navigate("/Dashboard/AddHeading")}
              >
                เพิ่มหัวข้อ
              </button>
            </div>

            <div className="d-flex align-items-center mb-3">
              <label htmlFor="yearFilter" className="me-2">
                เลือกปี:
              </label>
              <select
                id="yearFilter"
                className="form-select"
                style={{ width: "150px" }}
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
              >
                {yearOptions.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>

            <div
              className="progress"
              style={{ height: "20px" }} //กำหนดความสูงของ Progress Bar
            >
              <div
                className="progress-bar bg-success"
                role="progressbar"
                style={{
                  width: `${headingsFullySubmitted + headingsNotFullySubmitted > 0
                    ? (headingsFullySubmitted / (headingsFullySubmitted + headingsNotFullySubmitted)) * 100
                    : 0}%`, //กำหนดความยาวแถบสีตามค่าหัวข้อ
                  transition: "width 0.5s ease-in-out", //เพิ่มเอฟเฟกต์การเคลื่อนไหว
                }}
                aria-valuenow={headingsFullySubmitted}
                aria-valuemin={0}
                aria-valuemax={headingsFullySubmitted + headingsNotFullySubmitted}
              >
                {headingsFullySubmitted}/{headingsFullySubmitted + headingsNotFullySubmitted} {/*แสดงแค่จำนวนหัวข้อ */}
              </div>
            </div>

            {/* Modal for hidden headings */}
            <Modal
              show={showModal}
              onHide={() => setShowModal(false)}
              centered
              size="lg"
            >
              <Modal.Header
                closeButton
                style={{
                  backgroundColor: "#f1e4ff",
                  color: "purple",
                }}
              >
                <Modal.Title>
                  <b>หัวข้อที่ปิดแล้ว</b>
                </Modal.Title>
              </Modal.Header>
              <Modal.Body style={{ padding: "20px" }}>
                <div style={{ maxHeight: "400px", overflowY: "auto" }}>
                  <ul className="list-unstyled">
                    {hiddenHeadings.length > 0 ? (
                      hiddenHeadings.map((heading) => (
                        <li
                          key={heading.heading_id}
                          style={{ marginBottom: "20px" }}
                        >
                          <div
                            style={{
                              fontSize: "1.2em",
                              fontWeight: "bold",
                              marginBottom: "10px",
                            }}
                          >
                            <span
                              style={{
                                textDecoration: "underline",
                                cursor: "pointer",
                              }}
                              onClick={() => {
                                setShowModal(false); // ปิด Modal hidden headings
                                openHModal(heading); // เปิด Modal ของหัวข้อที่เลือก
                              }}
                            >
                              {heading.heading_name}
                            </span>
                          </div>
                          <div className="d-flex justify-content-end">
                            {/* เพิ่มปุ่ม "ดูเพิ่มเติม" */}
                            <button
                              className="btn btn-sm btn-info"
                              onClick={() =>
                                navigate(
                                  `/dashboard/${heading.heading_id}`
                                )
                              }
                              style={{ width: "auto" }}
                            >
                              ดูเพิ่มเติม
                            </button>
                          </div>
                          <hr
                            style={{
                              margin: "10px 0",
                              borderTop: "1px solid #ddd",
                            }}
                          />
                        </li>
                      ))
                    ) : (
                      <p className="text-center text-muted">
                        ไม่มีหัวข้อที่ถูกซ่อน
                      </p>
                    )}
                  </ul>
                </div>
              </Modal.Body>
            </Modal>

            <table className="table">
              <thead>
                <tr className="text-center">
                  <th scope="col">ลำดับ</th>
                  <th scope="col" style={{ width: "40%" }}>
                    หัวข้อ
                  </th>
                  <th scope="col">จำนวนคนส่ง</th>
                  <th scope="col"></th>
                  <th scope="col"></th>
                </tr>
              </thead>
              <tbody className="table-group-divider">
                {currentItems.length > 0 ? (
                  currentItems.map((item, index) => {
                    const headingId = item.heading_id;
                    const totalSubmitted =
                      headingId !== undefined ? submissionCounts[headingId] || 0 : 0;

                    const rowClassName = getRowClassName(item.time_end);

                    return (
                      <tr key={headingId} className={rowClassName}>
                        <th scope="row" className="align-middle text-center">
                          {indexOfFirstItem + index + 1} {/* ลำดับที่เป็น auto increment */}
                        </th>
                        <td style={{ fontSize: "1.2em" }} className="align-middle">
                          <span
                            style={{
                              textDecoration: "underline",
                              cursor: "pointer",
                            }}
                            onClick={() => openHModal(item)}
                          >
                            {item.heading_name}
                          </span>
                        </td>
                        <td style={{ fontSize: "1.1em" }} className="align-middle text-center">
                          <span className="badge bg-info">{`${totalSubmitted}/${users.length}`}</span>
                          <br />
                          <Link to={`/dashboard/${headingId}`}>
                            <button className="btn btn-outline-info" style={{ margin: 10 }}>
                              <FontAwesomeIcon icon={faRectangleList} />
                            </button>
                          </Link>
                        </td>
                        <td className="align-middle text-center">
                          <button
                            className="btn btn-outline-success"
                            style={{ margin: 10 }}
                            onClick={() => handleHide(headingId)}
                          >
                            <FontAwesomeIcon icon={faBan} />
                          </button>
                          <Link to={`/dashboard/edit/${headingId}`}>
                            <button className="btn btn-outline-primary" style={{ margin: 10 }}>
                              <FontAwesomeIcon icon={faEdit} />
                            </button>
                          </Link>
                        </td>
                        <td className="align-middle text-center">
                          <button
                            className="btn btn-outline-danger"
                            style={{ margin: 20 }}
                            onClick={() => handleDelete(headingId)}
                          >
                            <FontAwesomeIcon icon={faTrashCan} />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={5} className="text-center">
                      ไม่มีข้อมูลที่จะแสดง
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            <nav>
              <ul className="pagination justify-content-center">
                {Array.from({ length: totalPages }, (_, index) => (
                  <li
                    key={index}
                    className={`page-item ${index + 1 === currentPage ? "active" : ""
                      }`}
                  >
                    <button
                      onClick={() => paginate(index + 1)}
                      className="page-link"
                    >
                      {index + 1}
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>
      </main>

      {/* Modal for Viewing Heading Details */}
      {showHModal && selectedHeading && (
        <div
          className="modal show d-block"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
        >
          <div className="modal-dialog modal-lg">
            <div
              className="modal-content"
              style={{ borderRadius: "10px", overflow: "hidden" }}
            >
              <div
                className="modal-header"
                style={{
                  backgroundColor: "#c7911b",
                  color: "white",
                  padding: "20px",
                }}
              >
                <h5 className="modal-title">{selectedHeading.heading_name}</h5>
                <button
                  type="button"
                  className="btn-close"
                  style={{ backgroundColor: "white", opacity: 0.7 }}
                  onClick={closeHModal}
                ></button>
              </div>
              <div
                className="modal-body"
                style={{
                  padding: "25px",
                  backgroundColor: "#fefcff",
                  color: "#333",
                }}
              >
                <p style={{ fontSize: "1em" }}>
                  <strong>รายละเอียด:</strong>{" "}
                  <span
                    dangerouslySetInnerHTML={{
                      __html: selectedHeading.heading_details.replace(
                        /(https?:\/\/[^\s]+)/g,
                        '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>'
                      ),
                    }}
                    style={{
                      whiteSpace: "pre-wrap",
                      overflowWrap: "break-word",
                    }}
                  />
                </p>
              </div>
              <div
                className="modal-footer"
                style={{
                  backgroundColor: "#e3e4e5",
                  padding: "20px",
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
                <p style={{ fontSize: "1em", color: "green" }}>
                  <strong>เวลาเริ่ม:</strong>{" "}
                  {new Date(selectedHeading.time_start).toLocaleString("th-TH")}
                </p>
                <br />
                <p style={{ fontSize: "1em", color: "#c30010" }}>
                  <strong>เวลาสิ้นสุด:</strong>{" "}
                  {new Date(selectedHeading.time_end).toLocaleString("th-TH")}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
