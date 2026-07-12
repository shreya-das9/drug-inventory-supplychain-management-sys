import { login as apiLogin } from "../services/auth.api";

export async function login(form, navigate, setError, setIsLoading) {
  setIsLoading(true);
  try {
    const { data } = await apiLogin(form);

    // TEMP DIAGNOSTIC LOGS - remove after verification
    try {
      console.log("[DIAG][Login] window.origin:", window.location.origin);
      console.log("[DIAG][Login] login response keys:", Object.keys(data || {}));
    } catch (e) {
      // ignore in non-browser environments
    }

    localStorage.setItem("token", data.token);
    localStorage.setItem("role", data.user.role);
    localStorage.setItem("user", JSON.stringify(data.user));

    // Verify storage immediately
    try {
      console.log("[DIAG][Login] token stored?", !!localStorage.getItem("token"));
      console.log("[DIAG][Login] stored token (preview):", String(localStorage.getItem("token") || "").slice(0, 16));
      console.log("[DIAG][Login] role stored:", localStorage.getItem("role"));
      console.log("[DIAG][Login] user stored present?", !!localStorage.getItem("user"));
    } catch (e) {
      console.warn("[DIAG][Login] unable to read localStorage after set", e?.message || e);
    }

    if (data.user.role === "ADMIN") navigate("/admin/dashboard");
    else if (data.user.role === "WAREHOUSE") navigate("/warehouse/dashboard");
    else if (data.user.role === "RETAILER") navigate("/retailer/home");
    else navigate("/unauthorized");
  } catch (err) {
    setError(err.response?.data?.message || "Login failed");
  } finally {
    setIsLoading(false);
  }
}

export default { login };
