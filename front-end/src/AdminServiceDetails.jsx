import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Save, ArrowLeft, Plus, Trash2 } from 'lucide-react';
import './AdminManagement.css';

const AdminServiceDetails = () => {
  const { serviceId } = useParams();
  const navigate = useNavigate();
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [detailedFeatures, setDetailedFeatures] = useState([]);

  const API_URL = `${import.meta.env.VITE_API_BASE_URL}/api/v1.0/Services`;

  useEffect(() => {
    const fetchService = async () => {
      try {
        const response = await fetch(API_URL);
        if (response.ok) {
          const services = await response.json();
          const found = services.find(s => String(s.id || s.Id) === String(serviceId));
          if (found) {
            setService(found);
            
            // Initialize detailed features: if empty, map from existing string features to give a starting point
            if (found.detailedFeatures && found.detailedFeatures.length > 0) {
              setDetailedFeatures(found.detailedFeatures);
            } else if (found.features && found.features.length > 0) {
              setDetailedFeatures(found.features.map(f => ({ title: f, description: '' })));
            }
          }
        }
      } catch (err) {
        console.error("Error fetching service details", err);
      } finally {
        setLoading(false);
      }
    };
    fetchService();
  }, [serviceId]);

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
      
      const payload = {
        ...service, // keep existing fields
        detailedFeatures
      };

      const response = await fetch(`${API_URL}/${serviceId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error('Failed to update service details');
      }

      alert('Service details updated successfully!');
      navigate('/admin/services');
    } catch (err) {
      alert(`Error saving details: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="admin-loading">Loading Service Details...</div>;
  if (!service) return <div className="admin-loading">Service not found.</div>;

  return (
    <div className="admin-management-container" style={{ paddingBottom: '100px' }}>
      <div className="management-header">
        <div>
          <button onClick={() => navigate('/admin/services')} className="btn-secondary" style={{ marginBottom: '1rem', padding: '6px 12px' }}>
            <ArrowLeft size={16} /> Back to Services
          </button>
          <h1>Manage Details: {service.title}</h1>
          <p>Update the rich information displayed on the service's dedicated page.</p>
        </div>
        <button onClick={handleSave} className="btn-primary" disabled={saving}>
          <Save size={18} /> {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      <div style={{ display: 'grid', gap: '30px', gridTemplateColumns: '1fr' }}>
        
        {/* Detailed Features */}
        <div className="management-card">
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
                        placeholder="e.g. 24/7 Monitoring"
                      />
                    </div>
                    <div className="form-group">
                      <label>Feature Description</label>
                      <textarea 
                        value={feat.description} 
                        onChange={(e) => handleDetailedFeatureChange(idx, 'description', e.target.value)} 
                        rows="4"
                        placeholder="Detailed explanation of what this service aspect provides..."
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

export default AdminServiceDetails;
