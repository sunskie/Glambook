import api from '../../utils/api';

export const paymentService = {
  initiatePayment: async (type: 'booking' | 'enrollment', id: string, amount: number) => {
    const res = await api.post('/payment/initiate', { type, id, amount });
    return res.data; // { paymentData, esewaUrl }
  },

  verifyPayment: async (data: string, type: string, id: string) => {
    const res = await api.get(`/payment/verify?data=${encodeURIComponent(data)}&type=${type}&id=${id}`);
    return res;
  },

  getPaymentStatus: async (type: string, id: string) => {
    const res = await api.get(`/payment/status/${type}/${id}`);
    return res.data;
  },
};
