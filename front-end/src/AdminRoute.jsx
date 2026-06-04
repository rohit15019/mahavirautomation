import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const AdminRoute = () => {
  const user = localStorage.getItem('user');
  const role = localStorage.getItem('role');

  if (!user) {
    // Not logged in
    return <Navigate to="/login" replace />;
  }

  if (role && role.toLowerCase() === 'admin') {
    return <Outlet />;
  }

  // Logged in but not admin
  return <Navigate to="/dashboard" replace />;
};

export default AdminRoute;
