import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import { AuthProvider, useAuth } from './contexts/AuthContext';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/login" element={<LoginRoute />} />
            <Route path="/dashboard" element={<ProtectedRoute />} />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

function LoginRoute() {
  const { user } = useAuth();
  return user ? <Navigate to="/dashboard" replace /> : <Login />;
}

function ProtectedRoute() {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div className="container">Loading...</div>;
  }
  
  return user ? <Dashboard /> : <Navigate to="/login" replace />;
}

export default App;
