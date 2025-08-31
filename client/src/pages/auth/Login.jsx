import React, { useState } from "react";
//import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { loginThunk } from "../../store/slices/authSlice";


import { useNavigate } from "react-router-dom";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error: authError } = useSelector((state) => state.auth);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const result = await dispatch(loginThunk(form));
      
      if (loginThunk.fulfilled.match(result)) {
        // Navigate based on user role
        if (result.payload.user.role === "ADMIN") navigate("/admin");
        else if (result.payload.user.role === "WAREHOUSE") navigate("/warehouse");
        else navigate("/user");
      } else {
        setError(result.payload || "Login failed");
      }
    } catch (err) {
      setError("Login failed");
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-lg shadow-md w-96 space-y-4"
      >
        <h2 className="text-2xl font-bold text-center">Login</h2>

        {(error || authError) && (
          <p className="text-red-500 text-sm">{error || authError}</p>
        )}

        {loading && (
          <p className="text-blue-500 text-sm text-center">Logging in...</p>
        )}

        <input
          type="email"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          className="w-full px-3 py-2 border rounded"
          required
          disabled={loading}
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          className="w-full px-3 py-2 border rounded"
          required
          disabled={loading}
        />

        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 disabled:bg-blue-300"
          disabled={loading}
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
}