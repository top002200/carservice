import React from 'react';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const userId = sessionStorage.getItem('userId');

  const handleLogout = () => {
    sessionStorage.clear();
    navigate('/');
  };

  const goToRefundReport = () => {
    navigate('/dashboard/เงินคืน'); // ✅ เปลี่ยน path นี้ได้ตามที่คุณใช้จริง
  };

  const goToUserManagement = () => {
    navigate('/dashboard/users');
  };
  const goToplusdenide = () => {
    navigate('/dashboard/useradmin');
  };

  return (
    <div className="container mt-5">
      <div className="card shadow-sm">
        <div className="card-header bg-primary text-white">
          <h4 className="mb-0">แดชบอร์ดผู้ดูแลระบบ</h4>
        </div>
        <div className="card-body">
          <p>ยินดีต้อนรับ, ผู้ดูแลระบบ!</p>
          <p><strong>รหัสผู้ใช้งาน:</strong> {userId}</p>

          <div className="d-flex flex-column gap-2 mt-4">
            <button className="btn btn-success" onClick={goToplusdenide}>
              📄 รายงานเพิ่มลด
            </button>
            <button className="btn btn-warning" onClick={goToRefundReport}>
              📄 รายงานเงินเพิ่มเงินคืน
            </button>
            <button className="btn btn-info text-white" onClick={goToUserManagement}>
              👥 จัดการผู้ใช้
            </button>
            <button className="btn btn-outline-danger mt-3" onClick={handleLogout}>
              ออกจากระบบ
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
