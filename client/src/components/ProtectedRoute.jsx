// src/components/ProtectedRoute.jsx
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');

  if (!token) {
    // If no token, redirect to login-signup page
    return <Navigate to="/login-signup" replace />;
  }

  // If token is present, render the child component (e.g., Dashboard)
  return children;
};

export default ProtectedRoute;
