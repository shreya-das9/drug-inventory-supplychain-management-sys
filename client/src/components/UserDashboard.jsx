// import React, { useState } from 'react';
// import { 
//   User, 
//   QrCode, 
//   ShoppingBag, 
//   Star, 
//   Shield, 
//   LogOut,
//   Bell,
//   Settings,
//   Scan,
//   Package,
//   Clock,
//   CheckCircle,
//   AlertCircle,
//   Phone,
//   Mail,
//   MapPin,
//   Building
// } from 'lucide-react';

// const UserDashboard = ({ user = {}, onLogout }) => {
//   const [activeTab, setActiveTab] = useState('home');

//   const stats = [
//     {
//       name: 'Products Verified',
//       value: '127',
//       icon: Shield,
//       color: 'bg-green-500',
//       description: 'Authentic products scanned'
//     },
//     {
//       name: 'Orders Placed',
//       value: '8',
//       icon: ShoppingBag,
//       color: 'bg-blue-500',
//       description: 'Total orders this month'
//     },
//     {
//       name: 'Reviews Given',
//       value: '15',
//       icon: Star,
//       color: 'bg-yellow-500',
//       description: 'Product reviews submitted'
//     }
//   ];

//   const recentOrders = [
//     {
//       id: 'ORD-2025-001',
//       productName: 'Paracetamol 500mg',
//       quantity: '2 boxes',
//       status: 'delivered',
//       date: '2025-08-28',
//       tracking: 'TRK-001234'
//     },
//     {
//       id: 'ORD-2025-002',
//       productName: 'Vitamin D3 1000IU',
//       quantity: '1 bottle',
//       status: 'in-transit',
//       date: '2025-08-30',
//       tracking: 'TRK-001235'
//     },
//     {
//       id: 'ORD-2025-003',
//       productName: 'Cough Syrup 100ml',
//       quantity: '3 bottles',
//       status: 'processing',
//       date: '2025-08-31',
//       tracking: 'TRK-001236'
//     }
//   ];

//   const recentScans = [
//     {
//       id: 1,
//       productName: 'Aspirin 325mg',
//       batchNumber: 'BTH-2025-089',
//       scanTime: '10 minutes ago',
//       status: 'authentic',
//       manufacturer: 'PharmaCorp Ltd.'
//     },
//     {
//       id: 2,
//       productName: 'Insulin Pen',
//       batchNumber: 'BTH-2025-090',
//       scanTime: '1 hour ago',
//       status: 'authentic',
//       manufacturer: 'MediTech Inc.'
//     },
//     {
//       id: 3,
//       productName: 'Antibiotics 250mg',
//       batchNumber: 'BTH-2025-087',
//       scanTime: '3 hours ago',
//       status: 'authentic',
//       manufacturer: 'HealthCare Solutions'
//     }
//   ];

//   const navigation = [
//     { name: 'Home', id: 'home', icon: User },
//     { name: 'Verify Product', id: 'verify', icon: QrCode },
//     { name: 'My Orders', id: 'orders', icon: ShoppingBag },
//     { name: 'Reviews', id: 'reviews', icon: Star },
//     { name: 'Profile', id: 'profile', icon: Settings }
//   ];

//   const getStatusColor = (status) => {
//     switch (status) {
//       case 'delivered': return 'bg-green-100 text-green-800';
//       case 'in-transit': return 'bg-blue-100 text-blue-800';
//       case 'processing': return 'bg-yellow-100 text-yellow-800';
//       case 'cancelled': return 'bg-red-100 text-red-800';
//       case 'authentic': return 'bg-green-100 text-green-800';
//       case 'suspicious': return 'bg-red-100 text-red-800';
//       default: return 'bg-gray-100 text-gray-800';
//     }
//   };

//   const getStatusIcon = (status) => {
//     switch (status) {
//       case 'delivered': return CheckCircle;
//       case 'in-transit': return Clock;
//       case 'processing': return Package;
//       case 'authentic': return Shield;
//       case 'suspicious': return AlertCircle;
//       default: return Package;
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gray-50">
//       {/* Header */}
//       <div className="bg-white shadow-sm border-b">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="flex justify-between items-center py-4">
//             <div className="flex items-center">
//               <div className="h-8 w-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mr-3">
//                 <User className="h-5 w-5 text-white" />
//               </div>
//               <div>
//                 <h1 className="text-2xl font-bold text-gray-900">
//                   {user?.role === 'RETAILER' ? 'Retailer Portal' : 'User Dashboard'}
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
//                           ? 'bg-blue-100 text-blue-700'
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
//             {activeTab === 'home' && (
//               <div className="space-y-8">
//                 {/* Stats Grid */}
//                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//                   {stats.map((stat) => (
//                     <div key={stat.name} className="bg-white rounded-lg shadow-sm p-6">
//                       <div className="flex items-center">
//                         <div className={`flex-shrink-0 p-3 rounded-md ${stat.color}`}>
//                           <stat.icon className="h-6 w-6 text-white" />
//                         </div>
//                         <div className="ml-4 flex-1">
//                           <p className="text-sm font-medium text-gray-500">{stat.name}</p>
//                           <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
//                           <p className="text-xs text-gray-500 mt-1">{stat.description}</p>
//                         </div>
//                       </div>
//                     </div>
//                   ))}
//                 </div>

//                 {/* Quick Actions */}
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                   <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg shadow-sm p-6 text-white">
//                     <div className="flex items-center justify-between">
//                       <div>
//                         <h3 className="text-lg font-medium">Verify Product</h3>
//                         <p className="text-sm opacity-90">Scan QR code to verify authenticity</p>
//                       </div>
//                       <QrCode className="h-8 w-8 opacity-80" />
//                     </div>
//                     <button className="mt-4 w-full bg-white bg-opacity-20 hover:bg-opacity-30 text-white py-2 px-4 rounded-md transition-all duration-200">
//                       Start Scanning
//                     </button>
//                   </div>

//                   <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg shadow-sm p-6 text-white">
//                     <div className="flex items-center justify-between">
//                       <div>
//                         <h3 className="text-lg font-medium">Track Orders</h3>
//                         <p className="text-sm opacity-90">Monitor your order status</p>
//                       </div>
//                       <ShoppingBag className="h-8 w-8 opacity-80" />
//                     </div>
//                     <button className="mt-4 w-full bg-white bg-opacity-20 hover:bg-opacity-30 text-white py-2 px-4 rounded-md transition-all duration-200">
//                       View Orders
//                     </button>
//                   </div>
//                 </div>

//                 {/* Recent Scans */}
//                 <div className="bg-white rounded-lg shadow-sm">
//                   <div className="px-6 py-4 border-b border-gray-200">
//                     <h3 className="text-lg font-medium text-gray-900">Recent Verifications</h3>
//                   </div>
//                   <div className="p-6">
//                     <div className="space-y-4">
//                       {recentScans.map((scan) => {
//                         const StatusIcon = getStatusIcon(scan.status);
//                         return (
//                           <div key={scan.id} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
//                             <div className={`flex-shrink-0 p-2 rounded-full ${getStatusColor(scan.status)}`}>
//                               <StatusIcon className="h-4 w-4" />
//                             </div>
//                             <div className="flex-1 min-w-0">
//                               <p className="text-sm font-medium text-gray-900">{scan.productName}</p>
//                               <p className="text-sm text-gray-500">Batch: {scan.batchNumber}</p>
//                               <p className="text-xs text-gray-400">{scan.manufacturer}</p>
//                             </div>
//                             <div className="text-right">
//                               <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(scan.status)}`}>
//                                 {scan.status}
//                               </span>
//                               <p className="text-xs text-gray-500 mt-1">{scan.scanTime}</p>
//                             </div>
//                           </div>
//                         );
//                       })}
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             )}

//             {activeTab === 'verify' && (
//               <div className="bg-white rounded-lg shadow-sm">
//                 <div className="px-6 py-4 border-b border-gray-200">
//                   <h3 className="text-lg font-medium text-gray-900">Product Verification</h3>
//                 </div>
//                 <div className="p-6">
//                   <div className="text-center py-12">
//                     <div className="mx-auto h-16 w-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-6">
//                       <Scan className="h-8 w-8 text-white" />
//                     </div>
//                     <h3 className="text-xl font-medium text-gray-900">Scan Product QR Code</h3>
//                     <p className="mt-2 text-sm text-gray-500 max-w-md mx-auto">
//                       Use your device camera to scan the QR code on any pharmaceutical product to verify its authenticity and track its supply chain.
//                     </p>
//                     <div className="mt-8 space-y-4">
//                       <button className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors">
//                         <QrCode className="h-5 w-5 mr-2" />
//                         Start QR Scanner
//                       </button>
//                       <div className="text-center">
//                         <p className="text-xs text-gray-400">
//                           Alternatively, enter product code manually
//                         </p>
//                         <input 
//                           type="text" 
//                           placeholder="Enter product code"
//                           className="mt-2 block w-64 mx-auto px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
//                         />
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             )}

//             {activeTab === 'orders' && (
//               <div className="bg-white rounded-lg shadow-sm">
//                 <div className="px-6 py-4 border-b border-gray-200">
//                   <h3 className="text-lg font-medium text-gray-900">My Orders</h3>
//                 </div>
//                 <div className="p-6">
//                   <div className="space-y-4">
//                     {recentOrders.map((order) => {
//                       const StatusIcon = getStatusIcon(order.status);
//                       return (
//                         <div key={order.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
//                           <div className="flex items-center justify-between">
//                             <div className="flex-1">
//                               <div className="flex items-center space-x-3">
//                                 <StatusIcon className="h-5 w-5 text-gray-400" />
//                                 <div>
//                                   <p className="text-sm font-medium text-gray-900">{order.productName}</p>
//                                   <p className="text-sm text-gray-500">Order ID: {order.id}</p>
//                                   <p className="text-xs text-gray-400">Quantity: {order.quantity}</p>
//                                 </div>
//                               </div>
//                             </div>
//                             <div className="text-right">
//                               <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
//                                 {order.status.replace('-', ' ')}
//                               </span>
//                               <p className="text-xs text-gray-500 mt-1">
//                                 Ordered: {new Date(order.date).toLocaleDateString()}
//                               </p>
//                               <p className="text-xs text-blue-600 mt-1">
//                                 Track: {order.tracking}
//                               </p>
//                             </div>
//                           </div>
//                         </div>
//                       );
//                     })}
//                   </div>
//                 </div>
//               </div>
//             )}

//             {activeTab === 'profile' && (
//               <div className="bg-white rounded-lg shadow-sm">
//                 <div className="px-6 py-4 border-b border-gray-200">
//                   <h3 className="text-lg font-medium text-gray-900">Profile Information</h3>
//                 </div>
//                 <div className="p-6">
//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
//                     {/* Personal Information */}
//                     <div>
//                       <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
//                         <User className="h-5 w-5 mr-2 text-blue-600" />
//                         Personal Details
//                       </h4>
//                       <div className="space-y-4">
//                         <div className="flex items-center space-x-3">
//                           <User className="h-4 w-4 text-gray-400" />
//                           <div>
//                             <p className="text-sm font-medium text-gray-900">
//                               {user?.firstName || 'User'} {user?.lastName || ''}
//                             </p>
//                             <p className="text-xs text-gray-500">Full Name</p>
//                           </div>
//                         </div>
                        
//                         <div className="flex items-center space-x-3">
//                           <Mail className="h-4 w-4 text-gray-400" />
//                           <div>
//                             <p className="text-sm font-medium text-gray-900">{user?.email || 'No email'}</p>
//                             <p className="text-xs text-gray-500">Email Address</p>
//                           </div>
//                         </div>
                        
//                         {user?.phone && (
//                           <div className="flex items-center space-x-3">
//                             <Phone className="h-4 w-4 text-gray-400" />
//                             <div>
//                               <p className="text-sm font-medium text-gray-900">{user?.phone}</p>
//                               <p className="text-xs text-gray-500">Phone Number</p>
//                             </div>
//                           </div>
//                         )}

//                         <div className="flex items-center space-x-3">
//                           <Shield className="h-4 w-4 text-gray-400" />
//                           <div>
//                             <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
//                               user?.role === 'ADMIN' ? 'bg-red-100 text-red-800' :
//                               user?.role === 'WAREHOUSE' ? 'bg-purple-100 text-purple-800' :
//                               user?.role === 'RETAILER' ? 'bg-blue-100 text-blue-800' :
//                               'bg-green-100 text-green-800'
//                             }`}>
//                               {user?.role || 'USER'}
//                             </span>
//                             <p className="text-xs text-gray-500 mt-1">Account Type</p>
//                           </div>
//                         </div>
//                       </div>
//                     </div>

//                     {/* Business Information */}
//                     {(user?.companyName || user?.licenseNumber) && (
//                       <div>
//                         <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
//                           <Building className="h-5 w-5 mr-2 text-green-600" />
//                           Business Details
//                         </h4>
//                         <div className="space-y-4">
//                           {user?.companyName && (
//                             <div className="flex items-center space-x-3">
//                               <Building className="h-4 w-4 text-gray-400" />
//                               <div>
//                                 <p className="text-sm font-medium text-gray-900">{user?.companyName}</p>
//                                 <p className="text-xs text-gray-500">Company Name</p>
//                               </div>
//                             </div>
//                           )}
                          
//                           {user?.licenseNumber && (
//                             <div className="flex items-center space-x-3">
//                               <Shield className="h-4 w-4 text-gray-400" />
//                               <div>
//                                 <p className="text-sm font-medium text-gray-900">{user?.licenseNumber}</p>
//                                 <p className="text-xs text-gray-500">License Number</p>
//                               </div>
//                             </div>
//                           )}
//                         </div>
//                       </div>
//                     )}
//                   </div>

//                   {/* Account Status */}
//                   <div className="mt-8 p-4 bg-gray-50 rounded-lg">
//                     <h4 className="text-sm font-medium text-gray-900 mb-3">Account Status</h4>
//                     <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//                       <div className="text-center">
//                         <div className={`inline-flex items-center justify-center w-8 h-8 rounded-full ${
//                           user?.isEmailVerified ? 'bg-green-100' : 'bg-yellow-100'
//                         }`}>
//                           <CheckCircle className={`h-4 w-4 ${
//                             user?.isEmailVerified ? 'text-green-600' : 'text-yellow-600'
//                           }`} />
//                         </div>
//                         <p className="text-xs text-gray-600 mt-1">Email Verified</p>
//                       </div>
                      
//                       <div className="text-center">
//                         <div className={`inline-flex items-center justify-center w-8 h-8 rounded-full ${
//                           user?.isActive ? 'bg-green-100' : 'bg-red-100'
//                         }`}>
//                           <CheckCircle className={`h-4 w-4 ${
//                             user?.isActive ? 'text-green-600' : 'text-red-600'
//                           }`} />
//                         </div>
//                         <p className="text-xs text-gray-600 mt-1">Account Active</p>
//                       </div>
                      
//                       <div className="text-center">
//                         <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-100">
//                           <Clock className="h-4 w-4 text-blue-600" />
//                         </div>
//                         <p className="text-xs text-gray-600 mt-1">
//                           Member since {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown'}
//                         </p>
//                       </div>
                      
//                       <div className="text-center">
//                         <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-purple-100">
//                           <Clock className="h-4 w-4 text-purple-600" />
//                         </div>
//                         <p className="text-xs text-gray-600 mt-1">
//                           Last login: {user?.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'First time'}
//                         </p>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             )}

//             {activeTab === 'reviews' && (
//               <div className="bg-white rounded-lg shadow-sm">
//                 <div className="px-6 py-4 border-b border-gray-200">
//                   <h3 className="text-lg font-medium text-gray-900">Product Reviews</h3>
//                 </div>
//                 <div className="p-6">
//                   <div className="text-center py-12">
//                     <Star className="mx-auto h-12 w-12 text-gray-400" />
//                     <h3 className="mt-2 text-sm font-medium text-gray-900">Reviews & Ratings</h3>
//                     <p className="mt-1 text-sm text-gray-500">
//                       Share your experience with products and help other users make informed decisions.
//                     </p>
//                     <div className="mt-6">
//                       <button className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-yellow-600 hover:bg-yellow-700">
//                         <Star className="h-4 w-4 mr-2" />
//                         Write Review
//                       </button>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             )}

//             {(activeTab === 'verify' || activeTab === 'orders' || activeTab === 'reviews') && activeTab !== 'home' && activeTab !== 'profile' && (
//               <div className="bg-white rounded-lg shadow-sm">
//                 <div className="px-6 py-4 border-b border-gray-200">
//                   <h3 className="text-lg font-medium text-gray-900 capitalize">
//                     {activeTab === 'verify' ? 'Product Verification' : activeTab}
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
//                       This section will contain {activeTab} functionality.
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

// export default UserDashboard;
import React from 'react';

export default function UserDashboard({ user = {}, onLogout }) {
  const name = [user.firstName, user.lastName].filter(Boolean).join(' ') || 'User';
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Retailer/User Dashboard</h1>
      <p className="mt-2">Welcome, {name} ({user.role || 'UNKNOWN'})</p>
      <div className="mt-6 space-x-3">
        <button className="px-3 py-2 bg-gray-200 rounded">Verify Products</button>
        <button className="px-3 py-2 bg-gray-200 rounded">Orders</button>
        <button className="px-3 py-2 bg-gray-200 rounded">Profile</button>
        <button onClick={onLogout} className="px-3 py-2 bg-red-600 text-white rounded">Logout</button>
      </div>
    </div>
  );
}
