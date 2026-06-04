import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  ChevronDown, 
  ChevronRight, 
  ShieldCheck, 
  UserCog, 
  LayoutDashboard, 
  LogOut,
  Menu,
  X
} from 'lucide-react';
import logo from './assets/logo.png';

import './Navbar.css';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const path = location.pathname;
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  });
  const [showProfile, setShowProfile] = useState(false);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Close mobile menu when location changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/v1.0/category`);
        if (response.ok) {
          const data = await response.json();
          setCategories(data);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
    
    const checkUser = () => {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      } else {
        setUser(null);
      }
    };

    checkUser();
    window.addEventListener('storage', checkUser);
    window.addEventListener('userLoginStateChange', checkUser);

    return () => {
      window.removeEventListener('storage', checkUser);
      window.removeEventListener('userLoginStateChange', checkUser);
    };
  }, []);


  const handleLogout = () => {
    localStorage.clear();
    setUser(null);
    setShowProfile(false);
    navigate('/login');
  };

  const getSubcategories = (parentId) => {
    return categories.filter(c => c.parentId === parentId || c.ParentId === parentId);
  };

  const renderDropdown = (categoryType, linkPrefix) => {
    const typeCategories = categories.filter(c => (c.categoryType || c.CategoryType) === categoryType);
    const rootCategories = typeCategories.filter(c => !(c.parentId || c.ParentId));
    
    // Check if current activeCategory belongs to this type
    const isActiveType = typeCategories.some(c => (c.id || c.Id) === activeCategory);
    const currentActive = isActiveType ? activeCategory : (rootCategories.length > 0 ? (rootCategories[0].id || rootCategories[0].Id) : null);
    
    const subCategories = currentActive 
      ? typeCategories.filter(c => (c.parentId === currentActive || c.ParentId === currentActive))
      : [];

    if (rootCategories.length === 0) return null;

    return (
      <div className="mega-menu-container">
        {/* Left Pane: Root Categories (Scrollable) */}
        <div className="mega-menu-side root-pane">
          <ul className="root-list">
            {rootCategories.map(cat => (
              <li 
                key={cat.id || cat.Id} 
                onMouseEnter={() => setActiveCategory(cat.id || cat.Id)}
                className={`root-item ${currentActive === (cat.id || cat.Id) ? 'active' : ''}`}
              >

                <Link to={`${linkPrefix}?category=${cat.id || cat.Id}`}>
                  {cat.name || cat.Name}
                  {typeCategories.some(c => (c.parentId === (cat.id || cat.Id) || c.ParentId === (cat.id || cat.Id))) && <ChevronRight size={14} className="menu-arrow-icon" />}

                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Right Pane: Sub-categories (Scrollable) */}
        {subCategories.length > 0 && (
          <div className="mega-menu-side sub-pane">
            <ul className="sub-list">
              {subCategories.map(sub => (
                <li key={sub.id || sub.Id} className="sub-item">
                  <Link to={`${linkPrefix}?category=${sub.id || sub.Id}`}>
                    {sub.name || sub.Name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  };


  return (
    <nav className="navbar-container">
      <div className="navbar-content">
        <div className="nav-logo" onClick={() => navigate('/')} style={{cursor: 'pointer'}}>
          <img src={logo} alt="Mahavir Automation" className="nav-logo-img" />
          <span className="nav-brand-name">Mahavir Automation</span>
        </div>
        
        <button 
          className="mobile-menu-toggle" 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>

        <div className={`nav-links ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
          <Link to="/" className={path === '/' ? 'active' : ''}>Home</Link>
          
          <div className="nav-item-with-dropdown">
            <Link to="/products" className={path.startsWith('/products') ? 'active' : ''}>
              Products {categories.some(c => (c.categoryType || c.CategoryType) === 'Product') && <ChevronDown size={14} />}
            </Link>
            {renderDropdown('Product', '/products')}
          </div>

          <Link to="/about" className={path === '/about' ? 'active' : ''}>About us</Link>
          
          <div className="nav-item-with-dropdown">
            <Link to="/services" className={path.startsWith('/services') ? 'active' : ''}>
              Services {categories.some(c => (c.categoryType || c.CategoryType) === 'Service') && <ChevronDown size={14} />}
            </Link>
            {renderDropdown('Service', '/services')}
          </div>

          <Link to="/download" className={path === '/download' ? 'active' : ''}>Download</Link>
          <Link to="/contact" className={path === '/contact' ? 'active' : ''}>Contact us</Link>
          
          {user ? (
            <div className="nav-profile-section">
              <button 
                className="nav-profile-trigger"
                onClick={() => setShowProfile(!showProfile)}
              >
                <div className="avatar-circle">
                  {(user.firstName || user.FirstName || 'U').charAt(0)}
                  {(user.lastName || user.LastName || '').charAt(0)}
                </div>
                <ChevronDown size={16} className={showProfile ? 'rotate' : ''} />
              </button>

              {showProfile && (
                <div className="nav-profile-dropdown">
                  <div className="dropdown-header">
                    <p className="user-name">
                      {user.firstName || user.FirstName || 'User'} {user.lastName || user.LastName || ''}
                    </p>
                    <p className="user-email">{user.email || user.Email}</p>
                  </div>
                  <div className="dropdown-divider"></div>

                  <div className="dropdown-item">
                    <ShieldCheck size={18} />
                    <div className="item-text">
                      <span className="label">Account Type</span>
                      <span className="value">{localStorage.getItem('role') || 'User'}</span>
                    </div>
                  </div>
                  <div className="dropdown-divider"></div>
                  <Link to="/edit-profile" className="dropdown-link" onClick={() => setShowProfile(false)}>
                    <UserCog size={18} />
                    <span>Edit Profile</span>
                  </Link>
                  <div className="dropdown-divider"></div>
                  {(localStorage.getItem('role') || '').toLowerCase() === 'admin' && (
                    <Link to="/admin/dashboard" className="dropdown-link" onClick={() => setShowProfile(false)}>
                      <LayoutDashboard size={18} />
                      <span>Admin Dashboard</span>
                    </Link>
                  )}
                  {(localStorage.getItem('role') || '').toLowerCase() === 'user' && (
                    <Link to="/dashboard" className="dropdown-link" onClick={() => setShowProfile(false)}>
                      <LayoutDashboard size={18} />
                      <span>User Dashboard</span>
                    </Link>
                  )}
                  <button className="logout-btn" onClick={handleLogout}>
                    <LogOut size={18} />
                    <span>Log Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" className={path === '/login' || path === '/register' ? 'active login-btn' : 'login-btn'}>
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
