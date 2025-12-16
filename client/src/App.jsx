// // import { BrowserRouter as Router, Routes, Route, Navigate, Link } from "react-router-dom";
// // import AuthGuard from "./components/auth/AuthGuard";
// // import RoleGuard from "./components/auth/RoleGuard";

// // import AdminDashboard from "./pages/admin/Dashboard";
// // import WarehouseDashboard from "./pages/warehouse/Dashboard";
// // import UserHome from "./pages/user/Home";
// // import RetailerHome from "./pages/retailer/Home";
// // import Login from "./pages/auth/Login";
// // import Signup from "./pages/auth/Signup";
// // import ForgotPassword from './pages/auth/ForgotPassword';
// // import ResetPassword from './pages/auth/ResetPassword';

// // export default function App() {
// //   return (
// //     <Router>
// //       <nav style={{ padding: "1rem", borderBottom: "1px solid #ccc" }}>
// //         <Link to="/login" style={{ marginRight: "1rem" }}>Login</Link>
// //         <Link to="/signup" style={{ marginRight: "1rem" }}>Signup</Link>
// //       </nav>

// //       <Routes>
// //         <Route path="/" element={<Navigate to="/login" replace />} />

// //         <Route path="/login" element={<Login />} />
// //         <Route path="/signup" element={<Signup />} />
        
// //         {/* ADD THESE TWO NEW ROUTES */}
// //         <Route path="/forgot-password" element={<ForgotPassword />} />
// //         <Route path="/reset-password" element={<ResetPassword />} />

// //         <Route
// //           path="/admin/dashboard"
// //           element={
// //             <AuthGuard>
// //               <RoleGuard allowedRoles={["ADMIN"]}>
// //                 <AdminDashboard />
// //               </RoleGuard>
// //             </AuthGuard>
// //           }
// //         />
// //         <Route
// //           path="/warehouse/dashboard"
// //           element={
// //             <AuthGuard>
// //               <RoleGuard allowedRoles={["WAREHOUSE"]}>
// //                 <WarehouseDashboard />
// //               </RoleGuard>
// //             </AuthGuard>
// //           }
// //         />
// //         <Route
// //           path="/user/home"
// //           element={
// //             <AuthGuard>
// //               <RoleGuard allowedRoles={["USER"]}>
// //                 <UserHome />
// //               </RoleGuard>
// //             </AuthGuard>
// //           }
// //         />
// //         <Route
// //           path="/retailer/home"
// //           element={
// //             <AuthGuard>
// //               <RoleGuard allowedRoles={["RETAILER"]}>
// //                 <RetailerHome />
// //               </RoleGuard>
// //             </AuthGuard>
// //           }
// //         />

// //         <Route path="*" element={<Navigate to="/" replace />} />
// //       </Routes>
// //     </Router>
// //   );
// //  }

// import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
// import AuthGuard from "./components/auth/AuthGuard";
// import RoleGuard from "./components/auth/RoleGuard";

// import AdminDashboard from "./pages/admin/Dashboard";
// import WarehouseDashboard from "./pages/warehouse/Dashboard";
// import UserHome from "./pages/user/Home";
// import RetailerHome from "./pages/retailer/Home";
// import Login from "./pages/auth/Login";
// import Signup from "./pages/auth/Signup";
// import ForgotPassword from './pages/auth/ForgotPassword';
// import ResetPassword from './pages/auth/ResetPassword';

// export default function App() {
//   return (
//     <Router>
//       {/* 🚫 Removed the nav so no white strip appears */}

//       <Routes>
//         <Route path="/" element={<Navigate to="/login" replace />} />

//         <Route path="/login" element={<Login />} />
//         <Route path="/signup" element={<Signup />} />
//         <Route path="/forgot-password" element={<ForgotPassword />} />
//         <Route path="/reset-password" element={<ResetPassword />} />

//         <Route
//           path="/admin/dashboard"
//           element={
//             <AuthGuard>
//               <RoleGuard allowedRoles={["ADMIN"]}>
//                 <AdminDashboard />
//               </RoleGuard>
//             </AuthGuard>
//           }
//         />
//         <Route
//           path="/warehouse/dashboard"
//           element={
//             <AuthGuard>
//               <RoleGuard allowedRoles={["WAREHOUSE"]}>
//                 <WarehouseDashboard />
//               </RoleGuard>
//             </AuthGuard>
//           }
//         />
//         <Route
//           path="/user/home"
//           element={
//             <AuthGuard>
//               <RoleGuard allowedRoles={["USER"]}>
//                 <UserHome />
//               </RoleGuard>
//             </AuthGuard>
//           }
//         />
//         <Route
//           path="/retailer/home"
//           element={
//             <AuthGuard>
//               <RoleGuard allowedRoles={["RETAILER"]}>
//                 <RetailerHome />
//               </RoleGuard>
//             </AuthGuard>
//           }
//         />

//         <Route path="*" element={<Navigate to="/" replace />} />
//       </Routes>
//     </Router>
//   );
// }

import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import AuthGuard from "./components/auth/AuthGuard";
import RoleGuard from "./components/auth/RoleGuard";

import AdminLayout from "./pages/admin/AdminLayout";
import Dashboard from "./pages/admin/Dashboard";
import Drugs from "./pages/admin/Drugs";
import Inventory from "./pages/admin/Inventory";
import Suppliers from "./pages/admin/Suppliers";
import Shipments from "./pages/admin/Shipments";
import Orders from "./pages/admin/Orders";
import Alerts from "./pages/admin/Alerts";

import WarehouseDashboard from "./pages/warehouse/Dashboard";
import UserHome from "./pages/user/Home";
import RetailerHome from "./pages/retailer/Home";
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Redirect base URL */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Auth routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* ✅ Admin routes with sidebar layout */}
        <Route
          path="/admin"
          element={
            <AuthGuard>
              <RoleGuard allowedRoles={["ADMIN"]}>
                <AdminLayout />
              </RoleGuard>
            </AuthGuard>
          }
        >
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="drugs" element={<Drugs />} />
          <Route path="inventory" element={<Inventory />} />
          <Route path="suppliers" element={<Suppliers />} />
          <Route path="shipments" element={<Shipments />} />
          <Route path="orders" element={<Orders />} />
          <Route path="alerts" element={<Alerts />} />
        </Route>

        {/* Other roles */}
        <Route
          path="/warehouse/dashboard"
          element={
            <AuthGuard>
              <RoleGuard allowedRoles={["WAREHOUSE"]}>
                <WarehouseDashboard />
              </RoleGuard>
            </AuthGuard>
          }
        />
        <Route
          path="/user/home"
          element={
            <AuthGuard>
              <RoleGuard allowedRoles={["USER"]}>
                <UserHome />
              </RoleGuard>
            </AuthGuard>
          }
        />
        <Route
          path="/retailer/home"
          element={
            <AuthGuard>
              <RoleGuard allowedRoles={["RETAILER"]}>
                <RetailerHome />
              </RoleGuard>
            </AuthGuard>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
 }