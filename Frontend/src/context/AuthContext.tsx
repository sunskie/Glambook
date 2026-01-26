// ============================================
// AUTH CONTEXT (TypeScript)
// ============================================
import { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import {
  login as apiLogin,
  register as apiRegister,
  logout as apiLogout,
  getCurrentUser,
  User
} from '../services/api';

// ============================================
// TYPE DEFINITIONS
// ============================================

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<any>;
  register: (userData: RegisterData) => Promise<any>;
  logout: () => void;
  isVendor: () => boolean;
  isClient: () => boolean;
  isAdmin: () => boolean;
  isAuthenticated: () => boolean;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
  role: 'vendor' | 'client';
  phone?: string;
}

interface AuthProviderProps {
  children: ReactNode;
}

// ============================================
// CREATE CONTEXT
// ============================================
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ============================================
// AUTH PROVIDER COMPONENT
// ============================================
export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // ──────────────────────────────────────
  // Check if user is already logged in on app load
  // ──────────────────────────────────────
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = () => {
    try {
      const currentUser = getCurrentUser();
      if (currentUser) {
        setUser(currentUser);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  // ──────────────────────────────────────
  // LOGIN
  // ──────────────────────────────────────
  const login = async (email: string, password: string) => {
    try {
      setError(null);
      setLoading(true);

      const response = await apiLogin({ email, password });
      setUser(response.user);

      return response;
    } catch (error: any) {
      const errorMessage = error.message || 'Login failed';
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // ──────────────────────────────────────
  // REGISTER
  // ──────────────────────────────────────
  const register = async (userData: RegisterData) => {
    try {
      setError(null);
      setLoading(true);

      const response = await apiRegister(userData);

      if (response.token) {
        setUser(response.user);
      }

      return response;
    } catch (error: any) {
      const errorMessage = error.message || 'Registration failed';
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // ──────────────────────────────────────
  // LOGOUT
  // ──────────────────────────────────────
  const logout = () => {
    apiLogout();
    setUser(null);
    setError(null);
  };

  // ──────────────────────────────────────
  // HELPER FUNCTIONS
  // ──────────────────────────────────────
  const isVendor = (): boolean => user?.role === 'vendor';
  const isClient = (): boolean => user?.role === 'client';
  const isAdmin = (): boolean => user?.role === 'admin';
  const isAuthenticated = (): boolean => !!user;

  const value: AuthContextType = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    isVendor,
    isClient,
    isAdmin,
    isAuthenticated
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

// ============================================
// CUSTOM HOOK
// ============================================
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};

export default AuthContext;