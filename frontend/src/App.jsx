import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './Login.jsx';
import Signup from './Signup.jsx';
import Welcome from './Welcome.jsx';

function getUser() {
  try { return JSON.parse(sessionStorage.getItem('user')); }
  catch { return null; }
}

function ProtectedRoute({ children }) {
  return getUser() ? children : <Navigate to="/" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"       element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route
          path="/welcome"
          element={<ProtectedRoute><Welcome /></ProtectedRoute>}
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
