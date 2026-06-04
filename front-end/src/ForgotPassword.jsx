import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Mail, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import './ForgotPassword.css';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSendLink = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/v1.0/Auth/forgot-password`, { email });
      if (response.status === 200) {
        setSuccess('Password reset link sent to your email. Please check your inbox.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send reset link.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forgot-password-page">
      <div className="forgot-password-card">
        <Link to="/login" className="back-link">
          <ArrowLeft size={18} />
          <span>Back to Login</span>
        </Link>

        <div className="card-header">
          <div className="icon-wrapper">
            <Mail size={32} className="header-icon" />
          </div>
          <h1>Forgot Password?</h1>
          <p>Enter your email and we'll send you a password reset link.</p>
        </div>

        {error && (
          <div className="message-box error">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}
        {success && (
          <div className="message-box success">
            <CheckCircle2 size={18} />
            <span>{success}</span>
          </div>
        )}

        {!success && (
          <form onSubmit={handleSendLink}>
            <div className="form-group">
              <label>Email Address</label>
              <div className="input-with-icon">
                <Mail className="input-icon" size={18} />
                <input
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>
            <button type="submit" className="submit-btn" disabled={loading || !email}>
              {loading ? <Loader2 className="animate-spin" /> : 'Send Reset Link'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
