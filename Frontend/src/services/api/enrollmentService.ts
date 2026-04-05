// Frontend/src/services/api/enrollmentService.ts
import api from '../../utils/api';

export interface CreateEnrollmentData {
  courseId: string;
  selectedBatchId?: string;
  clientName: string;
  clientPhone: string;
  clientEmail: string;
}

const enrollmentService = {
  // Create enrollment
  createEnrollment: async (enrollmentData: CreateEnrollmentData) => {
    const response = await api.post('/enrollments', enrollmentData);
    return response;
  },

  // Get client's enrollments (My Courses)
  getClientEnrollments: async (status?: string) => {
    const url = status ? `/enrollments/my-enrollments?status=${status}` : '/enrollments/my-enrollments';
    const response = await api.get(url);
    return response.data;
  },

  // Get single enrollment (for learning dashboard)
  getEnrollmentById: async (id: string) => {
    const response = await api.get(`/enrollments/${id}`);
    return response.data;
  },

  // Update lesson progress
  updateLessonProgress: async (enrollmentId: string, lessonData: {
    lessonId: string;
    completed: boolean;
    timeSpent?: number;
  }) => {
    const response = await api.patch(`/enrollments/${enrollmentId}/lesson-progress`, lessonData);
    return response;
  },

  // Cancel enrollment
  cancelEnrollment: async (id: string) => {
    const response = await api.patch(`/enrollments/${id}/cancel`);
    return response;
  },

  // Get vendor's students
  getVendorEnrollments: async (filters?: { status?: string; courseId?: string }) => {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.courseId) params.append('courseId', filters.courseId);
    
    const queryString = params.toString();
    const url = queryString ? `/enrollments/vendor/students?${queryString}` : '/enrollments/vendor/students';
    
    const response = await api.get(url);
    return response.data;
  },

  // Update enrollment status (Vendor)
  updateEnrollmentStatus: async (id: string, status: string) => {
    const response = await api.patch(`/enrollments/${id}/status`, { status });
    return response;
  },

  // Mark attendance (Vendor)
  markAttendance: async (enrollmentId: string, attendanceData: {
    date: string;
    attended: boolean;
    notes?: string;
  }) => {
    const response = await api.patch(`/enrollments/${enrollmentId}/attendance`, attendanceData);
    return response;
  },

  // Update payment status
  updatePaymentStatus: async (id: string, paymentStatus: string) => {
    const response = await api.patch(`/enrollments/${id}/payment`, { paymentStatus });
    return response;
  },
};

export default enrollmentService;