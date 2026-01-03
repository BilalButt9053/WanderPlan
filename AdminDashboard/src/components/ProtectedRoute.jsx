import React from 'react';
import { Navigate } from 'react-router-dom';

export const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('authToken');
  const userData = localStorage.getItem('userData');
  
  if (!token || !userData) {
    return <Navigate to="/auth/sign-in" replace />;
  }
  
  try {
    const user = JSON.parse(userData);
    if (!user.isAdmin) {
      // Not an admin, redirect to sign-in
      localStorage.clear();
      return <Navigate to="/auth/sign-in" replace />;
    }
  } catch (error) {
    localStorage.clear();
    return <Navigate to="/auth/sign-in" replace />;
  }
  
  return children;
};

export const AuthRoute = ({ children }) => {
  const token = localStorage.getItem('authToken');
  
  if (token) {
    return <Navigate to="/" replace />;
  }
  
  return children;
};
