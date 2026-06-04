import React from 'react';
import './UserDashboard.css';

const UserDashboard = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  return (
    <div className="user-dashboard">
      <h1>User Dashboard</h1>
      <p>Welcome back, {user.firstName || 'User'}!</p>
      <div className="dashboard-content">
        <p>This is your personal dashboard. Only users with the 'User' role can see this page.</p>
      </div>
    </div>
  );
};

export default UserDashboard;
