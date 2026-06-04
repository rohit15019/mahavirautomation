import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import * as Icons from 'lucide-react';
import logo from './assets/logo.png';
import './AdminLayout.css';

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [showProfile, setShowProfile] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) setUser(JSON.parse(storedUser));
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  // Determine current page title based on path
  const getPageTitle = () => {
    if (location.pathname.includes('services') && !location.pathname.includes('categories')) return 'Manage Services';
    if (location.pathname.includes('products')) return 'Manage Products';
    if (location.pathname.includes('service-categories')) return 'Services Categories';
    if (location.pathname.includes('categories')) return 'Product categories';
    if (location.pathname.includes('downloads')) return 'Manage Downloads';
    if (location.pathname.includes('profile')) return 'My Profile';

    return 'All Users Directory'; // Default/Dashboard
  };

  return (
    <div className="admin-app-container">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="admin-brand" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
          <img src={logo} alt="MAHAVIR AUTOMATION" className="admin-brand-logo" />
          <span className="admin-brand-name">Mahavir Automation</span>
        </div>

        <nav className="admin-nav-group">
          <NavLink to="/admin" end className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}>
            <Icons.LayoutDashboard size={20} /> Dashboard
          </NavLink>
          <NavLink to="/" className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}>
            <Icons.Home size={20} /> Home
          </NavLink>
          <NavLink to="/products" className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}>
            <Icons.Grid size={20} /> Product
          </NavLink>
          <NavLink to="/about" className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}>
            <Icons.Info size={20} /> About Us
          </NavLink>
          <NavLink to="/services" className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}>
            <Icons.Shield size={20} /> Services
          </NavLink>
          <NavLink to="/download" className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}>
            <Icons.Download size={20} /> Downloads
          </NavLink>
          <NavLink to="/contact" className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}>
            <Icons.Mail size={20} /> Contact Us
          </NavLink>
        </nav>

        <div className="nav-section-title">Bottom Management</div>
        <nav className="admin-nav-group">
          <NavLink to="/admin/services" className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}>
            <Icons.Settings size={20} /> Manage Services
          </NavLink>
          <NavLink to="/admin/products" className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}>
            <Icons.Box size={20} /> Manage Product
          </NavLink>
          <NavLink to="/admin/categories" className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}>
            <Icons.Layers size={20} /> Product categories
          </NavLink>
          <NavLink to="/admin/service-categories" className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}>
            <Icons.Layers size={20} /> Services Categories
          </NavLink>
          <NavLink to="/admin/downloads" className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}>
            <Icons.Download size={20} /> Manage Downloads
          </NavLink>

        </nav>

        <div className="nav-section-title">System & Users Management</div>
        <nav className="admin-nav-group">
          <NavLink to="/admin" className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}>
            <Icons.Users size={20} /> All Users
          </NavLink>
          <NavLink to="/admin/profile" className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}>
            <Icons.UserCog size={20} /> My Profile
          </NavLink>
          <div className="admin-nav-item" onClick={handleLogout} style={{ color: '#ef4444' }}>
            <Icons.LogOut size={20} /> Logout
          </div>
          <NavLink to="/admin/requests" className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}>
            <Icons.FileText size={20} /> Requests
          </NavLink>
        </nav>
      </aside>

      {/* Main Content Area */}
      <div className="admin-main-area">
        {/* Top Header */}
        <header className="admin-top-header">
          <div className="header-page-info">
            <h1>{getPageTitle()}</h1>
            <span className="breadcrumb">Home</span>
          </div>

          <div className="header-actions">

            
            <button className="notification-btn">
              <Icons.Bell size={20} />
              <span className="notification-dot"></span>
            </button>

            <div className="admin-profile-section" style={{ position: 'relative' }}>
              <div className="admin-profile-dropdown" onClick={() => setShowProfile(!showProfile)}>
                <div className="admin-avatar">
                  <Icons.User size={18} />
                </div>
                <span className="admin-name">{user ? `${user.firstName || user.FirstName || ''} ${user.lastName || user.LastName || ''}` : 'Admin User'}</span>
                <Icons.ChevronDown size={16} color="#64748b" className={showProfile ? 'rotate' : ''} />
              </div>

              {showProfile && (
                <div className="admin-profile-menu">
                  <div className="admin-dropdown-header">
                    <p className="admin-user-name">
                      {user ? `${user.firstName || user.FirstName || 'Admin'} ${user.lastName || user.LastName || 'User'}` : 'Admin User'}
                    </p>
                    <p className="admin-user-email">{user?.email || user?.Email || ''}</p>
                  </div>
                  <div className="admin-dropdown-divider"></div>
                  <NavLink to="/admin/profile" className="admin-dropdown-link" onClick={() => setShowProfile(false)}>
                    <Icons.UserCog size={18} />
                    <span>Edit Profile</span>
                  </NavLink>
                  <div className="admin-dropdown-divider"></div>
                  <button className="admin-logout-btn" onClick={handleLogout}>
                    <Icons.LogOut size={18} />
                    <span>Log Out</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Content Outlet */}
        <main className="admin-content-outlet">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
