import { Navigate, useLocation } from "react-router-dom";
import jwtDecode from "../../utils/jwtDecode";

export default function AuthGuard({ children }) {
  const location = useLocation();
  const token = localStorage.getItem("token");

  // TEMP DIAGNOSTIC: log origin and token presence
  try {
    console.log('[DIAG][AuthGuard] origin:', window.location.origin, 'token present:', !!token);
  } catch (e) {}

  if (!token) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  try {
    const { exp } = jwtDecode(token);
    if (exp * 1000 < Date.now()) {
      console.warn('[DIAG][AuthGuard] token expired, clearing storage');
      localStorage.clear();
      return <Navigate to="/login" replace state={{ from: location }} />;
    }
  } catch {
    localStorage.clear();
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
}
