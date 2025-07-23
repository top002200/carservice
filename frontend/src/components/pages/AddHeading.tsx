import React, {  useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { createHeading } from '../../services/api';
import { HeadingData } from '../../interface/IHeading';
import { useNavigate } from 'react-router-dom'; 
import Swal from 'sweetalert2';
import logo from '../../assets/image/PEA Logo on Violet.png';

const AddHeading = () => {
  const [headingName, setHeadingName] = useState('');
  const [headingDetails, setHeadingDetails] = useState('');
  const [dateTimeStart, setDateTimeStart] = useState(() => {
    const now = new Date();
    return now.toISOString().slice(0, 16); // Default to current time in 'YYYY-MM-DDTHH:MM' format
  });
  const [dateTimeEnd, setDateTimeEnd] = useState('');
  const navigate = useNavigate();

  const adminId = sessionStorage.getItem("userId") || "";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const isoTimeStart = new Date(dateTimeStart).toISOString();
      const isoTimeEnd = new Date(dateTimeEnd).toISOString();

      const newHeading: HeadingData = {
        heading_name: headingName,
        heading_details: headingDetails,
        time_start: isoTimeStart,
        time_end: isoTimeEnd,
        admins: [{
          admin_id: adminId,
          admin_name: '',
          email: '',
          phone_number: '',
          password: '',
          profile_pic: '',
          headings: [],
          users: []
        }]
      };

      await createHeading(newHeading);

      Swal.fire({
        title: 'บันทึกสำเร็จ!',
        text: 'การบันทึกข้อมูลสำเร็จแล้ว',
        icon: 'success',
        confirmButtonText: 'ตกลง',
        customClass: {
          confirmButton: 'btn btn-purple',
        },
        buttonsStyling: false,
      }).then(() => {
        navigate('/dashboard');
      });
  

      setHeadingName('');
      setHeadingDetails('');
      setDateTimeStart(new Date().toISOString().slice(0, 16)); // Reset to current time
      setDateTimeEnd('');
    } catch (error) {
      console.error('Error creating heading:', error);
      alert('Failed to create heading.');
    }
  };

  return (
    <div className="vh-100 d-flex flex-column" style={{ width: '100vw', maxWidth: '100%', backgroundColor: '#f0f0f0' }}>
      <header
        className="header d-flex justify-content-between align-items-center p-3 text-white"
        style={{
          width: '100%',
          backgroundColor: 'purple',
          position: 'fixed',
          top: 0,
          left: 0,
          zIndex: 1000,
        }}
      >
        <div className="d-flex align-items-center">
          <img
            src={logo}
            alt="PEA Logo"
            style={{ width: 'auto', height: '50px', marginRight: '10px' }}
          />
        </div>
        <div className="ms-auto">
          <button className="btn btn-light">Logout</button>
        </div>
      </header>

      <main className="flex-grow-1 d-flex align-items-center justify-content-center" style={{ marginTop: '100px' }}>
        <form
          onSubmit={handleSubmit}
          className="p-4 border border-purple rounded"
          style={{
            backgroundColor: '#ffffff',
            width: '100%',
            maxWidth: '800px',
            margin: '0 auto',
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
          }}
        >
          <h2 className="text-center mb-4" style={{ color: 'purple' }}>เพิ่มหัวข้อ</h2>
          <div className="mb-3">
            <label htmlFor="headingName" className="form-label" style={{ color: '#333' }}>ชื่อเรื่อง</label>
            <input
              type="text"
              className="form-control"
              id="headingName"
              value={headingName}
              onChange={(e) => setHeadingName(e.target.value)}
              required
              style={{ backgroundColor: '#f7f7f7', borderColor: '#ddd' }}
            />
          </div>
          <div className="mb-3">
            <label htmlFor="headingDetails" className="form-label" style={{ color: '#333' }}>รายละเอียด</label>
            <textarea
              className="form-control"
              id="headingDetails"
              value={headingDetails}
              onChange={(e) => setHeadingDetails(e.target.value)}
              required
              style={{ minHeight: '100px', backgroundColor: '#f7f7f7', borderColor: '#ddd'}}
            />
          </div>
          <div className="mb-3">
            <label htmlFor="dateTimeStart" className="form-label" style={{ color: '#333' }}>วันที่และเวลาเริ่ม</label>
            <input
              type="datetime-local"
              className="form-control"
              id="dateTimeStart"
              value={dateTimeStart}
              onChange={(e) => setDateTimeStart(e.target.value)}
              min={dateTimeStart}
              required
              style={{ backgroundColor: '#f7f7f7', borderColor: '#ddd' }}
            />
          </div>
          <div className="mb-3">
            <label htmlFor="dateTimeEnd" className="form-label" style={{ color: '#333' }}>วันที่และเวลาเสร็จสิ้น</label>
            <input
              type="datetime-local"
              className="form-control"
              id="dateTimeEnd"
              value={dateTimeEnd}
              onChange={(e) => setDateTimeEnd(e.target.value)}
              required
              style={{ backgroundColor: '#f7f7f7', borderColor: '#ddd' }}
            />
          </div>
          <div className="d-grid gap-2 d-md-flex justify-content-md-center">
          <button type="submit" className="btn btn-success"
          style={{width: 70, }}
          >
            เพิ่ม
          </button>
          <button type="reset" className="btn btn-danger"
          onClick={() => navigate('/Dashboard')}
          >
            ยกเลิก
          </button>
          </div>
        </form>
      </main>
    </div>
  );
};

export default AddHeading;
