import { useState, useEffect, useRef } from 'react';
import VendorSidebar from '../../components/Vendor/VendorSidebar';
import api from '../../utils/api';
import { Upload, X, ImageIcon } from 'lucide-react';

const MAX_EVIDENCE = 3;

const VendorDisputesPage = () => {
  const [disputes, setDisputes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [respondModal, setRespondModal] = useState<any>(null);
  const [responseForm, setResponseForm] = useState({ action: '', vendorResponseDescription: '' });
  // Multi-photo evidence
  const [evidenceFiles, setEvidenceFiles] = useState<File[]>([]);
  const [evidencePreviews, setEvidencePreviews] = useState<string[]>([]);
  const [uploadMode, setUploadMode] = useState<'file' | 'url'>('file');
  const [evidenceUrls, setEvidenceUrls] = useState<string[]>(['', '', '']);
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
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

  // ── Evidence helpers ──────────────────────────────────────────
  const addFiles = (files: FileList | File[]) => {
    const arr = Array.from(files);
    const remaining = MAX_EVIDENCE - evidenceFiles.length;
    if (remaining <= 0) return;
    const toAdd = arr.slice(0, remaining).filter(f => {
      if (!f.type.startsWith('image/')) { alert('Only image files allowed'); return false; }
      if (f.size > 5 * 1024 * 1024) { alert(`${f.name} exceeds 5MB`); return false; }
      return true;
    });
    setEvidenceFiles(prev => [...prev, ...toAdd]);
    toAdd.forEach(file => {
      const reader = new FileReader();
      reader.onload = () => setEvidencePreviews(prev => [...prev, reader.result as string]);
      reader.readAsDataURL(file);
    });
  };

  const removeFile = (idx: number) => {
    setEvidenceFiles(prev => prev.filter((_, i) => i !== idx));
    setEvidencePreviews(prev => prev.filter((_, i) => i !== idx));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const resetModal = () => {
    setRespondModal(null);
    setEvidenceFiles([]); setEvidencePreviews([]);
    setEvidenceUrls(['', '', '']);
    setUploadMode('file');
    setResponseForm({ action: '', vendorResponseDescription: '' });
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleRespond = async () => {
    if (!responseForm.action || !responseForm.vendorResponseDescription) return;
    setSubmitting(true);
    try {
      let finalUrls: string[] = [];
      if (uploadMode === 'file' && evidenceFiles.length > 0) {
        for (let i = 0; i < evidenceFiles.length; i++) {
          try {
            const formData = new FormData();
            formData.append('image', evidenceFiles[i]);
            const res: any = await api.post('/uploads/dispute-evidence', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
            finalUrls.push(res.data?.url || res.url || evidencePreviews[i]);
          } catch { finalUrls.push(evidencePreviews[i]); }
        }
      } else if (uploadMode === 'url') {
        finalUrls = evidenceUrls.filter(u => u.trim() !== '');
      }
      await api.patch(`/disputes/${respondModal._id}/respond`, {
        action: responseForm.action,
        vendorResponseDescription: responseForm.vendorResponseDescription,
        vendorEvidenceUrls: finalUrls,
      });
      const updated: any = await api.get('/disputes/vendor');
      setDisputes(updated.data || updated || []);
      resetModal();
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to submit response');
    }
    setSubmitting(false);
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#F8F9FC' }}>
      <VendorSidebar />
      <div style={{ marginLeft: '280px', flex: 1, padding: '32px', ...font }}>
        <h1 style={{ margin: '0 0 4px', fontSize: '24px', fontWeight: 800, color: '#111', fontFamily: 'Syne, sans-serif' }}>Dispute Center</h1>
        <p style={{ margin: '0 0 28px', fontSize: '14px', color: '#6B7280' }}>Manage and respond to client disputes on your bookings</p>

        {loading ? <p style={{ color: '#9CA3AF' }}>Loading disputes...</p>
          : disputes.length === 0 ? (
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
                  <div key={dispute._id} style={{ backgroundColor: 'white', borderRadius: '16px', border: `2px solid ${isPending ? '#FCD34D' : '#E5E7EB'}`, padding: '20px 24px', boxShadow: isPending ? '0 4px 20px rgba(251,191,36,0.15)' : '0 2px 8px rgba(0,0,0,0.05)' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '14px' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                          <span style={{ padding: '3px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: 700, backgroundColor: sc.bg, color: sc.color }}>{sc.pulse && '● '}{sc.label}</span>
                          <span style={{ fontSize: '11px', color: '#9CA3AF' }}>Filed {new Date(dispute.createdAt).toLocaleDateString('en-NP', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                        </div>
                        <p style={{ margin: 0, fontWeight: 700, fontSize: '15px', color: '#111' }}>
                          Booking on {dispute.bookingId?.bookingDate ? new Date(dispute.bookingId.bookingDate).toLocaleDateString('en-NP', { day: 'numeric', month: 'long', year: 'numeric' }) : 'N/A'}
                        </p>
                        <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#6B7280' }}>Client: {dispute.clientId?.name} · Rs. {dispute.bookingId?.totalPrice}</p>
                      </div>
                      {isPending && (
                        <button onClick={() => setRespondModal(dispute)} style={{ padding: '8px 20px', backgroundColor: '#D97706', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 700, fontSize: '12px', cursor: 'pointer', ...font }}>
                          Respond Now →
                        </button>
                      )}
                    </div>
                    <div style={{ backgroundColor: '#FFF9F0', borderRadius: '10px', padding: '14px 16px', border: '1px solid #FDE68A' }}>
                      <p style={{ margin: '0 0 4px', fontSize: '11px', fontWeight: 700, color: '#D97706', textTransform: 'uppercase' as const }}>Client's Complaint</p>
                      <p style={{ margin: '0 0 4px', fontWeight: 600, fontSize: '13px', color: '#111' }}>Category: {dispute.reason?.replace('_', ' ').toUpperCase()}</p>
                      <p style={{ margin: 0, fontSize: '13px', color: '#374151', lineHeight: 1.5 }}>{dispute.description}</p>
                      {dispute.evidenceUrls?.length > 0 && (
                        <div style={{ marginTop: '10px' }}>
                          <p style={{ margin: '0 0 6px', fontSize: '11px', fontWeight: 700, color: '#9CA3AF' }}>CLIENT EVIDENCE</p>
                          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' as const }}>
                            {dispute.evidenceUrls.map((url: string, i: number) => (
                              <img key={i} src={url} alt={`Evidence ${i+1}`} onClick={() => setLightboxSrc(url)}
                                style={{ width: '80px', height: '64px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #FDE68A', cursor: 'pointer' }} />
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    {dispute.vendorResponseDescription && (
                      <div style={{ backgroundColor: '#F0FDF4', borderRadius: '10px', padding: '14px 16px', border: '1px solid #86EFAC', marginTop: '10px' }}>
                        <p style={{ margin: '0 0 4px', fontSize: '11px', fontWeight: 700, color: '#16a34a', textTransform: 'uppercase' as const }}>Your Response</p>
                        <p style={{ margin: 0, fontSize: '13px', color: '#374151' }}>{dispute.vendorResponseDescription}</p>
                        {dispute.vendorEvidenceUrls?.length > 0 && (
                          <div style={{ marginTop: '8px', display: 'flex', gap: '8px', flexWrap: 'wrap' as const }}>
                            {dispute.vendorEvidenceUrls.map((url: string, i: number) => (
                              <img key={i} src={url} alt={`Your evidence ${i+1}`} onClick={() => setLightboxSrc(url)}
                                style={{ width: '80px', height: '64px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #86EFAC', cursor: 'pointer' }} />
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                    {dispute.timeline?.length > 0 && (
                      <div style={{ marginTop: '14px' }}>
                        <p style={{ fontSize: '11px', fontWeight: 700, color: '#9CA3AF', marginBottom: '8px', textTransform: 'uppercase' as const }}>Timeline</p>
                        {dispute.timeline.map((t: any, i: number) => (
                          <div key={i} style={{ display: 'flex', gap: '10px', marginBottom: '6px', alignItems: 'flex-start' }}>
                            <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#5B62B3', marginTop: '5px', flexShrink: 0 }} />
                            <div>
                              <p style={{ margin: 0, fontSize: '12px', color: '#374151', fontWeight: 500 }}>{t.event}</p>
                              <p style={{ margin: 0, fontSize: '10px', color: '#9CA3AF' }}>{new Date(t.timestamp).toLocaleString()} · {t.actor}</p>
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

      {/* ── RESPOND MODAL ── */}
      {respondModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '16px', ...font }}>
          <div style={{ backgroundColor: 'white', borderRadius: '20px', padding: '28px', width: '100%', maxWidth: '540px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.3)', border: '2px solid #FCD34D' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, fontFamily: 'Syne, sans-serif', color: '#111' }}>Respond to Dispute</h3>
              <button onClick={resetModal} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#9CA3AF' }}>×</button>
            </div>

            <div style={{ backgroundColor: '#FEF3C7', borderRadius: '10px', padding: '12px 16px', marginBottom: '20px', border: '1px solid #FCD34D' }}>
              <p style={{ margin: 0, fontSize: '12px', color: '#92400E', fontWeight: 600 }}>⚠️ {respondModal.reason?.replace('_', ' ')} — Rs. {respondModal.bookingId?.totalPrice}</p>
              <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#92400E' }}>{respondModal.description}</p>
            </div>

            {/* Action */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '12px', fontWeight: 700, color: '#374151', display: 'block', marginBottom: '8px' }}>Choose Your Response *</label>
              <div style={{ display: 'flex', gap: '10px' }}>
                {[{ value: 'accept_refund', label: ' Accept & Resolve', activeColor: '#16a34a', activeBg: '#DCFCE7', activeBorder: '#86EFAC' },
                  { value: 'challenge', label: ' Challenge Dispute', activeColor: '#D97706', activeBg: '#FEF3C7', activeBorder: '#FCD34D' }].map(opt => (
                  <button key={opt.value} onClick={() => setResponseForm(p => ({ ...p, action: opt.value }))}
                    style={{ flex: 1, padding: '10px', borderRadius: '10px', cursor: 'pointer', border: `2px solid ${responseForm.action === opt.value ? opt.activeBorder : '#E5E7EB'}`, backgroundColor: responseForm.action === opt.value ? opt.activeBg : 'white', fontWeight: 700, fontSize: '12px', color: responseForm.action === opt.value ? opt.activeColor : '#374151', ...font }}>
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Statement */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '12px', fontWeight: 700, color: '#374151', display: 'block', marginBottom: '6px' }}>Your Statement *</label>
              <textarea value={responseForm.vendorResponseDescription} onChange={e => setResponseForm(p => ({ ...p, vendorResponseDescription: e.target.value }))} placeholder="Provide your side of the story..." rows={4}
                style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1.5px solid #E5E7EB', fontSize: '13px', fontFamily: 'Montserrat, sans-serif', resize: 'vertical' as const, outline: 'none', boxSizing: 'border-box' as const }} />
            </div>

            {/* Evidence */}
            <div style={{ marginBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                <label style={{ fontSize: '12px', fontWeight: 700, color: '#374151' }}>
                  Evidence Photos <span style={{ fontWeight: 400, color: '#9CA3AF' }}>(up to {MAX_EVIDENCE}, optional)</span>
                </label>
                <div style={{ display: 'flex', gap: '3px', backgroundColor: '#F3F4F6', borderRadius: '8px', padding: '3px' }}>
                  {(['file', 'url'] as const).map(mode => (
                    <button key={mode}
                      onClick={() => { setUploadMode(mode); setEvidenceFiles([]); setEvidencePreviews([]); setEvidenceUrls(['','','']); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                      style={{ padding: '4px 10px', border: 'none', borderRadius: '6px', fontSize: '11px', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', backgroundColor: uploadMode === mode ? '#fff' : 'transparent', color: uploadMode === mode ? '#5B62B3' : '#6B7280', boxShadow: uploadMode === mode ? '0 1px 3px rgba(0,0,0,0.1)' : 'none' }}>
                      {mode === 'file' ? 'Upload' : 'URL'}
                    </button>
                  ))}
                </div>
              </div>

              {uploadMode === 'file' ? (
                <div>
                  {evidencePreviews.length > 0 && (
                    <div style={{ display: 'flex', gap: '10px', marginBottom: '10px', flexWrap: 'wrap' as const }}>
                      {evidencePreviews.map((src, idx) => (
                        <div key={idx} style={{ position: 'relative', width: '100px', height: '80px', borderRadius: '10px', overflow: 'hidden', border: '1.5px solid #5B62B3', cursor: 'pointer' }} onClick={() => setLightboxSrc(src)}>
                          <img src={src} alt={`Evidence ${idx+1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          <button onClick={e => { e.stopPropagation(); removeFile(idx); }}
                            style={{ position: 'absolute', top: '4px', right: '4px', backgroundColor: 'rgba(0,0,0,0.65)', border: 'none', borderRadius: '50%', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#fff', padding: 0 }}>
                            <X size={11} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  {evidenceFiles.length < MAX_EVIDENCE && (
                    <div
                      onDrop={e => { e.preventDefault(); addFiles(e.dataTransfer.files); }}
                      onDragOver={e => e.preventDefault()}
                      onClick={() => fileInputRef.current?.click()}
                      style={{ border: '2px dashed #D1D5DB', borderRadius: '12px', padding: '20px', display: 'flex', flexDirection: 'column' as const, alignItems: 'center', gap: '6px', cursor: 'pointer', backgroundColor: '#FAFAFA' }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = '#5B62B3'; e.currentTarget.style.backgroundColor = '#EEEEF8'; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = '#D1D5DB'; e.currentTarget.style.backgroundColor = '#FAFAFA'; }}>
                      <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#EEEEF8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Upload size={16} color="#5B62B3" />
                      </div>
                      <p style={{ margin: 0, fontSize: '12px', fontWeight: 600, color: '#374151' }}>
                        {evidenceFiles.length === 0 ? 'Click or drag & drop photos' : `Add more (${evidenceFiles.length}/${MAX_EVIDENCE})`}
                      </p>
                      <p style={{ margin: 0, fontSize: '11px', color: '#9CA3AF' }}>PNG, JPG, WEBP · max 5MB each</p>
                    </div>
                  )}
                  <input ref={fileInputRef} type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={e => { if (e.target.files) addFiles(e.target.files); }} />
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '8px' }}>
                  {[0,1,2].map(i => (
                    <input key={i} type="url" value={evidenceUrls[i]} placeholder={`Photo URL ${i+1}${i === 0 ? ' *' : ' (optional)'}`}
                      onChange={e => setEvidenceUrls(prev => { const next = [...prev]; next[i] = e.target.value; return next; })}
                      style={{ width: '100%', padding: '9px 14px', borderRadius: '10px', border: '1.5px solid #E5E7EB', fontSize: '13px', fontFamily: 'Montserrat, sans-serif', outline: 'none', boxSizing: 'border-box' as const }} />
                  ))}
                </div>
              )}
            </div>

            <button disabled={!responseForm.action || !responseForm.vendorResponseDescription || submitting} onClick={handleRespond}
              style={{ width: '100%', padding: '13px', backgroundColor: (!responseForm.action || !responseForm.vendorResponseDescription) ? '#E5E7EB' : '#D97706', color: (!responseForm.action || !responseForm.vendorResponseDescription) ? '#9CA3AF' : 'white', border: 'none', borderRadius: '12px', fontWeight: 800, fontSize: '14px', cursor: (!responseForm.action || !responseForm.vendorResponseDescription) ? 'not-allowed' : 'pointer', ...font }}>
              {submitting ? 'Submitting...' : 'Submit Response'}
            </button>
          </div>
        </div>
      )}

      {/* ── LIGHTBOX ── */}
      {lightboxSrc && (
        <div onClick={() => setLightboxSrc(null)} style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.88)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', cursor: 'zoom-out' }}>
          <img src={lightboxSrc} alt="Evidence" style={{ maxWidth: '90vw', maxHeight: '85vh', objectFit: 'contain', borderRadius: '12px' }} />
          <button onClick={() => setLightboxSrc(null)} style={{ position: 'absolute', top: '20px', right: '20px', background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#fff' }}>
            <X size={18} />
          </button>
        </div>
      )}
    </div>
  );
};

export default VendorDisputesPage;