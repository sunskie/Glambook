import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

interface VerifyData {
  valid: boolean;
  student?: { name: string };
  course?: { title: string };
  vendor?: string;
  quizScore?: number;
  completedLessons?: number;
  totalLessons?: number;
  progress?: number;
  completionDate?: string;
  attendanceStatus?: 'verified' | 'pending';
  practicalStatus?: 'approved' | 'pending';
  certId?: string;
  verifiedAt?: string;
  message?: string;
}

const PRIMARY = '#5B62B3';
const NAVY   = '#1a3a6b';
const GOLD   = '#c9a227';

const VerifyCertificate = () => {
  const { certId } = useParams<{ certId: string }>();
  const [data, setData]     = useState<VerifyData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!certId || certId === 'undefined') {
      setData({ valid: false, message: 'Invalid certificate ID' });
      setLoading(false);
      return;
    }

    const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    axios
      .get(`${baseURL}/enrollments/verify/${encodeURIComponent(certId)}`)
      .then(res  => setData(res.data))
      .catch(err => setData({
        valid: false,
        message: err.response?.data?.message || 'Certificate not found or invalid',
      }))
      .finally(() => setLoading(false));
  }, [certId]);

  /* ── Loading ── */
  if (loading) {
    return (
      <div style={S.page}>
        <div style={S.spinner} />
        <p style={{ color:'#6B7280', marginTop:16, fontFamily:'Montserrat,sans-serif' }}>
          Verifying certificate…
        </p>
        <style>{spinCSS}</style>
      </div>
    );
  }

  /* ── Invalid ── */
  if (!data?.valid) {
    return (
      <div style={{ minHeight:'100vh', backgroundColor:'#F8F9FC', padding:'40px 20px', fontFamily:'Montserrat,sans-serif' }}>
        <div style={{ maxWidth:600, margin:'0 auto' }}>

          {/* Header */}
          <div style={{ textAlign:'center', marginBottom:32 }}>
            <span style={{ fontSize:28, fontWeight:800, color:PRIMARY }}>
              Glam<span style={{ color:'#E91E63' }}>Book</span>
            </span>
            <p style={{ fontSize:13, color:'#9CA3AF', margin:'4px 0 0' }}>Certificate Verification</p>
          </div>

          <div style={{ backgroundColor:'white', borderRadius:16, padding:40, boxShadow:'0 4px 24px rgba(0,0,0,0.08)', textAlign:'center' }}>
            {/* Red banner */}
            <div style={{ backgroundColor:'#FEE2E2', border:'2px solid #FCA5A5', borderRadius:12, padding:24, marginBottom:24 }}>
              <div style={{ fontSize:48, marginBottom:8 }}>✗</div>
              <h2 style={{ margin:'0 0 8px', fontSize:22, color:'#DC2626', fontFamily:'Montserrat,sans-serif' }}>
                Invalid Certificate
              </h2>
              <p style={{ margin:0, fontSize:13, color:'#991B1B' }}>
                {data?.message || 'The certificate you are trying to verify is not valid.'}
              </p>
            </div>

            {certId && (
              <div style={{ backgroundColor:'#F3F4F6', borderRadius:8, padding:'10px 16px', marginBottom:24, fontFamily:'monospace', fontSize:13, color:'#6B7280' }}>
                Looked up: <strong style={{ color:'#374151' }}>{certId}</strong>
              </div>
            )}

            <h3 style={{ margin:'0 0 12px', fontSize:15, fontWeight:700, color:'#111' }}>Possible reasons:</h3>
            <ul style={{ listStyle:'none', padding:0, margin:'0 0 28px', textAlign:'left' }}>
              {[
                'Certificate ID not found in records',
                'Certificate may have been revoked',
                'QR code is damaged or incorrect',
                'Enrollment does not meet certificate requirements',
              ].map((r, i, arr) => (
                <li key={i} style={{ padding:'10px 0', fontSize:13, color:'#6B7280', borderBottom: i < arr.length-1 ? '1px solid #E5E7EB' : 'none' }}>
                  • {r}
                </li>
              ))}
            </ul>

            <button onClick={() => window.location.href='/'} style={S.btnPrimary}>
              Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ── Valid ── */
  const verifiedDate = data.verifiedAt
    ? new Date(data.verifiedAt).toLocaleDateString('en-US', { year:'numeric', month:'long', day:'numeric' })
    : '';

  const completionDateStr = data.completionDate
    ? new Date(data.completionDate).toLocaleDateString('en-US', { year:'numeric', month:'long', day:'numeric' })
    : 'N/A';

  return (
    <div style={{ minHeight:'100vh', backgroundColor:'#F0F2F8', padding:'40px 20px', fontFamily:'Montserrat,sans-serif' }}>
      <div style={{ maxWidth:700, margin:'0 auto' }}>

        {/* Header */}
        <div style={{ textAlign:'center', marginBottom:36 }}>
          <span style={{ fontSize:28, fontWeight:800, color:PRIMARY }}>
            Glam<span style={{ color:'#E91E63' }}>Book</span>
          </span>
          <h1 style={{ margin:'8px 0 4px', fontSize:28, fontWeight:800, color:'#111' }}>
            Certificate Verification
          </h1>
          <p style={{ margin:0, fontSize:13, color:'#9CA3AF' }}>GlamBook Academy</p>
        </div>

        {/* ✓ Valid banner */}
        <div style={{ backgroundColor:'#ECFDF5', border:'2px solid #86EFAC', borderRadius:14, padding:'28px 24px', marginBottom:28, textAlign:'center' }}>
          <div style={{ width:64, height:64, borderRadius:'50%', backgroundColor:'#10B981', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 12px', fontSize:28, color:'white' }}>
            ✓
          </div>
          <h2 style={{ margin:'0 0 6px', fontSize:22, color:'#16A34A', fontWeight:800 }}>
            Certificate Verified
          </h2>
          <p style={{ margin:0, fontSize:13, color:'#166534' }}>
            This certificate is valid and authentic
          </p>
        </div>

        {/* Cert ID chip */}
        <div style={{ backgroundColor:'white', borderRadius:12, padding:'16px 20px', marginBottom:20, boxShadow:'0 2px 8px rgba(0,0,0,0.06)', display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:8 }}>
          <span style={{ fontSize:11, fontWeight:700, color:'#9CA3AF', textTransform:'uppercase', letterSpacing:1 }}>Certificate ID</span>
          <span style={{ fontSize:14, fontWeight:700, color:PRIMARY, fontFamily:'monospace' }}>{data.certId || certId}</span>
        </div>

        {/* Metrics */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:14, marginBottom:24 }}>
          {[
            { label:'Quiz Score',    value:`${data.quizScore ?? 0}%`,                        color:'#10B981' },
            { label:'Lessons Done',  value:`${data.completedLessons}/${data.totalLessons}`,  color:PRIMARY   },
            { label:'Progress',      value:`${data.progress ?? 0}%`,                         color:'#F59E0B' },
          ].map(m => (
            <div key={m.label} style={{ backgroundColor:'white', borderRadius:12, padding:18, textAlign:'center', boxShadow:'0 2px 8px rgba(0,0,0,0.06)' }}>
              <p style={{ margin:'0 0 6px', fontSize:11, fontWeight:700, color:'#9CA3AF', textTransform:'uppercase', letterSpacing:1 }}>{m.label}</p>
              <p style={{ margin:0, fontSize:26, fontWeight:800, color:m.color }}>{m.value}</p>
            </div>
          ))}
        </div>

        {/* Detail card */}
        <div style={{ backgroundColor:'white', borderRadius:14, padding:28, marginBottom:24, boxShadow:'0 4px 16px rgba(0,0,0,0.08)' }}>
          {[
            { label:'Student',         value: data.student?.name },
            { label:'Course',          value: data.course?.title },
            { label:'Issued By',       value: data.vendor },
            { label:'Completion Date', value: completionDateStr },
          ].map((row, i, arr) => (
            <div key={row.label} style={{ marginBottom: i < arr.length-1 ? 20 : 0, paddingBottom: i < arr.length-1 ? 20 : 0, borderBottom: i < arr.length-1 ? '1px solid #E5E7EB' : 'none' }}>
              <p style={{ margin:'0 0 4px', fontSize:11, fontWeight:700, color:'#9CA3AF', textTransform:'uppercase', letterSpacing:1 }}>{row.label}</p>
              <p style={{ margin:0, fontSize:17, fontWeight:700, color:'#111' }}>{row.value || 'N/A'}</p>
            </div>
          ))}

          {/* Status badges */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14, marginTop:20 }}>
            <StatusBadge label="Online Learning" status="completed" />
            <StatusBadge label="Quiz Status"     status="passed"    />
          </div>
        </div>

        {/* Certificate preview strip */}
        <div style={{
          background: `linear-gradient(135deg, ${NAVY} 0%, ${PRIMARY} 100%)`,
          borderRadius:14, padding:'24px 28px', marginBottom:24, color:'white',
          display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:16,
        }}>
          <div>
            <p style={{ margin:'0 0 4px', fontSize:11, fontWeight:700, opacity:0.7, letterSpacing:1, textTransform:'uppercase' }}>Issued by</p>
            <p style={{ margin:0, fontSize:20, fontWeight:800 }}>GlamBook Academy</p>
            <p style={{ margin:'4px 0 0', fontSize:12, opacity:0.7 }}>Online Certificate of Completion</p>
          </div>
          <div style={{ width:52, height:52, borderRadius:'50%', background:`linear-gradient(135deg,${GOLD},#f0d060,${GOLD})`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:22, border:'2px solid rgba(255,255,255,0.3)' }}>
            ⚜
          </div>
        </div>

        {/* Note */}
        <div style={{ backgroundColor:'#FFFBEB', border:'1px solid #FCD34D', borderRadius:12, padding:20, marginBottom:24 }}>
          <p style={{ margin:'0 0 6px', fontSize:12, fontWeight:700, color:'#92400E' }}>📌 Important Note:</p>
          <p style={{ margin:0, fontSize:12, color:'#78350F', lineHeight:1.7 }}>
            This certificate confirms completion of the online theoretical component. The Final
            Professional Certificate will be issued separately by the beauty academy upon successful
            completion of physical practical training, attendance verification (minimum 80%), and
            vendor approval.
          </p>
        </div>

        {/* Timestamp */}
        <div style={{ textAlign:'center', padding:'20px 0', borderTop:'1px solid #E5E7EB' }}>
          <p style={{ margin:'0 0 2px', fontSize:11, color:'#9CA3AF' }}>Verified on {verifiedDate}</p>
          <p style={{ margin:0, fontSize:10, color:'#D1D5DB' }}>GlamBook Academy Verification System</p>
        </div>

      </div>
      <style>{spinCSS}</style>
    </div>
  );
};

/* ── Status badge helper ── */
const StatusBadge = ({ label, status }: { label: string; status: 'completed' | 'passed' }) => (
  <div>
    <p style={{ margin:'0 0 6px', fontSize:11, fontWeight:700, color:'#9CA3AF', textTransform:'uppercase', letterSpacing:1 }}>{label}</p>
    <div style={{ backgroundColor:'#ECFDF5', color:'#166534', padding:'8px 12px', borderRadius:8, fontSize:13, fontWeight:700, textAlign:'center' }}>
      ✓ {status === 'completed' ? 'Completed' : 'Passed'}
    </div>
  </div>
);

/* ── Styles ── */
const S: Record<string, React.CSSProperties> = {
  page:      { minHeight:'100vh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', backgroundColor:'#F8F9FC', fontFamily:'Montserrat,sans-serif' },
  spinner:   { width:44, height:44, border:'4px solid #EEF0FF', borderTop:`4px solid #5B62B3`, borderRadius:'50%', animation:'spin 0.9s linear infinite' },
  btnPrimary:{ padding:'12px 32px', backgroundColor:'#5B62B3', color:'white', border:'none', borderRadius:8, fontWeight:700, fontSize:14, cursor:'pointer', fontFamily:'Montserrat,sans-serif' },
};
const spinCSS = `@keyframes spin { to { transform: rotate(360deg); } }`;

export default VerifyCertificate;