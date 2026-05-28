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
      const data = await authService.register(fullName, email, phone, password, role);
      return data;
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Đăng ký thất bại');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async (email, otp) => {
    setLoading(true);
    setError(null);
    try {
      const { user } = await authService.verifyOtp(email, otp);
      setUser(user);
      return user;
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Xác thực OTP thất bại');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const resendOtp = async (email) => {
    setLoading(true);
    setError(null);
    try {
      const data = await authService.resendOtp(email);
      return data;
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Gửi lại mã OTP thất bại');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const forgotPassword = async (email) => {
    setLoading(true);
    setError(null);
    try {
      const data = await authService.forgotPassword(email);
      return data;
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Yêu cầu OTP thất bại');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email, otp, newPassword) => {
    setLoading(true);
    setError(null);
    try {
      const data = await authService.resetPassword(email, otp, newPassword);
      return data;
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Khôi phục mật khẩu thất bại');
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
    <AuthContext.Provider value={{ user, setUser, loading, error, login, logout, register, verifyOtp, resendOtp, forgotPassword, resetPassword }}>
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
