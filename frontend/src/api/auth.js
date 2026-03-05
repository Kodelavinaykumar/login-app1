import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
});

// identifier = username OR email
export async function loginUser(identifier, password) {
  const res = await api.post('/login', { identifier, password });
  return res.data;
}

// signup requires username + email + password
export async function signupUser(username, email, password) {
  const res = await api.post('/signup', { username, email, password });
  return res.data;
}