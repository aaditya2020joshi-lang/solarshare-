import { createContext, useContext, useState } from 'react';
import client from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('solarshare_user');
    return stored ? JSON.parse(stored) : null;
  });

  function persist(token, user) {
    localStorage.setItem('solarshare_token', token);
    localStorage.setItem('solarshare_user', JSON.stringify(user));
    setUser(user);
  }

  async function signup(payload) {
    const { data } = await client.post('/auth/signup', payload);
    persist(data.token, data.user);
    return data.user;
  }

  async function login(email, password) {
    const { data } = await client.post('/auth/login', { email, password });
    persist(data.token, data.user);
    return data.user;
  }

  function logout() {
    localStorage.removeItem('solarshare_token');
    localStorage.removeItem('solarshare_user');
    setUser(null);
  }

  function updateUser(nextUser) {
    localStorage.setItem('solarshare_user', JSON.stringify(nextUser));
    setUser(nextUser);
  }

  return (
    <AuthContext.Provider value={{ user, signup, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
