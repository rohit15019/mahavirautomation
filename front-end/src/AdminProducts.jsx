/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { 
  Box, Edit2, Trash2, Search, Plus, X, ChevronLeft, ChevronRight, 
  Workflow, Database, Users, Settings, Layout, FileText, Download
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './AdminManagement.css'; 

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    imageKey: '',
    price: '',
    features: '',
    categoryId: ''
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const API_URL = `${import.meta.env.VITE_API_BASE_URL}/api/v1.0/Product`;
  const CAT_API_URL = `${import.meta.env.VITE_API_BASE_URL}/api/v1.0/category`;

  const fetchData = async () => {
    try {
      setLoading(true);
      const [productsRes, categoriesRes] = await Promise.all([
        fetch(API_URL),
        fetch(`${CAT_API_URL}?type=Product`)
      ]);

      if (productsRes.ok) setProducts(await productsRes.json());
      if (categoriesRes.ok) setCategories(await categoriesRes.json());
    } catch (err) {
      setError(err.message);
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

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const featuresArray = formData.features
      .split('\n')
      .map(item => item.trim())
      .filter(item => item !== '');

    const data = new FormData();
    data.append('title', formData.title);
    data.append('description', formData.description);
    data.append('price', formData.price);
    data.append('categoryId', formData.categoryId);
    data.append('imageKey', formData.imageKey); // existing path if any
    
    data.append('features', JSON.stringify(featuresArray));
    
    if (imageFile) {
      data.append('imageFile', imageFile);
    }

    try {
      let response;
      if (isEditing) {
        response = await fetch(`${API_URL}/${editingId}`, {
          method: 'PUT',
          headers: { 
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: data
        });
      } else {
        response = await fetch(`${API_URL}/add`, {
          method: 'POST',
          headers: { 
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: data
        });
      }

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.message || 'Failed to save product');
      }
      
      resetForm();
      await fetchData();
      alert(`Product ${isEditing ? 'updated' : 'added'} successfully!`);
    } catch (err) {
      alert(`Operation failed: ${err.message}`);
    }
  };

  const handleEdit = (product) => {
    setFormData({
      title: product.title,
      description: product.description,
      imageKey: product.imageKey || '',
      price: product.price.toString(),
      features: (product.features || []).join('\n'),
      categoryId: product.categoryId || ''
    });
    setImagePreview(product.imageKey ? `${import.meta.env.VITE_API_BASE_URL}${product.imageKey}` : null);
    setImageFile(null);
    setIsEditing(true);
    setEditingId(product.id || product.Id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        const response = await fetch(`${API_URL}/${id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });

      if (response.ok) {
        setProducts(prev => prev.filter(p => (p.id || p.Id) !== id));
        await fetchData();
      } else {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.message || 'Failed to delete product');
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
      imageKey: '',
      price: '',
      features: '',
      categoryId: ''
    });
    setImageFile(null);
    setImagePreview(null);
    setIsEditing(false);
    setEditingId(null);
  };

  const filteredProducts = Array.isArray(products) ? products.filter(p => 
    (p.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.description || '').toLowerCase().includes(searchQuery.toLowerCase())
  ) : [];

  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  const availableImages = ['workflow', 'datasync', 'team'];

  if (loading) return <div className="admin-loading">Loading Products...</div>;

  return (
    <div className="admin-management-container">
      <div className="management-header">
        <div>
          <h1>Product Management</h1>
          <p>Maintain and update your industrial automation product catalog</p>
        </div>
        
        <div className="search-box">
          <input 
            type="text" 
            placeholder="Search products..." 
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
            <h2>{isEditing ? <Edit2 size={20} /> : <Plus size={20} />} {isEditing ? 'Edit Product' : 'Add New Product'}</h2>
            <form onSubmit={handleSubmit} className="management-form">
              <div className="form-group">
                <label>Product Title</label>
                <input 
                  type="text" 
                  name="title" 
                  value={formData.title} 
                  onChange={handleChange} 
                  required 
                  placeholder="e.g. Workflow Builder"
                />
              </div>

              <div className="form-group">
                <label>Product Image</label>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={handleImageChange}
                    style={{ width: '100%', padding: '8px', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '8px' }}
                  />
                  {imagePreview && (
                    <div className="icon-display" style={{ width: '60px', height: '60px', overflow: 'hidden', flexShrink: 0 }}>
                      <img src={imagePreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  )}
                </div>
              </div>
              
              <div className="form-group">
                <label>Category</label>
                <select name="categoryId" value={formData.categoryId} onChange={handleChange} required>
                  <option value="">Select Category</option>
                  {Array.isArray(categories) && categories.map(cat => (
                    <option key={cat.id || cat.Id} value={cat.id || cat.Id}>
                      {cat.parentId || cat.ParentId ? '↳ ' : ''}{cat.name || cat.Name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Price (₹)</label>
                <input 
                  type="number" 
                  name="price" 
                  value={formData.price} 
                  onChange={handleChange} 
                  required 
                  placeholder="e.g. 89"
                />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea 
                  name="description" 
                  value={formData.description} 
                  onChange={handleChange} 
                  required 
                  rows="3"
                  placeholder="Brief description of the product..."
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
                  {isEditing ? 'Update Product' : 'Add Product'}
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
            {paginatedProducts.map(product => (
              <div key={product.id || product.Id} className="item-card">
                <div className="item-header">
                  <div className="item-icon" style={{ overflow: 'hidden' }}>
                    {product.imageKey ? (
                      <img src={`${import.meta.env.VITE_API_BASE_URL}${product.imageKey}`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <Box size={24} />
                    )}
                  </div>
                  <div className="item-actions">
                    <button onClick={() => navigate(`/admin/products/${product.id || product.Id}/details`)} className="icon-btn" title="Manage Details" style={{color: '#00b4d8'}}><FileText size={16} /></button>
                    <button onClick={() => navigate(`/admin/products/${product.id || product.Id}/download`)} className="icon-btn" title="Manage Download" style={{color: '#10b981'}}><Download size={16} /></button>
                    <button onClick={() => handleEdit(product)} className="icon-btn edit" title="Edit"><Edit2 size={16} /></button>
                    <button onClick={() => handleDelete(product.id || product.Id)} className="icon-btn delete" title="Delete"><Trash2 size={16} /></button>
                  </div>
                </div>
                <div className="item-content">
                  <span className="item-price">₹{product.price}</span>
                  <div className="item-tags">
                    <span className="tag">
                      {categories.find(c => String(c.id || c.Id) === String(product.categoryId))?.name || 
                       categories.find(c => String(c.id || c.Id) === String(product.categoryId))?.Name || 
                       'Uncategorized'}
                    </span>
                  </div>
                  <h3>{product.title}</h3>
                  <p className="item-description">{(product.description || '').substring(0, 100)}...</p>
                </div>
              </div>
            ))}
            {filteredProducts.length === 0 && (
              <div className="no-results" style={{ gridColumn: '1 / -1' }}>
                No products found matching your criteria.
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

export default AdminProducts;
