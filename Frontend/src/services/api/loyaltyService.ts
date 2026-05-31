import api from '../../utils/api';
export const loyaltyService = {
  getBalance: async () => {
    const res = await api.get('/loyalty/balance');
    return res.data;
  },
};
