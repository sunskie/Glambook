import { useNavigate } from 'react-router-dom';

const BrowseLandingPage = () => {
  const navigate = useNavigate();
  const font = { fontFamily: 'Montserrat, sans-serif' };

  return (
    <div style={{
      minHeight: '100vh', backgroundColor: '#F8F9FC',
      display: 'flex', flexDirection: 'column' as const,
      alignItems: 'center', justifyContent: 'center',
      padding: '40px 24px', ...font,
    }}>
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        style={{
          position: 'absolute' as const, top: '24px', left: '24px',
          background: 'none', border: 'none', cursor: 'pointer',
          fontSize: '14px', color: '#6B7280', fontWeight: 600, ...font,
        }}
      >
        ← Back
      </button>

      {/* Header */}
      <p style={{ margin: '0 0 8px', fontSize: '11px', fontWeight: 700, color: '#5B62B3', letterSpacing: '2px', textTransform: 'uppercase' as const }}>
        CURATED SELECTION
      </p>
      <h1 style={{
        margin: '0 0 12px', fontSize: '36px', fontWeight: 800,
        color: '#111', textAlign: 'center' as const,
        fontFamily: 'Syne, sans-serif', lineHeight: 1.2,
      }}>
        What are you looking for today?
      </h1>
      <p style={{ margin: '0 0 48px', fontSize: '15px', color: '#6B7280', textAlign: 'center' as const, maxWidth: '400px', lineHeight: 1.6 }}>
        Experience the pinnacle of beauty and craftsmanship tailored specifically for your lifestyle.
      </p>

      {/* Two choice cards */}
      <div style={{ display: 'flex', gap: '24px', maxWidth: '760px', width: '100%' }}>

        {/* Services Card */}
        <div
          style={{
            flex: 1, backgroundColor: 'white', borderRadius: '24px',
            overflow: 'hidden', cursor: 'pointer',
            boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
            border: '1px solid #E5E7EB',
            transition: 'transform 0.2s, box-shadow 0.2s',
          }}
          onClick={() => navigate('/client/browse/services')}
          onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.transform = 'translateY(-6px)';
            (e.currentTarget as HTMLElement).style.boxShadow = '0 16px 48px rgba(91,98,179,0.2)';
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
            (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 24px rgba(0,0,0,0.08)';
          }}
        >
          {/* Image area */}
          <div style={{ position: 'relative' as const, height: '220px', overflow: 'hidden', backgroundColor: '#E8E8F0' }}>
            <div style={{
              width: '100%', height: '100%',
              background: 'linear-gradient(135deg, #C7D2FE 0%, #818CF8 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '80px',
            }}>
              💇
            </div>
            {/* Badge */}
            <span style={{
              position: 'absolute' as const, top: '16px', left: '16px',
              backgroundColor: 'rgba(0,0,0,0.55)', color: 'white',
              fontSize: '9px', fontWeight: 800, padding: '5px 12px',
              borderRadius: '20px', letterSpacing: '1.5px',
            }}>
              TOP TIER ARTISTS
            </span>
          </div>

          {/* Content */}
          <div style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
              <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 800, color: '#111', fontFamily: 'Syne, sans-serif' }}>
                Book a Service
              </h2>
              <span style={{ fontSize: '18px' }}>✂️</span>
            </div>
            <p style={{ margin: '0 0 20px', fontSize: '13px', color: '#6B7280', lineHeight: 1.6 }}>
              Connect with master stylists and makeup artists. From high-fashion transformations to personalized everyday refinement, find your next signature look.
            </p>
            <button style={{
              width: '100%', padding: '13px',
              backgroundColor: '#5B62B3', color: 'white',
              border: 'none', borderRadius: '12px', fontWeight: 700,
              fontSize: '14px', cursor: 'pointer', ...font,
            }}>
              Browse Services →
            </button>
          </div>
        </div>

        {/* Courses Card */}
        <div
          style={{
            flex: 1, backgroundColor: 'white', borderRadius: '24px',
            overflow: 'hidden', cursor: 'pointer',
            boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
            border: '1px solid #E5E7EB',
            transition: 'transform 0.2s, box-shadow 0.2s',
          }}
          onClick={() => navigate('/client/browse/courses')}
          onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.transform = 'translateY(-6px)';
            (e.currentTarget as HTMLElement).style.boxShadow = '0 16px 48px rgba(233,30,99,0.2)';
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
            (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 24px rgba(0,0,0,0.08)';
          }}
        >
          {/* Image area */}
          <div style={{ position: 'relative' as const, height: '220px', overflow: 'hidden', backgroundColor: '#FFF0F5' }}>
            <div style={{
              width: '100%', height: '100%',
              background: 'linear-gradient(135deg, #FBCFE8 0%, #F9A8D4 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '80px',
            }}>
              🎓
            </div>
            {/* Badge */}
            <span style={{
              position: 'absolute' as const, top: '16px', left: '16px',
              backgroundColor: 'rgba(0,0,0,0.55)', color: 'white',
              fontSize: '9px', fontWeight: 800, padding: '5px 12px',
              borderRadius: '20px', letterSpacing: '1.5px',
            }}>
              CERTIFICATION
            </span>
          </div>

          {/* Content */}
          <div style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
              <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 800, color: '#111', fontFamily: 'Syne, sans-serif' }}>
                Master a Skill
              </h2>
              <span style={{ fontSize: '18px' }}>🎓</span>
            </div>
            <p style={{ margin: '0 0 20px', fontSize: '13px', color: '#6B7280', lineHeight: 1.6 }}>
              Elevate your professional journey with certified courses led by industry veterans. Learn advanced techniques and business growth strategies.
            </p>
            <button style={{
              width: '100%', padding: '13px',
              backgroundColor: 'white', color: '#5B62B3',
              border: '2px solid #5B62B3', borderRadius: '12px', fontWeight: 700,
              fontSize: '14px', cursor: 'pointer', ...font,
            }}>
              Explore Academy 🎓
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default BrowseLandingPage;
