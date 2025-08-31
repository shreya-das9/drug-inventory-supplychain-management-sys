// import React, { useState } from 'react';
// import { 
//   Building, 
//   Package, 
//   Users, 
//   ShoppingCart, 
//   Truck, 
//   BarChart3, 
//   QrCode, 
//   Brain,
//   LogOut,
//   Bell,
//   Settings,
//   FileText,
//   TrendingUp,
//   AlertTriangle,
//   CheckCircle
// } from 'lucide-react';

// const WarehouseDashboard = ({ user = {}, onLogout }) => {
//   // Enhanced user validation with console logging for debugging
//   console.log('WarehouseDashboard received user:', user);
  
//   if (!user) {
//     console.log('User is null or undefined');
//     return (
//       <div className="min-h-screen bg-gray-100 flex items-center justify-center">
//         <div className="text-gray-600">No user data available...</div>
//       </div>
//     );
//   }
  
//   if (!user.firstName) {
//     console.log('User object exists but firstName is missing:', user);
//     return (
//       <div className="min-h-screen bg-gray-100 flex items-center justify-center">
//         <div className="text-gray-600">Loading user profile...</div>
//       </div>
//     );
//   }

//   const [activeTab, setActiveTab] = useState('overview');

//   const stats = [
//     {
//       name: 'Total Inventory',
//       value: '1,247',
//       change: '+12%',
//       changeType: 'increase',
//       icon: Package,
//       color: 'bg-blue-500'
//     },
//     {
//       name: 'Active Suppliers',
//       value: '23',
//       change: '+2',
//       changeType: 'increase',
//       icon: Users,
//       color: 'bg-green-500'
//     },
//     {
//       name: 'Pending Orders',
//       value: '56',
//       change: '-8',
//       changeType: 'decrease',
//       icon: ShoppingCart,
//       color: 'bg-yellow-500'
//     },
//     {
//       name: 'In Transit',
//       value: '34',
//       change: '+5',
//       changeType: 'increase',
//       icon: Truck,
//       color: 'bg-purple-500'
//     }
//   ];

//   const recentActivities = [
//     {
//       id: 1,
//       type: 'order',
//       message: 'New order #ORD-2025-001 received from MedPlus Pharmacy',
//       time: '2 minutes ago',
//       status: 'new',
//       icon: ShoppingCart
//     },
//     {
//       id: 2,
//       type: 'shipment',
//       message: 'Shipment #SHP-2025-045 delivered successfully',
//       time: '15 minutes ago',
//       status: 'success',
//       icon: Truck
//     },
//     {
//       id: 3,
//       type: 'alert',
//       message: 'Low stock alert: Paracetamol 500mg (12 units remaining)',
//       time: '1 hour ago',
//       status: 'warning',
//       icon: AlertTriangle
//     },
//     {
//       id: 4,
//       type: 'scan',
//       message: 'Suspicious scan pattern detected for batch #BTH-2025-089',
//       time: '2 hours ago',
//       status: 'alert',
//       icon: QrCode
//     }
//   ];

//   const navigation = [
//     { name: 'Overview', id: 'overview', icon: BarChart3 },
//     { name: 'Inventory', id: 'inventory', icon: Package },
//     { name: 'Suppliers', id: 'suppliers', icon: Users },
//     { name: 'Orders', id: 'orders', icon: ShoppingCart },
//     { name: 'Shipments', id: 'shipments', icon: Truck },
//     { name: 'Scan Logs', id: 'scanlogs', icon: QrCode },
//     { name: 'AI Insights', id: 'ai', icon: Brain }
//   ];

//   const getStatusColor = (status) => {
//     switch (status) {
//       case 'new': return 'bg-blue-100 text-blue-800';
//       case 'success': return 'bg-green-100 text-green-800';
//       case 'warning': return 'bg-yellow-100 text-yellow-800';
//       case 'alert': return 'bg-red-100 text-red-800';
//       default: return 'bg-gray-100 text-gray-800';
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gray-50">
//       {/* Header */}
//       <div className="bg-white shadow-sm border-b">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="flex justify-between items-center py-4">
//             <div className="flex items-center">
//               <Building className="h-8 w-8 text-indigo-600 mr-3" />
//               <div>
//                 <h1 className="text-2xl font-bold text-gray-900">
//                   Warehouse Management Portal
//                 </h1>
//                 <p className="text-sm text-gray-600">
//                   Welcome back, {user?.firstName || 'User'} {user?.lastName || ''}
//                   {user?.companyName && ` • ${user.companyName}`}
//                 </p>
//               </div>
//             </div>
//             <div className="flex items-center space-x-4">
//               <button className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors">
//                 <Bell className="h-5 w-5" />
//                 <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full"></span>
//               </button>
//               <button className="p-2 text-gray-600 hover:text-gray-900 transition-colors">
//                 <Settings className="h-5 w-5" />
//               </button>
//               <button
//                 onClick={onLogout}
//                 className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 transition-colors"
//               >
//                 <LogOut className="h-4 w-4 mr-2" />
//                 Logout
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>

//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
//         <div className="flex">
//           {/* Sidebar Navigation */}
//           <div className="w-64 bg-white rounded-lg shadow-sm mr-8 h-fit">
//             <nav className="p-4">
//               <ul className="space-y-2">
//                 {navigation.map((item) => (
//                   <li key={item.id}>
//                     <button
//                       onClick={() => setActiveTab(item.id)}
//                       className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
//                         activeTab === item.id
//                           ? 'bg-indigo-100 text-indigo-700'
//                           : 'text-gray-700 hover:bg-gray-100'
//                       }`}
//                     >
//                       <item.icon className="h-5 w-5 mr-3" />
//                       {item.name}
//                     </button>
//                   </li>
//                 ))}
//               </ul>
//             </nav>
//           </div>

//           {/* Main Content */}
//           <div className="flex-1">
//             {activeTab === 'overview' && (
//               <div className="space-y-8">
//                 {/* Stats Grid */}
//                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
//                   {stats.map((stat) => (
//                     <div key={stat.name} className="bg-white rounded-lg shadow-sm p-6">
//                       <div className="flex items-center">
//                         <div className={`flex-shrink-0 p-3 rounded-md ${stat.color}`}>
//                           <stat.icon className="h-6 w-6 text-white" />
//                         </div>
//                         <div className="ml-4 flex-1">
//                           <p className="text-sm font-medium text-gray-500">{stat.name}</p>
//                           <div className="flex items-baseline">
//                             <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
//                             <p className={`ml-2 text-sm font-medium ${
//                               stat.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
//                             }`}>
//                               {stat.change}
//                             </p>
//                           </div>
//                         </div>
//                       </div>
//                     </div>
//                   ))}
//                 </div>

//                 {/* Recent Activities */}
//                 <div className="bg-white rounded-lg shadow-sm">
//                   <div className="px-6 py-4 border-b border-gray-200">
//                     <h3 className="text-lg font-medium text-gray-900">Recent Activities</h3>
//                   </div>
//                   <div className="p-6">
//                     <div className="space-y-4">
//                       {recentActivities.map((activity) => (
//                         <div key={activity.id} className="flex items-start space-x-3">
//                           <div className={`flex-shrink-0 p-2 rounded-full ${getStatusColor(activity.status)}`}>
//                             <activity.icon className="h-4 w-4" />
//                           </div>
//                           <div className="flex-1 min-w-0">
//                             <p className="text-sm text-gray-900">{activity.message}</p>
//                             <p className="text-xs text-gray-500">{activity.time}</p>
//                           </div>
//                         </div>
//                       ))}
//                     </div>
//                   </div>
//                 </div>

//                 {/* Quick Actions */}
//                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//                   <div className="bg-white rounded-lg shadow-sm p-6">
//                     <div className="flex items-center justify-between">
//                       <div>
//                         <h3 className="text-lg font-medium text-gray-900">Add New Drug</h3>
//                         <p className="text-sm text-gray-500">Register new medication in inventory</p>
//                       </div>
//                       <Package className="h-8 w-8 text-indigo-600" />
//                     </div>
//                     <button className="mt-4 w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition-colors">
//                       Add Drug
//                     </button>
//                   </div>

//                   <div className="bg-white rounded-lg shadow-sm p-6">
//                     <div className="flex items-center justify-between">
//                       <div>
//                         <h3 className="text-lg font-medium text-gray-900">Process Orders</h3>
//                         <p className="text-sm text-gray-500">Review and process pending orders</p>
//                       </div>
//                       <FileText className="h-8 w-8 text-green-600" />
//                     </div>
//                     <button className="mt-4 w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors">
//                       View Orders
//                     </button>
//                   </div>

//                   <div className="bg-white rounded-lg shadow-sm p-6">
//                     <div className="flex items-center justify-between">
//                       <div>
//                         <h3 className="text-lg font-medium text-gray-900">Generate Report</h3>
//                         <p className="text-sm text-gray-500">Create inventory and sales reports</p>
//                       </div>
//                       <TrendingUp className="h-8 w-8 text-purple-600" />
//                     </div>
//                     <button className="mt-4 w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 transition-colors">
//                       Generate
//                     </button>
//                   </div>
//                 </div>
//               </div>
//             )}

//             {activeTab === 'inventory' && (
//               <div className="bg-white rounded-lg shadow-sm">
//                 <div className="px-6 py-4 border-b border-gray-200">
//                   <h3 className="text-lg font-medium text-gray-900">Inventory Management</h3>
//                 </div>
//                 <div className="p-6">
//                   <div className="text-center py-12">
//                     <Package className="mx-auto h-12 w-12 text-gray-400" />
//                     <h3 className="mt-2 text-sm font-medium text-gray-900">Inventory Module</h3>
//                     <p className="mt-1 text-sm text-gray-500">
//                       This section will contain drug inventory management, stock levels, batch tracking, and expiry monitoring.
//                     </p>
//                     <div className="mt-6">
//                       <button className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700">
//                         <Package className="h-4 w-4 mr-2" />
//                         Add New Item
//                       </button>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             )}

//             {activeTab === 'suppliers' && (
//               <div className="bg-white rounded-lg shadow-sm">
//                 <div className="px-6 py-4 border-b border-gray-200">
//                   <h3 className="text-lg font-medium text-gray-900">Supplier Management</h3>
//                 </div>
//                 <div className="p-6">
//                   <div className="text-center py-12">
//                     <Users className="mx-auto h-12 w-12 text-gray-400" />
//                     <h3 className="mt-2 text-sm font-medium text-gray-900">Supplier Network</h3>
//                     <p className="mt-1 text-sm text-gray-500">
//                       Manage supplier relationships, contracts, and performance metrics.
//                     </p>
//                     <div className="mt-6">
//                       <button className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700">
//                         <Users className="h-4 w-4 mr-2" />
//                         Add Supplier
//                       </button>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             )}

//             {activeTab === 'orders' && (
//               <div className="bg-white rounded-lg shadow-sm">
//                 <div className="px-6 py-4 border-b border-gray-200">
//                   <h3 className="text-lg font-medium text-gray-900">Order Management</h3>
//                 </div>
//                 <div className="p-6">
//                   <div className="text-center py-12">
//                     <ShoppingCart className="mx-auto h-12 w-12 text-gray-400" />
//                     <h3 className="mt-2 text-sm font-medium text-gray-900">Order Processing</h3>
//                     <p className="mt-1 text-sm text-gray-500">
//                       Process incoming orders, manage fulfillment, and track delivery status.
//                     </p>
//                     <div className="mt-6 space-x-4">
//                       <button className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">
//                         <FileText className="h-4 w-4 mr-2" />
//                         View Orders
//                       </button>
//                       <button className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
//                         <CheckCircle className="h-4 w-4 mr-2" />
//                         Process Queue
//                       </button>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             )}

//             {activeTab === 'ai' && (
//               <div className="bg-white rounded-lg shadow-sm">
//                 <div className="px-6 py-4 border-b border-gray-200">
//                   <h3 className="text-lg font-medium text-gray-900">AI Insights & Analytics</h3>
//                 </div>
//                 <div className="p-6">
//                   <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//                     <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg">
//                       <Brain className="mx-auto h-10 w-10 text-purple-600 mb-4" />
//                       <h4 className="text-lg font-medium text-gray-900">Demand Prediction</h4>
//                       <p className="text-sm text-gray-600 mt-2">
//                         AI-powered forecasting for optimal stock levels
//                       </p>
//                       <div className="mt-4">
//                         <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
//                           94% Accuracy
//                         </span>
//                       </div>
//                     </div>

//                     <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg">
//                       <AlertTriangle className="mx-auto h-10 w-10 text-blue-600 mb-4" />
//                       <h4 className="text-lg font-medium text-gray-900">Anomaly Detection</h4>
//                       <p className="text-sm text-gray-600 mt-2">
//                         Identify suspicious patterns and potential fraud
//                       </p>
//                       <div className="mt-4">
//                         <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
//                           3 Alerts Today
//                         </span>
//                       </div>
//                     </div>

//                     <div className="text-center p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg">
//                       <TrendingUp className="mx-auto h-10 w-10 text-green-600 mb-4" />
//                       <h4 className="text-lg font-medium text-gray-900">Supply Optimization</h4>
//                       <p className="text-sm text-gray-600 mt-2">
//                         Optimize supplier relationships and costs
//                       </p>
//                       <div className="mt-4">
//                         <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
//                           15% Cost Savings
//                         </span>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             )}

//             {activeTab !== 'overview' && activeTab !== 'ai' && (
//               <div className="bg-white rounded-lg shadow-sm">
//                 <div className="px-6 py-4 border-b border-gray-200">
//                   <h3 className="text-lg font-medium text-gray-900 capitalize">
//                     {activeTab} Management
//                   </h3>
//                 </div>
//                 <div className="p-6">
//                   <div className="text-center py-12">
//                     <div className="mx-auto h-12 w-12 bg-gray-100 rounded-full flex items-center justify-center">
//                       {navigation.find(nav => nav.id === activeTab)?.icon && 
//                         React.createElement(navigation.find(nav => nav.id === activeTab).icon, {
//                           className: "h-6 w-6 text-gray-400"
//                         })
//                       }
//                     </div>
//                     <h3 className="mt-2 text-sm font-medium text-gray-900 capitalize">
//                       {activeTab} Module
//                     </h3>
//                     <p className="mt-1 text-sm text-gray-500">
//                       This section will contain {activeTab} management functionality.
//                       Coming soon in the next development phase.
//                     </p>
//                   </div>
//                 </div>
//               </div>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default WarehouseDashboard;
import React from 'react';

export default function WarehouseDashboard({ user = {}, onLogout }) {
  const name = [user.firstName, user.lastName].filter(Boolean).join(' ') || 'User';
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Warehouse/Admin Dashboard</h1>
      <p className="mt-2">Welcome, {name} ({user.role || 'UNKNOWN'})</p>
      <div className="mt-6 space-x-3">
        <button className="px-3 py-2 bg-gray-200 rounded">Inventory</button>
        <button className="px-3 py-2 bg-gray-200 rounded">Suppliers</button>
        <button className="px-3 py-2 bg-gray-200 rounded">Orders</button>
        <button className="px-3 py-2 bg-gray-200 rounded">Reports</button>
        <button onClick={onLogout} className="px-3 py-2 bg-red-600 text-white rounded">Logout</button>
      </div>
    </div>
  );
}
