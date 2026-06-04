import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Phone, Lock, AlertCircle, CheckCircle2, UserCircle } from 'lucide-react';
import './Login.css';

const Login = () => {
  const [formData, setFormData] = useState({
    mobileOrEmail: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate();

  const validate = () => {
    const newErrors = {};
    if (!formData.mobileOrEmail) {
      newErrors.mobileOrEmail = 'Mobile number or Email is required.';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required.';
    }
    return newErrors;
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: '' }); // Clear error when typing
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
      const payload = {
        mobileOrEmail: formData.mobileOrEmail.trim(),
        password: formData.password.trim()
      };

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/v1.0/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      let data;
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.indexOf("application/json") !== -1) {
        data = await response.json();
      } else {
        const text = await response.text();
        throw new Error(text || 'Login failed with server error.');
      }

      if (!response.ok) {
        if (data.errors) {
          const formattedErrors = {};
          Object.keys(data.errors).forEach(key => {
            const stateKey = key.charAt(0).toLowerCase() + key.slice(1);
            formattedErrors[stateKey] = data.errors[key][0];
          });
          setErrors(formattedErrors);
        } else {
          setServerError(data.message || 'Login failed. Please check your credentials.');
        }
      } else {
        setSuccessMessage(data.message || 'Login successful!');
        
        if (data.token) localStorage.setItem('token', data.token);
        if (data.role) localStorage.setItem('role', data.role);
        if (data.user) localStorage.setItem('user', JSON.stringify(data.user));

        window.dispatchEvent(new Event('userLoginStateChange'));

        setTimeout(() => {
          const role = (data.role || '').toLowerCase();
          if (role === 'admin') {
            navigate('/admin/dashboard');
          } else if (role === 'user') {
            navigate('/dashboard');
          } else {
            navigate('/');
          }
        }, 1500);
      }
    } catch (error) {
      setServerError(error.message || 'Unable to connect to the server. Is the backend running?');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Welcome Back</h2>
        <p className="auth-subtitle">Log in to your Mahavir account</p>
        
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
          <div className="form-group">
            <label>Email or Mobile Number</label>
            <div className="input-wrapper">
              <input 
                type="text" 
                name="mobileOrEmail"
                value={formData.mobileOrEmail}
                onChange={handleChange}
                placeholder="email@example.com or 10-digit number"
                className={errors.mobileOrEmail ? 'input-error' : ''}
              />
              <UserCircle size={18} className="input-icon" />
            </div>
            {errors.mobileOrEmail && <span className="error-text">{errors.mobileOrEmail}</span>}
          </div>

          <div className="form-group">
            <label>Password</label>
            <div className="input-wrapper">
              <input 
                type="password" 
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                className={errors.password ? 'input-error' : ''}
              />
              <Lock size={18} className="input-icon" />
            </div>
            {errors.password && <span className="error-text">{errors.password}</span>}
            <div className="forgot-password-link-container">
              <Link to="/forgot-password">Forgot Password?</Link>
            </div>
          </div>

          <button type="submit" className="auth-submit-btn">Log In</button>
        </form>

        <div className="auth-footer">
          Don't have an account? <Link to="/register">Sign up</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
