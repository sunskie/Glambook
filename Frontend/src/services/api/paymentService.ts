import api from '../../utils/api';

export const initiatePayment = async (
  bookingId: string,
  totalAmount: number,
  termsAccepted: boolean
) => {
  const response = await api.post('/payments/initiate', {
    bookingId,
    totalAmount,
    termsAccepted,
  });
  console.log('Raw API response:', response);
  return response;
};

export const initiateCoursePayment = async (
  enrollmentId: string,
  totalAmount: number,
  termsAccepted: boolean
) => {
  const response = await api.post('/payments/course/initiate', {
    enrollmentId,
    totalAmount,
    termsAccepted,
  });
  return response;
};

export const verifyPayment = async (data: string, type: string, id: string) => {
  const response = await api.get(`/payments/verify?data=${encodeURIComponent(data)}&type=${type}&id=${id}`);
  return response;
};

export const submitEsewaForm = (esewaPayload: Record<string, string | number>) => {
  const form = document.createElement('form');
  form.method = 'POST';
  form.action = 'https://rc-epay.esewa.com.np/api/epay/main/v2/form';
  Object.entries(esewaPayload).forEach(([key, value]) => {
    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = key;
    input.value = String(value);
    form.appendChild(input);
  });
  document.body.appendChild(form);
  form.submit();
};
