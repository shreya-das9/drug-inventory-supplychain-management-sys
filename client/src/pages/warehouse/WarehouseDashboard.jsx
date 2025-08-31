import React from 'react';

export default function WarehouseDashboard(){
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  return (
    <div className="p-6">
      <h1 className="text-2xl">Warehouse Dashboard</h1>
      <p>Welcome, {user?.name} ({user?.email})</p>
    </div>
  );
}
