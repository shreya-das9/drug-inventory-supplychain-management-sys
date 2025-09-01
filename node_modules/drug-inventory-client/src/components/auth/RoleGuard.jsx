import { Navigate } from "react-router-dom";

export default function RoleGuard({ allowedRoles = [], children }) {
  const role = localStorage.getItem("role");
  if (!role || !allowedRoles.includes(role)) {
    return <Navigate to="/login" replace />;
  }
  return children;
}
