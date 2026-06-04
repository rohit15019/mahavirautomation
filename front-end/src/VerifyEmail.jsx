import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import './Login.css';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();
  
  const [status, setStatus] = useState('loading'); // 'loading', 'success', 'error'
  const [message, setMessage] = useState('Verifying your email...');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Invalid or missing verification token.');
      return;
    }

    const verifyToken = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/v1.0/auth/verify-email?token=${encodeURIComponent(token)}`);
        const data = await response.json();
        
        if (response.ok) {
          setStatus('success');
          setMessage(data.message || 'Email verified successfully!');
        } else {
          setStatus('error');
          setMessage(data.message || 'Failed to verify email. The link might be expired.');
        }
      } catch (err) {
        setStatus('error');
        setMessage('Network error. Please try again later.');
      }
    };

    verifyToken();
  }, [token]);

  return (
    <div className="auth-container">
      <div className="auth-card" style={{ textAlign: 'center', padding: '40px 20px' }}>
        {status === 'loading' && (
          <>
            <Loader2 size={48} className="spin" style={{ color: '#00b4d8', margin: '0 auto 20px' }} />
            <h2>Verifying Email</h2>
            <p style={{ color: '#94a3b8' }}>{message}</p>
          </>
        )}

        {status === 'success' && (
          <>
            <CheckCircle size={48} style={{ color: '#10b981', margin: '0 auto 20px' }} />
            <h2>Verification Complete!</h2>
            <p style={{ color: '#94a3b8', marginBottom: '30px' }}>{message}</p>
            <button className="auth-submit-btn" onClick={() => navigate('/login')}>
              Go to Login
            </button>
          </>
        )}

        {status === 'error' && (
          <>
            <XCircle size={48} style={{ color: '#ef4444', margin: '0 auto 20px' }} />
            <h2>Verification Failed</h2>
            <p style={{ color: '#94a3b8', marginBottom: '30px' }}>{message}</p>
            <Link to="/register" style={{ color: '#00b4d8', textDecoration: 'none' }}>
              Return to Registration
            </Link>
          </>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;
