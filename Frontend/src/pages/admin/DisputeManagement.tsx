import { useState, useEffect } from 'react';
import api from '../../utils/api';

const DisputeManagement = () => {
  const [disputes, setDisputes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [selectedDispute, setSelectedDispute] = useState<any>(null);
  const [verdictForm, setVerdictForm] = useState({ verdict: '', resolution: '', refundAmount: '' });
  const [submitting, setSubmitting] = useState(false);
  const [counts, setCounts] = useState({ pending: 0, underReview: 0 });
  const font = { fontFamily: 'Montserrat, sans-serif' };

  const fetchDisputes = () => {
    const params = activeTab === 'all' ? '' : `?status=${activeTab}`;
    api.get(`/disputes/all${params}`)
      .then((res: any) => {
        const list = res.data || res.disputes || res || [];
        const disputeArray = Array.isArray(list) ? list : [];
        setDisputes(disputeArray);
        setCounts({ pending: res.pendingCount || 0, underReview: res.underReviewCount || 0 });
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => { fetchDisputes(); }, [activeTab]);

  const handleMarkReview = async (disputeId: string) => {
    await api.patch(`/disputes/${disputeId}/review`, {});
    fetchDisputes();
    if (selectedDispute?._id === disputeId) {
      setSelectedDispute((p: any) => ({ ...p, status: 'under_review' }));
    }
  };

  const handleVerdict = async () => {
    if (!verdictForm.verdict || !verdictForm.resolution) return;
    setSubmitting(true);
    try {
      await api.patch(`/disputes/${selectedDispute._id}/resolve`, {
        verdict: verdictForm.verdict,
        resolution: verdictForm.resolution,
        refundAmount: verdictForm.refundAmount ? Number(verdictForm.refundAmount) : 0,
      });
      fetchDisputes();
      setSelectedDispute(null);
      setVerdictForm({ verdict: '', resolution: '', refundAmount: '' });
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to resolve');
    }
    setSubmitting(false);
  };

  const statusConfig: any = {
    pending: { label: 'Pending', color: '#D97706', bg: '#FEF3C7' },
    under_review: { label: 'Under Review', color: '#2563EB', bg: '#DBEAFE' },
    vendor_responded: { label: 'Vendor Responded', color: '#7C3AED', bg: '#EDE9FE' },
    resolved_refund: { label: 'Refunded', color: '#DC2626', bg: '#FEE2E2' },
    resolved_release: { label: 'Released', color: '#16a34a', bg: '#DCFCE7' },
    resolved_partial: { label: 'Partial Refund', color: '#D97706', bg: '#FEF3C7' },
  };

  const tabs = [
    { id: 'all', label: 'All' },
    { id: 'pending', label: `Pending ${counts.pending > 0 ? `(${counts.pending})` : ''}` },
    { id: 'under_review', label: `Under Review ${counts.underReview > 0 ? `(${counts.underReview})` : ''}` },
    { id: 'vendor_responded', label: 'Vendor Responded' },
    { id: 'resolved_refund', label: 'Resolved' },
  ];

  const isResolved = (status: string) => ['resolved_refund', 'resolved_release', 'resolved_partial'].includes(status);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F8F9FC' }}>
      <div style={{ maxWidth: '1300px', margin: '0 auto', padding: '32px 24px', ...font }}>
        <h1 style={{ margin: '0 0 4px', fontSize: '24px', fontWeight: 800, color: '#111', fontFamily: 'Syne, sans-serif' }}>
          🛡️ Dispute Management
        </h1>
        <p style={{ margin: '0 0 28px', fontSize: '14px', color: '#6B7280' }}>
          Review and resolve client-vendor disputes
        </p>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' as const }}>
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '8px 18px', borderRadius: '10px',
                fontWeight: 700, fontSize: '12px', cursor: 'pointer',
                backgroundColor: activeTab === tab.id ? '#5B62B3' : 'white',
                color: activeTab === tab.id ? 'white' : '#6B7280',
                border: activeTab === tab.id ? 'none' : '1px solid #E5E7EB',
                ...font,
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {loading ? (
          <p style={{ color: '#9CA3AF' }}>Loading disputes...</p>
        ) : disputes.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px', backgroundColor: 'white', borderRadius: '16px', border: '1px solid #E5E7EB' }}>
            <p style={{ fontSize: '48px', marginBottom: '12px' }}>✅</p>
            <p style={{ fontWeight: 700, color: '#111', marginBottom: '6px' }}>No disputes found</p>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: '20px' }}>

            {/* LEFT — Dispute list */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' as const, gap: '12px' }}>
              {disputes.map((dispute: any) => {
                const sc = statusConfig[dispute.status] || statusConfig.pending;
                const selected = selectedDispute?._id === dispute._id;
                return (
                  <div
                    key={dispute._id}
                    onClick={() => setSelectedDispute(dispute)}
                    style={{
                      backgroundColor: 'white', borderRadius: '14px',
                      border: `2px solid ${selected ? '#5B62B3' : '#E5E7EB'}`,
                      padding: '16px 20px', cursor: 'pointer',
                      boxShadow: selected ? '0 4px 20px rgba(91,98,179,0.15)' : '0 2px 6px rgba(0,0,0,0.04)',
                      transition: 'border-color 0.15s',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                      <div>
                        <p style={{ margin: 0, fontWeight: 700, fontSize: '14px', color: '#111' }}>
                          {dispute.clientId?.name} → {dispute.vendorId?.name}
                        </p>
                        <p style={{ margin: '2px 0 0', fontSize: '11px', color: '#6B7280' }}>
                          Rs. {dispute.bookingId?.totalPrice} · {new Date(dispute.createdAt).toLocaleDateString('en-NP', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                      </div>
                      <span style={{ padding: '3px 10px', borderRadius: '20px', fontSize: '10px', fontWeight: 700, backgroundColor: sc.bg, color: sc.color }}>
                        {sc.label}
                      </span>
                    </div>
                    <p style={{ margin: 0, fontSize: '12px', color: '#374151', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const }}>
                      <strong>{dispute.reason?.replace('_', ' ').toUpperCase()}</strong> — {dispute.description}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* RIGHT — Detail panel */}
            {selectedDispute ? (
              <div style={{ width: '440px', flexShrink: 0 }}>
                <div style={{ backgroundColor: 'white', borderRadius: '16px', border: '1px solid #E5E7EB', overflow: 'hidden', position: 'sticky' as const, top: '24px' }}>

                  {/* Header */}
                  <div style={{ padding: '20px 24px', borderBottom: '1px solid #E5E7EB', backgroundColor: '#F8F9FC' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, fontFamily: 'Syne, sans-serif', color: '#111' }}>
                        Dispute Detail
                      </h3>
                      <button onClick={() => setSelectedDispute(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF', fontSize: '18px' }}>×</button>
                    </div>
                  </div>

                  <div style={{ padding: '20px 24px', maxHeight: '70vh', overflowY: 'auto' }}>

                    {/* Booking info */}
                    <div style={{ marginBottom: '16px' }}>
                      <p style={{ fontSize: '11px', fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase' as const, marginBottom: '8px' }}>Booking Info</p>
                      <div style={{ backgroundColor: '#F8F9FC', borderRadius: '10px', padding: '12px 14px' }}>
                        <p style={{ margin: '0 0 3px', fontSize: '13px', fontWeight: 600 }}>Client: {selectedDispute.clientId?.name} ({selectedDispute.clientId?.email})</p>
                        <p style={{ margin: '0 0 3px', fontSize: '13px', fontWeight: 600 }}>Vendor: {selectedDispute.vendorId?.name}</p>
                        <p style={{ margin: 0, fontSize: '13px', color: '#5B62B3', fontWeight: 700 }}>Amount: Rs. {selectedDispute.bookingId?.totalPrice}</p>
                      </div>
                    </div>

                    {/* Client complaint */}
                    <div style={{ marginBottom: '16px' }}>
                      <p style={{ fontSize: '11px', fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase' as const, marginBottom: '8px' }}>Client Complaint</p>
                      <div style={{ backgroundColor: '#FFF9F0', borderRadius: '10px', padding: '12px 14px', border: '1px solid #FDE68A' }}>
                        <p style={{ margin: '0 0 4px', fontSize: '12px', fontWeight: 700, color: '#D97706' }}>{selectedDispute.reason?.replace('_', ' ').toUpperCase()}</p>
                        <p style={{ margin: 0, fontSize: '12px', color: '#374151', lineHeight: 1.5 }}>{selectedDispute.description}</p>
                        {selectedDispute.evidenceUrls?.length > 0 && (
                          <a href={selectedDispute.evidenceUrls[0]} target="_blank" rel="noreferrer" style={{ fontSize: '11px', color: '#5B62B3', display: 'block', marginTop: '6px' }}>📎 View Evidence</a>
                        )}
                      </div>
                    </div>

                    {/* Vendor response */}
                    {selectedDispute.vendorResponseDescription && (
                      <div style={{ marginBottom: '16px' }}>
                        <p style={{ fontSize: '11px', fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase' as const, marginBottom: '8px' }}>Vendor Response</p>
                        <div style={{ backgroundColor: '#F0FDF4', borderRadius: '10px', padding: '12px 14px', border: '1px solid #86EFAC' }}>
                          <p style={{ margin: 0, fontSize: '12px', color: '#374151', lineHeight: 1.5 }}>{selectedDispute.vendorResponseDescription}</p>
                          {selectedDispute.vendorEvidenceUrls?.length > 0 && (
                            <a href={selectedDispute.vendorEvidenceUrls[0]} target="_blank" rel="noreferrer" style={{ fontSize: '11px', color: '#5B62B3', display: 'block', marginTop: '6px' }}>📎 View Vendor Evidence</a>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Timeline */}
                    {selectedDispute.timeline?.length > 0 && (
                      <div style={{ marginBottom: '16px' }}>
                        <p style={{ fontSize: '11px', fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase' as const, marginBottom: '8px' }}>Timeline</p>
                        {selectedDispute.timeline.map((t: any, i: number) => (
                          <div key={i} style={{ display: 'flex', gap: '10px', marginBottom: '8px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column' as const, alignItems: 'center' }}>
                              <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#5B62B3', flexShrink: 0, marginTop: '4px' }} />
                              {i < selectedDispute.timeline.length - 1 && <div style={{ width: '1px', flex: 1, backgroundColor: '#E5E7EB', minHeight: '16px' }} />}
                            </div>
                            <div style={{ paddingBottom: '8px' }}>
                              <p style={{ margin: 0, fontSize: '12px', color: '#111', fontWeight: 500 }}>{t.event}</p>
                              <p style={{ margin: 0, fontSize: '10px', color: '#9CA3AF' }}>{new Date(t.timestamp).toLocaleString()} · {t.actor}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Mark under review button */}
                    {selectedDispute.status === 'pending' && (
                      <button
                        onClick={() => handleMarkReview(selectedDispute._id)}
                        style={{ width: '100%', padding: '10px', backgroundColor: '#DBEAFE', color: '#2563EB', border: '1.5px solid #93C5FD', borderRadius: '10px', fontWeight: 700, fontSize: '12px', cursor: 'pointer', marginBottom: '12px', ...font }}
                      >
                        🔍 Mark as Under Review
                      </button>
                    )}

                    {/* Verdict section — only show if not resolved */}
                    {!isResolved(selectedDispute.status) && (
                      <div style={{ borderTop: '1px solid #E5E7EB', paddingTop: '16px' }}>
                        <p style={{ fontSize: '12px', fontWeight: 700, color: '#374151', marginBottom: '10px' }}>Issue Verdict</p>

                        {/* Verdict buttons */}
                        <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '8px', marginBottom: '12px' }}>
                          {[
                            { value: 'resolved_refund', label: '💸 Full Refund to Client', color: '#DC2626', bg: '#FEE2E2', border: '#FCA5A5' },
                            { value: 'resolved_release', label: '✅ Release Payment to Vendor', color: '#16a34a', bg: '#DCFCE7', border: '#86EFAC' },
                            { value: 'resolved_partial', label: '⚖️ Partial Refund', color: '#D97706', bg: '#FEF3C7', border: '#FCD34D' },
                          ].map(v => (
                            <button
                              key={v.value}
                              onClick={() => setVerdictForm(p => ({ ...p, verdict: v.value }))}
                              style={{
                                padding: '10px 14px', borderRadius: '10px', cursor: 'pointer',
                                border: `2px solid ${verdictForm.verdict === v.value ? v.border : '#E5E7EB'}`,
                                backgroundColor: verdictForm.verdict === v.value ? v.bg : 'white',
                                fontWeight: 700, fontSize: '12px', color: verdictForm.verdict === v.value ? v.color : '#374151',
                                textAlign: 'left' as const, ...font,
                              }}
                            >
                              {v.label}
                            </button>
                          ))}
                        </div>

                        {/* Partial refund amount */}
                        {verdictForm.verdict === 'resolved_partial' && (
                          <input
                            type="number"
                            placeholder="Refund amount (Rs.)"
                            value={verdictForm.refundAmount}
                            onChange={e => setVerdictForm(p => ({ ...p, refundAmount: e.target.value }))}
                            style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1.5px solid #E5E7EB', fontSize: '13px', fontFamily: 'Montserrat, sans-serif', outline: 'none', marginBottom: '10px', boxSizing: 'border-box' as const }}
                          />
                        )}

                        {/* Resolution notes */}
                        <textarea
                          placeholder="Admin resolution notes..."
                          value={verdictForm.resolution}
                          onChange={e => setVerdictForm(p => ({ ...p, resolution: e.target.value }))}
                          rows={3}
                          style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1.5px solid #E5E7EB', fontSize: '12px', fontFamily: 'Montserrat, sans-serif', resize: 'vertical' as const, outline: 'none', marginBottom: '12px', boxSizing: 'border-box' as const }}
                        />

                        <button
                          disabled={!verdictForm.verdict || !verdictForm.resolution || submitting}
                          onClick={handleVerdict}
                          style={{
                            width: '100%', padding: '12px',
                            backgroundColor: (!verdictForm.verdict || !verdictForm.resolution) ? '#E5E7EB' : '#5B62B3',
                            color: (!verdictForm.verdict || !verdictForm.resolution) ? '#9CA3AF' : 'white',
                            border: 'none', borderRadius: '12px', fontWeight: 800, fontSize: '13px',
                            cursor: (!verdictForm.verdict || !verdictForm.resolution) ? 'not-allowed' : 'pointer',
                            ...font,
                          }}
                        >
                          {submitting ? 'Processing...' : '⚖️ Issue Final Verdict'}
                        </button>
                      </div>
                    )}

                    {/* Already resolved banner */}
                    {isResolved(selectedDispute.status) && (
                      <div style={{ backgroundColor: '#DCFCE7', borderRadius: '10px', padding: '14px 16px', border: '1px solid #86EFAC', textAlign: 'center' as const }}>
                        <p style={{ margin: 0, fontWeight: 700, fontSize: '13px', color: '#16a34a' }}>✅ This dispute has been resolved</p>
                        {selectedDispute.resolution && <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#374151' }}>{selectedDispute.resolution}</p>}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ width: '440px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'white', borderRadius: '16px', border: '1px solid #E5E7EB', color: '#9CA3AF', fontSize: '13px' }}>
                ← Select a dispute to review
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DisputeManagement;
