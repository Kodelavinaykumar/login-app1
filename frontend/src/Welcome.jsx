import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from './hooks/useAuth.js';
import './Welcome.css';

export default function Welcome() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { logout } = useAuth();

  const user = location.state?.user || (() => {
    try { return JSON.parse(sessionStorage.getItem('user')); } catch { return null; }
  })();

  const username  = user?.username || 'User';
  const role      = username.toLowerCase() === 'admin' ? 'Admin' : 'User';
  const loginTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const loginDate = new Date().toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });

  const handleLogout = () => { logout(); navigate('/', { replace: true }); };

  return (
    <div className="welcome-page">
      <div className="welcome-card">
        <div className="welcome-icon">
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#27ae60" strokeWidth="2">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </div>

        <h1 className="welcome-title">
          Welcome back, <span className="welcome-username">{username}</span>
        </h1>
        <p className="welcome-subtitle">You have successfully signed in.</p>

        <div className="welcome-divider" />

        <div className="welcome-meta">
          <div className="meta-item">
            <span className="meta-label">Date</span>
            <span className="meta-value">{loginDate}</span>
          </div>
          <div className="meta-item">
            <span className="meta-label">Time</span>
            <span className="meta-value">{loginTime}</span>
          </div>
          <div className="meta-item">
            <span className="meta-label">Role</span>
            <span className="meta-value">{role}</span>
          </div>
        </div>

        <button className="logout-btn" onClick={handleLogout}>Sign Out</button>
      </div>
    </div>
  );
}