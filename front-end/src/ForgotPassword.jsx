import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Mail, AlertCircle, CheckCircle2, Loader2, KeyRound } from 'lucide-react';
import './ForgotPassword.css';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState(1); // 1: Email, 2: OTP
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSendOtp = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/v1.0/Auth/forgot-password`, { email });
      if (response.status === 200) {
        setSuccess('OTP sent to your email. Please check your inbox.');
        setStep(2);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send reset link.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/v1.0/Auth/verify-otp`, { email, otp });
      if (response.status === 200) {
        setSuccess('OTP verified! Redirecting to reset password...');
        setTimeout(() => navigate(`/reset-password?token=${otp}`), 1500);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid or expired OTP.');
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
            {step === 1 ? <Mail size={32} className="header-icon" /> : <KeyRound size={32} className="header-icon" />}
          </div>
          <h1>{step === 1 ? 'Forgot Password?' : 'Enter OTP'}</h1>
          <p>{step === 1 ? "Enter your email and we'll send you an OTP." : "Enter the 4-digit OTP sent to your email."}</p>
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

        {step === 1 ? (
          <form onSubmit={handleSendOtp}>
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
              {loading ? <Loader2 className="animate-spin" /> : 'Send OTP'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp}>
            <div className="form-group">
              <label>4-Digit OTP</label>
              <div className="input-with-icon">
                <KeyRound className="input-icon" size={18} />
                <input
                  type="text"
                  placeholder="1234"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  maxLength={4}
                  required
                  style={{ letterSpacing: '4px', textAlign: 'center', fontSize: '1.2rem', fontWeight: 'bold' }}
                />
              </div>
            </div>
            <button type="submit" className="submit-btn" disabled={loading || otp.length !== 4}>
              {loading ? <Loader2 className="animate-spin" /> : 'Verify OTP'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
