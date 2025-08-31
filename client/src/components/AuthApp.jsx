// // import React, { useState, useEffect } from 'react';
// // import LoginForm from './LoginForm';
// // import SignupForm from './SignupForm';
// // import WarehouseDashboard from './WarehouseDashboard';
// // import UserDashboard from './UserDashboard';

// // const AuthApp = () => {
// //   const [currentView, setCurrentView] = useState('login'); // 'login', 'signup', 'dashboard'
// //   const [isLoading, setIsLoading] = useState(false);
// //   const [error, setError] = useState('');
// //   const [success, setSuccess] = useState('');
// //   const [currentUser, setCurrentUser] = useState(null);

// //   const API_BASE_URL = 'http://localhost:5000/api';

// //   // Check for existing authentication on mount
// //   useEffect(() => {
// //     const token = localStorage?.getItem('accessToken');
// //     const userData = localStorage?.getItem('userData');
    
// //     if (token && userData) {
// //       try {
// //         const user = JSON.parse(userData);
// //         setCurrentUser(user);
// //         setCurrentView('dashboard');
// //       } catch (err) {
// //         localStorage?.clear();
// //       }
// //     }
// //   }, []);

// //   // Login function
// //   const handleLogin = async (email, password) => {
// //     setIsLoading(true);
// //     setError('');
// //     setSuccess('');

// //     try {
// //       const response = await fetch(`${API_BASE_URL}/auth/login`, {
// //         method: 'POST',
// //         headers: {
// //           'Content-Type': 'application/json',
// //         },
// //         body: JSON.stringify({ email, password }),
// //       });

// //       const data = await response.json();

// //       if (!response.ok) {
// //         throw new Error(data.message || 'Login failed');
// //       }

// //       // Store tokens and user data
// //       if (typeof localStorage !== 'undefined') {
// //         localStorage.setItem('accessToken', data.data.accessToken);
// //         localStorage.setItem('refreshToken', data.data.refreshToken);
// //         localStorage.setItem('userData', JSON.stringify(data.data.user));
// //       }

// //       setCurrentUser(data.data.user);
// //       setCurrentView('dashboard');
// //       setSuccess(`Welcome back, ${data.data.user.firstName}!`);

// //     } catch (error) {
// //       setError(error.message);
// //     } finally {
// //       setIsLoading(false);
// //     }
// //   };

// //   // Signup function
// //   const handleSignup = async (userData) => {
// //     setIsLoading(true);
// //     setError('');
// //     setSuccess('');

// //     try {
// //       // Client-side validation
// //       if (!userData.firstName || !userData.lastName || !userData.email || !userData.password) {
// //         throw new Error('Please fill in all required fields');
// //       }

// //       if (userData.password.length < 6) {
// //         throw new Error('Password must be at least 6 characters long');
// //       }

// //       if (!userData.password.match(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)) {
// //         throw new Error('Password must contain uppercase, lowercase, and number');
// //       }

// //       if ((userData.role === 'WAREHOUSE' || userData.role === 'RETAILER') && !userData.companyName) {
// //         throw new Error('Company name is required for business accounts');
// //       }

// //       if (userData.role === 'RETAILER' && !userData.licenseNumber) {
// //         throw new Error('License number is required for retailer accounts');
// //       }

// //       const response = await fetch(`${API_BASE_URL}/auth/signup`, {
// //         method: 'POST',
// //         headers: {
// //           'Content-Type': 'application/json',
// //         },
// //         body: JSON.stringify(userData),
// //       });

// //       const data = await response.json();

// //       if (!response.ok) {
// //         throw new Error(data.message || 'Signup failed');
// //       }

// //       // Store tokens and user data
// //       if (typeof localStorage !== 'undefined') {
// //         localStorage.setItem('accessToken', data.data.accessToken);
// //         localStorage.setItem('refreshToken', data.data.refreshToken);
// //         localStorage.setItem('userData', JSON.stringify(data.data.user));
// //       }

// //       setCurrentUser(data.data.user);
// //       setCurrentView('dashboard');
// //       setSuccess(`Account created successfully! Welcome, ${data.data.user.firstName}!`);

// //     } catch (error) {
// //       setError(error.message);
// //     } finally {
// //       setIsLoading(false);
// //     }
// //   };

// //   // Logout function
// //   const handleLogout = () => {
// //     if (typeof localStorage !== 'undefined') {
// //       localStorage.clear();
// //     }
// //     setCurrentUser(null);
// //     setCurrentView('login');
// //     setSuccess('Logged out successfully');
// //     setError('');
// //   };

// //   // Switch to signup
// //   const switchToSignup = () => {
// //     setCurrentView('signup');
// //     setError('');
// //     setSuccess('');
// //   };

// //   // Switch to login
// //   const switchToLogin = () => {
// //     setCurrentView('login');
// //     setError('');
// //     setSuccess('');
// //   };

// //   // Show success message briefly
// //   useEffect(() => {
// //     if (success) {
// //       const timer = setTimeout(() => {
// //         setSuccess('');
// //       }, 3000);
// //       return () => clearTimeout(timer);
// //     }
// //   }, [success]);

// //   // Render appropriate view
// //   if (currentView === 'dashboard' && currentUser) {
// //     // Role-based dashboard rendering
// //     if (currentUser.role === 'ADMIN' || currentUser.role === 'WAREHOUSE') {
// //       return <WarehouseDashboard user={currentUser} onLogout={handleLogout} />;
// //     } else {
// //       return <UserDashboard user={currentUser} onLogout={handleLogout} />;
// //     }
// //   }

// //   if (currentView === 'signup') {
// //     return (
// //       <>
// //         {success && (
// //           <div className="fixed top-4 right-4 z-50 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md shadow-lg">
// //             <p className="text-sm">{success}</p>
// //           </div>
// //         )}
// //         <SignupForm 
// //           onSignup={handleSignup}
// //           isLoading={isLoading}
// //           error={error}
// //           onSwitchToLogin={switchToLogin}
// //         />
// //       </>
// //     );
// //   }

// //   // Default to login view
// //   return (
// //     <>
// //       {success && (
// //         <div className="fixed top-4 right-4 z-50 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md shadow-lg">
// //           <p className="text-sm">{success}</p>
// //         </div>
// //       )}
// //       <LoginForm 
// //         onLogin={handleLogin}
// //         isLoading={isLoading}
// //         error={error}
// //         onSwitchToSignup={switchToSignup}
// //       />
// //     </>
// //   );
// // };

// // export default AuthApp;
// // client/src/components/AuthApp.jsx
// import React, { useState } from "react";
// import LoginForm from "./LoginForm";
// import SignupForm from "./SignupForm"; // create similar form for signup
// import { useAuth } from "../contexts/AuthContexts";

// const AuthApp = () => {
//   const [showSignup, setShowSignup] = useState(false);
//   const { user, login, isLoading, error } = useAuth();

//   if (user) {
//     return (
//       <div className="flex items-center justify-center h-screen">
//         <h1 className="text-2xl font-bold">
//           Welcome, {user.email} 🎉
//         </h1>
//       </div>
//     );
//   }

//   return showSignup ? (
//     <SignupForm onSwitchToLogin={() => setShowSignup(false)} />
//   ) : (
//     <LoginForm
//       onLogin={login}
//       isLoading={isLoading}
//       error={error}
//       onSwitchToSignup={() => setShowSignup(true)}
//     />
//   );
// };

// export default AuthApp;

import React, { useState } from 'react';
import LoginForm from './LoginForm.jsx';
import SignupForm from './SignupForm.jsx';
import WarehouseDashboard from './WarehouseDashboard.jsx';
import UserDashboard from './UserDashboard.jsx';
import { useAuth } from '../contexts/AuthContext.jsx';

export default function AuthApp() {
  const { user, isLoading, error, login, signup, logout } = useAuth();
  const [view, setView] = useState('login'); // 'login' | 'signup'

  if (user) {
    const role = user.role || 'USER';
    if (role === 'ADMIN' || role === 'WAREHOUSE') {
      return <WarehouseDashboard user={user} onLogout={logout} />;
    }
    return <UserDashboard user={user} onLogout={logout} />;
  }

  if (view === 'signup') {
    return (
      <SignupForm
        onSignup={async (payload) => { await signup(payload); }}
        isLoading={isLoading}
        error={error}
        onSwitchToLogin={() => setView('login')}
      />
    );
  }

  return (
    <LoginForm
      onLogin={async (email, pwd) => { await login(email, pwd); }}
      isLoading={isLoading}
      error={error}
      onSwitchToSignup={() => setView('signup')}
    />
  );
}
