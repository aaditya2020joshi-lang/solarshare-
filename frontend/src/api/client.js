import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL || '/api';
const client = axios.create({ baseURL });

const TOKEN_KEY = 'study_token';

const storedToken = localStorage.getItem(TOKEN_KEY);
if (storedToken) {
  client.defaults.headers.common.Authorization = `Bearer ${storedToken}`;
}

export function setAuthToken(token) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
    client.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    localStorage.removeItem(TOKEN_KEY);
    delete client.defaults.headers.common.Authorization;
  }
}

export function getAuthToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export default client;
