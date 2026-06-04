import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ShieldCheck, 
  Settings, 
  TrendingUp, 
  Users, 
  Zap, 
  Wrench, 
  ShoppingCart, 
  Eye, 
  Target,
  CheckCircle2,
  Clock,
  MapPin,
  Handshake,
  Heart,
  Briefcase,
  PhoneCall
} from 'lucide-react';
import './AboutUs.css';

const AboutUs = () => {
  const navigate = useNavigate();

  return (
    <div className="about-us-container">
      {/* Hero Section - Who We Are */}
      <section className="about-hero">
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <h1 className="hero-title">Mahavir Automation</h1>
          <p className="hero-subtitle">Quality Products, Professional Service, Trusted Partner</p>
          <div className="intro-text">
            <p>
              Mahavir Automation is a well-established and reputed name in the field of electronics and electrical parts trading and service. 
              We are dedicated to providing high-quality electrical components, industrial automation parts, and reliable service solutions to our customers. 
              Operating with a strong commitment to quality, integrity, and customer satisfaction, we understand the growing demand for automation 
              and efficient electrical systems in today's fast-paced environments.
            </p>
          </div>
        </div>
      </section>

      {/* Mission & Vision Section */}
      <section className="mission-vision-section">
        <div className="mission-card glass">
          <div className="icon-wrapper">
            <Target size={40} color="#07E7F7" />
          </div>
          <h2>Our Mission</h2>
          <p>
            To provide reliable, high-quality electronic and electrical solutions at competitive prices, backed by expert service support. 
            We aim to become the first choice for customers who need both products and services under one roof. 
            Ensuring a product works perfectly is our complete responsibility.
          </p>
        </div>
        <div className="vision-card glass">
          <div className="icon-wrapper">
            <Eye size={40} color="#07E7F7" />
          </div>
          <h2>Our Vision</h2>
          <p>
            To be a leading name in the electronics and electrical trading and service sector in India. 
            We strive to expand our reach, build long-term relationships, and constantly upgrade our knowledge 
            as technology evolves, being known as a solutions provider who understands real-world challenges.
          </p>
        </div>
      </section>

      {/* Core Business Section */}
      <section className="core-business">
        <h2 className="section-title">What We Do</h2>
        <div className="business-grid">
          <div className="business-card trading">
            <div className="business-image-container">
              <ShoppingCart size={48} />
            </div>
            <h3>Trading of Electronics & Electrical Parts</h3>
            <p>We deal in a wide range of components sourced from trusted and certified manufacturers:</p>
            <ul className="feature-list">
              <li><CheckCircle2 size={18} /> Switches, sockets, and connectors</li>
              <li><CheckCircle2 size={18} /> Relays, contactors, and circuit breakers</li>
              <li><CheckCircle2 size={18} /> Sensors, PLCs, and industrial automation parts</li>
              <li><CheckCircle2 size={18} /> Power supplies, adapters, and converters</li>
              <li><CheckCircle2 size={18} /> Wires, cables, and harnesses</li>
              <li><CheckCircle2 size={18} /> Fuses, holders, and protection devices</li>
              <li><CheckCircle2 size={18} /> LED drivers, dimmers, and lighting controls</li>
              <li><CheckCircle2 size={18} /> Motors, drives, and control panels</li>
              <li><CheckCircle2 size={18} /> Electrical tools and testing equipment</li>
            </ul>
          </div>
          <div className="business-card service">
            <div className="business-image-container">
              <Wrench size={48} />
            </div>
            <h3>Installation, Repair & Maintenance</h3>
            <p>Our service division offers complete end-to-end technical solutions:</p>
            <ul className="feature-list">
              <li><CheckCircle2 size={18} /> On-site installation support for panels and units</li>
              <li><CheckCircle2 size={18} /> Repair and troubleshooting for all equipment</li>
              <li><CheckCircle2 size={18} /> Preventive and breakdown maintenance</li>
              <li><CheckCircle2 size={18} /> System upgrading and retrofitting services</li>
              <li><CheckCircle2 size={18} /> Technical consultation for component selection</li>
              <li><CheckCircle2 size={18} /> Warranty and post-service support</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="why-choose-us">
        <h2 className="section-title">Why Choose Mahavir Automation?</h2>
        <div className="strengths-grid">
          <div className="strength-item">
            <Briefcase className="strength-icon" />
            <h4>Wide Product Range</h4>
            <p>Thousands of parts under one roof, eliminating the need for multiple vendors.</p>
          </div>
          <div className="strength-item">
            <ShieldCheck className="strength-icon" />
            <h4>Genuine Quality</h4>
            <p>Products sourced from authorized brands or verified standard manufacturers.</p>
          </div>
          <div className="strength-item">
            <Users className="strength-icon" />
            <h4>Expert Service Team</h4>
            <p>Technicians and engineers experienced in handling complex electrical systems.</p>
          </div>
          <div className="strength-item">
            <TrendingUp className="strength-icon" />
            <h4>Competitive Pricing</h4>
            <p>Direct manufacturer relationships allow us to offer value without cutting corners.</p>
          </div>
          <div className="strength-item">
            <Clock className="strength-icon" />
            <h4>Timely Support</h4>
            <p>We respond quickly to minimize your downtime and cost.</p>
          </div>
          <div className="strength-item">
            <Zap className="strength-icon" />
            <h4>One-Stop Solution</h4>
            <p>From a small switch to a full control panel – we do it all.</p>
          </div>
        </div>
      </section>

      {/* How We Work Section */}
      <section className="how-we-work">
        <h2 className="section-title">Our Process</h2>
        <div className="process-timeline">
          <div className="process-step">
            <div className="step-number">1</div>
            <h4>Inquiry</h4>
            <p>Contact us with your requirement or service issue.</p>
          </div>
          <div className="process-step">
            <div className="step-number">2</div>
            <h4>Quotation</h4>
            <p>Receive a clear quote with price and timeline.</p>
          </div>
          <div className="process-step">
            <div className="step-number">3</div>
            <h4>Approval</h4>
            <p>Review and approve the proposed solution.</p>
          </div>
          <div className="process-step">
            <div className="step-number">4</div>
            <h4>Fulfillment</h4>
            <p>Products supplied or service team dispatched.</p>
          </div>
          <div className="process-step">
            <div className="step-number">5</div>
            <h4>Follow-up</h4>
            <p>Post-fulfillment check to ensure perfection.</p>
          </div>
        </div>
      </section>

      {/* Customers Section */}
      <section className="customers-section">
        <h2 className="section-title">Who We Serve</h2>
        <div className="customers-grid">
          <div className="customer-tag">Industrial Manufacturing</div>
          <div className="customer-tag">Automation Integrators</div>
          <div className="customer-tag">Panel Builders</div>
          <div className="customer-tag">Facility Managers</div>
          <div className="customer-tag">Retail Shops</div>
          <div className="customer-tag">Local Electricians</div>
          <div className="customer-tag">Small Business Owners</div>
          <div className="customer-tag">Educational Institutions</div>
          <div className="customer-tag">Homeowners</div>
          <div className="customer-tag">Infrastructure Projects</div>
        </div>
        <p className="customer-note">No order is too small or too big for us. We treat every customer with equal importance and professionalism.</p>
      </section>

      {/* Values Section */}
      <section className="values-section">
        <h2 className="section-title">Our Values</h2>
        <div className="values-grid">
          <div className="value-card">
            <Handshake size={32} color="#07E7F7" />
            <h3>Honesty</h3>
            <p>We recommend what works best for you, not just what makes us money.</p>
          </div>
          <div className="value-card">
            <ShieldCheck size={32} color="#07E7F7" />
            <h3>Quality</h3>
            <p>Never compromising on product or service standards.</p>
          </div>
          <div className="value-card">
            <Zap size={32} color="#07E7F7" />
            <h3>Speed</h3>
            <p>Fast action and response because we respect your time.</p>
          </div>
          <div className="value-card">
            <TrendingUp size={32} color="#07E7F7" />
            <h3>Learning</h3>
            <p>Evolving with technology to provide modern solutions.</p>
          </div>
          <div className="value-card">
            <Heart size={32} color="#07E7F7" />
            <h3>Relationships</h3>
            <p>Preferring repeat customers over one-time gains.</p>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="team-section">
        <h2 className="section-title">Our Team</h2>
        <p className="team-intro">Behind every successful company is a hardworking team of specialists, engineers, and support staff.</p>
        <div className="team-grid">
          <div className="team-member-card">
            <div className="member-icon-bg">
              <Users size={40} />
            </div>
            <h4>Product Specialists</h4>
            <p>Deep knowledge of every component we sell.</p>
          </div>
          <div className="team-member-card">
            <div className="member-icon-bg">
              <Settings size={40} />
            </div>
            <h4>Service Engineers</h4>
            <p>Experienced in fault diagnosis and repair using modern tools.</p>
          </div>
          <div className="team-member-card">
            <div className="member-icon-bg">
              <Briefcase size={40} />
            </div>
            <h4>Support Staff</h4>
            <p>Handling orders, inquiries, and logistics efficiently.</p>
          </div>
          <div className="team-member-card">
            <div className="member-icon-bg">
              <ShieldCheck size={40} />
            </div>
            <h4>Management</h4>
            <p>Believing in transparency, ethics, and continuous improvement.</p>
          </div>
        </div>
      </section>

      {/* Reach & Safety Section */}
      <section className="reach-safety">
        <div className="safety-info glass">
          <div className="info-header">
            <ShieldCheck size={32} color="#07E7F7" />
            <h3>Quality & Safety Commitment</h3>
          </div>
          <p>We follow strict quality protocols: ISO/BIS certified sources, functional checks on all lots, and adherence to electrical safety guidelines using calibrated tools.</p>
        </div>
        <div className="reach-info glass">
          <div className="info-header">
            <MapPin size={32} color="#07E7F7" />
            <h3>Our Location & Reach</h3>
          </div>
          <p>Operating from our base, we serve customers regionally and across India via modern logistics. We handle bulk orders and customized service contracts.</p>
        </div>
      </section>

      {/* CTA Section */}
      <section className="about-cta">
        <div className="cta-content">
          <h2>Ready to Power Your Systems?</h2>
          <p>Experience the Mahavir Automation difference today. Whether you need a single part or a complete solution, we're here to help.</p>
          <button className="cta-btn" onClick={() => navigate('/contact')}>
            <PhoneCall size={20} /> Get In Touch
          </button>
        </div>
      </section>
    </div>
  );
};

export default AboutUs;
