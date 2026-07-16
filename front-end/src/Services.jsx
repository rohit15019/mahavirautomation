import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Workflow, Database, BarChart2, Headphones, Code, Settings, 
  Shield, Zap, Server, Cloud, Smartphone, Cpu, Activity, Globe 
} from 'lucide-react';
import { getServices } from './servicesData';
import headerImg from './assets/service_header.png';
import './Services.css';

const IconsMap = {
  Workflow, Database, BarChart2, Headphones, Code, Settings, 
  Shield, Zap, Server, Cloud, Smartphone, Cpu, Activity, Globe,
  HeadphonesIcon: Headphones // Map HeadphonesIcon to Headphones just in case
};

const IconComponent = ({ name }) => {
  const Icon = IconsMap[name] || IconsMap.Settings;
  return <Icon size={28} color="#ffffff" strokeWidth={2.5} />;
};


const Services = () => {
  const [servicesData, setServicesData] = useState([]);
  const [categories, setCategories] = useState([]);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const loadData = async () => {
      // Fetch services
      const services = await getServices();
      setServicesData(services);
      
      // Fetch categories
      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/v1.0/category?type=Service`);
        if (response.ok) {
          const catData = await response.json();
          setCategories(catData);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };
    loadData();
  }, []);

  const queryParams = new URLSearchParams(location.search);
  const categoryId = queryParams.get('category');
  
  const filteredServices = categoryId 
    ? servicesData.filter(s => String(s.categoryId) === String(categoryId))
    : servicesData;
    
  const cat = categoryId ? categories.find(c => String(c.id || c.Id) === String(categoryId)) : null;
  const currentCategoryName = cat ? (cat.name || cat.Name) : null;

  return (
    <div className="services-page-container">
      {/* Header Section */}
      <div className="services-hero">
        <div className="services-hero-content">
          <div className="services-badge">✨ Expert Engineering Services</div>
          <h1 className="services-title">
            Industrial <span className="highlight-text">Automation Services</span>
          </h1>
          <p className="services-subtitle primary-desc">
            Mahavir Automation provides complete industrial automation services to improve machine performance, production speed, and system reliability. We specialize in PLC programming, HMI development, SCADA integration, servo and VFD tuning, electrical panel design, and machine troubleshooting.
          </p>
          <p className="services-subtitle secondary-desc">
            Our expert solutions are designed according to each machine and process requirement, ensuring smooth operation, accurate control, and minimum downtime. From small machine automation to full plant-level systems, we deliver reliable and efficient service support.
          </p>
          <p className="services-subtitle secondary-desc">
            We also provide on-site support, system upgrades, fault diagnosis, and optimization of existing automation systems to improve productivity and reduce maintenance cost.
          </p>
          <div className="services-hero-actions">
            <button className="btn btn-primary" onClick={() => window.scrollTo({ top: 800, behavior: 'smooth' })}>View Services</button>
            <button className="btn btn-outline" onClick={() => navigate('/contact')}>Get a Quote</button>
          </div>
        </div>
        <div className="services-hero-image">
          <div className="image-glow"></div>
          <img src={headerImg} alt="Industrial Automation Services" />
        </div>
      </div>

      {/* Services Grid */}
      <div className="services-grid-container">
        <div className="services-grid">
          {filteredServices.map((service) => (
            <div key={service.id} className="service-card">
              <div className="service-icon">
                <IconComponent name={service.iconName} />
              </div>
              <h3 className="service-card-title">{service.title}</h3>
              <p className="service-card-desc">{service.description}</p>
              <ul className="service-features-list">
                {service.features.slice(0, 1).map((feature, index) => (
                  <li key={index}>
                    <span className="feature-diamond">✦</span>
                    <span className="feature-text">{feature}</span>
                  </li>
                ))}
              </ul>
              <button 
                className="learn-more-btn"
                onClick={() => navigate(`/service/${service.id || service.Id}`)}
              >
                Get started <span>→</span>
              </button>
            </div>
          ))}
        </div>

        {filteredServices.length === 0 && (
          <div className="no-services-found">
            <p>No services found in this category yet.</p>
          </div>
        )}
      </div>

      {/* Consultation Section */}
      <div className="consultation-section">
        <h2>Not sure which service you need?</h2>
        <p>Schedule a free consultation with our automation experts. We'll analyze your needs and recommend the best approach.</p>
        <button className="book-consultation-btn" onClick={() => navigate('/contact')}>Book a consultation</button>
      </div>


    </div>
  );
};

export default Services;
