import { Navigate } from "react-router-dom";

export default function RoleGuard({ allowedRoles = [], children }) {
  const role = localStorage.getItem("role");
  // TEMP DIAGNOSTIC: log origin and role
  try {
    console.log('[DIAG][RoleGuard] origin:', window.location.origin, 'role:', role, 'allowed:', allowedRoles);
  } catch (e) {}

  if (!role || !allowedRoles.includes(role)) {
    return <Navigate to="/login" replace />;
  }
  return children;
}
