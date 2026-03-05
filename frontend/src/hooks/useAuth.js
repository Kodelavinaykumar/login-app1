import { useState, useCallback } from 'react';
import { loginUser } from '../api/auth.js';

const REMEMBER_KEY = 'rememberedIdentifier';

export function useAuth() {
  const [loading, setLoading] = useState(false);
  const [error,   setError  ] = useState('');

  const getSavedIdentifier = () => localStorage.getItem(REMEMBER_KEY) || '';

  const login = useCallback(async ({ identifier, password, remember, onSuccess }) => {
    setLoading(true);
    setError('');
    try {
      const data = await loginUser(identifier.trim(), password);
      remember
        ? localStorage.setItem(REMEMBER_KEY, identifier.trim())
        : localStorage.removeItem(REMEMBER_KEY);
      sessionStorage.setItem('user', JSON.stringify(data.user));
      onSuccess(data.user);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
        (err.code === 'ECONNABORTED' ? 'Request timed out.' : 'Something went wrong.')
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = () => sessionStorage.removeItem('user');

  return { login, logout, loading, error, setError, getSavedIdentifier };
}
