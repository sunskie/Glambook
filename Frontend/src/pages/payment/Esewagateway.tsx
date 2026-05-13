import api from "@/utils/api";
import BookingManagement from "../admin/BookingManagement"; 
const handlePay = async () => {
  try {
    const res = await api.post('/payment/esewa/initiate', {
      amount: 1000,
      bookingId: (BookingManagement as any)?.selectedBooking?._id,
    });

    const data = res.data;

    const form = document.createElement('form');
    form.method = 'POST';
    form.action = 'https://rc-epay.esewa.com.np/api/epay/main/v2/form';

    Object.entries(data).forEach(([key, value]) => {
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = key;
      input.value = String(value);
      form.appendChild(input);
    });

    document.body.appendChild(form);
    form.submit();
  } catch (error) {
    console.error('Payment initiation failed:', error);
  }
};