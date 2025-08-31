// client/src/components/LogoutButton.jsx
import React from 'react';
import { useDispatch } from 'react-redux';
import { logout } from '../store/slices/authSlice';
import { useNavigate } from 'react-router-dom';

export default function LogoutButton(){
  const dispatch = useDispatch();
  const nav = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    nav('/auth/login');
  };

  return (
    <button onClick={handleLogout} className="px-3 py-1 bg-red-600 text-white rounded">Logout</button>
  );
}
