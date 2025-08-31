import React from 'react';

export default function AdminDashboard(){
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  return (
    <div className="p-6">
      <h1 className="text-2xl">Admin Dashboard</h1>
      <p>Welcome, {user?.name} ({user?.email})</p>
    </div>
  );
}
