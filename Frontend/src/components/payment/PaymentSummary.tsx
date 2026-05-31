import { useState } from 'react';

interface PaymentSummaryProps {
  totalAmount: number;
  onProceed: (termsAccepted: boolean) => void;
}

const PaymentSummary = ({ totalAmount, onProceed }: PaymentSummaryProps) => {
  const [termsAccepted, setTermsAccepted] = useState(false);
  const advanceAmount = Math.round(totalAmount * 0.15);
  const remainingAmount = totalAmount - advanceAmount;

  return (
    <div style={{
      padding: '24px',
      backgroundColor: '#1e1b4b',
      borderRadius: '12px',
      color: 'white',
      fontFamily: 'Montserrat, sans-serif',
    }}>
      <h3 style={{ margin: '0 0 20px', fontSize: '20px', fontWeight: 600 }}>Payment Breakdown</h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: '#9CA3AF', fontSize: '14px' }}>Total Service Amount</span>
          <span style={{ fontSize: '16px', fontWeight: 500 }}>Rs. {totalAmount.toLocaleString()}</span>
        </div>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '12px',
          backgroundColor: 'rgba(233, 30, 99, 0.1)',
          borderRadius: '8px',
          border: '1px solid rgba(233, 30, 99, 0.3)',
        }}>
          <div>
            <span style={{ color: '#E91E63', fontSize: '14px', fontWeight: 600 }}>Advance Payment (15%)</span>
            <div style={{ color: '#9CA3AF', fontSize: '12px', marginTop: '2px' }}>Pay Online Now</div>
          </div>
          <span style={{ color: '#E91E63', fontSize: '18px', fontWeight: 700 }}>Rs. {advanceAmount.toLocaleString()}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: '#9CA3AF', fontSize: '14px' }}>Remaining Amount</span>
          <span style={{ fontSize: '16px', fontWeight: 500, color: '#6B7280' }}>Rs. {remainingAmount.toLocaleString()}</span>
        </div>
        <div style={{ color: '#6B7280', fontSize: '12px', textAlign: 'right' }}>Pay at Salon</div>
      </div>

      <div style={{
        padding: '12px',
        backgroundColor: 'rgba(251, 191, 36, 0.1)',
        borderRadius: '8px',
        border: '1px solid rgba(251, 191, 36, 0.3)',
        marginBottom: '20px',
      }}>
        <span style={{ color: '#FBBF24', fontSize: '13px' }}>
          ⚠️ The advance payment of Rs. {advanceAmount.toLocaleString()} is <strong>non-refundable</strong> once confirmed.
        </span>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', cursor: 'pointer' }}>
          <input
            type="checkbox"
            id="terms"
            checked={termsAccepted}
            onChange={e => setTermsAccepted(e.target.checked)}
            style={{ marginTop: '4px', width: '18px', height: '18px', cursor: 'pointer' }}
          />
          <span style={{ fontSize: '13px', color: '#D1D5DB', lineHeight: '1.5' }}>
            I agree to the{' '}
            <a
              href="/terms-and-conditions"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: '#E91E63', textDecoration: 'underline' }}
            >
              Terms & Conditions
            </a>
            {' '}including the non-refundable advance payment policy.
          </span>
        </label>
      </div>

      <button
        onClick={() => onProceed(termsAccepted)}
        disabled={!termsAccepted}
        style={{
          width: '100%',
          padding: '14px',
          backgroundColor: termsAccepted ? '#E91E63' : '#374151',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          fontWeight: 600,
          fontSize: '15px',
          cursor: termsAccepted ? 'pointer' : 'not-allowed',
          transition: 'background 0.2s',
          fontFamily: 'Montserrat, sans-serif',
        }}
      >
        Pay Rs. {advanceAmount.toLocaleString()} via eSewa
      </button>
    </div>
  );
};

export default PaymentSummary;
