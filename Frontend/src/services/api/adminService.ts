// Frontend/src/services/api/adminService.ts
// Uses the shared api instance which auto-unwraps response.data
// So all functions return the backend JSON directly (no extra .data wrapper)

import api from '../../utils/api';

// ─── Dashboard ───────────────────────────────────────────────
export const getDashboardStats = () => {
  return api.get('/admin/dashboard/stats');
};

// ─── User Management ─────────────────────────────────────────
export const getAllUsers = (params?: {
  search?: string;
  role?: string;
  status?: string;
  page?: number;
  limit?: number;
}) => {
  // Strip empty string values so backend filter doesn't receive ''
  const cleanParams: Record<string, any> = {};
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') {
        cleanParams[k] = v;
      }
    });
  }
  return api.get('/admin/users', { params: cleanParams });
};

export const getUserById = (id: string) => {
  return api.get(`/admin/users/${id}`);
};

export const updateUserStatus = (id: string, isActive: boolean) => {
  return api.patch(`/admin/users/${id}/status`, { isActive });
};

export const deleteUser = (id: string) => {
  return api.delete(`/admin/users/${id}`);
};

// ─── Vendor Management ───────────────────────────────────────
export const getAllVendors = (params?: {
  search?: string;
  status?: string;
  approved?: string;
  page?: number;
  limit?: number;
}) => {
  const cleanParams: Record<string, any> = {};
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') {
        cleanParams[k] = v;
      }
    });
  }
  return api.get('/admin/vendors', { params: cleanParams });
};

export const approveVendor = (id: string) => {
  return api.patch(`/admin/vendors/${id}/approve`, {});
};

export const rejectVendor = (id: string) => {
  return api.patch(`/admin/vendors/${id}/reject`, {});
};

// ─── Service Management ──────────────────────────────────────
export const getAllServicesAdmin = (params?: {
  search?: string;
  vendor?: string;
  category?: string;
  status?: string;
  page?: number;
  limit?: number;
}) => {
  const cleanParams: Record<string, any> = {};
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') {
        cleanParams[k] = v;
      }
    });
  }
  return api.get('/admin/services', { params: cleanParams });
};

export const updateServiceStatus = (id: string, status: string) => {
  return api.patch(`/admin/services/${id}/status`, { status });
};

export const deleteServiceAdmin = (id: string) => {
  return api.delete(`/admin/services/${id}`);
};

// ─── Booking Management ──────────────────────────────────────
export const getAllBookingsAdmin = (params?: {
  search?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
}) => {
  const cleanParams: Record<string, any> = {};
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') {
        cleanParams[k] = v;
      }
    });
  }
  return api.get('/admin/bookings', { params: cleanParams });
};

// ─── Course Management ───────────────────────────────────────
export const getAllCoursesAdmin = (params?: {
  search?: string;
  vendor?: string;
  category?: string;
  status?: string;
  page?: number;
  limit?: number;
}) => {
  const cleanParams: Record<string, any> = {};
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') {
        cleanParams[k] = v;
      }
    });
  }
  return api.get('/admin/courses', { params: cleanParams });
};

export const approveCourse = (id: string) => {
  return api.patch(`/admin/courses/${id}/approve`, {});
};

export const rejectCourse = (id: string) => {
  return api.patch(`/admin/courses/${id}/reject`, {});
};

export const deleteCourseAdmin = (id: string) => {
  return api.delete(`/admin/courses/${id}`);
};

// ─── Enrollment Management ───────────────────────────────────
export const getAllEnrollmentsAdmin = (params?: {
  search?: string;
  status?: string;
  course?: string;
  page?: number;
  limit?: number;
}) => {
  const cleanParams: Record<string, any> = {};
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') {
        cleanParams[k] = v;
      }
    });
  }
  return api.get('/admin/enrollments', { params: cleanParams });
};

// ─── Default export as object ────────────────────────────────
const adminService = {
  getDashboardStats,
  getAllUsers,
  getUserById,
  updateUserStatus,
  deleteUser,
  getAllVendors,
  approveVendor,
  rejectVendor,
  getAllServicesAdmin,
  updateServiceStatus,
  deleteServiceAdmin,
  getAllBookingsAdmin,
  getAllCoursesAdmin,
  approveCourse,
  rejectCourse,
  deleteCourseAdmin,
  getAllEnrollmentsAdmin,
};

export default adminService;