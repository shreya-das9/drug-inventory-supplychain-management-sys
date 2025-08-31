import React from 'react';
import { AuthProvider } from './contexts/AuthContext.jsx';
import AuthApp from './components/AuthApp.jsx';

export default function App() {
  return (
    <AuthProvider>
      <AuthApp />
    </AuthProvider>
  );
}
