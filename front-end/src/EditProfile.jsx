import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import * as Icons from 'lucide-react';
import './Login.css'; // Reusing auth styles for consistency

const EditProfile = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    mobileNumber: ''
  });
  const [successMessage, setSuccessMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setFormData({
        firstName: user.firstName || user.FirstName || '',
        lastName: user.lastName || user.LastName || '',
        email: user.email || user.Email || '',
        mobileNumber: user.mobileNumber || user.MobileNumber || user.mobile || ''
      });
    } else {
      navigate('/login');
    }
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setError('');
    if (name === 'mobileNumber') {
      const cleanedValue = value.replace(/\D/g, '').slice(0, 10);
      setFormData({ ...formData, [name]: cleanedValue });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    if (formData.mobileNumber && !/^\d{10}$/.test(formData.mobileNumber)) {
      setError('Mobile number must be exactly 10 digits.');
      return;
    }
    
    const updatedUser = {
      ...JSON.parse(localStorage.getItem('user')),
      firstName: formData.firstName,
      lastName: formData.lastName,
      mobileNumber: formData.mobileNumber
    };

    localStorage.setItem('user', JSON.stringify(updatedUser));
    
    // Dispatch event so Navbar updates
    window.dispatchEvent(new Event('userLoginStateChange'));
    
    setSuccessMessage('Profile updated successfully!');
    
    setTimeout(() => {
      navigate('/');
    }, 1500);
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Edit Profile</h2>
        <p className="auth-subtitle">Update your personal information</p>
        
        {successMessage && <div className="success-alert">{successMessage}</div>}
        {error && <div className="error-alert">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>First Name</label>
            <input 
              type="text" 
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Last Name</label>
            <input 
              type="text" 
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Email (Read-only)</label>
            <input 
              type="email" 
              value={formData.email}
              disabled
              style={{ backgroundColor: '#f3f4f6', cursor: 'not-allowed' }}
            />
          </div>
          
          <div className="form-group">
            <label>Mobile Number</label>
            <input 
              type="text" 
              name="mobileNumber"
              value={formData.mobileNumber}
              onChange={handleChange}
              placeholder="10-digit number"
              maxLength="10"
              required
            />
          </div>



          <button type="submit" className="auth-submit-btn">
            <Icons.Save size={18} style={{ marginRight: '8px' }} />
            Save Changes
          </button>
          
          <button 
            type="button" 
            className="auth-submit-btn" 
            style={{ marginTop: '12px', backgroundColor: '#6b7280' }}
            onClick={() => navigate(-1)}
          >
            Cancel
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditProfile;
