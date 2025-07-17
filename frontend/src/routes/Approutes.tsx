import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Outlet,
} from "react-router-dom";
import AddHeading from "../components/pages/AddHeading";
import User from "../components/pages/User";
import Login from "../components/pages/Login";
import EditHeading from "../components/pages/EditHeading";
import HeadingDash from "../components/pages/HeadingDash";
import ManageUsers from "../components/pages/ManageUsers";
import { getAuthToken } from "../services/api";
import AddBill from "../components/pages/AddBill";
import BillPrint from "../components/pages/BillPrint";
import ExpenseBillPrint from "../components/pages/ExpenseBillPrint";
import ExpenseBillList from "../components/pages/ExpenseBillList";
import ExpenseBillAdd from "../components/pages/ExpenseBillAdd";
import UserLayout from "../components/pages/UserLayout"; // ✅ import layout ที่มี Header + Menu

// Component สำหรับ Protected Route
function ProtectedRoute({
  element,
  requiredRole,
}: {
  element: JSX.Element;
  requiredRole: string;
}) {
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
        
        <Route
          path="/dashboard/addheading"
          element={
            <ProtectedRoute element={<AddHeading />} requiredRole="admin" />
          }
        />
        <Route
          path="/dashboard/:id"
          element={
            <ProtectedRoute element={<HeadingDash />} requiredRole="admin" />
          }
        />
        <Route
          path="/dashboard/users"
          element={
            <ProtectedRoute element={<ManageUsers />} requiredRole="admin" />
          }
        />
        <Route
          path="/dashboard/edit/:id"
          element={
            <ProtectedRoute element={<EditHeading />} requiredRole="admin" />
          }
        />

        {/* ✅ User Routes with Layout */}
        <Route
          path="/user"
          element={
            <ProtectedRoute element={<UserLayout />} requiredRole="user" />
          }
        >
          {/* ✅ แสดงแต่ละหน้าภายใต้ Layout */}
          <Route index element={<User />} />
          <Route path="addbill" element={<AddBill />} />
          <Route path="bill-print" element={<BillPrint />} />
          <Route path="ExpenseBillList" element={<ExpenseBillList />} />
          <Route path="expense-bill-print" element={<ExpenseBillPrint />} />
          <Route path="add-expense" element={<ExpenseBillAdd />} />
        </Route>

        {/* Fallback for Undefined Routes */}
        <Route path="*" element={<div>Page Not Found</div>} />
      </Routes>
    </Router>
  );
}
