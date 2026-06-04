import React, { useState } from 'react';
import './Contact.css';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    inquiryType: '',
    message: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState({ type: '', message: '' });

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'mobile') {
      // Only allow numbers and limit to 10 digits
      const cleanedValue = value.replace(/\D/g, '').slice(0, 10);
      setFormData(prev => ({ ...prev, [name]: cleanedValue }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus({ type: '', message: '' });
    
    // Validate mobile number (exactly 10 digits)
    if (!/^\d{10}$/.test(formData.mobile)) {
        setSubmitStatus({ type: 'error', message: 'Mobile number must be exactly 10 digits.' });
        setIsSubmitting(false);
        return;
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/v1.0/Contact/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setSubmitStatus({ type: 'success', message: 'Message sent successfully! We will get back to you soon.' });
        setFormData({
          name: '',
          email: '',
          mobile: '',
          inquiryType: '',
          message: ''
        });
      } else {
        setSubmitStatus({ type: 'error', message: data.message || 'Failed to send message.' });
      }
    } catch (error) {
      setSubmitStatus({ type: 'error', message: 'An error occurred. Please try again later.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="contact-page">
      {/* Header */}
      <div className="contact-header">
        <h1>Get in touch</h1>
        <p>
          Have questions about our products or services? We're here to help. Send us a message and we'll respond within 24 hours.
        </p>
      </div>

      <div className="contact-container">
        {/* Left Side: Contact Info */}
        <div className="contact-info-section">
          <h2>Contact information</h2>
          
          <div className="info-cards">
            <div className="info-item">
              <div className="info-icon">✉</div>
              <div className="info-content">
                <span className="info-label">Email</span>
                <span className="info-value">mahavirautomation111@gmail.com</span>
              </div>
            </div>
            
            <div className="info-item">
              <div className="info-icon">📞</div>
              <div className="info-content">
                <span className="info-label">Phone</span>
                <span className="info-value">+91 97237 73000</span>
              </div>
            </div>
            
            <div className="info-item">
              <div className="info-icon">📍</div>
              <div className="info-content">
                <span className="info-label">Office</span>
                <span className="info-value">"Mahavir Automation", Lakhdhirpur Road, Opp :- The Grand Vaibhav Hotel, Morbi-2 363642 Gujrat</span>
              </div>
            </div>
            
            <div className="info-item">
              <div className="info-icon">🕒</div>
              <div className="info-content">
                <span className="info-label">Business hours</span>
                <span className="info-value">Everyday 9:00 AM To 8:00 PM</span>
              </div>
            </div>
          </div>

          <div className="enterprise-card">
            <h3>Enterprise inquiries</h3>
            <p>Looking for a custom solution for your organization? Our enterprise team can help.</p>
            <a href="mailto:mahavirautomation111@gmail.com">mahavirautomation111@gmail.com</a>
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="contact-form-section">
          <div className="form-box">
            <h2>Send us a message</h2>
            <form className="contact-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Name</label>
                <input 
                  type="text" 
                  name="name"
                  placeholder="Your name" 
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Mobile Number</label>
                <input 
                  type="tel" 
                  name="mobile"
                  placeholder="Enter 10-digit mobile number" 
                  value={formData.mobile}
                  onChange={handleChange}
                  maxLength="10"
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Email</label>
                <input 
                  type="email" 
                  name="email"
                  placeholder="your.email@example.com" 
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Inquiry type</label>
                <select 
                  name="inquiryType"
                  value={formData.inquiryType}
                  onChange={handleChange}
                  required
                >
                  <option value="" disabled>Select inquiry type</option>
                  <option value="sales">Sales</option>
                  <option value="support">Support</option>
                  <option value="billing">Billing</option>
                  <option value="other">Other</option>
                </select>
              </div>
              
              <div className="form-group message-group">
                <label>Message</label>
                <textarea 
                  name="message"
                  placeholder="Tell us about your needs..." 
                  rows="5"
                  value={formData.message}
                  onChange={handleChange}
                  required
                ></textarea>
              </div>
              
              {submitStatus.message && (
                <div className={`form-status ${submitStatus.type}`}>
                  {submitStatus.message}
                </div>
              )}
              
              <button 
                type="submit" 
                className="btn-submit" 
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Sending...' : 'Send message'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
