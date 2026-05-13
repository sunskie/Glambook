import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import VendorSidebar from '../../components/Vendor/VendorSidebar';
import api from '../../utils/api';

const VendorDisputesPage = () => {
  const [disputes, setDisputes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [respondModal, setRespondModal] = useState<any>(null);
  const [responseForm, setResponseForm] = useState({ action: '', vendorResponseDescription: '', vendorEvidenceUrls: '' });
  const [submitting, setSubmitting] = useState(false);
  const font = { fontFamily: 'Montserrat, sans-serif' };

  useEffect(() => {
    api.get('/disputes/vendor')
      .then((res: any) => { setDisputes(res.data || res || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const statusConfig: any = {
    pending: { label: 'Awaiting Your Response', color: '#D97706', bg: '#FEF3C7', pulse: true },
    under_review: { label: 'Under Admin Review', color: '#2563EB', bg: '#DBEAFE', pulse: false },
    vendor_responded: { label: 'Response Submitted', color: '#6B7280', bg: '#F3F4F6', pulse: false },
    resolved_refund: { label: 'Resolved — Refund Issued', color: '#DC2626', bg: '#FEE2E2', pulse: false },
    resolved_release: { label: 'Resolved — Payment Released', color: '#16a34a', bg: '#DCFCE7', pulse: false },
    resolved_partial: { label: 'Resolved — Partial Refund', color: '#D97706', bg: '#FEF3C7', pulse: false },
  };

  const handleRespond = async () => {
    if (!responseForm.action || !responseForm.vendorResponseDescription) return;
    setSubmitting(true);
    try {
      await api.patch(`/disputes/${respondModal._id}/respond`, {
        action: responseForm.action,
        vendorResponseDescription: responseForm.vendorResponseDescription,
        vendorEvidenceUrls: responseForm.vendorEvidenceUrls ? [responseForm.vendorEvidenceUrls] : [],
      });
      const updated: any = await api.get('/disputes/vendor');
      setDisputes(updated.data || updated || []);
      setRespondModal(null);
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to submit response');
    }
    setSubmitting(false);
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#F8F9FC' }}>
      <VendorSidebar />
      <div style={{ marginLeft: '280px', flex: 1, padding: '32px', ...font }}>

        <h1 style={{ margin: '0 0 4px', fontSize: '24px', fontWeight: 800, color: '#111', fontFamily: 'Syne, sans-serif' }}>
          Dispute Center
        </h1>
        <p style={{ margin: '0 0 28px', fontSize: '14px', color: '#6B7280' }}>
          Manage and respond to client disputes on your bookings
        </p>

        {loading ? (
          <p style={{ color: '#9CA3AF' }}>Loading disputes...</p>
        ) : disputes.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px', backgroundColor: 'white', borderRadius: '16px', border: '1px solid #E5E7EB' }}>
            <p style={{ fontSize: '48px', marginBottom: '12px' }}>✅</p>
            <p style={{ fontWeight: 700, color: '#111', marginBottom: '6px' }}>No disputes</p>
            <p style={{ color: '#6B7280', fontSize: '13px' }}>All your bookings are in good standing</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '16px' }}>
            {disputes.map((dispute: any) => {
              const sc = statusConfig[dispute.status] || statusConfig.pending;
              const isPending = dispute.status === 'pending';
              return (
                <div
                  key={dispute._id}
                  style={{
                    backgroundColor: 'white', borderRadius: '16px',
                    border: `2px solid ${isPending ? '#FCD34D' : '#E5E7EB'}`,
                    padding: '20px 24px',
                    boxShadow: isPending ? '0 4px 20px rgba(251,191,36,0.15)' : '0 2px 8px rgba(0,0,0,0.05)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '14px' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                        <span style={{
                          padding: '3px 12px', borderRadius: '20px', fontSize: '11px',
                          fontWeight: 700, backgroundColor: sc.bg, color: sc.color,
                        }}>
                          {sc.pulse && '● '}{sc.label}
                        </span>
                        <span style={{ fontSize: '11px', color: '#9CA3AF' }}>
                          Filed {new Date(dispute.createdAt).toLocaleDateString('en-NP', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                      </div>
                      <p style={{ margin: 0, fontWeight: 700, fontSize: '15px', color: '#111' }}>
                        Booking on {dispute.bookingId?.bookingDate
                          ? new Date(dispute.bookingId.bookingDate).toLocaleDateString('en-NP', { day: 'numeric', month: 'long', year: 'numeric' })
                          : 'N/A'}
                      </p>
                      <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#6B7280' }}>
                        Client: {dispute.clientId?.name} · Rs. {dispute.bookingId?.totalPrice}
                      </p>
                    </div>
                    {isPending && (
                      <button
                        onClick={() => setRespondModal(dispute)}
                        style={{
                          padding: '8px 20px', backgroundColor: '#D97706', color: 'white',
                          border: 'none', borderRadius: '10px', fontWeight: 700,
                          fontSize: '12px', cursor: 'pointer', ...font,
                        }}
                      >
                        Respond Now →
                      </button>
                    )}
                  </div>

                  {/* Dispute details */}
                  <div style={{ backgroundColor: '#FFF9F0', borderRadius: '10px', padding: '14px 16px', border: '1px solid #FDE68A' }}>
                    <p style={{ margin: '0 0 4px', fontSize: '11px', fontWeight: 700, color: '#D97706', textTransform: 'uppercase' as const }}>
                      Client's Complaint
                    </p>
                    <p style={{ margin: '0 0 4px', fontWeight: 600, fontSize: '13px', color: '#111' }}>
                      Category: {dispute.reason?.replace('_', ' ').toUpperCase()}
                    </p>
                    <p style={{ margin: 0, fontSize: '13px', color: '#374151', lineHeight: 1.5 }}>
                      {dispute.description}
                    </p>
                  </div>

                  {/* Vendor response if submitted */}
                  {dispute.vendorResponseDescription && (
                    <div style={{ backgroundColor: '#F0FDF4', borderRadius: '10px', padding: '14px 16px', border: '1px solid #86EFAC', marginTop: '10px' }}>
                      <p style={{ margin: '0 0 4px', fontSize: '11px', fontWeight: 700, color: '#16a34a', textTransform: 'uppercase' as const }}>
                        Your Response
                      </p>
                      <p style={{ margin: 0, fontSize: '13px', color: '#374151' }}>{dispute.vendorResponseDescription}</p>
                    </div>
                  )}

                  {/* Timeline */}
                  {dispute.timeline?.length > 0 && (
                    <div style={{ marginTop: '14px' }}>
                      <p style={{ fontSize: '11px', fontWeight: 700, color: '#9CA3AF', marginBottom: '8px', textTransform: 'uppercase' as const }}>
                        Timeline
                      </p>
                      {dispute.timeline.map((t: any, i: number) => (
                        <div key={i} style={{ display: 'flex', gap: '10px', marginBottom: '6px', alignItems: 'flex-start' }}>
                          <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#5B62B3', marginTop: '5px', flexShrink: 0 }} />
                          <div>
                            <p style={{ margin: 0, fontSize: '12px', color: '#374151', fontWeight: 500 }}>{t.event}</p>
                            <p style={{ margin: 0, fontSize: '10px', color: '#9CA3AF' }}>
                              {new Date(t.timestamp).toLocaleString()} · {t.actor}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Respond Modal */}
      {respondModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, ...font }}>
          <div style={{ backgroundColor: 'white', borderRadius: '20px', padding: '32px', width: '100%', maxWidth: '520px', boxShadow: '0 20px 60px rgba(0,0,0,0.3)', border: '2px solid #FCD34D' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, fontFamily: 'Syne, sans-serif', color: '#111' }}>
                Respond to Dispute
              </h3>
              <button onClick={() => setRespondModal(null)} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#9CA3AF' }}>×</button>
            </div>

            <div style={{ backgroundColor: '#FEF3C7', borderRadius: '10px', padding: '12px 16px', marginBottom: '20px', border: '1px solid #FCD34D' }}>
              <p style={{ margin: 0, fontSize: '12px', color: '#92400E', fontWeight: 600 }}>
                ⚠️ Dispute: {respondModal.reason?.replace('_', ' ')} — Rs. {respondModal.bookingId?.totalPrice}
              </p>
              <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#92400E' }}>{respondModal.description}</p>
            </div>

            {/* Action choice */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '12px', fontWeight: 700, color: '#374151', display: 'block', marginBottom: '8px' }}>Choose Your Response *</label>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  onClick={() => setResponseForm(p => ({ ...p, action: 'accept_refund' }))}
                  style={{
                    flex: 1, padding: '10px', borderRadius: '10px', cursor: 'pointer',
                    border: `2px solid ${responseForm.action === 'accept_refund' ? '#16a34a' : '#E5E7EB'}`,
                    backgroundColor: responseForm.action === 'accept_refund' ? '#DCFCE7' : 'white',
                    fontWeight: 700, fontSize: '12px', color: responseForm.action === 'accept_refund' ? '#16a34a' : '#374151',
                    ...font,
                  }}
                >
                  ✅ Accept & Refund
                </button>
                <button
                  onClick={() => setResponseForm(p => ({ ...p, action: 'challenge' }))}
                  style={{
                    flex: 1, padding: '10px', borderRadius: '10px', cursor: 'pointer',
                    border: `2px solid ${responseForm.action === 'challenge' ? '#D97706' : '#E5E7EB'}`,
                    backgroundColor: responseForm.action === 'challenge' ? '#FEF3C7' : 'white',
                    fontWeight: 700, fontSize: '12px', color: responseForm.action === 'challenge' ? '#D97706' : '#374151',
                    ...font,
                  }}
                >
                  ⚔️ Challenge Dispute
                </button>
              </div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '12px', fontWeight: 700, color: '#374151', display: 'block', marginBottom: '6px' }}>Your Statement *</label>
              <textarea
                value={responseForm.vendorResponseDescription}
                onChange={e => setResponseForm(p => ({ ...p, vendorResponseDescription: e.target.value }))}
                placeholder="Provide your side of the story..."
                rows={4}
                style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1.5px solid #E5E7EB', fontSize: '13px', fontFamily: 'Montserrat, sans-serif', resize: 'vertical' as const, outline: 'none', boxSizing: 'border-box' as const }}
              />
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ fontSize: '12px', fontWeight: 700, color: '#374151', display: 'block', marginBottom: '6px' }}>Evidence URL (optional)</label>
              <input
                type="text"
                placeholder="Paste image URL as evidence..."
                value={responseForm.vendorEvidenceUrls}
                onChange={e => setResponseForm(p => ({ ...p, vendorEvidenceUrls: e.target.value }))}
                style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1.5px solid #E5E7EB', fontSize: '13px', fontFamily: 'Montserrat, sans-serif', outline: 'none', boxSizing: 'border-box' as const }}
              />
            </div>

            <button
              disabled={!responseForm.action || !responseForm.vendorResponseDescription || submitting}
              onClick={handleRespond}
              style={{
                width: '100%', padding: '13px',
                backgroundColor: (!responseForm.action || !responseForm.vendorResponseDescription) ? '#E5E7EB' : '#D97706',
                color: (!responseForm.action || !responseForm.vendorResponseDescription) ? '#9CA3AF' : 'white',
                border: 'none', borderRadius: '12px', fontWeight: 800, fontSize: '14px',
                cursor: (!responseForm.action || !responseForm.vendorResponseDescription) ? 'not-allowed' : 'pointer',
                ...font,
              }}
            >
              {submitting ? 'Submitting...' : 'Submit Response'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default VendorDisputesPage;
