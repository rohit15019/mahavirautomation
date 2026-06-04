import React, { useState, useEffect } from 'react';
import { CornerDownRight, Edit2, Trash2 } from 'lucide-react';
import './AdminManagement.css'; // Reusing some styles

const AdminCategories = ({ categoryType = 'Product' }) => {
  const [categories, setCategories] = useState([]);
  const [parentName, setParentName] = useState('');
  const [childName, setChildName] = useState('');
  const [selectedParentId, setSelectedParentId] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const itemsPerPage = 10;

  // Group categories: Parents first, followed by their children
  const getGroupedCategories = () => {
    const searchLower = searchQuery.toLowerCase();
    const filtered = Array.isArray(categories) ? categories.filter(cat => {
      const matchName = (cat.name || cat.Name || '').toLowerCase().includes(searchLower);
      const parentId = cat.parentId || cat.ParentId;
      const matchParent = parentId 
        ? getParentName(parentId).toLowerCase().includes(searchLower)
        : false;
      return matchName || matchParent;
    }) : [];

    const parents = filtered.filter(c => !(c.parentId || c.ParentId));
    const children = filtered.filter(c => (c.parentId || c.ParentId));
    
    let grouped = [];
    parents.forEach(parent => {
      grouped.push(parent);
      const parentChildren = children.filter(child => 
        (child.parentId === (parent.id || parent.Id) || child.ParentId === (parent.id || parent.Id))
      );
      grouped.push(...parentChildren);
    });
    
    // Add orphans (children whose parents didn't match the search but they did)
    const groupedIds = new Set(grouped.map(c => c.id || c.Id));
    const orphans = children.filter(c => !groupedIds.has(c.id || c.Id));
    grouped.push(...orphans);
    
    return grouped;
  };

  const groupedCategories = getGroupedCategories();



  const API_URL = `${import.meta.env.VITE_API_BASE_URL}/api/v1.0/category`;

  useEffect(() => {
    fetchCategories();
  }, [categoryType]);

  async function fetchCategories() {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}?type=${categoryType}`);
      if (!response.ok) throw new Error('Failed to fetch categories');
      const data = await response.json();
      setCategories(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }



  const handleAddParent = async () => {
    if (!parentName.trim()) {
      alert('Please enter a parent category name');
      return;
    }

    try {
      let response;
      if (isEditing && !selectedParentId) {
        // Update existing parent
        response = await fetch(`${API_URL}/${editingId}`, {
          method: 'PUT',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({ name: parentName, parentId: null, categoryType: categoryType })
        });
      } else {
        // Add new parent
        response = await fetch(`${API_URL}/add`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({ name: parentName, parentId: null, categoryType: categoryType })
        });
      }

      if (!response.ok) throw new Error('Failed to save parent category');
      
      setParentName('');
      setIsEditing(false);
      setEditingId(null);
      fetchCategories();
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  const handleAddChild = async () => {
    if (!childName.trim()) {
      alert('Please enter a child category name');
      return;
    }
    if (!selectedParentId) {
      alert('Please select a parent category');
      return;
    }

    try {
      let response;
      if (isEditing && selectedParentId) {
        // Update existing child
        response = await fetch(`${API_URL}/${editingId}`, {
          method: 'PUT',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({ name: childName, parentId: parseInt(selectedParentId), categoryType: categoryType })
        });
      } else {
        // Add new child
        response = await fetch(`${API_URL}/add`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({ name: childName, parentId: parseInt(selectedParentId), categoryType: categoryType })
        });
      }

      if (!response.ok) throw new Error('Failed to save child category');
      
      setChildName('');
      setSelectedParentId('');
      setIsEditing(false);
      setEditingId(null);
      fetchCategories();
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };


  const handleDelete = async (id) => {
    if (window.confirm('Are you sure? This will delete this category and all its sub-categories.')) {
      try {
        const response = await fetch(`${API_URL}/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (response.ok) {
          fetchCategories(); // Refresh the list from backend
        } else {
          throw new Error('Failed to delete category');
        }
      } catch (err) {
        alert(err.message);
      }
    }
  };


  const handleEdit = (cat) => {
    setIsEditing(true);
    setEditingId(cat.id || cat.Id);
    const pId = cat.parentId || cat.ParentId;
    if (pId) {
      setChildName(cat.name || cat.Name);
      setSelectedParentId(pId);
      setParentName('');
    } else {
      setParentName(cat.name || cat.Name);
      setChildName('');
      setSelectedParentId('');
    }
  };

  const resetForm = () => {
    setIsEditing(false);
    setEditingId(null);
    setParentName('');
    setChildName('');
    setSelectedParentId('');
  };

  function getParentName(parentId) {
    if (!parentId) return 'None (Root)';
    const parent = categories.find(c => (c.id === parentId || c.Id === parentId));
    return parent ? (parent.name || parent.Name) : 'Unknown';
  }

  if (loading) return <div className="admin-loading">Loading Categories...</div>;

  return (
    <div className="admin-management-container">
      <div className="management-header">
        <div>
          <h2>{categoryType} Category Structure</h2>
          <p>Organize your {categoryType.toLowerCase()}s with hierarchical categories</p>
        </div>
        
        {/* Search Bar */}
        <div className="search-box">
          <input 
            type="text" 
            placeholder="Search category..." 
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1); // Reset to first page on search
            }}
            className="modern-input search-input"
          />
        </div>
      </div>

      <div className="management-grid">
        {/* Form Section */}
        <div className="management-form-card">
          <div className="form-section-container">
            {/* Parent Category Section */}
            <div className="category-form-section">
              <div className="form-group">
                <input 
                  type="text" 
                  value={parentName} 
                  onChange={(e) => setParentName(e.target.value)}
                  placeholder={`add parent ${categoryType.toLowerCase()} category`}
                  className="modern-input"
                />
              </div>
              <button className="submit-btn" onClick={handleAddParent}>
                {isEditing && !selectedParentId ? `update parent ${categoryType.toLowerCase()} category` : `add parent ${categoryType.toLowerCase()} category`}
              </button>
            </div>

            <div className="form-divider"></div>

            {/* Child Category Section */}
            <div className="category-form-section">
              <div className="form-group">
                <input 
                  type="text" 
                  value={childName} 
                  onChange={(e) => setChildName(e.target.value)}
                  placeholder={`add child ${categoryType.toLowerCase()} category`}
                  className="modern-input"
                />
              </div>
              <div className="form-group">
                <select 
                  value={selectedParentId} 
                  onChange={(e) => setSelectedParentId(e.target.value)}
                  className="modern-select"
                >
                  <option value="">select parent category</option>
                  {Array.isArray(categories) && categories
                    .filter(c => !(c.parentId || c.ParentId)) // Only root categories can be parents
                    .map(c => (
                      <option key={c.id || c.Id} value={c.id || c.Id}>{c.name || c.Name}</option>
                    ))
                  }
                </select>
              </div>
              <button className="submit-btn child-btn" onClick={handleAddChild}>
                {isEditing && selectedParentId ? `update child ${categoryType.toLowerCase()} category` : `add child ${categoryType.toLowerCase()} category`}
              </button>
            </div>

            {isEditing && (
              <button className="cancel-btn full-width" onClick={resetForm}>Cancel Editing</button>
            )}
          </div>
        </div>

        {/* List Section */}
        <div className="management-list-card">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Parent</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {groupedCategories.length > 0 ? (
                groupedCategories.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map(cat => {
                  const isSub = !!(cat.parentId || cat.ParentId);
                  return (
                    <tr key={cat.id || cat.Id} className={isSub ? 'sub-category-row' : 'parent-category-row'}>
                      <td>
                        <div className="category-name-cell" title={cat.name || cat.Name}>
                          {isSub && (
                            <div className="sub-depth-indicator">
                              <CornerDownRight size={14} className="sub-icon" />
                            </div>
                          )}
                          <div className="category-info">
                            <span className="category-text">{cat.name || cat.Name}</span>
                            {isSub && <span className="parent-tag-mobile">{getParentName(cat.parentId || cat.ParentId)}</span>}
                          </div>
                        </div>
                      </td>
                      <td className="parent-col">
                        {!isSub ? (
                          <span className="root-badge">Root Category</span>
                        ) : (
                          <span className="parent-name-link">{getParentName(cat.parentId || cat.ParentId)}</span>
                        )}
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button className="edit-btn" onClick={() => handleEdit(cat)} title="Edit"><Edit2 size={16} /></button>
                          <button className="delete-btn" onClick={() => handleDelete(cat.id || cat.Id)} title="Delete"><Trash2 size={16} /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="3" className="no-results">
                    {searchQuery ? `No category found for "${searchQuery}"` : "No categories available"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Pagination Controls */}
          {groupedCategories.length > itemsPerPage && (
            <div className="pagination-container">
              <button 
                className="page-btn" 
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                Prev
              </button>
              
              {Array.from({ length: Math.ceil(groupedCategories.length / itemsPerPage) }, (_, i) => i + 1).map(page => (
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
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(groupedCategories.length / itemsPerPage)))}
                disabled={currentPage === Math.ceil(groupedCategories.length / itemsPerPage)}
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </div>

  );
};


export default AdminCategories;
