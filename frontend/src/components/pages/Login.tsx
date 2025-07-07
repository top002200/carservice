import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import Swal from 'sweetalert2';
import '../pages/Layout.css';
import logo from '../../assets/image/PEA Logo on Violet.png';
import { login } from '../../services/api';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    const result = await login(email, password);
    if (result.status) {
      Swal.fire({
        icon: 'success',
        title: 'เข้าสู่ระบบสำเร็จ',
        text: result.message,
      });

      const role = result.data?.role;
      const userId = result.data?.id;

      console.log("Login Response:", result);
      console.log("User ID:", userId);

      if (userId) {
        sessionStorage.setItem("userId", userId);
      } else {
        Swal.fire('เกิดข้อผิดพลาด', 'ไม่พบข้อมูลผู้ใช้', 'error');
        return;
      }

      if (role === 'admin') {
        navigate('/dashboard');
      } else if (role === 'user') {
        navigate('/user');
      } else {
        Swal.fire('เกิดข้อผิดพลาด', 'ไม่สามารถเข้าถึงข้อมูลนี้ได้', 'error');
      }
    } else {
      Swal.fire({
        icon: 'error',
        title: 'เข้าสู่ระบบล้มเหลว',
        text: result.message,
      });
    }
  };

  return (
    <div className="d-flex flex-column justify-content-center align-items-center" style={{
      margin: -120, padding: 0, backgroundImage: `url('https://img5.pic.in.th/file/secure-sv1/e26dc4b3-cfba-4b20-8173-0976558f5c9e.png')`,
      backgroundSize: 'cover', backgroundPosition: 'center', height: '100vh', width: '100vw', overflow: 'hidden'
    }}>
      <header className="header d-flex justify-content-center align-items-center p-3 text-white" style={{
        width: '100%', backgroundColor: 'orange', position: 'fixed', top: 0, left: 0, zIndex: 1000, opacity: 0.9
      }}>
        <div className="d-flex align-items-center">
          <img src={logo} alt="PEA Logo" style={{ width: 'auto', height: '50px', marginRight: '10px' }} />
        </div>
      </header>
      <form onSubmit={handleLogin} className="w-25 p-4" style={{
        backgroundColor: 'rgba(255, 255, 255, 0.8)', borderRadius: '8px', position: 'relative', zIndex: 1
      }}>
        <h2 className="text-center mb-4">เข้าสู่ระบบ</h2>
        <div className="form-group mb-3">
          <label htmlFor="email">เลขประจำตัวพนักงาน</label>
          <input
            type="text" // Changed from "email" to "text" to disable email validation
            id="email"
            className="form-control"
            placeholder="กรอกเลขประจำตัวพนักงาน"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="form-group mb-3">
          <label htmlFor="password">รหัสผ่าน</label>
          <input
            type="password"
            id="password"
            className="form-control"
            placeholder="กรอกรหัสผ่านของคุณ"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="btn btn-dark w-100" style={{ backgroundColor: 'orange', color: 'white' }}>เข้าสู่ระบบ</button>
      </form>
    </div>
  );
};

export default Login;
