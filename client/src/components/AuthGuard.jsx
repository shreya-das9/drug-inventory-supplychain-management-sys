import React from 'react';
import { Navigate } from 'react-router-dom';

export default function AuthGuard({ children, allowedRoles = null }) {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || 'null');

  if (!token || !user) return <Navigate to="/auth/login" replace />;

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Optionally redirect to unauthorized page or home
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}
