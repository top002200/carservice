import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { useParams, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { getAllUsers, getHeadingById } from "../../services/api";
import { HeadingData } from "../../interface/IHeading";
import { UserData } from "../../interface/IUser";
import logo from "../../assets/image/PEA Logo on Violet.png";

const HeadingDash: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [heading, setHeading] = useState<HeadingData | null>(null);
  const [users, setUsers] = useState<UserData[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // New state for status filter
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const navigate = useNavigate();

  const fetchHeadingData = async () => {
    try {
      const response = await getHeadingById(id || "");
      if (response.status) {
        setHeading(response.data.data);
      } else {
        Swal.fire("Error", "Failed to fetch heading data", "error");
      }
    } catch (error) {
      console.error("Error fetching heading data:", error);
      Swal.fire("Error", "Error fetching data", "error");
    }
  };

  const fetchUsersData = async () => {
    try {
      const response = await getAllUsers();
      if (
        response &&
        response.status &&
        response.data &&
        Array.isArray(response.data.data)
      ) {
        setUsers(response.data.data);
      } else {
        console.error("Unexpected response structure:", response);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      Swal.fire("Error", "Error fetching user data", "error");
    }
  };

  useEffect(() => {
    fetchHeadingData();
    fetchUsersData();
  }, [id]);


  // Filter users based on search term and status filter
  const filteredStatus = users.filter((user) => {
    const userSubmission = user.submissions?.find(
      (submission) => submission.heading_id === parseInt(id || "")
    );
    const status =
      userSubmission?.status === "ส่งแล้ว" ? "ส่งแล้ว" : "ยังไม่ส่ง";

    // Apply both search term and status filter
    const matchesSearchTerm = user.user_name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || status === statusFilter;

    return matchesSearchTerm && matchesStatus;
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredStatus.slice(indexOfFirstItem, indexOfLastItem); // Change filteredData to filteredStatus

  const totalPages = Math.ceil(filteredStatus.length / itemsPerPage);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

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
        <div className="d-flex ms-auto gap-2 justify-content-md-end">
          <button
            className="btn btn-light"
            onClick={() => navigate('/dashboard')}
          >
            กลับหน้าหลัก
          </button>
        </div>
      </header>

      <main
        className="flex-grow-5 mt-5 pt-5 justify-content-center"
        style={{ width: "100%" }}
      >
        <div className="container mt-3 d-flex flex-column align-items-center">
          <h5 className="text-left mb-3">
            <b>{heading?.heading_name || "Loading..."}</b>
          </h5>
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
            <div className="d-flex mb-3">
              <input
                type="text"
                className="form-control"
                placeholder="ค้นหาชื่อผู้ใช้"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ maxWidth: "250px", border: "3px solid purple" }}
              />
              {/* Status Filter Dropdown */}
              <select
                className="form-select ms-auto"
                style={{ maxWidth: "120px", border: "3px solid purple" }}
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">ทั้งหมด</option>
                <option value="ส่งแล้ว">ส่งแล้ว</option>
                <option value="ยังไม่ส่ง">ยังไม่ส่ง</option>
              </select>
            </div>

            <table className="table">
              <thead>
                <tr>
                  <th scope="col" className="text-center">
                    เรื่องที่
                  </th>
                  <th scope="col">ชื่อผู้ใช้</th>
                  <th scope="col">เลขประจำตัวพนักงาน</th>
                  <th scope="col">หมายเลขโทรศัพท์</th>
                  <th scope="col">สถานะ</th>
                </tr>
              </thead>
              <tbody className="table-group-divider">
                {currentItems.map((user, index) => {
                  // Check if the user has a submission with the current heading_id
                  const userSubmission = user.submissions?.find(
                    (submission) => submission.heading_id === parseInt(id || "")
                  );

                  // Determine the status to display
                  const status =
                    userSubmission?.status === "ส่งแล้ว"
                      ? "ส่งแล้ว"
                      : "ยังไม่ส่ง";

                  return (
                    <tr key={user.user_id}>
                      <th scope="row" className="text-center">
                        {index + 1 + indexOfFirstItem}
                      </th>
                      <td>{user.user_name}</td>
                      <td>{user.email}</td>
                      <td>{user.phone_number}</td>
                      <td>
                        {status === "ส่งแล้ว" ? (
                          <span className="badge bg-success">ส่งแล้ว</span>
                        ) : (
                          <span className="badge bg-danger">ยังไม่ส่ง</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Pagination */}
            <nav>
              <ul className="pagination justify-content-center">
                {Array.from({ length: totalPages }, (_, index) => (
                  <li
                    key={index}
                    className={`page-item ${
                      index + 1 === currentPage ? "active" : ""
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
    </div>
  );
};

export default HeadingDash;
