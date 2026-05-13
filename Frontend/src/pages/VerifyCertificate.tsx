import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../utils/api';

const VerifyCertificate = () => {
  const { certificateId } = useParams();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!certificateId) return;
    api.get(`/enrollments/verify/${certificateId}`)
      .then((res: any) => setData(res?.data?.data || res?.data || null))
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [certificateId]);

  if (loading) return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Verifying...</div>;

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F8F9FC', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px' }}>
      <div style={{ backgroundColor: 'white', borderRadius: '24px', padding: '48px', maxWidth: '480px', width: '100%', textAlign: 'center' as const, boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }}>
        {notFound || !data ? (
          <>
            <span style={{ fontSize: '64px' }}>❌</span>
            <h2 style={{ margin: '16px 0 8px', color: '#DC2626', fontSize: '26px' }}>Invalid Certificate</h2>
            <p style={{ color: '#6B7280' }}>This certificate could not be verified. It may be fake or revoked.</p>
          </>
        ) : (
          <>
            <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: '#DCFCE7', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', fontSize: '36px' }}>✅</div>
            <h2 style={{ margin: '0 0 8px', color: '#166534', fontSize: '26px' }}>Certificate Verified</h2>
            <p style={{ color: '#6B7280', margin: '0 0 28px' }}>This is an authentic GlamBook Academy certificate.</p>
            <div style={{ backgroundColor: '#F8F9FC', borderRadius: '16px', padding: '20px', textAlign: 'left' as const }}>
              {[
                { label: 'Student Name', value: data.studentName },
                { label: 'Course', value: data.courseName },
                { label: 'Completed On', value: data.completedAt ? new Date(data.completedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A' },
                { label: 'Certificate ID', value: data.certificateId },
                { label: 'Issued By', value: data.issuedBy },
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: i < 4 ? '1px solid #E5E7EB' : 'none' }}>
                  <span style={{ fontSize: '12px', color: '#9CA3AF', fontWeight: 600 }}>{item.label}</span>
                  <span style={{ fontSize: '13px', color: '#111', fontWeight: 600, textAlign: 'right' as const, maxWidth: '60%' }}>{item.value}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default VerifyCertificate;
