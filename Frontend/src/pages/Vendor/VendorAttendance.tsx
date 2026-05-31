import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Users, CheckCircle, XCircle, Award, ChevronDown, ChevronUp, AlertCircle, ArrowLeft } from 'lucide-react';
import api from '../../utils/api';
import VendorSidebar from '../../components/Vendor/VendorSidebar';

interface AttendanceLog {
  date: string;
  status: 'present' | 'absent';
}

interface Student {
  _id: string;
  clientId: { _id: string; name: string; email: string };
  progress: number;
  onlineCompleted: boolean;
  quizPassed: boolean;
  quizScore: number;
  attendancePercentage: number;
  totalClasses: number;
  attendedClasses: number;
  practicalPassed: boolean;
  certificateEligible: boolean;
  attendanceLog: AttendanceLog[];
}

const VendorAttendance: React.FC = () => {
  const { id: courseId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedStudent, setExpandedStudent] = useState<string | null>(null);
  const [markingId, setMarkingId] = useState<string | null>(null);
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const todayDate = new Date().toISOString().split('T')[0];

  useEffect(() => {
    if (courseId) fetchStudents();
  }, [courseId]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get(`/enrollments/course/${courseId}/students`);
      const data = res.data?.data || res.data || [];
      setStudents(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error('fetchStudents error:', err);
      setError(err.response?.data?.message || 'Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  const markAttendance = async (enrollmentId: string, status: 'present' | 'absent') => {
    try {
      setMarkingId(enrollmentId + status);
      await api.patch(`/enrollments/${enrollmentId}/attendance-mark`, {
        date: todayDate,
        status,
      });
      await fetchStudents();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to mark attendance');
    } finally {
      setMarkingId(null);
    }
  };

  const approvePractical = async (enrollmentId: string) => {
    if (!window.confirm('Approve practical training for this student?')) return;
    try {
      setApprovingId(enrollmentId);
      await api.patch(`/enrollments/${enrollmentId}/practical`);
      await fetchStudents();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to approve practical');
    } finally {
      setApprovingId(null);
    }
  };

  const getTodayStatus = (student: Student): 'present' | 'absent' | null => {
    const log = student.attendanceLog?.find(
      l => new Date(l.date).toISOString().split('T')[0] === todayDate
    );
    return log?.status || null;
  };

  const totalStudents = students.length;
  const avgAttendance = totalStudents > 0
    ? Math.round(students.reduce((sum, s) => sum + (Number(s.attendancePercentage) || 0), 0) / totalStudents)
    : 0;
  const eligibleCount = students.filter(s => s.certificateEligible).length;
  const presentToday = students.filter(s => getTodayStatus(s) === 'present').length;

  if (loading) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#fafafa' }}>
        <VendorSidebar />
        <div style={{ marginLeft: '280px', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: '40px', height: '40px', border: '4px solid #e2e8f0', borderTopColor: '#5B62B3', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#fafafa', fontFamily: 'Montserrat, sans-serif' }}>
      <VendorSidebar />
      <div style={{ marginLeft: '280px', flex: 1, padding: '40px' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '8px' }}>
          <button
            onClick={() => navigate('/vendor/courses')}
            style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', color: '#6B7280', fontSize: '14px', fontFamily: 'Montserrat, sans-serif' }}
          >
            <ArrowLeft size={16} /> Back to Courses
          </button>
        </div>
        <h1 style={{ fontSize: '28px', fontWeight: 800, margin: '0 0 4px', color: '#111' }}>
          Attendance Management
        </h1>
        <p style={{ fontSize: '14px', color: '#6B7280', margin: '0 0 32px' }}>
          Track student attendance and practical approval for this course
        </p>

        {/* Stats Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '32px' }}>
          {[
            { label: 'Total Students', value: totalStudents, color: '#5B62B3', bg: 'rgba(91,98,179,0.08)' },
            { label: 'Present Today', value: presentToday, color: '#10B981', bg: '#ECFDF5' },
            { label: 'Avg Attendance', value: `${avgAttendance}%`, color: avgAttendance >= 80 ? '#10B981' : '#EF4444', bg: avgAttendance >= 80 ? '#ECFDF5' : '#FEF2F2' },
            { label: 'Certificate Eligible', value: eligibleCount, color: '#D97706', bg: '#FEF3C7' },
          ].map(card => (
            <div key={card.label} style={{ backgroundColor: 'white', padding: '20px', borderRadius: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', border: '1px solid #f1f5f9' }}>
              <p style={{ margin: '0 0 8px', fontSize: '12px', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{card.label}</p>
              <div style={{ fontSize: '28px', fontWeight: 800, color: card.color }}>{card.value}</div>
            </div>
          ))}
        </div>

        {error && (
          <div style={{ padding: '16px', backgroundColor: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '12px', color: '#991B1B', marginBottom: '24px', fontSize: '14px' }}>
            {error}
          </div>
        )}

        {/* Student List */}
        {students.length === 0 ? (
          <div style={{ backgroundColor: 'white', padding: '60px', borderRadius: '16px', textAlign: 'center', border: '1px dashed #E5E7EB' }}>
            <Users size={48} style={{ margin: '0 auto 16px', color: '#D1D5DB' }} />
            <p style={{ fontSize: '16px', fontWeight: 600, color: '#374151', margin: '0 0 4px' }}>No students enrolled</p>
            <p style={{ fontSize: '14px', color: '#6B7280', margin: 0 }}>Students will appear here once they enroll in this course</p>
          </div>
        ) : (
          <>
            {/* Table Header */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 40px',
              gap: '16px',
              padding: '12px 20px',
              backgroundColor: '#F8FAFC',
              borderRadius: '10px',
              marginBottom: '8px',
            }}>
              {['Student', 'Online', 'Quiz', 'Attendance', 'Practical', ''].map(h => (
                <div key={h} style={{ fontSize: '11px', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{h}</div>
              ))}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {students.map((student) => {
                const todayStatus = getTodayStatus(student);
                const isExpanded = expandedStudent === student._id;

                return (
                  <div key={student._id} style={{ backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: '1px solid #F1F5F9', overflow: 'hidden' }}>

                    {/* Main Row */}
                    <div
                      onClick={() => setExpandedStudent(isExpanded ? null : student._id)}
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 40px',
                        gap: '16px',
                        padding: '16px 20px',
                        alignItems: 'center',
                        cursor: 'pointer',
                        transition: 'background 0.15s',
                      }}
                      onMouseEnter={e => (e.currentTarget.style.background = '#F9FAFB')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                    >
                      {/* Name */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                        <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg,#5B62B3,#8C92E6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '13px', fontWeight: 700, flexShrink: 0 }}>
                          {student.clientId?.name?.[0]?.toUpperCase() || 'S'}
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <p style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: '#111', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {student.clientId?.name || 'Unknown'}
                          </p>
                          <p style={{ margin: '2px 0 0', fontSize: '11px', color: '#6B7280', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {student.clientId?.email || '—'}
                          </p>
                        </div>
                      </div>

                      {/* Online */}
                      <div>
                        <div style={{ fontSize: '11px', color: '#6B7280', marginBottom: '4px' }}>{Number(student.progress) || 0}% done</div>
                        <div style={{ height: '4px', backgroundColor: '#E5E7EB', borderRadius: '2px', overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${Number(student.progress) || 0}%`, backgroundColor: student.onlineCompleted ? '#10B981' : '#5B62B3', borderRadius: '2px' }} />
                        </div>
                      </div>

                      {/* Quiz */}
                      <div style={{ fontSize: '13px', fontWeight: 600, color: student.quizPassed ? '#10B981' : '#F59E0B' }}>
                        {student.quizPassed ? `✓ ${Number(student.quizScore) || 0}%` : '○ Pending'}
                      </div>

                      {/* Attendance */}
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: 700, color: (Number(student.attendancePercentage) || 0) >= 80 ? '#10B981' : '#EF4444', marginBottom: '2px' }}>
                          {Number(student.attendancePercentage) || 0}%
                        </div>
                        <div style={{ fontSize: '11px', color: '#6B7280' }}>
                          {Number(student.attendedClasses) || 0}/{Number(student.totalClasses) || 0}
                        </div>
                      </div>

                      {/* Practical */}
                      <div style={{ fontSize: '13px', fontWeight: 600, color: student.practicalPassed ? '#10B981' : '#F59E0B' }}>
                        {student.practicalPassed ? '✓ Done' : '○ Pending'}
                      </div>

                      {/* Expand */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {isExpanded
                          ? <ChevronUp size={18} style={{ color: '#5B62B3' }} />
                          : <ChevronDown size={18} style={{ color: '#D1D5DB' }} />
                        }
                      </div>
                    </div>

                    {/* Expanded Panel */}
                    {isExpanded && (
                      <div style={{ borderTop: '1px solid #F3F4F6', backgroundColor: '#FAFBFF', padding: '20px' }}>

                        {/* Today's Attendance */}
                        <div style={{ marginBottom: '20px' }}>
                          <p style={{ margin: '0 0 10px', fontSize: '13px', fontWeight: 600, color: '#374151' }}>
                            Mark Attendance — {new Date(todayDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                          </p>
                          <div style={{ display: 'flex', gap: '10px' }}>
                            <button
                              onClick={() => markAttendance(student._id, 'present')}
                              disabled={markingId === student._id + 'present'}
                              style={{
                                flex: 1,
                                padding: '10px',
                                backgroundColor: todayStatus === 'present' ? '#10B981' : '#F3F4F6',
                                color: todayStatus === 'present' ? 'white' : '#374151',
                                border: todayStatus === 'present' ? 'none' : '1.5px solid #E5E7EB',
                                borderRadius: '8px',
                                fontSize: '13px',
                                fontWeight: 600,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '6px',
                                fontFamily: 'Montserrat, sans-serif',
                                transition: 'all 0.15s',
                              }}
                            >
                              <CheckCircle size={15} />
                              {markingId === student._id + 'present' ? 'Saving...' : 'Present'}
                            </button>
                            <button
                              onClick={() => markAttendance(student._id, 'absent')}
                              disabled={markingId === student._id + 'absent'}
                              style={{
                                flex: 1,
                                padding: '10px',
                                backgroundColor: todayStatus === 'absent' ? '#EF4444' : '#F3F4F6',
                                color: todayStatus === 'absent' ? 'white' : '#374151',
                                border: todayStatus === 'absent' ? 'none' : '1.5px solid #E5E7EB',
                                borderRadius: '8px',
                                fontSize: '13px',
                                fontWeight: 600,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '6px',
                                fontFamily: 'Montserrat, sans-serif',
                                transition: 'all 0.15s',
                              }}
                            >
                              <XCircle size={15} />
                              {markingId === student._id + 'absent' ? 'Saving...' : 'Absent'}
                            </button>
                          </div>
                        </div>

                        {/* Attendance Progress */}
                        <div style={{ marginBottom: '20px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                            <span style={{ fontSize: '12px', fontWeight: 600, color: '#374151' }}>Attendance Progress</span>
                            <span style={{ fontSize: '12px', color: '#6B7280' }}>{Number(student.attendedClasses) || 0}/{Number(student.totalClasses) || 0} classes</span>
                          </div>
                          <div style={{ height: '6px', backgroundColor: '#E5E7EB', borderRadius: '3px', overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: `${Number(student.attendancePercentage) || 0}%`, backgroundColor: (Number(student.attendancePercentage) || 0) >= 80 ? '#10B981' : '#EF4444', borderRadius: '3px', transition: 'width 0.4s ease' }} />
                          </div>
                          <p style={{ margin: '6px 0 0', fontSize: '11px', color: (Number(student.attendancePercentage) || 0) >= 80 ? '#10B981' : '#EF4444', fontWeight: 600 }}>
                            {(Number(student.attendancePercentage) || 0) >= 80 ? '✓ Meets 80% requirement' : `${80 - (Number(student.attendancePercentage) || 0)}% more needed`}
                          </p>
                        </div>

                        {/* Approve Practical */}
                        {!student.practicalPassed && (
                          <button
                            onClick={() => approvePractical(student._id)}
                            disabled={approvingId === student._id}
                            style={{
                              width: '100%',
                              padding: '11px',
                              backgroundColor: '#5B62B3',
                              color: 'white',
                              border: 'none',
                              borderRadius: '8px',
                              fontSize: '13px',
                              fontWeight: 700,
                              cursor: approvingId === student._id ? 'not-allowed' : 'pointer',
                              opacity: approvingId === student._id ? 0.7 : 1,
                              fontFamily: 'Montserrat, sans-serif',
                              marginBottom: '16px',
                            }}
                          >
                            {approvingId === student._id ? 'Approving...' : 'Approve Practical Training'}
                          </button>
                        )}

                        {/* Certificate Status */}
                        <div style={{
                          padding: '14px 16px',
                          backgroundColor: student.certificateEligible ? '#EFF6FF' : '#FFFBEB',
                          border: `1px solid ${student.certificateEligible ? '#BFDBFE' : '#FDE68A'}`,
                          borderRadius: '10px',
                          display: 'flex',
                          gap: '10px',
                          alignItems: 'flex-start',
                        }}>
                          {student.certificateEligible
                            ? <Award size={16} style={{ color: '#2563EB', marginTop: '1px', flexShrink: 0 }} />
                            : <AlertCircle size={16} style={{ color: '#D97706', marginTop: '1px', flexShrink: 0 }} />
                          }
                          <div>
                            <p style={{ margin: 0, fontSize: '13px', fontWeight: 700, color: student.certificateEligible ? '#1E40AF' : '#92400E' }}>
                              {student.certificateEligible ? 'Certificate Eligible' : 'Not Yet Eligible'}
                            </p>
                            <p style={{ margin: '4px 0 0', fontSize: '11px', color: student.certificateEligible ? '#3B82F6' : '#B45309' }}>
                              {student.certificateEligible
                                ? 'All requirements met. Certificate can be issued.'
                                : `Needs: ${!student.onlineCompleted ? 'Online 100% ' : ''}${!student.quizPassed ? 'Quiz ' : ''}${(Number(student.attendancePercentage) || 0) < 80 ? 'Attendance 80%+ ' : ''}${!student.practicalPassed ? 'Practical Approval' : ''}`
                              }
                            </p>
                          </div>
                        </div>

                        {/* Recent Attendance Log */}
                        {student.attendanceLog && student.attendanceLog.length > 0 && (
                          <div style={{ marginTop: '16px' }}>
                            <p style={{ margin: '0 0 8px', fontSize: '11px', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                              Recent Attendance
                            </p>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                              {[...student.attendanceLog].reverse().slice(0, 7).map((log, idx) => (
                                <div key={idx} style={{
                                  padding: '5px 10px',
                                  backgroundColor: log.status === 'present' ? '#DCFCE7' : '#FEE2E2',
                                  color: log.status === 'present' ? '#166534' : '#991B1B',
                                  fontSize: '11px',
                                  fontWeight: 600,
                                  borderRadius: '6px',
                                }}>
                                  {new Date(log.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} — {log.status === 'present' ? 'P' : 'A'}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default VendorAttendance;
