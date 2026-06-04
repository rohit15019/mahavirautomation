import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Download.css';

const Download = () => {
  const navigate = useNavigate();
  const [downloads, setDownloads] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDownloads = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/v1.0/Download`);
        if (response.ok) {
          const data = await response.json();
          setDownloads(data);
        }
      } catch (error) {
        console.error('Error fetching downloads:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDownloads();
  }, []);

  const handleDownload = async (id, fileName) => {
    const user = localStorage.getItem('user');
    if (!user) {
      navigate('/register');
      return;
    }
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/v1.0/Download/file/${id}`);
      if (!response.ok) throw new Error('Download failed');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = fileName || 'download';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading file:', error);
      alert('Failed to download file. Please try again.');
    }
  };

  return (
    <div className="download-page">
      <div className="download-header-section">
        <h1>Downloads and resources</h1>
        <p>Access software, documentation, templates, and training materials to maximize your Mahavir Automation experience.</p>
      </div>

      <div className="download-content">
        <div className="download-section">
          <div className="section-title">
            <span className="section-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
                <polyline points="10 9 9 9 8 9"></polyline>
              </svg>
            </span>
            <h2>Available Downloads</h2>
          </div>
          
          {loading ? (
            <p style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>Loading downloads...</p>
          ) : downloads.length > 0 ? (
            <div className="cards-grid">
              {downloads.map(dl => (
                <div key={dl.id} className="download-card">
                  <div className="card-header">
                    <h3>{dl.name || 'Unnamed'}</h3>
                    <span className="file-tag">{(dl.fileType || '').toUpperCase()}</span>
                  </div>
                  <p className="card-desc">{dl.description || 'No description'}</p>
                  <div className="card-footer">
                    <span className="file-size">{((dl.fileSize || 0) / 1024 / 1024).toFixed(2)} MB</span>
                    <button className="download-btn" onClick={() => handleDownload(dl.id, `${dl.name}.${dl.fileType}`)}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                        <polyline points="7 10 12 15 17 10"></polyline>
                        <line x1="12" y1="15" x2="12" y2="3"></line>
                      </svg>
                      Download
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ textAlign: 'center', padding: '40px', color: '#64748b', fontStyle: 'italic', background: '#f8fafc', borderRadius: '12px' }}>
              No downloads available at the moment.
            </p>
          )}
        </div>
      </div>

      <div className="section-divider full-width"></div>

      <div className="download-help-section">
        <h2>Need help with installation?</h2>
        <p>Our support team is available 24/7 to help you get up and running.</p>
        <Link to="/contact" className="contact-support-btn">Contact support</Link>
      </div>
    </div>
  );
};

export default Download;
