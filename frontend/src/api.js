import axios from 'axios';

export const API_BASE_URL = 'http://localhost:8080';
export const ML_BASE_URL = 'http://localhost:8000';
export const AGENT_BASE_URL = 'http://localhost:8001';

const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('linkit_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  login: (username, password) => api.post('/login', { username, password }),
  register: (username, password) => api.post('/register', { username, password }),
};

export const linksAPI = {
  list: (limit = 50) => api.get(`/api/links?limit=${limit}`),
  shorten: (url) => api.post('/shorten', { url }),
  getAnalytics: (shortCode, days = 30) => api.get(`/api/analytics/${shortCode}?days=${days}`),
  getForecast: (shortCode) => api.get(`/api/forecast/${shortCode}`),
};

export const agentAPI = {
  chat: (userId, username, message) =>
    axios.post(`${AGENT_BASE_URL}/chat`, {
      user_id: userId || 1,
      username: username || 'guest',
      message,
    }),
  health: () => axios.get(`${AGENT_BASE_URL}/health`),
};

export default api;
