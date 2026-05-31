import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, Clock, Award, User, BookOpen } from 'lucide-react';
import api from '../../utils/api';
import VendorSidebar from '../../components/Vendor/VendorSidebar';

interface PendingApproval {
  _id: string;
  clientId: {
    _id: string;
    name: string;
    email: string;
  };
  courseId: {
    _id: string;
    title: string;
  };
  quizScore: number;
  quizAttempts: number;
  quizStatus: string;
  createdAt: string;
}

const QuizApprovals: React.FC = () => {
  const navigate = useNavigate();
  const [approvals, setApprovals] = useState<PendingApproval[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);

  useEffect(() => {
    fetchPendingApprovals();
  }, []);

  const fetchPendingApprovals = async () => {
    try {
      setLoading(true);
      const res: any = await api.get('/enrollments/vendor/pending-approvals');
      setApprovals(res?.data?.data || []);
    } catch (err: any) {
      console.error('Failed to fetch pending approvals:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (enrollmentId: string) => {
    setProcessing(enrollmentId);
    try {
      await api.patch(`/enrollments/${enrollmentId}/approve-quiz`);
      alert('Quiz approved and certificate issued!');
      fetchPendingApprovals();
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to approve quiz');
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async (enrollmentId: string) => {
    const reason = prompt('Reason for rejection (optional):');
    if (reason === null) return; // User cancelled

    setProcessing(enrollmentId);
    try {
      await api.patch(`/enrollments/${enrollmentId}/reject-quiz`, { reason });
      alert('Quiz rejected. Student can retake the quiz.');
      fetchPendingApprovals();
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to reject quiz');
    } finally {
      setProcessing(null);
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#F8F9FC', fontFamily: 'Montserrat, sans-serif' }}>
      <VendorSidebar />

      <div style={{ flex: 1, padding: '32px', overflow: 'auto' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ marginBottom: '32px' }}>
            <h1 style={{ margin: '0 0 8px', fontFamily: 'Syne, sans-serif', fontSize: '32px', fontWeight: 800, color: '#111' }}>
              Quiz Approvals
            </h1>
            <p style={{ margin: 0, color: '#6B7280', fontSize: '16px' }}>
              Review and approve student quiz submissions to issue certificates
            </p>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '64px', color: '#6B7280' }}>
              <Clock size={48} style={{ margin: '0 auto 16px', opacity: 0.5 }} />
              <p>Loading pending approvals...</p>
            </div>
          ) : approvals.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '64px', backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
              <CheckCircle size={48} style={{ margin: '0 auto 16px', color: '#10B981', opacity: 0.5 }} />
              <h3 style={{ margin: '0 0 8px', fontFamily: 'Syne, sans-serif', color: '#111' }}>
                No pending approvals
              </h3>
              <p style={{ margin: 0, color: '#6B7280' }}>
                All quiz submissions have been reviewed
              </p>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '16px' }}>
              {approvals.map((approval) => (
                <div
                  key={approval._id}
                  style={{
                    backgroundColor: 'white',
                    borderRadius: '12px',
                    padding: '24px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                    display: 'grid',
                    gridTemplateColumns: '1fr auto',
                    gap: '24px',
                    alignItems: 'center'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                      <User size={20} style={{ color: '#5B62B3' }} />
                      <span style={{ fontWeight: 600, fontSize: '16px', color: '#111' }}>
                        {approval.clientId.name}
                      </span>
                      <span style={{ color: '#9CA3AF', fontSize: '14px' }}>
                        ({approval.clientId.email})
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                      <BookOpen size={18} style={{ color: '#E91E63' }} />
                      <span style={{ fontSize: '15px', color: '#374151' }}>
                        {approval.courseId.title}
                      </span>
                    </div>

                    <div style={{ display: 'flex', gap: '24px', marginTop: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Award size={18} style={{ color: '#10B981' }} />
                        <div>
                          <span style={{ fontWeight: 700, fontSize: '18px', color: '#111' }}>
                            {approval.quizScore}%
                          </span>
                          <span style={{ color: '#6B7280', fontSize: '14px', marginLeft: '4px' }}>
                            score
                          </span>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Clock size={18} style={{ color: '#F59E0B' }} />
                        <span style={{ fontSize: '14px', color: '#6B7280' }}>
                          Attempt {approval.quizAttempts}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button
                      onClick={() => handleApprove(approval._id)}
                      disabled={processing === approval._id}
                      style={{
                        padding: '10px 20px',
                        backgroundColor: '#10B981',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        fontWeight: 600,
                        fontSize: '14px',
                        cursor: processing === approval._id ? 'not-allowed' : 'pointer',
                        fontFamily: 'Montserrat, sans-serif',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        opacity: processing === approval._id ? 0.7 : 1
                      }}
                    >
                      <CheckCircle size={18} />
                      {processing === approval._id ? 'Processing...' : 'Approve'}
                    </button>

                    <button
                      onClick={() => handleReject(approval._id)}
                      disabled={processing === approval._id}
                      style={{
                        padding: '10px 20px',
                        backgroundColor: '#E91E63',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        fontWeight: 600,
                        fontSize: '14px',
                        cursor: processing === approval._id ? 'not-allowed' : 'pointer',
                        fontFamily: 'Montserrat, sans-serif',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        opacity: processing === approval._id ? 0.7 : 1
                      }}
                    >
                      <XCircle size={18} />
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuizApprovals;
