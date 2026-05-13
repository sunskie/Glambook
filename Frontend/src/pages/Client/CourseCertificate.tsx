import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../utils/api';

const CourseCertificate = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const printRef = useRef<HTMLDivElement>(null);
  const BASE_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

  useEffect(() => {
    if (!courseId) return;
    api.get(`/enrollments/certificate/${courseId}`)
      .then((res: any) => setData(res?.data?.data || res?.data || null))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [courseId]);

  const handlePrint = () => window.print();

  if (loading) return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading...</div>;

  if (!data) return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' as const, alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
      <span style={{ fontSize: '48px' }}>🔒</span>
      <h2>Certificate not available</h2>
      <button onClick={() => navigate(`/client/courses/${courseId}/learn`)} style={{ padding: '12px 24px', backgroundColor: '#E91E63', color: 'white', border: 'none', borderRadius: '10px' }}>Go to Course</button>
    </div>
  );

  const enrollment = data.enrollment;
  const course = enrollment?.courseId;
  const student = enrollment?.clientId;
  const certId = enrollment?.certificateId || data.certificateId;
  const completedDate = enrollment?.certificateIssuedAt ? new Date(enrollment.certificateIssuedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const verifyUrl = `${window.location.origin}/verify/${certId}`;
  const qrSrc = `https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(verifyUrl)}`;

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F8F9FC', padding: '40px 24px' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <button onClick={() => navigate('/client/my-courses')} style={{ background: 'none', border: 'none', color: '#6B7280' }}>← My Courses</button>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={handlePrint} style={{ padding: '10px 20px', backgroundColor: '#5B62B3', color: 'white', border: 'none', borderRadius: '10px' }}>🖨 Download / Print</button>
          <button onClick={() => { navigator.clipboard?.writeText(verifyUrl); alert('Copied!'); }} style={{ padding: '10px 20px', backgroundColor: 'white', border: '1.5px solid #E5E7EB', borderRadius: '10px' }}>🔗 Share</button>
        </div>
      </div>

      <div ref={printRef} data-print style={{ maxWidth: '800px', margin: '0 auto', backgroundColor: '#FEFCF5', border: '12px solid #1a3a6b', borderRadius: '4px', padding: '0', boxShadow: '0 16px 48px rgba(0,0,0,0.15)', position: 'relative' as const, overflow: 'hidden' }}>
        <div style={{ padding: '52px 60px', textAlign: 'center' as const, position: 'relative' as const, zIndex: 3 }}>
          <div style={{ marginBottom: '24px' }}>
            <div style={{ display: 'inline-block', background: 'linear-gradient(135deg, #c9a227, #f0d060, #c9a227)', padding: '10px 48px', borderRadius: '2px' }}>
              <span style={{ fontSize: '11px', fontWeight: 800, letterSpacing: '4px', color: '#5C3A00', textTransform: 'uppercase' as const }}>GlamBook Academy</span>
            </div>
          </div>
          <h1 style={{ margin: '0 0 4px', fontSize: '44px', fontWeight: 900, color: '#1a3a6b', letterSpacing: '8px', textTransform: 'uppercase' as const, fontFamily: 'Syne, Georgia, serif' }}>CERTIFICATE</h1>
          <p style={{ margin: '0 0 4px', fontSize: '13px', letterSpacing: '6px', color: '#4a6fa5', textTransform: 'uppercase' as const, fontWeight: 600 }}>OF COMPLETION</p>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', margin: '20px 0' }}>
            <div style={{ height: '1px', width: '80px', background: 'linear-gradient(to right, transparent, #b8960c)' }} />
            <span style={{ color: '#b8960c', fontSize: '16px' }}>✦</span>
            <div style={{ height: '1px', width: '80px', background: 'linear-gradient(to left, transparent, #b8960c)' }} />
          </div>
          <p style={{ margin: '0 0 8px', fontSize: '13px', letterSpacing: '2px', color: '#6B7280', textTransform: 'uppercase' as const }}>This Certificate is proudly presented to</p>
          <h2 style={{ margin: '12px 0 4px', fontSize: '42px', fontWeight: 400, color: '#1a3a6b', fontFamily: '"Brush Script MT", "Dancing Script", cursive', letterSpacing: '2px' }}>{student?.name || 'Student Name'}</h2>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', margin: '20px 0' }}>
            <div style={{ height: '1px', width: '80px', background: 'linear-gradient(to right, transparent, #b8960c)' }} />
            <span style={{ color: '#b8960c', fontSize: '16px' }}>✦</span>
            <div style={{ height: '1px', width: '80px', background: 'linear-gradient(to left, transparent, #b8960c)' }} />
          </div>
          <p style={{ margin: '0 0 6px', fontSize: '14px', color: '#374151', lineHeight: 1.6 }}>has successfully completed the course</p>
          <h3 style={{ margin: '8px 0 24px', fontSize: '22px', fontWeight: 800, color: '#1a3a6b', fontFamily: 'Syne, sans-serif' }}>{course?.title || 'Course Name'}</h3>
          <p style={{ margin: '0 0 32px', fontSize: '13px', color: '#6B7280' }}>Completed on: {completedDate} • Certificate ID: <span style={{ fontFamily: 'monospace' }}>{certId}</span></p>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: '16px' }}>
            <div style={{ textAlign: 'center' as const }}>
              <div style={{ width: '140px', borderBottom: '1.5px solid #374151', marginBottom: '8px', paddingBottom: '4px' }}>
                <span style={{ fontSize: '20px', fontFamily: '"Brush Script MT", cursive', color: '#1a3a6b' }}>{course?.vendorId?.name || 'Instructor'}</span>
              </div>
              <p style={{ margin: 0, fontSize: '11px', color: '#6B7280', letterSpacing: '1px' }}>INSTRUCTOR</p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' as const, alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: 'linear-gradient(135deg, #c9a227, #f0d060, #c9a227)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '3px solid #b8960c' }}><span style={{ fontSize: '28px' }}>⚜</span></div>
              <img src={qrSrc} alt="QR" style={{ width: '80px', height: '80px' }} />
            </div>
            <div style={{ textAlign: 'center' as const }}>
              <div style={{ width: '140px', borderBottom: '1.5px solid #374151', marginBottom: '8px', paddingBottom: '4px' }}>
                <span style={{ fontSize: '20px', fontFamily: '"Brush Script MT", cursive', color: '#1a3a6b' }}>GlamBook</span>
              </div>
              <p style={{ margin: 0, fontSize: '11px', color: '#6B7280', letterSpacing: '1px' }}>AUTHORIZED BY</p>
            </div>
          </div>
          <div style={{ margin: '32px -60px -52px', height: '12px', background: 'linear-gradient(90deg, #1a3a6b 0%, #5B62B3 50%, #1a3a6b 100%)' }} />
        </div>
      </div>
      <p style={{ textAlign: 'center' as const, marginTop: '20px', fontSize: '12px', color: '#9CA3AF' }}>Scan QR or visit <span style={{ color: '#5B62B3' }}>{verifyUrl}</span> to verify</p>
    </div>
  );
};

export default CourseCertificate;
