// ============================================
// SERVICE API SERVICE
// ============================================
// All service-related API calls

import api from '../../utils/api';
import { Service } from '../../types';

// ============================================
// TYPE DEFINITIONS
// ============================================

interface CreateServiceData {
  title: string;
  description: string;
  price: number;
  duration: number;
  category: string;
  status?: 'active' | 'inactive';
}

interface UpdateServiceData {
  title?: string;
  description?: string;
  price?: number;
  duration?: number;
  category?: string;
  status?: 'active' | 'inactive';
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

interface DeleteResponse {
  success: boolean;
  message: string;
}

interface ServiceFilters {
  category?: string;
  status?: string;
  minPrice?: number;
  maxPrice?: number;
}

// ============================================
// SERVICE API CLASS
// ============================================

class ServiceService {
  // ──────────────────────────────────────
  // CREATE SERVICE (Vendor only)
  // ──────────────────────────────────────
  async createService(data: CreateServiceData): Promise<ServiceResponse> {
    try {
      const response = await api.post<ServiceResponse>('/services', data);
      return response;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to create service');
    }
  }

  // ──────────────────────────────────────
  // GET VENDOR'S OWN SERVICES
  // ──────────────────────────────────────
  async getMyServices(): Promise<ServicesResponse> {
    try {
      const response = await api.get<ServicesResponse>('/services/my-services');
      return response;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch services');
    }
  }

  // ──────────────────────────────────────
  // GET ALL SERVICES (with filters)
  // ──────────────────────────────────────
  async getAllServices(filters?: ServiceFilters): Promise<ServicesResponse> {
    try {
      const queryString = filters ? new URLSearchParams(filters as any).toString() : '';
      const url = queryString ? `/services?${queryString}` : '/services';
      
      const response = await api.get<ServicesResponse>(url);
      return response;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch services');
    }
  }

  // ──────────────────────────────────────
  // GET SINGLE SERVICE BY ID
  // ──────────────────────────────────────
  async getServiceById(id: string): Promise<ServiceResponse> {
    try {
      const response = await api.get<ServiceResponse>(`/services/${id}`);
      return response;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch service');
    }
  }

  // ──────────────────────────────────────
  // UPDATE SERVICE
  // ──────────────────────────────────────
  async updateService(id: string, data: UpdateServiceData): Promise<ServiceResponse> {
    try {
      const response = await api.put<ServiceResponse>(`/services/${id}`, data);
      return response;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update service');
    }
  }

  // ──────────────────────────────────────
  // DELETE SERVICE
  // ──────────────────────────────────────
  async deleteService(id: string): Promise<DeleteResponse> {
    try {
      const response = await api.delete<DeleteResponse>(`/services/${id}`);
      return response;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to delete service');
    }
  }
}

export default new ServiceService();