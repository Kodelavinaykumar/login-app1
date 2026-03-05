import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from './hooks/useAuth.js';
import './Login.css';

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
const AlertIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{flexShrink:0,marginTop:1}}>
    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
  </svg>
);

export default function Login() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { login, loading, error, setError, getSavedIdentifier } = useAuth();

  const [identifier,   setIdentifier  ] = useState('');
  const [password,     setPassword    ] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember,     setRemember    ] = useState(false);
  const [shake,        setShake       ] = useState(false);

  useEffect(() => {
    const fromSignup = location.state?.prefillUsername;
    const saved      = getSavedIdentifier();
    if (fromSignup) { setIdentifier(fromSignup); }
    else if (saved) { setIdentifier(saved); setRemember(true); }
  }, []);

  useEffect(() => {
    if (error) {
      setShake(true);
      const t = setTimeout(() => setShake(false), 500);
      return () => clearTimeout(t);
    }
  }, [error]);

  const handleSubmit = (e) => {
    e.preventDefault();
    login({
      identifier, password, remember,
      onSuccess: (user) => navigate('/welcome', { replace: true, state: { user } }),
    });
  };

  return (
    <div className="login-page">
      <div className={`login-card${shake ? ' shake' : ''}`}>

        <div className="login-header">
          <div className="login-logo">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#faf8f4" strokeWidth="1.8">
              <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
          </div>
          <h1 className="login-title">Authority</h1>
          <p className="login-subtitle">Sign in to your account</p>
        </div>

        {error && (
          <div className="error-banner" role="alert">
            <AlertIcon /><span>{error}</span>
          </div>
        )}

        <form className="login-form" onSubmit={handleSubmit} noValidate>
          <div className="field">
            <label className="field-label" htmlFor="identifier">Username or Email</label>
            <div className="field-input-wrap">
              <input
                id="identifier" type="text" className="field-input"
                autoComplete="username" placeholder="Enter username or email"
                value={identifier} disabled={loading}
                onChange={(e) => { setIdentifier(e.target.value); setError(''); }}
                required
              />
            </div>
          </div>

          <div className="field">
            <label className="field-label" htmlFor="password">Password</label>
            <div className="field-input-wrap">
              <input
                id="password" type={showPassword ? 'text' : 'password'}
                className="field-input has-toggle"
                autoComplete="current-password" placeholder="Enter your password"
                value={password} disabled={loading}
                onChange={(e) => { setPassword(e.target.value); setError(''); }}
                required
              />
              <button type="button" className="toggle-btn" tabIndex={-1}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                onClick={() => setShowPassword(v => !v)}>
                {showPassword ? <EyeOff /> : <EyeOpen />}
              </button>
            </div>
          </div>

          <div className="remember-row">
            <input
              id="remember" type="checkbox" className="remember-checkbox"
              checked={remember} disabled={loading}
              onChange={(e) => setRemember(e.target.checked)}
            />
            <label htmlFor="remember" className="remember-label">Remember me</label>
          </div>

          <button type="submit" className="submit-btn" disabled={loading || !identifier || !password}>
            {loading ? <><span className="spinner" />Signing in…</> : 'Sign In'}
          </button>
        </form>

        <p className="login-hint">
          Don't have an account?{' '}
          <a onClick={() => navigate('/signup')} style={{color:'var(--accent)',cursor:'pointer',fontWeight:600,textDecoration:'none'}}>
            Create one
          </a>
        </p>
      </div>
    </div>
  );
}
