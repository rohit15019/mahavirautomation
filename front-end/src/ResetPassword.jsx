import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Loader2, Lock, AlertCircle, CheckCircle2, ArrowLeft } from 'lucide-react';
import './ForgotPassword.css';

const ResetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!token) {
      setError('Invalid or missing reset token.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    
    setLoading(true);
    setError('');
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/v1.0/Auth/reset-password`, { 
        token, 
        newPassword,
        confirmPassword
      });
      if (response.status === 200) {
        setSuccess('Password reset successful! Redirecting to login...');
        setTimeout(() => navigate('/login'), 2000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password.');
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
            <Lock size={32} className="header-icon" />
          </div>
          <h1>Reset Password</h1>
          <p>Enter your new password below.</p>
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
          <form onSubmit={handleResetPassword}>
            <div className="form-group">
              <label>New Password</label>
              <div className="input-with-icon">
                <Lock className="input-icon" size={18} />
                <input
                  type="password"
                  placeholder="At least 6 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength="6"
                />
              </div>
            </div>
            <div className="form-group">
              <label>Confirm Password</label>
              <div className="input-with-icon">
                <Lock className="input-icon" size={18} />
                <input
                  type="password"
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength="6"
                />
              </div>
            </div>
            <button type="submit" className="submit-btn" disabled={loading || !newPassword || !confirmPassword || !token}>
              {loading ? <Loader2 className="animate-spin" /> : 'Reset Password'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;
