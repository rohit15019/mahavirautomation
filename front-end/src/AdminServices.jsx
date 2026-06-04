/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { 
  Workflow, Database, BarChart2, Headphones, Code, Settings, 
  Shield, Zap, Server, Cloud, Smartphone, Cpu, Activity, Globe,
  Edit2, Trash2, Search, Plus, X, ChevronLeft, ChevronRight, Layout, Download
} from 'lucide-react';
import './AdminManagement.css'; 
import { useNavigate } from 'react-router-dom';

const IconsMap = {
  Workflow, Database, BarChart2, Headphones, Code, Settings,
  Shield, Zap, Server, Cloud, Smartphone, Cpu, Activity, Globe,
  HeadphonesIcon: Headphones
};


const AdminServices = () => {
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    iconName: 'Settings',
    features: '',
    categoryId: ''
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const API_URL = `${import.meta.env.VITE_API_BASE_URL}/api/v1.0/Services`;
  const CAT_API_URL = `${import.meta.env.VITE_API_BASE_URL}/api/v1.0/category`;

  const fetchData = async () => {
    try {
      setLoading(true);
      const [servicesRes, categoriesRes] = await Promise.all([
        fetch(API_URL),
        fetch(`${CAT_API_URL}?type=Service`)
      ]);

      if (servicesRes.ok) setServices(await servicesRes.json());
      else throw new Error('Failed to fetch services');
      
      if (categoriesRes.ok) setCategories(await categoriesRes.json());
      else throw new Error('Failed to fetch categories');
    } catch (err) {
      setError(err.message);
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line
    fetchData();
  }, []);


  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const featuresArray = formData.features
      .split('\n')
      .map(item => item.trim())
      .filter(item => item !== '');

    const payload = {
      title: formData.title,
      description: formData.description,
      iconName: formData.iconName,
      features: featuresArray,
      categoryId: formData.categoryId ? parseInt(formData.categoryId) : null
    };

    try {
      let response;
      if (isEditing) {
        response = await fetch(`${API_URL}/${editingId}`, {
          method: 'PUT',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify(payload)
        });
      } else {
        response = await fetch(`${API_URL}/add`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify(payload)
        });
      }

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.message || 'Failed to save service');
      }
      
      resetForm();
      await fetchData();
      alert(`Service ${isEditing ? 'updated' : 'added'} successfully!`);
    } catch (err) {
      alert(`Operation failed: ${err.message}`);
    }
  };

  const handleEdit = (service) => {
    setFormData({
      title: service.title,
      description: service.description,
      iconName: service.iconName,
      features: (service.features || []).join('\n'),
      categoryId: service.categoryId || ''
    });
    setIsEditing(true);
    setEditingId(service.id || service.Id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this service?')) {
      try {
        const response = await fetch(`${API_URL}/${id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });

      if (response.ok) {
        setServices(prev => prev.filter(s => (s.id || s.Id) !== id));
        await fetchData();
      } else {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.message || 'Failed to delete service');
      }
    } catch (err) {
      alert(`Delete failed: ${err.message}`);
    }
  }
};


  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      iconName: 'Settings',
      features: '',
      categoryId: ''
    });
    setIsEditing(false);
    setEditingId(null);
  };

  const filteredServices = Array.isArray(services) ? services.filter(s => 
    (s.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (s.description || '').toLowerCase().includes(searchQuery.toLowerCase())
  ) : [];

  const paginatedServices = filteredServices.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredServices.length / itemsPerPage);

  const commonIcons = [
    'Workflow', 'Database', 'BarChart2', 'Headphones', 'Code', 'Settings', 
    'Shield', 'Zap', 'Server', 'Cloud', 'Smartphone', 'Cpu', 'Activity', 'Globe'
  ];

  if (loading) return <div className="admin-loading">Loading Services...</div>;
  if (error) return (
    <div className="admin-error">
      <h2>Error Loading Services</h2>
      <p>{error}</p>
      <button onClick={fetchData} className="btn-primary">Retry</button>
    </div>
  );

  return (
    <div className="admin-management-container">
      <div className="management-header">
        <div>
          <h1>Service Management</h1>
          <p>Create and manage premium automation services</p>
        </div>
        
        <div className="search-box">
          <input 
            type="text" 
            placeholder="Search services..." 
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="search-input"
          />
        </div>
      </div>

      <div className="management-grid">
        {/* Form Section */}
        <div className="management-form-card">
          <div className="management-card">
            <h2>{isEditing ? <Edit2 size={20} /> : <Plus size={20} />} {isEditing ? 'Edit Service' : 'Add New Service'}</h2>
            <form onSubmit={handleSubmit} className="management-form">
              <div className="form-group">
                <label>Service Title</label>
                <input 
                  type="text" 
                  name="title" 
                  value={formData.title} 
                  onChange={handleChange} 
                  required 
                  placeholder="e.g. Workflow automation"
                />
              </div>

              <div className="form-group">
                <label>Icon Selection</label>
                <div className="icon-preview-box">
                  <select name="iconName" value={formData.iconName} onChange={handleChange}>
                    {commonIcons.map(icon => (
                      <option key={icon} value={icon}>{icon}</option>
                    ))}
                  </select>
                  <div className="icon-display">
                    {IconsMap[formData.iconName] && React.createElement(IconsMap[formData.iconName], { size: 24, color: '#07E7F7' })}
                  </div>
                </div>
              </div>
              
              <div className="form-group">
                <label>Service Category</label>
                <select name="categoryId" value={formData.categoryId} onChange={handleChange} required>
                  <option value="">Select Service Category</option>
                  {Array.isArray(categories) && categories.map(cat => (
                    <option key={cat.id || cat.Id} value={cat.id || cat.Id}>
                      {cat.parentId || cat.ParentId ? '↳ ' : ''}{cat.name || cat.Name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea 
                  name="description" 
                  value={formData.description} 
                  onChange={handleChange} 
                  required 
                  rows="3"
                  placeholder="Brief description of the service..."
                />
              </div>

              <div className="form-group">
                <label>Features (One per line)</label>
                <textarea 
                  name="features" 
                  value={formData.features} 
                  onChange={handleChange} 
                  required 
                  rows="5"
                  placeholder="Feature 1&#10;Feature 2&#10;Feature 3"
                />
              </div>

              <div className="form-actions">
                <button type="submit" className="btn-primary">
                  {isEditing ? <Edit2 size={18} /> : <Plus size={18} />}
                  {isEditing ? 'Update Service' : 'Add Service'}
                </button>
                {isEditing && (
                  <button type="button" className="btn-secondary" onClick={resetForm}>
                    <X size={18} /> Cancel
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* List Section */}
        <div className="management-list-section">
          <div className="list-container">
            {paginatedServices.map(service => (
              <div key={service.id || service.Id} className="item-card">
                <div className="item-header">
                  <div className="item-icon">
                    {IconsMap[service.iconName] && React.createElement(IconsMap[service.iconName], { size: 24 })}
                  </div>
                  <div className="item-actions">
                    <button onClick={() => navigate(`${service.id || service.Id}/details`)} className="icon-btn edit" title="Manage Detailed Features" style={{ color: '#00b4d8' }}><Layout size={16} /></button>
                    <button onClick={() => navigate(`${service.id || service.Id}/download`)} className="icon-btn edit" title="Manage Download File" style={{ color: '#10b981' }}><Download size={16} /></button>
                    <button onClick={() => handleEdit(service)} className="icon-btn edit" title="Edit Basic Info"><Edit2 size={16} /></button>
                    <button onClick={() => handleDelete(service.id || service.Id)} className="icon-btn delete" title="Delete"><Trash2 size={16} /></button>
                  </div>
                </div>
                <div className="item-content">
                  <div className="item-tags">
                    <span className="tag">
                      {categories.find(c => String(c.id || c.Id) === String(service.categoryId))?.name || 
                       categories.find(c => String(c.id || c.Id) === String(service.categoryId))?.Name || 
                       'Uncategorized'}
                    </span>
                  </div>
                  <h3>{service.title}</h3>
                  <p className="item-description">{(service.description || '').substring(0, 100)}...</p>
                </div>
              </div>
            ))}
            {filteredServices.length === 0 && (
              <div className="no-results" style={{ gridColumn: '1 / -1' }}>
                No services found matching your criteria.
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pagination-container" style={{ marginTop: '2rem', background: 'none', border: 'none' }}>
              <button 
                className="page-btn" 
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft size={18} />
              </button>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button 
                  key={page} 
                  className={`page-btn ${currentPage === page ? 'active' : ''}`}
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </button>
              ))}

              <button 
                className="page-btn" 
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                <ChevronRight size={18} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminServices;
