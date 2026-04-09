// Frontend/src/services/api/serviceService.ts
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
  total: number;
  page: number;
  totalPages: number;
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
  search?: string;
}

class ServiceService {
  async createService(data: CreateServiceData): Promise<ServiceResponse> {
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

    const response: any = await api.post('/services', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response;
  }

  async getMyServices(page: number = 1): Promise<ServicesResponse> {
    const response: any = await api.get(`/services/my-services?page=${page}&limit=6`);
    return response;
  }

  async getAllServices(filters?: ServiceFilters, page: number = 1): Promise<ServicesResponse> {
    const params: any = { ...filters, page, limit: 9 };
    
    // Remove undefined values
    Object.keys(params).forEach(key => {
      if (params[key] === undefined || params[key] === null || params[key] === '') {
        delete params[key];
      }
    });
    
    const queryString = new URLSearchParams(params).toString();
    const url = `/services${queryString ? `?${queryString}` : ''}`;
    
    const response: any = await api.get(url);
    return response;
  }

  async getServiceById(id: string): Promise<ServiceResponse> {
    const response: any = await api.get(`/services/${id}`);
    return response;
  }

  async updateService(id: string, data: UpdateServiceData): Promise<ServiceResponse> {
    const formData = new FormData();
    
    if (data.title) formData.append('title', data.title);
    if (data.description) formData.append('description', data.description);
    if (data.price !== undefined) formData.append('price', data.price.toString());
    if (data.duration !== undefined) formData.append('duration', data.duration.toString());
    if (data.category) formData.append('category', data.category);
    if (data.status) formData.append('status', data.status);
    if (data.image) formData.append('image', data.image);

    const response: any = await api.put(`/services/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response;
  }

  async deleteService(id: string): Promise<DeleteResponse> {
    const response: any = await api.delete(`/services/${id}`);
    return response;
  }
}

export default new ServiceService();