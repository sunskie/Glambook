// Frontend/src/types/index.ts
import React from 'react';

// User Types
export interface User {
  _id: string;
  id?: string;
  name: string;
  email: string;
  role: 'client' | 'vendor' | 'admin';
  phone?: string;
  createdAt?: string;
  updatedAt?: string;
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
  phone?: string;
  password: string;
  role: 'client' | 'vendor';
}

export interface AuthResponse {
  success: boolean;
  message: string;
  token?: string;
  user?: User;
}

// Service Types
export interface Service {
  _id: string;
  title: string;
  description: string;
  price: number;
  duration: number;
  category: string;
  status: 'active' | 'inactive';
  rating?: number;
  reviewCount?: number;
  vendorId: string | {
    _id: string;
    name: string;
    email: string;
    phone?: string;
  };
  imageUrl?: string | null;
  createdAt: string;
  updatedAt: string;
}

// Booking Types
export interface Booking {
  _id: string;
  serviceId: string | {
    _id: string;
    title: string;
    category: string;
    imageUrl: string | null;
    price: number;
    duration: number;
  };
  clientId: string | {
    _id: string;
    name: string;
    email: string;
    phone?: string;
  };
  vendorId: string | {
    _id: string;
    name: string;
    email: string;
    phone?: string;
  };
  bookingDate: string;
  bookingTime: string;
  duration: number;
  totalPrice: number;
  clientName: string;
  clientPhone: string;
  clientEmail: string;
  specialRequests?: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  createdAt: string;
  updatedAt: string;
}

// Component Props
export interface InputFieldProps {
  type?: string;
  placeholder?: string;
  icon?: React.ReactNode;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  name?: string;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  maxLength?: number;
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

export interface AuthContextType {
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

// API Response
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}
