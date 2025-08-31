// client/src/AppLoader.jsx
import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { refreshMe } from './store/slices/authSlice';

export default function AppLoader({ children }) {
  const dispatch = useDispatch();
  useEffect(() => {
    // attempt to refresh current user if token exists in localStorage
    const token = localStorage.getItem('token');
    if (token) {
      dispatch(refreshMe());
    }
  }, [dispatch]);

  return children;
}
