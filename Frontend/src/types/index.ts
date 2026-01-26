import React from 'react';

// User Types
export interface User {
  _id: string;
  id?: string;
  name: string;
  email: string;
  role: 'client' | 'vendor' | 'admin';
  createdAt?: string;
}

// Auth Types
export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterData {
  name: string;
  email: string;
  mobileNumber: string;
  password: string;
  confirmPassword: string;
  role: 'client' | 'vendor';
  agreeToTerms: boolean;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  token?: string;
  user?: User;
}

// Component Props
export interface InputFieldProps {
  type?: string;
  placeholder?: string;
  icon?: React.ReactNode;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  name?: string;
  required?: boolean;
  disabled?: boolean;
  error?: string;
}

export interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  variant?: 'primary' | 'secondary' | 'outline';
  disabled?: boolean;
  fullWidth?: boolean;
  loading?: boolean;
}

export interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (userData: User, token: string) => void;
  logout: () => void;
}

// API Response
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}
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