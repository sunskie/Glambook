import api from '../../utils/api';

class VendorBookingService {
  async getVendorBookings(params?: { status?: string; page?: number }) {
    return await api.get('/vendor/bookings', { params }) as any;
  }

  async getBookingStats() {
    return await api.get('/vendor/bookings/stats') as any;
  }

  async updateBookingStatus(bookingId: string, status: string) {
    return await api.patch(`/vendor/bookings/${bookingId}/status`, { status }) as any;
  }
}

export default new VendorBookingService();