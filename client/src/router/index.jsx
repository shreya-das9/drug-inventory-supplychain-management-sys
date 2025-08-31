// import React from "react";
// import { createBrowserRouter } from "react-router-dom";
// import Login from "../pages/auth/Login.jsx";
// import Signup from "../pages/auth/Signup.jsx";
// import AdminDashboard from "../pages/admin/AdminDashboard.jsx";
// import WarehouseDashboard from "../pages/warehouse/WarehouseDashboard.jsx";
// import UserDashboard from "../pages/user/UserDashboard.jsx";
// import AuthGuard from "../components/AuthGuard.jsx";
// import { Link } from "react-router-dom";

// const router = createBrowserRouter([
//   { 
//     path: "/", 
//     element: (
//       <div className="p-6">
//         <h1 className="text-2xl font-bold">Welcome Shreya</h1>
//         <p>
//           <Link to="/auth/login" className="text-blue-500">Login</Link> or{" "}
//           <Link to="/auth/signup" className="text-blue-500">Sign up</Link>
//         </p>
//       </div>
//     ) 
//   },
//   { path: "/auth/login", element: <Login /> },
//   { path: "/auth/signup", element: <Signup /> },
//   { 
//     path: "/admin", 
//     element: (
//       <AuthGuard allowedRoles={["ADMIN"]}>
//         <AdminDashboard />
//       </AuthGuard>
//     ) 
//   },
//   { 
//     path: "/warehouse", 
//     element: (
//       <AuthGuard allowedRoles={["WAREHOUSE"]}>
//         <WarehouseDashboard />
//       </AuthGuard>
//     ) 
//   },
//   { 
//     path: "/user", 
//     element: (
//       <AuthGuard allowedRoles={["USER"]}>
//         <UserDashboard />
//       </AuthGuard>
//     ) 
//   },
// ]);

// export default router;

import React from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Signup from "../pages/auth/Signup";
import Login from "../pages/auth/Login";

const router = createBrowserRouter([
  { path: "/", element: <Login /> }, // ⬅️ make Login the default
  { path: "/auth/login", element: <Login /> },
  { path: "/auth/signup", element: <Signup /> },
]);

export default function AppRouter() {
  return <RouterProvider router={router} />;
}
