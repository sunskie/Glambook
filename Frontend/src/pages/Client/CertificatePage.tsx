// Frontend/src/pages/Client/CertificatePage.tsx
import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import quizService from '../../services/api/quizService';

interface CertificateData {
  certificateId: string;
  studentName: string;
  courseName: string;
  score: number;
  issuedDate: string;
  verified: boolean;
}

const PRIMARY = '#5B62B3';
const PINK = '#E91E63';

const CertificatePage: React.FC = () => {
  const { certificateId } = useParams<{ certificateId: string }>();
  const [certificate, setCertificate] = useState<CertificateData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const certRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (certificateId) {
      loadCertificate();
    }
  }, [certificateId]);

  const loadCertificate = async () => {
    try {
      setLoading(true);
      const res = await quizService.verifyCertificate(certificateId!);
      setCertificate(res);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Certificate not found');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const verifyUrl = `${window.location.origin}/certificate/${certificateId}`;

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', fontFamily: 'Montserrat, sans-serif', backgroundColor: '#F8F9FA' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '48px', height: '48px', border: `4px solid #EEF0FF`, borderTop: `4px solid ${PRIMARY}`, borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }} />
          <p style={{ color: '#666' }}>Loading certificate...</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  if (error || !certificate) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', fontFamily: 'Montserrat, sans-serif', backgroundColor: '#F8F9FA', padding: '24px' }}>
        <div style={{ backgroundColor: 'white', borderRadius: '20px', padding: '48px', maxWidth: '460px', width: '100%', textAlign: 'center', boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>
          <div style={{ fontSize: '64px', marginBottom: '20px' }}>🔍</div>
          <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#111', marginBottom: '12px' }}>Certificate Not Found</h2>
          <p style={{ color: '#666', lineHeight: '1.6' }}>{error || 'This certificate ID does not exist or has been revoked.'}</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F0F2F8', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 16px', fontFamily: 'Montserrat, sans-serif' }}>
      {/* Download button — hidden on print */}
      <div className="no-print" style={{ marginBottom: '24px', display: 'flex', gap: '12px' }}>
        <button
          onClick={handlePrint}
          style={{ padding: '12px 28px', backgroundColor: PRIMARY, color: 'white', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: 700, cursor: 'pointer', fontFamily: 'Montserrat, sans-serif', boxShadow: '0 4px 12px rgba(91,98,179,0.3)', display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          🖨️ Download as PDF
        </button>
      </div>

      {/* Certificate Card */}
      <div
        ref={certRef}
        style={{
          backgroundColor: 'white',
          maxWidth: '800px',
          width: '100%',
          padding: '60px',
          borderRadius: '4px',
          border: `3px solid ${PRIMARY}`,
          boxShadow: '0 12px 48px rgba(0,0,0,0.12)',
          position: 'relative',
        }}
      >
        {/* Inner border */}
        <div style={{
          position: 'absolute',
          inset: '12px',
          border: `1px solid ${PINK}`,
          borderRadius: '2px',
          pointerEvents: 'none',
        }} />

        {/* Top Decorative Line */}
        <div style={{ display: 'flex', gap: '4px', marginBottom: '40px', justifyContent: 'center' }}>
          <div style={{ height: '4px', width: '60px', backgroundColor: PRIMARY, borderRadius: '2px' }} />
          <div style={{ height: '4px', width: '12px', backgroundColor: PINK, borderRadius: '2px' }} />
          <div style={{ height: '4px', width: '60px', backgroundColor: PRIMARY, borderRadius: '2px' }} />
        </div>

        {/* GlamBook Logo */}
        <div style={{ textAlign: 'center', marginBottom: '8px' }}>
          <span style={{ fontSize: '28px', fontWeight: 800, color: PRIMARY, letterSpacing: '-0.5px' }}>
            Glam<span style={{ color: PINK }}>Book</span>
          </span>
        </div>

        {/* Subtitle */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{ fontSize: '13px', fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
            Certificate of Completion
          </div>
        </div>

        {/* Body */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <p style={{ fontSize: '16px', color: '#6B7280', marginBottom: '16px', fontStyle: 'italic' }}>
            This is to certify that
          </p>

          <div style={{
            fontSize: '40px',
            fontWeight: 700,
            color: PRIMARY,
            fontStyle: 'italic',
            marginBottom: '20px',
            lineHeight: '1.2',
            fontFamily: 'Georgia, serif',
          }}>
            {certificate.studentName}
          </div>

          <p style={{ fontSize: '16px', color: '#6B7280', marginBottom: '16px' }}>
            has successfully completed
          </p>

          <div style={{
            fontSize: '24px',
            fontWeight: 700,
            color: '#111',
            marginBottom: '20px',
            lineHeight: '1.3',
          }}>
            {certificate.courseName}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '8px' }}>
            <span style={{ display: 'inline-block', padding: '6px 20px', backgroundColor: '#EEF0FF', borderRadius: '999px', fontSize: '15px', fontWeight: 700, color: PRIMARY }}>
              Score: {certificate.score}%
            </span>
          </div>

          <p style={{ fontSize: '14px', color: '#9CA3AF', marginTop: '16px' }}>
            Issued on {formatDate(certificate.issuedDate)}
          </p>
        </div>

        {/* Divider */}
        <div style={{ height: '1px', backgroundColor: '#E5E7EB', margin: '0 0 32px' }} />

        {/* Footer */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '24px' }}>
          {/* QR Code */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
            <QRCodeSVG
              value={verifyUrl}
              size={90}
              fgColor={PRIMARY}
              bgColor="white"
              level="M"
            />
            <div style={{ fontSize: '10px', color: '#9CA3AF', textAlign: 'center', maxWidth: '100px' }}>
              Scan to verify
            </div>
          </div>

          {/* Center — signature line */}
          <div style={{ textAlign: 'center', flex: 1 }}>
            <div style={{ borderTop: '1.5px solid #D1D5DB', paddingTop: '8px', width: '160px', margin: '0 auto' }}>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#374151' }}>GlamBook Academy</div>
              <div style={{ fontSize: '11px', color: '#9CA3AF' }}>Authorized Signature</div>
            </div>
          </div>

          {/* Certificate ID */}
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '11px', color: '#9CA3AF', marginBottom: '4px' }}>Certificate ID</div>
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#374151', letterSpacing: '0.05em' }}>
              {certificate.certificateId}
            </div>
            {certificate.verified && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '6px', justifyContent: 'flex-end' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10B981' }} />
                <span style={{ fontSize: '11px', color: '#10B981', fontWeight: 600 }}>Verified</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Print styles */}
      <style>{`
        @media print {
          body { margin: 0; background: white; }
          .no-print { display: none !important; }
          div[style*="minHeight: '100vh'"] {
            padding: 0 !important;
            background: white !important;
          }
        }
      `}</style>
    </div>
  );
};

export default CertificatePage;
