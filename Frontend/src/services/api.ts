// ============================================
// API CONFIGURATION FILE (TypeScript)
// ============================================
import axios, { AxiosError } from 'axios';

// ============================================
// TYPE DEFINITIONS
// ============================================

// User type
export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'vendor' | 'client' | 'admin';
  phone?: string;
}

// Service type
export interface Service {
  _id: string;
  title: string;
  description: string;
  price: number;
  duration: number;
  category: string;
  status: 'active' | 'inactive';
  vendorId: string | User;
  createdAt: string;
  updatedAt: string;
}

// API Response types
interface AuthResponse {
  success: boolean;
  token: string;
  user: User;
  message?: string;
}

interface ServiceResponse {
  success: boolean;
  data: Service;
  message?: string;
}

interface ServicesResponse {
  success: boolean;
  count: number;
  data: Service[];
}

interface ErrorResponse {
  success: boolean;
  message: string;
  errors?: string[];
}

// ============================================
// BASE URL
// ============================================
const API_BASE_URL = 'http://localhost:5000/api';

// ============================================
// CREATE AXIOS INSTANCE
// ============================================
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ============================================
// REQUEST INTERCEPTOR
// ============================================
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// ============================================
// RESPONSE INTERCEPTOR
// ============================================
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error: AxiosError<ErrorResponse>) => {
    if (error.response) {
      const { status } = error.response;
      
      if (status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

// ============================================
// AUTH API CALLS
// ============================================

export const register = async (userData: {
  name: string;
  email: string;
  password: string;
  role: 'vendor' | 'client';
  phone?: string;
}): Promise<AuthResponse> => {
  try {
    const response = await api.post<AuthResponse>('/auth/register', userData);
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<ErrorResponse>;
    throw axiosError.response?.data || { message: 'Registration failed' };
  }
};

export const login = async (credentials: {
  email: string;
  password: string;
}): Promise<AuthResponse> => {
  try {
    const response = await api.post<AuthResponse>('/auth/login', credentials);
    
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<ErrorResponse>;
    throw axiosError.response?.data || { message: 'Login failed' };
  }
};

export const logout = (): void => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = '/login';
};

// ============================================
// SERVICE API CALLS
// ============================================

export const createService = async (serviceData: {
  title: string;
  description: string;
  price: number;
  duration: number;
  category: string;
  status?: 'active' | 'inactive';
}): Promise<ServiceResponse> => {
  try {
    const response = await api.post<ServiceResponse>('/services', serviceData);
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<ErrorResponse>;
    throw axiosError.response?.data || { message: 'Failed to create service' };
  }
};

export const getAllServices = async (filters?: {
  category?: string;
  status?: string;
  minPrice?: number;
  maxPrice?: number;
}): Promise<ServicesResponse> => {
  try {
    const queryString = filters ? new URLSearchParams(filters as any).toString() : '';
    const url = queryString ? `/services?${queryString}` : '/services';
    
    const response = await api.get<ServicesResponse>(url);
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<ErrorResponse>;
    throw axiosError.response?.data || { message: 'Failed to fetch services' };
  }
};

export const getMyServices = async (): Promise<ServicesResponse> => {
  try {
    const response = await api.get<ServicesResponse>('/services/my-services');
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<ErrorResponse>;
    throw axiosError.response?.data || { message: 'Failed to fetch your services' };
  }
};

export const getServiceById = async (id: string): Promise<ServiceResponse> => {
  try {
    const response = await api.get<ServiceResponse>(`/services/${id}`);
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<ErrorResponse>;
    throw axiosError.response?.data || { message: 'Failed to fetch service' };
  }
};

export const updateService = async (
  id: string,
  serviceData: Partial<{
    title: string;
    description: string;
    price: number;
    duration: number;
    category: string;
    status: 'active' | 'inactive';
  }>
): Promise<ServiceResponse> => {
  try {
    const response = await api.put<ServiceResponse>(`/services/${id}`, serviceData);
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<ErrorResponse>;
    throw axiosError.response?.data || { message: 'Failed to update service' };
  }
};

export const deleteService = async (id: string): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await api.delete<{ success: boolean; message: string }>(`/services/${id}`);
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<ErrorResponse>;
    throw axiosError.response?.data || { message: 'Failed to delete service' };
  }
};

// ============================================
// HELPER FUNCTIONS
// ============================================

export const isAuthenticated = (): boolean => {
  return !!localStorage.getItem('token');
};

export const getCurrentUser = (): User | null => {
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
};

export const isVendor = (): boolean => {
  const user = getCurrentUser();
  return user?.role === 'vendor';
};

export const isClient = (): boolean => {
  const user = getCurrentUser();
  return user?.role === 'client';
};

export const isAdmin = (): boolean => {
  const user = getCurrentUser();
  return user?.role === 'admin';
};

export default api;