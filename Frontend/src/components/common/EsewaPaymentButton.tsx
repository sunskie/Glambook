import React, { useState } from 'react';
import { paymentService } from '../../services/api/paymentService';
import showToast from './Toast';

interface Props {
  type: 'booking' | 'enrollment';
  id: string;
  amount: number;
  disabled?: boolean;
}

const EsewaPaymentButton: React.FC<Props> = ({ type, id, amount, disabled }) => {
  const [loading, setLoading] = useState(false);

  const handlePay = async () => {
    if (disabled || loading) return;
    try {
      setLoading(true);
      const { paymentData, esewaUrl } = await paymentService.initiatePayment(type, id, amount);

      // Build and submit hidden form to eSewa
      const form = document.createElement('form');
      form.method = 'POST';
      form.action = esewaUrl;
      form.style.display = 'none';

      Object.entries(paymentData).forEach(([key, value]) => {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = key;
        input.value = String(value);
        form.appendChild(input);
      });

      document.body.appendChild(form);
      form.submit();
    } catch (err: any) {
      setLoading(false);
      showToast.error(err.message || 'Failed to initiate payment');
    }
  };

  return (
    <button
      onClick={handlePay}
      disabled={loading || disabled}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '12px',
        width: '100%',
        padding: '14px 24px',
        backgroundColor: loading || disabled ? '#9ca3af' : '#60BB46',
        color: 'white',
        border: 'none',
        borderRadius: '12px',
        fontWeight: 700,
        fontSize: '15px',
        cursor: loading || disabled ? 'not-allowed' : 'pointer',
        fontFamily: 'Montserrat, sans-serif',
        transition: 'background-color 0.2s',
      }}
      onMouseEnter={(e) => { if (!loading && !disabled) e.currentTarget.style.backgroundColor = '#4fa832'; }}
      onMouseLeave={(e) => { if (!loading && !disabled) e.currentTarget.style.backgroundColor = '#60BB46'; }}
    >
      {loading ? (
        <>
          <div style={{ width: '18px', height: '18px', border: '2px solid rgba(255,255,255,0.4)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
          Redirecting to eSewa...
        </>
      ) : (
        <>
          <span style={{ fontSize: '20px' }}>💚</span>
          Pay Rs. {amount?.toLocaleString()} with eSewa
        </>
      )}
    </button>
  );
};

export default EsewaPaymentButton;
