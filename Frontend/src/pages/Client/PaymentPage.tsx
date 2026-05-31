import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { initiatePayment, submitEsewaForm } from '../../services/api/paymentService';

const PaymentPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as any;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const bookingId = state?.bookingId;
  const totalAmount = state?.totalAmount || 0;
  const serviceName = state?.serviceName || 'Service';
  const bookingDate = state?.bookingDate || '';
  const bookingTime = state?.bookingTime || '';

  const advanceAmount = Math.round(totalAmount * 0.15);
  const remainingAmount = totalAmount - advanceAmount;

  // Guard: Check for booking data on mount
  if (!bookingId || !totalAmount) {
    return (
      <div style={{
        maxWidth: '600px',
        margin: '60px auto',
        padding: '32px',
        background: 'rgba(255,255,255,0.05)',
        borderRadius: '16px',
        textAlign: 'center',
        color: 'white',
      }}>
        <h2 style={{ color: '#ef4444', marginBottom: '8px' }}>No Booking Found</h2>
        <p style={{ color: '#9ca3af', marginBottom: '24px' }}>
          Please create a booking first before proceeding to payment.
        </p>
        <button
          onClick={() => navigate('/client/browse/services')}
          style={{
            background: '#6366f1',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            padding: '12px 32px',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: '600',
          }}
        >
          Browse Services
        </button>
      </div>
    );
  }

  const handleEsewaPayment = async () => {
    try {
      setLoading(true);
      setError('');

      console.log('Initiating payment with:', { bookingId, totalAmount });
      const res = await initiatePayment(bookingId, totalAmount, true);
      const response = (res as any)?.data || res;

      console.log('Payment response:', response);

      if (!response) {
        throw new Error('No response received from payment service');
      }

      if (!response.success) {
        throw new Error(response.message || 'Failed to initiate payment');
      }

      if (!response.esewaPayload) {
        throw new Error('No payment form data received');
      }

      console.log('eSewa Payload:', response.esewaPayload);

      localStorage.setItem('pendingBookingId', bookingId);
      submitEsewaForm(response.esewaPayload);

    } catch (err: any) {
      console.error('Payment error:', err);
      const errorMsg = err.response?.data?.message || err.message || 'Payment initiation failed. Please try again.';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handlePayLater = () => {
    navigate('/client/bookings');
  };

  if (error) {
    return (
      <div style={{
        maxWidth: '600px',
        margin: '60px auto',
        padding: '32px',
        background: 'rgba(255,255,255,0.05)',
        borderRadius: '16px',
        textAlign: 'center',
        color: '#ef4444',
      }}>
        <h2>⚠️ Payment Error</h2>
        <p style={{ color: '#fca5a5', marginBottom: '24px' }}>{error}</p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <button
            onClick={() => setError('')}
            style={{
              background: '#6366f1',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              padding: '12px 32px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: '600',
            }}
          >
            Try Again
          </button>
          <button
            onClick={() => navigate('/client/bookings')}
            style={{
              background: 'transparent',
              color: '#9ca3af',
              border: '1px solid #374151',
              borderRadius: '8px',
              padding: '12px 32px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: '600',
            }}
          >
            Back to Bookings
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      maxWidth: '600px',
      margin: '60px auto',
      padding: '32px',
      background: 'rgba(255,255,255,0.02)',
      color: 'white',
      fontFamily: 'Montserrat, sans-serif',
    }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{
          fontSize: '28px',
          fontWeight: '600',
          marginBottom: '8px',
          color: '#ffffff',
        }}>
          Complete Payment
        </h1>
        <p style={{
          fontSize: '14px',
          color: '#9ca3af',
          marginBottom: '0px',
        }}>
          Your booking has been created. Complete payment to confirm it.
        </p>
      </div>

      {/* Payment Breakdown Card */}
      <div style={{
        background: 'rgba(255,255,255,0.05)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '12px',
        padding: '24px',
        marginBottom: '24px',
      }}>
        <h3 style={{
          fontSize: '16px',
          fontWeight: '600',
          color: '#ffffff',
          marginBottom: '16px',
          marginTop: '0px',
        }}>
          Booking Details
        </h3>

        <div style={{ marginBottom: '16px' }}>
          <p style={{ color: '#9ca3af', fontSize: '13px', margin: '0 0 4px 0' }}>Service</p>
          <p style={{ color: '#ffffff', fontSize: '15px', margin: '0px', fontWeight: '500' }}>
            {serviceName}
          </p>
        </div>

        <div style={{ marginBottom: '16px' }}>
          <p style={{ color: '#9ca3af', fontSize: '13px', margin: '0 0 4px 0' }}>Date & Time</p>
          <p style={{ color: '#ffffff', fontSize: '15px', margin: '0px', fontWeight: '500' }}>
            {new Date(bookingDate).toLocaleDateString('en-US', {
              weekday: 'short',
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            })}{' '}
            at {bookingTime}
          </p>
        </div>

        <hr style={{
          border: 'none',
          borderTop: '1px solid rgba(255,255,255,0.1)',
          margin: '16px 0',
        }} />

        {/* Amount Breakdown */}
        <div style={{ marginBottom: '12px', display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: '#9ca3af', fontSize: '14px' }}>Total Amount</span>
          <span style={{ color: '#ffffff', fontSize: '14px', fontWeight: '600' }}>
            Rs. {totalAmount.toLocaleString()}
          </span>
        </div>

        <div style={{
          marginBottom: '12px',
          display: 'flex',
          justifyContent: 'space-between',
          padding: '12px',
          background: 'rgba(34, 197, 94, 0.1)',
          borderRadius: '8px',
          border: '1px solid rgba(34, 197, 94, 0.2)',
        }}>
          <span style={{ color: '#86efac', fontSize: '14px', fontWeight: '600' }}>
            Advance Payment (15%)
          </span>
          <span style={{ color: '#22c55e', fontSize: '14px', fontWeight: '700' }}>
            Rs. {advanceAmount.toLocaleString()}
          </span>
        </div>

        <div style={{ marginBottom: '0px', display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: '#9ca3af', fontSize: '14px' }}>Remaining (Pay at Salon)</span>
          <span style={{ color: '#fbbf24', fontSize: '14px', fontWeight: '600' }}>
            Rs. {remainingAmount.toLocaleString()}
          </span>
        </div>
      </div>

      {/* eSewa Test Credentials */}
      <div style={{
        background: 'rgba(251, 191, 36, 0.1)',
        border: '1px solid rgba(251, 191, 36, 0.3)',
        borderRadius: '12px',
        padding: '16px',
        marginBottom: '24px',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: '12px',
        }}>
          <span style={{ fontSize: '20px' }}>🔑</span>
          <div>
            <p style={{
              color: '#fbbf24',
              fontSize: '13px',
              fontWeight: '600',
              margin: '0 0 8px 0',
            }}>
              eSewa Test Mode
            </p>
            <p style={{
              color: '#fcd34d',
              fontSize: '12px',
              margin: '0 0 6px 0',
              lineHeight: '1.5',
            }}>
              <strong>eSewa ID:</strong> 9806800001
            </p>
            <p style={{
              color: '#fcd34d',
              fontSize: '12px',
              margin: '0 0 6px 0',
              lineHeight: '1.5',
            }}>
              <strong>Password:</strong> Nepal@123
            </p>
            <p style={{
              color: '#d97706',
              fontSize: '11px',
              margin: '0px',
              lineHeight: '1.4',
            }}>
              These are official eSewa sandbox test accounts.
            </p>
          </div>
        </div>
      </div>

      {/* Non-Refundable Warning */}
      <div style={{
        background: 'rgba(239, 68, 68, 0.1)',
        border: '1px solid rgba(239, 68, 68, 0.3)',
        borderRadius: '12px',
        padding: '12px',
        marginBottom: '24px',
        fontSize: '13px',
        color: '#fca5a5',
      }}>
        ⚠️ The advance payment is <strong>non-refundable</strong> once confirmed.
      </div>

      {/* Payment Buttons */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '12px',
      }}>
        <button
          onClick={handleEsewaPayment}
          disabled={loading}
          style={{
            background: loading ? '#9ca3af' : '#22c55e',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            padding: '14px 16px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: '14px',
            fontWeight: '600',
            fontFamily: 'Montserrat, sans-serif',
            transition: 'background 0.3s',
          }}
          onMouseEnter={(e) => {
            if (!loading) (e.target as HTMLButtonElement).style.background = '#16a34a';
          }}
          onMouseLeave={(e) => {
            if (!loading) (e.target as HTMLButtonElement).style.background = '#22c55e';
          }}
        >
          {loading ? 'Processing...' : `Pay Rs. ${advanceAmount.toLocaleString()} with eSewa`}
        </button>

        <button
          onClick={handlePayLater}
          disabled={loading}
          style={{
            background: 'transparent',
            color: '#9ca3af',
            border: '1px solid #374151',
            borderRadius: '8px',
            padding: '14px 16px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: '14px',
            fontWeight: '600',
            fontFamily: 'Montserrat, sans-serif',
            transition: 'all 0.3s',
          }}
          onMouseEnter={(e) => {
            if (!loading) {
              (e.target as HTMLButtonElement).style.borderColor = '#6b7280';
              (e.target as HTMLButtonElement).style.color = '#e5e7eb';
            }
          }}
          onMouseLeave={(e) => {
            if (!loading) {
              (e.target as HTMLButtonElement).style.borderColor = '#374151';
              (e.target as HTMLButtonElement).style.color = '#9ca3af';
            }
          }}
        >
          Pay Later (Pending)
        </button>
      </div>
    </div>
  );
};

export default PaymentPage;
