import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { signupUser } from './api/auth.js';
import './Signup.css';

const AlertIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{flexShrink:0,marginTop:1}}>
    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
  </svg>
);
const CheckIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{flexShrink:0,marginTop:1}}>
    <circle cx="12" cy="12" r="10"/><polyline points="9 12 11 14 15 10"/>
  </svg>
);
const EyeOpen = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
);
const EyeOff = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
);

function getStrength(pw) {
  if (!pw) return { score: 0, label: '', color: 'transparent', width: '0%' };
  let score = 0;
  if (pw.length >= 6)  score++;
  if (pw.length >= 10) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw))  score++;
  if (/[^a-zA-Z0-9]/.test(pw)) score++;
  const map = [
    { label: 'Very weak',   color: '#e74c3c', width: '20%'  },
    { label: 'Weak',        color: '#e67e22', width: '40%'  },
    { label: 'Fair',        color: '#f1c40f', width: '60%'  },
    { label: 'Strong',      color: '#2ecc71', width: '80%'  },
    { label: 'Very strong', color: '#27ae60', width: '100%' },
  ];
  return { score, ...map[Math.min(score, 4)] };
}

export default function Signup() {
  const navigate = useNavigate();

  const [username,     setUsername    ] = useState('');
  const [email,        setEmail       ] = useState('');
  const [password,     setPassword    ] = useState('');
  const [confirm,      setConfirm     ] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm,  setShowConfirm ] = useState(false);
  const [loading,      setLoading     ] = useState(false);
  const [error,        setError       ] = useState('');
  const [success,      setSuccess     ] = useState('');
  const [shake,        setShake       ] = useState(false);

  const strength = getStrength(password);

  useEffect(() => {
    if (error) {
      setShake(true);
      const t = setTimeout(() => setShake(false), 500);
      return () => clearTimeout(t);
    }
  }, [error]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await signupUser(username.trim(), email.trim(), password);
      setSuccess('Account created! Redirecting to sign in…');
      setTimeout(() => navigate('/', { state: { prefillUsername: username.trim() } }), 1800);
    } catch (err) {
      setError(err?.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const canSubmit = username && email && password && confirm && !loading && !success;

  return (
    <div className="signup-page">
      <div className={`signup-card${shake ? ' shake' : ''}`}>

        <div className="signup-header">
          <div className="signup-logo">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
          </div>
          <h1 className="signup-title">Create Account</h1>
          <p className="signup-subtitle">Join Authority today</p>
        </div>

        {error   && <div className="error-banner"   role="alert" ><AlertIcon /><span>{error}</span></div>}
        {success && <div className="success-banner" role="status"><CheckIcon /><span>{success}</span></div>}

        <form className="signup-form" onSubmit={handleSubmit} noValidate>

          {/* Username */}
          <div className="field">
            <label className="field-label" htmlFor="su-username">Username</label>
            <div className="field-input-wrap">
              <input
                id="su-username" type="text" className="field-input"
                autoComplete="username" placeholder="Choose a username"
                value={username} disabled={loading || !!success}
                onChange={(e) => { setUsername(e.target.value); setError(''); }}
                required
              />
            </div>
          </div>

          {/* Email */}
          <div className="field">
            <label className="field-label" htmlFor="su-email">Email</label>
            <div className="field-input-wrap">
              <input
                id="su-email" type="email" className="field-input"
                autoComplete="email" placeholder="Enter your email address"
                value={email} disabled={loading || !!success}
                onChange={(e) => { setEmail(e.target.value); setError(''); }}
                required
              />
            </div>
          </div>

          {/* Password */}
          <div className="field">
            <label className="field-label" htmlFor="su-password">Password</label>
            <div className="field-input-wrap">
              <input
                id="su-password" type={showPassword ? 'text' : 'password'}
                className="field-input has-toggle"
                autoComplete="new-password" placeholder="Create a password"
                value={password} disabled={loading || !!success}
                onChange={(e) => { setPassword(e.target.value); setError(''); }}
                required
              />
              <button type="button" className="toggle-btn" tabIndex={-1}
                onClick={() => setShowPassword(v => !v)}>
                {showPassword ? <EyeOff /> : <EyeOpen />}
              </button>
            </div>
            {password && (
              <>
                <div className="strength-bar-wrap">
                  <div className="strength-bar" style={{ width: strength.width, background: strength.color }} />
                </div>
                <span className="strength-label">{strength.label}</span>
              </>
            )}
          </div>

          {/* Confirm Password */}
          <div className="field">
            <label className="field-label" htmlFor="su-confirm">Confirm Password</label>
            <div className="field-input-wrap">
              <input
                id="su-confirm" type={showConfirm ? 'text' : 'password'}
                className="field-input has-toggle"
                autoComplete="new-password" placeholder="Repeat your password"
                value={confirm} disabled={loading || !!success}
                onChange={(e) => { setConfirm(e.target.value); setError(''); }}
                required
              />
              <button type="button" className="toggle-btn" tabIndex={-1}
                onClick={() => setShowConfirm(v => !v)}>
                {showConfirm ? <EyeOff /> : <EyeOpen />}
              </button>
            </div>
          </div>

          <button type="submit" className="signup-btn" disabled={!canSubmit}>
            {loading ? <><span className="spinner" />Creating account…</> : 'Create Account'}
          </button>
        </form>

        <p className="signup-footer">
          Already have an account?{' '}
          <a onClick={() => navigate('/')}>Sign in</a>
        </p>
      </div>
    </div>
  );
}
