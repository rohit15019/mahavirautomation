import React, { useState, useEffect } from 'react';
import { 
  MoreHorizontal, 
  Edit2, 
  Trash2, 
  Eye, 
  Users,
  UserPlus,
  Clock,
  X
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import './AdminDashboard.css';

const formatDate = (dateString, includeTime = false) => {
  if (!dateString || dateString.startsWith('0001')) return 'N/A';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return 'N/A';
  
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = String(date.getFullYear()).slice(-2);
  
  if (includeTime) {
    const time = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return `${day}/${month}/${year} ${time}`;
  }
  return `${day}/${month}/${year}`;
};

const AdminDashboard = () => {
  const [stats, setStats] = useState({ totalUsers: 0, newUsers24h: 0, pendingRequests: 0 });
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const API_BASE = `${import.meta.env.VITE_API_BASE_URL}/api/v1.0/Admin`;

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const headers = {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      };

      const [statsRes, usersRes] = await Promise.all([
        fetch(`${API_BASE}/stats`, { headers }),
        fetch(`${API_BASE}/users`, { headers })
      ]);

      if (statsRes.status === 401 || usersRes.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('role');
        navigate('/login');
        return;
      }

      if (!statsRes.ok || !usersRes.ok) {
        throw new Error(`Failed to fetch data: ${statsRes.status} / ${usersRes.status}`);
      }

      const statsData = await statsRes.json();
      const usersData = await usersRes.json();
      
      setStats(statsData);
      setUsers(usersData);
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to permanently delete this user? This action cannot be undone.")) return;

    try {
      const response = await fetch(`${API_BASE}/users/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        alert("User deleted successfully.");
        // If the deleted user was being viewed in the modal, close it
        if (selectedUser && (selectedUser.id === id || selectedUser.Id === id)) {
          setSelectedUser(null);
        }
        fetchData(); // Refresh the list and stats
      } else {
        const data = await response.json().catch(() => ({}));
        alert(data.message || "Failed to delete user.");
      }
    } catch (err) {
      console.error("Error deleting user:", err);
      alert("An error occurred while deleting the user.");
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) return <div className="admin-loading">Loading Dashboard...</div>;
  if (error) return <div className="admin-error-container">
    <h3>Error Loading Dashboard</h3>
    <p>{error}</p>
    <button onClick={fetchData} className="retry-btn">Retry</button>
  </div>;

  return (
    <div className="dashboard-grid simplified">
      {/* Main Content Area */}
      <div className="dashboard-main full-width">
        {/* Top Stat Cards */}
        <div className="stat-cards-container">
          <div className="stat-card">
            <div className="stat-header">
              <span className="stat-title">Total Users</span>
              <div className="stat-icon-wrapper blue">
                <Users size={18} />
              </div>
            </div>
            <div className="stat-value">{stats.totalUsers}</div>
            <div className="stat-label">System-wide registered accounts</div>
          </div>

          <div className="stat-card">
            <div className="stat-header">
              <span className="stat-title">New Users (24h)</span>
              <div className="stat-icon-wrapper green">
                <UserPlus size={18} />
              </div>
            </div>
            <div className="stat-value">{stats.newUsers24h}</div>
            <div className="stat-label">Joined in the last 24 hours</div>
          </div>

          <div className="stat-card" onClick={() => navigate('/admin/requests')} style={{ cursor: 'pointer' }}>
            <div className="stat-header">
              <span className="stat-title">Pending Requests</span>
              <div className="stat-icon-wrapper red">
                <Clock size={18} />
              </div>
            </div>
            <div className="stat-value">{stats.pendingRequests}</div>
            <div className="stat-label">Awaiting administrator action</div>
          </div>
        </div>

        {/* User Table Section */}
        <div className="table-card">
          <div className="table-header">
            <h3>User Table</h3>
            <button className="table-more-btn"><MoreHorizontal size={20} /></button>
          </div>
          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>User ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Status</th>
                  <th>Role</th>
                  <th>Last Login</th>
                  <th>Registration Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id || user.Id}>
                    <td>#{user.displayId}</td>
                    <td className="font-medium">{user.name || user.Name}</td>
                    <td>{user.email || user.Email}</td>
                    <td><span className={`status-badge active`}>Active</span></td>
                    <td>{user.role || user.Role}</td>
                    <td>{formatDate(user.lastLogin || user.LastLogin, true)}</td>
                    <td>{formatDate(user.createdAt || user.CreatedAt)}</td>
                    <td className="table-actions">
                      {(user.role || user.Role) !== 'Admin' && (
                        <button title="Delete User" onClick={() => handleDelete(user.id || user.Id)}><Trash2 size={16} /></button>
                      )}
                      {JSON.parse(localStorage.getItem('user'))?.userGuid === user.userGuid && (
                         <button title="Edit Profile" onClick={() => navigate('/admin/profile')}><Edit2 size={16} /></button>
                      )}
                      <button title="View Details" onClick={() => setSelectedUser(user)}><Eye size={16} /></button>
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr>
                    <td colSpan="8" style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                      No users found in the system.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* User Details Modal */}
      {selectedUser && (
        <div className="modal-overlay" onClick={() => setSelectedUser(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>User Details</h3>
              <button className="close-btn" onClick={() => setSelectedUser(null)}><X size={20} /></button>
            </div>
            <div className="modal-body">
              <div className="detail-row">
                <span className="detail-label">Name:</span>
                <span className="detail-value">{selectedUser.name || selectedUser.Name}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Email:</span>
                <span className="detail-value">{selectedUser.email || selectedUser.Email}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Mobile Number:</span>
                <span className="detail-value">{selectedUser.mobileNumber || selectedUser.MobileNumber || 'N/A'}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Password:</span>
                <span className="detail-value">{selectedUser.password || selectedUser.Password || 'N/A'}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Role:</span>
                <span className="detail-value">{selectedUser.role || selectedUser.Role}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">User ID:</span>
                <span className="detail-value">#{selectedUser.displayId}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Status:</span>
                <span className="detail-value"><span className="status-badge active">Active</span></span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Last Login:</span>
                <span className="detail-value">{formatDate(selectedUser.lastLogin || selectedUser.LastLogin, true)}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Registration Date:</span>
                <span className="detail-value">{formatDate(selectedUser.createdAt || selectedUser.CreatedAt)}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
