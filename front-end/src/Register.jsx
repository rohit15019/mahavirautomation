import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Phone, Lock, AlertCircle, CheckCircle2 } from 'lucide-react';
import './Login.css'; // Reusing Login styles for consistency

const Register = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    mobile: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate();

  const validate = () => {
    const newErrors = {};
    if (!formData.firstName) newErrors.firstName = 'First name is required.';
    if (!formData.lastName) newErrors.lastName = 'Last name is required.';
    if (!formData.email) newErrors.email = 'Email is required.';
    if (!formData.mobile) {
      newErrors.mobile = 'Mobile number is required.';
    } else if (!/^\d{10}$/.test(formData.mobile)) {
      newErrors.mobile = 'Mobile number must be exactly 10 digits.';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required.';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters.';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please re-enter your password.';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Password does not match.';
    }
    return newErrors;
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: '' });
    setServerError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/v1.0/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.errors) {
          const formattedErrors = {};
          Object.keys(data.errors).forEach(key => {
            const stateKey = key.charAt(0).toLowerCase() + key.slice(1);
            formattedErrors[stateKey] = data.errors[key][0];
          });
          setErrors(formattedErrors);
        } else {
          setServerError(data.message || 'Registration failed.');
        }
      } else {
        setSuccessMessage(data.message || 'Registration successful! Please check your email to verify your account.');
        setTimeout(() => {
          navigate('/login');
        }, 4000);
      }
    } catch (error) {
      setServerError('Unable to connect to the server. Is the backend running?');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Create Account</h2>
        <p className="auth-subtitle">Join Mahavir Automation solutions</p>
        
        {serverError && (
          <div className="error-alert">
            <AlertCircle size={20} />
            {serverError}
          </div>
        )}
        {successMessage && (
          <div className="success-alert">
            <CheckCircle2 size={20} />
            {successMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-row">
            <div className="form-group">
              <label>First Name</label>
              <div className="input-wrapper">
                <input 
                  type="text" 
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="John"
                  className={errors.firstName ? 'input-error' : ''}
                />
                <User size={18} className="input-icon" />
              </div>
              {errors.firstName && <span className="error-text">{errors.firstName}</span>}
            </div>
            <div className="form-group">
              <label>Last Name</label>
              <div className="input-wrapper">
                <input 
                  type="text" 
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="Doe"
                  className={errors.lastName ? 'input-error' : ''}
                />
                <User size={18} className="input-icon" />
              </div>
              {errors.lastName && <span className="error-text">{errors.lastName}</span>}
            </div>
          </div>

          <div className="form-group">
            <label>Email Address</label>
            <div className="input-wrapper">
              <input 
                type="email" 
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="john@example.com"
                className={errors.email ? 'input-error' : ''}
              />
              <Mail size={18} className="input-icon" />
            </div>
            {errors.email && <span className="error-text">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label>Mobile Number</label>
            <div className="input-wrapper">
              <input 
                type="text" 
                name="mobile"
                value={formData.mobile}
                onChange={handleChange}
                placeholder="10-digit number"
                maxLength="10"
                className={errors.mobile ? 'input-error' : ''}
              />
              <Phone size={18} className="input-icon" />
            </div>
            {errors.mobile && <span className="error-text">{errors.mobile}</span>}
          </div>

          <div className="form-group">
            <label>Password</label>
            <div className="input-wrapper">
              <input 
                type="password" 
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Min 6 characters"
                className={errors.password ? 'input-error' : ''}
              />
              <Lock size={18} className="input-icon" />
            </div>
            {errors.password && <span className="error-text">{errors.password}</span>}
          </div>

          <div className="form-group">
            <label>Confirm Password</label>
            <div className="input-wrapper">
              <input 
                type="password" 
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Re-enter your password"
                className={errors.confirmPassword ? 'input-error' : ''}
              />
              <Lock size={18} className="input-icon" />
            </div>
            {errors.confirmPassword && <span className="error-text">{errors.confirmPassword}</span>}
          </div>

          <button type="submit" className="auth-submit-btn">Create Account</button>
        </form>

        <div className="auth-footer">
          Already have an account? <Link to="/login">Log in</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
