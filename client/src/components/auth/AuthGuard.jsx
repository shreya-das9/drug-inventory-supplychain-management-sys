import { Navigate, useLocation } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

export default function AuthGuard({ children }) {
  const location = useLocation();
  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  try {
    const { exp } = jwtDecode(token);
    if (exp * 1000 < Date.now()) {
      localStorage.clear();
      return <Navigate to="/login" replace state={{ from: location }} />;
    }
  } catch {
    localStorage.clear();
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
}
