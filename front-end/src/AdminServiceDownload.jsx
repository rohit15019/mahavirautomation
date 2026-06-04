import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Save, ArrowLeft, Trash2, Upload } from 'lucide-react';
import './AdminManagement.css';

const AdminServiceDownload = () => {
  const { serviceId } = useParams();
  const navigate = useNavigate();
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form states
  const [file, setFile] = useState(null);
  const [currentFiles, setCurrentFiles] = useState([]);

  const API_URL = `${import.meta.env.VITE_API_BASE_URL}/api/v1.0/Services`;

  const fetchService = async () => {
    try {
      setLoading(true);
      const response = await fetch(API_URL);
      if (response.ok) {
        const services = await response.json();
        const found = services.find(s => String(s.id || s.Id) === String(serviceId));
        if (found) {
          setService(found);
          if (found.filesMetadata && found.filesMetadata.length > 0) {
            setCurrentFiles(found.filesMetadata);
          } else {
            setCurrentFiles([]);
          }
        }
      }
    } catch (err) {
      console.error("Error fetching service details", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchService();
  }, [serviceId]);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      alert("Please select a file to upload.");
      return;
    }

    try {
      setSaving(true);
      const data = new FormData();
      data.append('file', file);

      const response = await fetch(`${API_URL}/${serviceId}/upload-file`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: data
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.message || 'Failed to upload file');
      }

      alert('File uploaded successfully!');
      setFile(null);
      document.getElementById('file-upload').value = '';
      await fetchService();
    } catch (err) {
      alert(`Error uploading file: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (filePath) => {
    if (window.confirm('Are you sure you want to delete this file?')) {
      try {
        setSaving(true);
        const response = await fetch(`${API_URL}/${serviceId}/delete-file?filePath=${encodeURIComponent(filePath)}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to delete file');
        }

        alert('File deleted successfully!');
        await fetchService();
      } catch (err) {
        alert(`Error deleting file: ${err.message}`);
      } finally {
        setSaving(false);
      }
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
          <h1>Manage Download: {service.title}</h1>
          <p>Upload a PDF or ZIP file that users can download from the service's details page.</p>
        </div>
      </div>

      <div style={{ display: 'grid', gap: '30px', gridTemplateColumns: '1fr 1fr' }}>
        
        {/* Upload Form */}
        <div className="management-card" style={{ gridColumn: '1 / 2' }}>
          <h2><Upload size={20} /> Upload New File</h2>
          <form onSubmit={handleUpload} className="management-form">
            <div className="form-group">
              <label>Select File (.pdf or .zip)</label>
              <input 
                type="file" 
                id="file-upload"
                onChange={handleFileChange} 
                accept=".pdf,.zip"
                required
              />
            </div>
            <div className="form-actions">
              <button type="submit" className="btn-primary" disabled={saving}>
                <Save size={18} /> {saving ? 'Uploading...' : 'Upload File'}
              </button>
            </div>
          </form>
        </div>

        {/* Current File Section */}
        <div className="management-card" style={{ gridColumn: '2 / 3' }}>
          <h2>Current Attached Files</h2>
          {currentFiles && currentFiles.length > 0 ? (
            currentFiles.map((file, idx) => (
              <div key={idx} style={{ padding: '20px', border: '1px solid var(--admin-border)', borderRadius: '8px', background: 'rgba(255, 255, 255, 0.03)', marginTop: '20px' }}>
                <p className="break-word" style={{ color: 'var(--admin-text-main)', marginBottom: '10px' }}><strong>File Name:</strong> {file.fileName}</p>
                <p style={{ color: 'var(--admin-text-main)' }}><strong>File Size:</strong> {file.fileSize}</p>
                
                <div style={{ marginTop: '20px' }}>
                  <button onClick={() => handleDelete(file.filePath)} className="btn-secondary" style={{ color: '#ef4444', borderColor: '#ef4444' }} disabled={saving}>
                    <Trash2 size={16} /> {saving ? 'Deleting...' : 'Delete File'}
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--admin-text-muted)', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '8px', marginTop: '20px' }}>
              No files currently attached to this service.
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default AdminServiceDownload;
