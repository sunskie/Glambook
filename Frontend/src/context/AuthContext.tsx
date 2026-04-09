import { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import showToast from '../components/common/Toast';
import authService from '../services/api/authService';
import { User, RegisterData, AuthContextType } from '../types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = () => {
    try {
      const token = localStorage.getItem('token');
      const currentUser = authService.getCurrentUser();
      if (token && currentUser) {
        setUser(currentUser);
      } else {
        clearSession();
      }
    } catch {
      clearSession();
    } finally {
      setLoading(false);
    }
  };

  const clearSession = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const login = async (email: string, password: string) => {
    try {
      setError(null);
      setLoading(true);
      clearSession();

      const response: any = await authService.login({ email, password });

      if (response.user) {
        const normalizedUser = {
          ...response.user,
          _id: response.user.id || response.user._id,
        };
        setUser(normalizedUser);

        const role = response.user.role;
        if (role === 'vendor') navigate('/vendor/dashboard');
        else if (role === 'client') navigate('/client/dashboard');
        else if (role === 'admin') navigate('/admin/dashboard');

        showToast.success('Login successful!');
      }
      return response;
    } catch (error: any) {
      const msg = error.response?.data?.message || error.message || 'Login failed';
      setError(msg);
      showToast.error(msg);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: RegisterData) => {
    try {
      setError(null);
      setLoading(true);
      clearSession();
      await authService.register(userData);
      showToast.success('Registration successful! Please login.');
      navigate('/login');
      return { success: true };
    } catch (error: any) {
      const msg = error.response?.data?.message || error.message || 'Registration failed';
      setError(msg);
      showToast.error(msg);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    clearSession();
    setError(null);
    navigate('/login');
    showToast.success('Logged out successfully');
  };

  return (
    <AuthContext.Provider value={{
      user, loading, error, login, register, logout,
      isVendor: () => user?.role === 'vendor',
      isClient: () => user?.role === 'client',
      isAdmin: () => user?.role === 'admin',
      isAuthenticated: () => !!user,
    }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

export default AuthContext;