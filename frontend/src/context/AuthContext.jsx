import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import client, { setAuthToken, getAuthToken } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!getAuthToken()) {
      setLoading(false);
      return;
    }
    client
      .get('/auth/me')
      .then((res) => setUser(res.data.user))
      .catch(() => setAuthToken(null))
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (email, password) => {
    const res = await client.post('/auth/login', { email, password });
    setAuthToken(res.data.token);
    setUser(res.data.user);
  }, []);

  const signup = useCallback(async (name, email, password) => {
    const res = await client.post('/auth/register', { name, email, password });
    if (res.data.pending) {
      return { pending: true, message: res.data.message };
    }
    setAuthToken(res.data.token);
    setUser(res.data.user);
    return { pending: false };
  }, []);

  const logout = useCallback(() => {
    setAuthToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
