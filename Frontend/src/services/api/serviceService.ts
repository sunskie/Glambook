import api from '../../utils/api';
import { Service } from '../../types';

interface CreateServiceData {
  title: string;
  description: string;
  price: number;
  duration: number;
  category: string;
  status?: 'active' | 'inactive';
  image?: File | null;
}

interface UpdateServiceData {
  title?: string;
  description?: string;
  price?: number;
  duration?: number;
  category?: string;
  status?: 'active' | 'inactive';
  image?: File | null;
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

class ServiceService {
  async createService(data: CreateServiceData): Promise<ServiceResponse> {
    try {
      const formData = new FormData();
      formData.append('title', data.title);
      formData.append('description', data.description);
      formData.append('price', data.price.toString());
      formData.append('duration', data.duration.toString());
      formData.append('category', data.category);
      if (data.status) {
        formData.append('status', data.status);
      }
      if (data.image) {
        formData.append('image', data.image);
      }

      const response = await api.post<ServiceResponse>('/services', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to create service');
    }
  }

  async getMyServices(): Promise<ServicesResponse> {
    try {
      const response = await api.get<ServicesResponse>('/services/my-services');
      return response;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch services');
    }
  }

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

  async getServiceById(id: string): Promise<ServiceResponse> {
    try {
      const response = await api.get<ServiceResponse>(`/services/${id}`);
      return response;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch service');
    }
  }

  async updateService(id: string, data: UpdateServiceData): Promise<ServiceResponse> {
    try {
      const formData = new FormData();
      
      if (data.title) formData.append('title', data.title);
      if (data.description) formData.append('description', data.description);
      if (data.price) formData.append('price', data.price.toString());
      if (data.duration) formData.append('duration', data.duration.toString());
      if (data.category) formData.append('category', data.category);
      if (data.status) formData.append('status', data.status);
      if (data.image) formData.append('image', data.image);

      const response = await api.put<ServiceResponse>(`/services/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update service');
    }
  }

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