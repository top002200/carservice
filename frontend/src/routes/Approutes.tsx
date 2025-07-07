import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate
} from "react-router-dom";
import Dashboard from "../components/pages/Dashboard";
import AddHeading from "../components/pages/AddHeading";
import User from "../components/pages/User";
import Login from "../components/pages/Login";
import EditHeading from '../components/pages/EditHeading';
import HeadingDash from '../components/pages/HeadingDash';
import ManageUsers from '../components/pages/ManageUsers';
import { getAuthToken } from "../services/api"; 
import AddBill from "../components/pages/AddBill";
import BillPrint from "../components/pages/BillPrint"; // นำเข้า BillPrint component

// Component สำหรับ Protected Route
function ProtectedRoute({ element, requiredRole }: { element: JSX.Element; requiredRole: string }) {
  const token = getAuthToken();
  const user = JSON.parse(sessionStorage.getItem("user_data") || "{}");

  return token && user.role === requiredRole ? element : <Navigate to="/" />;
}

export default function AppRoutes() {
  return (
    <Router>
      <Routes>
        {/* Public Route */}
        <Route path="/" element={<Login />} />
        
        {/* Admin Routes */}
        <Route path="/dashboard" element={<ProtectedRoute element={<Dashboard />} requiredRole="admin" />} />
        <Route path="/dashboard/addheading" element={<ProtectedRoute element={<AddHeading />} requiredRole="admin" />} />
        <Route path="/dashboard/:id" element={<ProtectedRoute element={<HeadingDash />} requiredRole="admin" />} />
        <Route path="/dashboard/users" element={<ProtectedRoute element={<ManageUsers />} requiredRole="admin" />} />
        <Route path="/dashboard/edit/:id" element={<ProtectedRoute element={<EditHeading />} requiredRole="admin" />} />
        
        {/* User Routes */}
        <Route path="/user" element={<ProtectedRoute element={<User />} requiredRole="user" />} />
        <Route path="/user/addbill" element={<ProtectedRoute element={<AddBill />} requiredRole="user" />} />
        <Route path="/user/bill-print" element={<ProtectedRoute element={<BillPrint />} requiredRole="user" />} /> {/* เพิ่ม Route สำหรับ BillPrint */}
        
        {/* Fallback for Undefined Routes */}
        <Route path="*" element={<div>Page Not Found</div>} />
      </Routes>
    </Router>
  );
}