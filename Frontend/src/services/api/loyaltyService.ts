import api from '../../utils/api';
export const loyaltyService = {
  getBalance: async () => {
    const res = await api.get('/loyalty/balance');
    return res.data;
  },
  redeemPoints: async (pointsToRedeem: number, bookingId: string) => {
    const res = await api.post('/loyalty/redeem', { pointsToRedeem, bookingId });
    return res.data;
  },
};
