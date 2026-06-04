import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getServices } from './servicesData';
import { 
  Workflow, Database, BarChart2, Headphones, Code, Settings, 
  Shield, Zap, Server, Cloud, Smartphone, Cpu, Activity, Globe,
  Calendar, CheckCircle, Download 
} from 'lucide-react';
import './ServiceDetails.css';

const IconsMap = {
  Workflow, Database, BarChart2, Headphones, Code, Settings, 
  Shield, Zap, Server, Cloud, Smartphone, Cpu, Activity, Globe,
  HeadphonesIcon: Headphones
};

const ServiceDetails = () => {
  const { serviceId } = useParams();
  const navigate = useNavigate();
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchService = async () => {
      const allServices = await getServices();
      const foundService = allServices.find(s => String(s.id || s.Id) === String(serviceId));
      setService(foundService);
      setLoading(false);
    };
    fetchService();
  }, [serviceId]);

  if (loading) {
    return (
      <div className="service-details-loading">
        <div className="loader"></div>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="service-details-not-found">
        <h2>Service Not Found</h2>
        <button onClick={() => navigate('/services')} className="back-btn">Back to Services</button>
      </div>
    );
  }

  const Icon = IconsMap[service.iconName] || IconsMap.Settings;

  // Use dynamic detailed features or fallback to generated ones
  const detailedFeatures = (service.detailedFeatures && service.detailedFeatures.length > 0)
    ? service.detailedFeatures.map((feat) => ({
        title: feat.title || 'Feature',
        description: feat.description || '',
        icon: <CheckCircle size={24} color="#00b4d8" />
      }))
    : (service.features || []).map((feature) => ({
        title: feature,
        description: `Our expert implementation of ${(feature || '').toLowerCase()} ensures your business stays ahead of the curve. We combine technical excellence with industry best practices to deliver solutions that are not only functional but also scalable and secure. Experience the difference of professional ${(service.title || 'Service').toLowerCase()} tailored to your specific goals.`,
        icon: <CheckCircle size={24} color="#00b4d8" />
      }));

  const files = service.filesMetadata || [];

  const handleDownload = async (filePath, fileName) => {
    const user = localStorage.getItem('user');
    if (!user) {
      navigate('/register');
      return;
    }
    
    if (service && (service.id || service.Id)) {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/v1.0/Services/${service.id || service.Id}/download-file?filePath=${encodeURIComponent(filePath)}`);
        if (!response.ok) throw new Error('Download failed');
        
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = fileName || 'service-download';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } catch (error) {
        console.error('Error downloading file:', error);
        alert('Failed to download file. Please try again.');
      }
    }
  };

  return (
    <div className="service-details-page">
      <div className="service-details-content">
        {/* Left Column: Detailed Features */}
        <div className="service-details-left">
          {detailedFeatures.map((feat, idx) => (
            <div key={idx} className="detailed-feature-block">
              <div className="detailed-feature-header">
                <span className="feature-icon">{feat.icon}</span>
                <h3>{feat.title}</h3>
              </div>
              <p>{feat.description}</p>
              
              {/* Mock sub-images removed per user request */}

            </div>
          ))}
        </div>

        {/* Right Column: Sticky Service Hero */}
        <div className="service-details-right">
          <div className="sticky-container">
            <h1 className="hero-title">{service.title}: Expert Implementation</h1>
            
            <p className="hero-subtitle" style={{ color: '#555', marginBottom: '30px', fontSize: '1.1rem', fontStyle: 'italic' }}>
              Explore the advanced capabilities and strategic advantages of our {service.title} implementation.
            </p>

            <div className="hero-icon-wrapper">
              <Icon size={160} color="#ffffff" strokeWidth={1.5} />
            </div>

            <div className="action-section">
              {files.length > 0 ? (
                files.map((file, idx) => (
                  <div key={idx} style={{ marginBottom: '20px' }}>
                    <button 
                      className="book-btn" 
                      onClick={() => handleDownload(file.filePath, file.fileName)}
                      style={{ background: 'linear-gradient(135deg, #00b4d8 0%, #0077b6 100%)', width: '100%', marginBottom: '10px' }}
                    >
                      <Download size={20} />
                      DOWNLOAD {file.fileName.toUpperCase()} ({file.fileSize})
                    </button>
                    <div className="service-meta">
                      <p><strong>Resource:</strong> {file.fileName}</p>
                      <p><strong>Updated:</strong> {file.lastUpdated}</p>
                    </div>
                  </div>
                ))
              ) : (
                <>
                  <button className="book-btn" onClick={() => navigate('/contact')}>
                    <Calendar size={20} />
                    REQUEST SERVICE DETAILS
                  </button>
                  <div className="service-meta" style={{ marginTop: '20px' }}>
                    <p><strong>Resource:</strong> Consultation available</p>
                    <p><strong>Availability:</strong> 24/7 Support Included</p>
                    <p><strong>Support:</strong> Expert guidance included</p>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceDetails;
