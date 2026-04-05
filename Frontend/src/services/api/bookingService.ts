import api from '../../utils/api';

export interface CreateBookingData {
  serviceId: string;
  bookingDate: string;
  bookingTime: string;
  clientName: string;
  clientPhone: string;
  clientEmail: string;
  specialRequests?: string;
}

// POST /bookings
export const createBooking = async (data: CreateBookingData) => {
  const response: any = await api.post('/bookings', data);
  return response;
};

// GET /bookings/my-bookings
export const getClientBookings = async (params?: { status?: string }) => {
  const queryParams: Record<string, string> = {};
  if (params?.status && params.status !== 'all') {
    queryParams.status = params.status;
  }
  const response: any = await api.get('/bookings/my-bookings', { params: queryParams });
  return response;
};

// GET /bookings/:id
export const getBookingById = async (id: string) => {
  const response: any = await api.get(`/bookings/${id}`);
  return response;
};

// PATCH /bookings/:id/cancel
export const cancelBooking = async (id: string) => {
  const response: any = await api.patch(`/bookings/${id}/cancel`);
  return response;
};