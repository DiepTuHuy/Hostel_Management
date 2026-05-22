import { createContext, useContext, useEffect, useState } from 'react';
import { authService } from '../services/authService.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => authService.getCurrentUser());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    setUser(authService.getCurrentUser());
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const { user } = await authService.login(email, password);
      setUser(user);
      return user;
    } catch (err) {
      setError(err.message || 'Đăng nhập thất bại');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (fullName, email, phone, password, role = 'tenant') => {
    setLoading(true);
    setError(null);
    try {
      const newUser = await authService.register(fullName, email, phone, password, role);
      return newUser;
    } catch (err) {
      setError(err.message || 'Đăng ký thất bại');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, loading, error, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth phải dùng bên trong <AuthProvider>');
  }
  return ctx;
};
