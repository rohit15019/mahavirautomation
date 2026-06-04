import { useState, useEffect } from 'react';
import axios from 'axios';
import { Loader2, Shield, AlertCircle, CheckCircle2, Clock } from 'lucide-react';

const VerifyOtp = ({ email, onVerified, onResend }) => {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [timer, setTimer] = useState(30);

  useEffect(() => {
    let interval;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/v1.0/Auth/verify-otp`, { email, otp });
      if (response.status === 200) {
        setSuccess('OTP verified successfully.');
        // If the backend returns a token, we could store it, but for now we follow the existing flow
        setTimeout(() => onVerified(otp), 1000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid or expired OTP.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setTimer(30);
    onResend();
  };

  return (
    <>
      <div className="card-header">
        <div className="icon-wrapper">
          <Shield size={32} className="header-icon" />
        </div>
        <h1>Verify OTP</h1>
        <p>We've sent a 4-digit code to <strong>{email}</strong></p>
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

      <form onSubmit={handleVerifyOtp}>
        <div className="form-group">
          <label>4-Digit OTP</label>
          <div className="input-with-icon">
            <Shield className="input-icon" size={18} />
            <input
              type="text"
              placeholder="Enter 4-digit OTP"
              maxLength="4"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))} // Ensure only numbers
              required
              autoFocus
            />
          </div>
        </div>
        <button type="submit" className="submit-btn" disabled={loading || otp.length !== 4}>
          {loading ? <Loader2 className="animate-spin" /> : 'Verify OTP'}
        </button>
        
        <div className="resend-container" style={{ textAlign: 'center', marginTop: '1rem' }}>
          {timer > 0 ? (
            <p style={{ fontSize: '0.85rem', color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
              <Clock size={14} /> Resend available in {timer}s
            </p>
          ) : (
            <button type="button" className="resend-btn" onClick={handleResend} disabled={loading} style={{ margin: 0 }}>
              Resend OTP
            </button>
          )}
        </div>
      </form>
    </>
  );
};

export default VerifyOtp;
