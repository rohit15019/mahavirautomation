import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Save, ArrowLeft, Plus, Trash2 } from 'lucide-react';
import './AdminManagement.css';

const AdminProductDetails = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [detailedFeatures, setDetailedFeatures] = useState([]);

  const API_URL = `${import.meta.env.VITE_API_BASE_URL}/api/v1.0/Product`;

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(API_URL);
        if (response.ok) {
          const products = await response.json();
          const found = products.find(p => String(p.id || p.Id) === String(productId));
          if (found) {
            setProduct(found);
            
            // Initialize detailed features: if empty, map from existing string features to give a starting point
            if (found.detailedFeatures && found.detailedFeatures.length > 0) {
              setDetailedFeatures(found.detailedFeatures);
            } else if (found.features && found.features.length > 0) {
              setDetailedFeatures(found.features.map(f => ({ title: f, description: '' })));
            }
          }
        }
      } catch (err) {
        console.error("Error fetching product details", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [productId]);

  const handleDetailedFeatureChange = (index, field, value) => {
    const newFeatures = [...detailedFeatures];
    newFeatures[index][field] = value;
    setDetailedFeatures(newFeatures);
  };

  const addDetailedFeature = () => {
    setDetailedFeatures([...detailedFeatures, { title: '', description: '' }]);
  };

  const removeDetailedFeature = (index) => {
    const newFeatures = [...detailedFeatures];
    newFeatures.splice(index, 1);
    setDetailedFeatures(newFeatures);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      const data = new FormData();
      data.append('title', product.title);
      data.append('description', product.description);
      data.append('price', product.price);
      data.append('categoryId', product.categoryId);
      data.append('imageKey', product.imageKey || '');
      
      // Append features as JSON string
      if (product.features) {
        data.append('features', JSON.stringify(product.features));
      }

      // Append detailed features as JSON string
      data.append('detailedFeatures', JSON.stringify(detailedFeatures));

      // Append file metadata as JSON string if it exists
      if (product.fileMetadata) {
        data.append('fileMetadata', JSON.stringify(product.fileMetadata));
      }

      // Add ID to the form data
      data.append('id', productId);

      const response = await fetch(`${API_URL}/${productId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: data
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.message || 'Failed to update product details');
      }

      alert('Product details updated successfully!');
      navigate('/admin/products');
    } catch (err) {
      alert(`Error saving details: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="admin-loading">Loading Product Details...</div>;
  if (!product) return <div className="admin-loading">Product not found.</div>;

  return (
    <div className="admin-management-container" style={{ paddingBottom: '100px' }}>
      <div className="management-header">
        <div>
          <button onClick={() => navigate('/admin/products')} className="btn-secondary" style={{ marginBottom: '1rem', padding: '6px 12px' }}>
            <ArrowLeft size={16} /> Back to Products
          </button>
          <h1>Manage Details: {product.title}</h1>
          <p>Update the rich information displayed on the product's dedicated page.</p>
        </div>
        <button onClick={handleSave} className="btn-primary" disabled={saving}>
          <Save size={18} /> {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      <div style={{ display: 'grid', gap: '30px', gridTemplateColumns: '1fr 1fr' }}>
        
        {/* Left Column: Detailed Features */}
        <div className="management-card" style={{ gridColumn: '1 / -1' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2>Detailed Features</h2>
            <button type="button" className="btn-primary" onClick={addDetailedFeature} style={{ padding: '6px 12px' }}>
              <Plus size={16} /> Add Feature Block
            </button>
          </div>
          
          {detailedFeatures.length === 0 ? (
            <p>No detailed features added yet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {detailedFeatures.map((feat, idx) => (
                <div key={idx} className="management-feature-item">
                  <button 
                    onClick={() => removeDetailedFeature(idx)}
                    style={{ position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', opacity: 0.7 }}
                    title="Remove feature"
                  >
                    <Trash2 size={20} />
                  </button>
                  
                  <div className="management-form">
                    <div className="form-group" style={{ maxWidth: '90%' }}>
                      <label>Feature Title</label>
                      <input 
                        type="text" 
                        value={feat.title} 
                        onChange={(e) => handleDetailedFeatureChange(idx, 'title', e.target.value)} 
                        placeholder="e.g. Bi-directional sync"
                      />
                    </div>
                    <div className="form-group">
                      <label>Feature Description</label>
                      <textarea 
                        value={feat.description} 
                        onChange={(e) => handleDetailedFeatureChange(idx, 'description', e.target.value)} 
                        rows="4"
                        placeholder="Detailed explanation of the feature..."
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>


      </div>
    </div>
  );
};

export default AdminProductDetails;
