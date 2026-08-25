import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL || '/api';
const client = axios.create({ baseURL });

client.interceptors.request.use((config) => {
  const token = localStorage.getItem('bfl_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && window.location.pathname !== '/login') {
      localStorage.removeItem('bfl_token');
      localStorage.removeItem('bfl_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default client;
