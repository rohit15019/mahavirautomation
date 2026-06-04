/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { 
  Box, Edit2, Trash2, Search, Plus, X, ChevronLeft, ChevronRight, 
  Download, FileText
} from 'lucide-react';
import './AdminManagement.css'; 

const AdminDownloads = () => {
  const [downloads, setDownloads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    file: null
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const API_URL = `${import.meta.env.VITE_API_BASE_URL}/api/v1.0/Download`;

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch(API_URL);
      if (res.ok) setDownloads(await res.json());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setFormData(prev => ({ ...prev, file: e.target.files[0] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.file) {
      alert("Please select a file to upload.");
      return;
    }

    const data = new FormData();
    data.append('name', formData.name);
    data.append('description', formData.description);
    data.append('file', formData.file);

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: data
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.message || 'Failed to upload download file');
      }
      
      resetForm();
      await fetchData();
      alert('File uploaded successfully!');
    } catch (err) {
      alert(`Operation failed: ${err.message}`);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this file?')) {
      try {
        const response = await fetch(`${API_URL}/${id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });

        if (response.ok) {
          setDownloads(prev => prev.filter(p => (p.id || p.Id) !== id));
          await fetchData();
        } else {
          const errData = await response.json().catch(() => ({}));
          throw new Error(errData.message || 'Failed to delete file');
        }
      } catch (err) {
        alert(`Delete failed: ${err.message}`);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      file: null
    });
    // clear file input
    const fileInput = document.getElementById('file-upload');
    if (fileInput) fileInput.value = '';
  };

  const filteredDownloads = downloads.filter(p => {
    const nameStr = p.name || '';
    const descStr = p.description || '';
    const fileType = p.fileType || '';
    if (!fileType) return false;
    return nameStr.toLowerCase().includes(searchQuery.toLowerCase()) ||
           descStr.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const paginatedDownloads = filteredDownloads.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredDownloads.length / itemsPerPage);

  if (loading) return <div className="admin-loading">Loading Downloads...</div>;

  return (
    <div className="admin-management-container">
      <div className="management-header">
        <div>
          <h1>Manage Downloads</h1>
          <p>Add and maintain downloadable resources (PDFs, ZIPs) for users</p>
        </div>
        
        <div className="search-box">
          <input 
            type="text" 
            placeholder="Search files..." 
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
            <h2><Plus size={20} /> Add New File</h2>
            <form onSubmit={handleSubmit} className="management-form">
              <div className="form-group">
                <label>File Name</label>
                <input 
                  type="text" 
                  name="name" 
                  value={formData.name} 
                  onChange={handleChange} 
                  required 
                  placeholder="e.g. User Manual 2026"
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
                  placeholder="Brief description of the file..."
                />
              </div>

              <div className="form-group">
                <label>Upload File (.pdf or .zip)</label>
                <input 
                  type="file" 
                  id="file-upload"
                  name="file" 
                  onChange={handleFileChange} 
                  required 
                  accept=".pdf,.zip"
                />
              </div>

              <div className="form-actions">
                <button type="submit" className="btn-primary">
                  <Plus size={18} /> Upload File
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* List Section */}
        <div className="management-list-section">
          <div className="list-container">
            {paginatedDownloads.map(dl => (
              <div key={dl.id || dl.Id} className="item-card">
                <div className="item-header">
                  <div className="item-icon">
                    <Download size={24} />
                  </div>
                  <div className="item-actions">
                    <button onClick={() => handleDelete(dl.id || dl.Id)} className="icon-btn delete" title="Delete"><Trash2 size={16} /></button>
                  </div>
                </div>
                <div className="item-content">
                  <span className="item-price" style={{fontSize:'1rem'}}>{(dl.fileType || '').toUpperCase()} - {((dl.fileSize || 0) / 1024).toFixed(1)} KB</span>
                  <h3>{dl.name || 'Unnamed'}</h3>
                  <p className="item-description">{dl.description || 'No description'}</p>
                </div>
              </div>
            ))}
            {filteredDownloads.length === 0 && (
              <div className="no-results" style={{ gridColumn: '1 / -1' }}>
                No files found matching your criteria.
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

export default AdminDownloads;
