import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "../pages/auth/Login";
import Signup from "../pages/auth/Signup";
import Logout from "../pages/auth/Logout";
import AdminLayout from "../pages/admin/AdminLayout";
import AdminDashboard from "../pages/admin/Dashboard";
import AdminDrugs from "../pages/admin/Drugs";
import AdminInventory from "../pages/admin/Inventory";
import WarehouseDashboard from "../pages/warehouse/Dashboard";
import UserHome from "../pages/user/Home";
import RetailerHome from "../pages/retailer/Home";
import AuthGuard from "../components/auth/AuthGuard";
import RoleGuard from "../components/auth/RoleGuard";

export default function AppRouter() {
  return (
    <Router>
      <Routes>
        {/* Public */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/logout" element={<Logout />} />

        {/* Admin Layout with nested routes */}
        <Route 
          element={
            <AuthGuard>
              <RoleGuard allowedRoles={["ADMIN"]}>
                <AdminLayout />
              </RoleGuard>
            </AuthGuard>
          }
        >
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/drugs" element={<AdminDrugs />} />
          <Route path="/admin/inventory" element={<AdminInventory />} />
        </Route>

        {/* Warehouse */}
        <Route path="/warehouse/dashboard" element={
          <AuthGuard>
            <RoleGuard allowedRoles={["WAREHOUSE"]}>
              <WarehouseDashboard />
            </RoleGuard>
          </AuthGuard>
        } />

        {/* User */}
        <Route path="/user/home" element={
          <AuthGuard>
            <RoleGuard allowedRoles={["USER"]}>
              <UserHome />
            </RoleGuard>
          </AuthGuard>
        } />

        {/* Retailer */}
        <Route path="/retailer/home" element={
          <AuthGuard>
            <RoleGuard allowedRoles={["RETAILER"]}>
              <RetailerHome />
            </RoleGuard>
          </AuthGuard>
        } />

        <Route path="/unauthorized" element={<h2>🚫 Unauthorized</h2>} />
        <Route path="*" element={<Login />} />
      </Routes>
    </Router>
  );
}
