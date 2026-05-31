import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../utils/api';

const OnlineCertificate = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const [enrollment, setEnrollment] = useState<any>(null);
  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [errorDetail, setErrorDetail] = useState('');

  useEffect(() => {
    if (!courseId) return;

    // Use the dedicated endpoint built exactly for this purpose
    api
      .get(`/enrollments/by-course/${courseId}`)
      .then((res: any) => {
        const data = res?.data?.data || res?.data || null;
        if (!data) {
          setError('Certificate data not found');
          return;
        }
        const enr = data.enrollment || data;
        const crs =
          (typeof enr.courseId === 'object' ? enr.courseId : null) ||
          data.course ||
          null;
        setEnrollment(enr);
        setCourse(crs);
      })
      .catch((err: any) => {
        const msg =
          err?.response?.data?.message ||
          'Failed to load certificate';
        const detail =
          err?.response?.status === 403
            ? `Progress: ${err?.response?.data?.progress ?? '?'}% — Quiz passed: ${err?.response?.data?.quizPassed ?? false}`
            : '';
        setError(msg);
        setErrorDetail(detail);
      })
      .finally(() => setLoading(false));
  }, [courseId]);

  const handlePrint = () => window.print();

  /* ── Loading ── */
  if (loading) {
    return (
      <div style={S.center}>
        <div style={S.spinner} />
        <p style={{ color: '#6B7280', marginTop: 16, fontFamily: 'Montserrat,sans-serif' }}>
          Loading certificate…
        </p>
        <style>{spinCSS}</style>
      </div>
    );
  }

  /* ── Error ── */
  if (error || !enrollment) {
    const isNotEligible =
      error.toLowerCase().includes('complete') ||
      error.toLowerCase().includes('pass') ||
      error.toLowerCase().includes('eligible');

    return (
      <div style={S.center}>
        <div style={S.errorCard}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>
            {isNotEligible ? '📚' : '🔒'}
          </div>
          <h2 style={{ color: '#EF4444', marginBottom: 12, fontFamily: 'Montserrat,sans-serif', fontSize: 20 }}>
            {isNotEligible ? 'Not Eligible Yet' : 'Certificate Not Available'}
          </h2>
          <p style={{ color: '#6B7280', marginBottom: 8, lineHeight: 1.6, fontFamily: 'Montserrat,sans-serif' }}>
            {error}
          </p>
          {errorDetail && (
            <p style={{ color: '#9CA3AF', fontSize: 12, marginBottom: 16, fontFamily: 'monospace', backgroundColor: '#F3F4F6', padding: '8px 12px', borderRadius: 6 }}>
              {errorDetail}
            </p>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%', maxWidth: 260 }}>
            {isNotEligible && (
              <button onClick={() => navigate(`/client/courses/${courseId}/learn`)} style={S.btnPrimary}>
                Continue Learning
              </button>
            )}
            <button onClick={() => navigate('/client/my-courses')} style={S.btnSecondary}>
              ← My Courses
            </button>
          </div>
        </div>
        <style>{spinCSS}</style>
      </div>
    );
  }

  /* ── Derive display values ── */
  const studentName =
    (typeof enrollment.clientId === 'object' ? enrollment.clientId?.name : null) ||
    enrollment.clientName ||
    'Student';

  const courseName =
    course?.title ||
    (typeof enrollment.courseId === 'object' ? enrollment.courseId?.title : null) ||
    'Course';

  const vendorName =
    (typeof course?.vendorId === 'object' ? course.vendorId?.name : null) ||
    (typeof enrollment.courseId === 'object'
      ? enrollment.courseId?.vendorId?.name
      : null) ||
    'GlamBook Academy';

  const certId =
    enrollment.certificateId ||
    enrollment.onlineCertificateId ||
    `OC-${enrollment._id?.slice(-8).toUpperCase()}`;

  const completionDate = new Date(
    enrollment.onlineCertificateIssuedAt ||
      enrollment.quizSubmittedAt ||
      enrollment.updatedAt ||
      new Date()
  ).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  const quizScore = enrollment.quizScore ?? 0;
  const verifyUrl = `${window.location.origin}/verify/${certId}`;
  const qrSrc = `https://api.qrserver.com/v1/create-qr-code/?size=120x120&color=1a3a6b&bgcolor=FEFCF5&data=${encodeURIComponent(verifyUrl)}`;

  /* ── Render ── */
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F8F9FC', padding: '40px 20px', fontFamily: 'Montserrat,sans-serif' }}>

      {/* Top controls */}
      <div className="no-print" style={{ maxWidth: 800, margin: '0 auto 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <button onClick={() => navigate('/client/my-courses')} style={S.btnGhost}>
          ← My Courses
        </button>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={handlePrint} style={S.btnPrimary}>🖨 Download / Print</button>
          <button
            onClick={() => { navigator.clipboard?.writeText(verifyUrl); alert('Verification link copied!'); }}
            style={S.btnSecondary}
          >
            🔗 Share
          </button>
        </div>
      </div>

      {/* Certificate */}
      <div
        id="certificate-content"
        style={{
          maxWidth: 800, margin: '0 auto',
          backgroundColor: '#FEFCF5',
          border: '12px solid #1a3a6b',
          borderRadius: 4,
          boxShadow: '0 16px 48px rgba(0,0,0,0.15)',
          position: 'relative', overflow: 'hidden',
        }}
      >
        {/* Gold corner accents */}
        {(['topLeft','topRight','bottomLeft','bottomRight'] as const).map(p => (
          <div key={p} style={corner(p)} />
        ))}

        <div style={{ padding: '52px 60px', textAlign: 'center', position: 'relative', zIndex: 3 }}>

          {/* Academy banner */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ display: 'inline-block', background: 'linear-gradient(135deg,#c9a227,#f0d060,#c9a227)', padding: '10px 48px', borderRadius: 2 }}>
              <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: '4px', color: '#5C3A00', textTransform: 'uppercase' }}>
                GlamBook Academy
              </span>
            </div>
          </div>

          {/* Title */}
          <h1 style={{ margin: '0 0 4px', fontSize: 44, fontWeight: 900, color: '#1a3a6b', letterSpacing: 8, textTransform: 'uppercase', fontFamily: 'Georgia,serif' }}>
            CERTIFICATE
          </h1>
          <p style={{ margin: '0 0 4px', fontSize: 13, letterSpacing: '6px', color: '#4a6fa5', textTransform: 'uppercase', fontWeight: 600 }}>
            OF ONLINE COMPLETION
          </p>

          <Divider />

          <p style={{ margin: '0 0 8px', fontSize: 13, letterSpacing: '2px', color: '#6B7280', textTransform: 'uppercase' }}>
            This Certificate is proudly presented to
          </p>

          {/* Student name */}
          <h2 style={{ margin: '12px 0 4px', fontSize: 42, fontWeight: 400, color: '#1a3a6b', fontFamily: '"Brush Script MT","Dancing Script",cursive', letterSpacing: 2 }}>
            {studentName}
          </h2>

          <Divider />

          <p style={{ margin: '0 0 6px', fontSize: 14, color: '#374151', lineHeight: 1.6 }}>
            has successfully completed the online theoretical component of the course
          </p>

          <h3 style={{ margin: '8px 0 8px', fontSize: 22, fontWeight: 800, color: '#1a3a6b', fontFamily: 'Georgia,serif' }}>
            {courseName}
          </h3>

          <p style={{ margin: '0 0 8px', fontSize: 13, color: '#6B7280' }}>
            offered by <strong>{vendorName}</strong>
          </p>

          {/* Stats row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, margin: '24px 0', backgroundColor: '#EEF0FF', borderRadius: 8, padding: 16 }}>
            <div>
              <p style={S.statLabel}>Quiz Score</p>
              <p style={{ ...S.statValue, color: '#10B981' }}>{quizScore}%</p>
            </div>
            <div>
              <p style={S.statLabel}>Completed</p>
              <p style={{ ...S.statValue, fontSize: 13, color: '#111' }}>{completionDate}</p>
            </div>
            <div>
              <p style={S.statLabel}>Certificate ID</p>
              <p style={{ ...S.statValue, fontSize: 12, color: '#1a3a6b', fontFamily: 'monospace' }}>{certId}</p>
            </div>
          </div>

          {/* Footer row */}
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: 16, flexWrap: 'wrap', gap: 16 }}>
            {/* Instructor sig */}
            <div style={{ textAlign: 'center' }}>
              <div style={{ width: 140, borderBottom: '1.5px solid #374151', marginBottom: 8, paddingBottom: 4 }}>
                <span style={{ fontSize: 20, fontFamily: '"Brush Script MT",cursive', color: '#1a3a6b' }}>{vendorName}</span>
              </div>
              <p style={{ margin: 0, fontSize: 11, color: '#6B7280', letterSpacing: 1 }}>INSTRUCTOR</p>
            </div>

            {/* Seal + QR */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'linear-gradient(135deg,#c9a227,#f0d060,#c9a227)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '3px solid #b8960c' }}>
                <span style={{ fontSize: 28 }}>⚜</span>
              </div>
              <img
                src={qrSrc}
                alt="Scan to verify"
                style={{ width: 80, height: 80, border: '2px solid #1a3a6b', borderRadius: 4, backgroundColor: '#FEFCF5' }}
                onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
              />
              <p style={{ margin: 0, fontSize: 9, color: '#9CA3AF', textAlign: 'center', maxWidth: 90 }}>Scan to verify</p>
            </div>

            {/* Authorized sig */}
            <div style={{ textAlign: 'center' }}>
              <div style={{ width: 140, borderBottom: '1.5px solid #374151', marginBottom: 8, paddingBottom: 4 }}>
                <span style={{ fontSize: 20, fontFamily: '"Brush Script MT",cursive', color: '#1a3a6b' }}>GlamBook</span>
              </div>
              <p style={{ margin: 0, fontSize: 11, color: '#6B7280', letterSpacing: 1 }}>AUTHORIZED BY</p>
            </div>
          </div>

          {/* Note */}
          <div style={{ backgroundColor: '#FFF8E7', border: '1px solid #F0D060', borderRadius: 8, padding: 16, marginTop: 28, textAlign: 'left' }}>
            <p style={{ margin: '0 0 6px', fontSize: 12, fontWeight: 700, color: '#92400E' }}>📌 Important Note:</p>
            <p style={{ margin: 0, fontSize: 12, color: '#78350F', lineHeight: 1.6 }}>
              This certificate confirms completion of the online learning component including all theoretical
              lessons and the mandatory quiz. The Final Professional Certificate will be issued upon
              successful completion of physical practical training (minimum 80% attendance) and vendor approval.
            </p>
          </div>

          <p style={{ margin: '20px 0 0', fontSize: 10, color: '#9CA3AF' }}>
            Verify at: <span style={{ color: '#1a3a6b', fontFamily: 'monospace' }}>{verifyUrl}</span>
          </p>

          {/* Bottom bar */}
          <div style={{ margin: '32px -60px -52px', height: 12, background: 'linear-gradient(90deg,#1a3a6b 0%,#5B62B3 50%,#1a3a6b 100%)' }} />
        </div>
      </div>

      <style>{`
        @media print {
          body { margin: 0; background: white; }
          .no-print { display: none !important; }
          #certificate-content { box-shadow: none !important; }
        }
        ${spinCSS}
      `}</style>
    </div>
  );
};

/* ── Tiny helpers ── */

const Divider = () => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, margin: '20px 0' }}>
    <div style={{ height: 1, width: 80, background: 'linear-gradient(to right,transparent,#b8960c)' }} />
    <span style={{ color: '#b8960c', fontSize: 16 }}>✦</span>
    <div style={{ height: 1, width: 80, background: 'linear-gradient(to left,transparent,#b8960c)' }} />
  </div>
);

const corner = (pos: 'topLeft'|'topRight'|'bottomLeft'|'bottomRight'): React.CSSProperties => {
  const base: React.CSSProperties = { position:'absolute', width:32, height:32, borderColor:'#c9a227', borderStyle:'solid', zIndex:10 };
  const map = {
    topLeft:     { top:16, left:16,   borderWidth:'2px 0 0 2px' },
    topRight:    { top:16, right:16,  borderWidth:'2px 2px 0 0' },
    bottomLeft:  { bottom:16, left:16,  borderWidth:'0 0 2px 2px' },
    bottomRight: { bottom:16, right:16, borderWidth:'0 2px 2px 0' },
  };
  return { ...base, ...map[pos] };
};

const S: Record<string, React.CSSProperties> = {
  center:    { minHeight:'100vh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', backgroundColor:'#F8F9FC', padding:24, fontFamily:'Montserrat,sans-serif' },
  errorCard: { backgroundColor:'white', borderRadius:16, padding:40, maxWidth:480, width:'100%', textAlign:'center', boxShadow:'0 4px 24px rgba(0,0,0,0.08)', display:'flex', flexDirection:'column', alignItems:'center' },
  btnPrimary:   { padding:'11px 22px', backgroundColor:'#5B62B3', color:'white', border:'none', borderRadius:10, fontWeight:700, fontSize:14, cursor:'pointer', fontFamily:'Montserrat,sans-serif' },
  btnSecondary: { padding:'10px 20px', backgroundColor:'white', color:'#5B62B3', border:'1.5px solid #5B62B3', borderRadius:10, fontWeight:600, fontSize:14, cursor:'pointer', fontFamily:'Montserrat,sans-serif' },
  btnGhost:     { background:'none', border:'none', color:'#6B7280', fontSize:14, cursor:'pointer', fontFamily:'Montserrat,sans-serif' },
  spinner:      { width:44, height:44, border:'4px solid #EEF0FF', borderTop:'4px solid #5B62B3', borderRadius:'50%', animation:'spin 0.9s linear infinite' },
  statLabel:    { margin:'0 0 4px', fontSize:10, fontWeight:700, color:'#6B7280', textTransform:'uppercase', letterSpacing:1 },
  statValue:    { margin:0, fontSize:22, fontWeight:800 },
};

const spinCSS = `@keyframes spin { to { transform: rotate(360deg); } }`;

export default OnlineCertificate;