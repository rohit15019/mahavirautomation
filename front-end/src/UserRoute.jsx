import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const UserRoute = () => {
  const user = localStorage.getItem('user');
  const role = localStorage.getItem('role');

  if (!user) {
    // Not logged in
    return <Navigate to="/login" replace />;
  }

  if (role && role.toLowerCase() === 'user') {
    return <Outlet />;
  }

  if (role && role.toLowerCase() === 'admin') {
    // Admins shouldn't be on user dashboards normally, redirect to admin
    return <Navigate to="/admin/dashboard" replace />;
  }

  return <Navigate to="/login" replace />;
};

export default UserRoute;
