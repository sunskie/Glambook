// Frontend/src/pages/Vendor/AttendanceTracking.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Calendar, Users, CheckCircle, 
  XCircle, Clock, Filter, Download, Save
} from 'lucide-react';
import enrollmentService from '../../services/api/enrollmentService';
import courseService from '../../services/api/courseService';

interface Student {
  enrollmentId: string;
  studentName: string;
  studentEmail: string;
  batchId: string;
  attendance: AttendanceRecord[];
}

interface AttendanceRecord {
  date: string;
  attended: boolean;
  notes: string;
}

interface Batch {
  _id: string;
  startDate: string;
  endDate: string;
  location: string;
  schedule: string;
}

const AttendanceTracking: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [course, setCourse] = useState<any>(null);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [selectedBatch, setSelectedBatch] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [students, setStudents] = useState<Student[]>([]);
  const [attendance, setAttendance] = useState<{ [key: string]: { attended: boolean; notes: string } }>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (id) {
      fetchCourseData();
    }
  }, [id]);

  useEffect(() => {
    if (selectedBatch && selectedDate) {
      fetchAttendance();
    }
  }, [selectedBatch, selectedDate]);

  const fetchCourseData = async () => {
    try {
      setLoading(true);
      const response = await courseService.getCourseById(id!);
      const courseData = response.data;
      setCourse(courseData);
      
      const batchesData = courseData.batches || [];
      setBatches(batchesData);
      
      if (batchesData.length > 0) {
        setSelectedBatch(batchesData[0]._id);
      }
    } catch (error) {
      console.error('Error fetching course:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAttendance = async () => {
    try {
      // Fetch enrollments for this batch
      const response = await enrollmentService.getVendorEnrollments({
        courseId: id,
        status: 'enrolled'
      });
      
      const enrollments = response.data || [];
      const batchStudents = enrollments.filter(
        (e: any) => e.selectedBatchId === selectedBatch
      );

      // Initialize attendance state
      const attendanceState: { [key: string]: { attended: boolean; notes: string } } = {};
      
      batchStudents.forEach((enrollment: any) => {
        const existingRecord = enrollment.practicalAttendance?.find(
          (a: any) => new Date(a.date).toISOString().split('T')[0] === selectedDate
        );
        
        attendanceState[enrollment._id] = {
          attended: existingRecord?.attended || false,
          notes: existingRecord?.notes || ''
        };
      });

      setStudents(batchStudents.map((e: any) => ({
        enrollmentId: e._id,
        studentName: e.clientId?.name || e.clientName,
        studentEmail: e.clientId?.email || e.clientEmail,
        batchId: e.selectedBatchId,
        attendance: e.practicalAttendance || []
      })));

      setAttendance(attendanceState);
      
    } catch (error) {
      console.error('Error fetching attendance:', error);
    }
  };

  const handleAttendanceChange = (enrollmentId: string, attended: boolean) => {
    setAttendance({
      ...attendance,
      [enrollmentId]: {
        ...attendance[enrollmentId],
        attended
      }
    });
  };

  const handleNotesChange = (enrollmentId: string, notes: string) => {
    setAttendance({
      ...attendance,
      [enrollmentId]: {
        ...attendance[enrollmentId],
        notes
      }
    });
  };

  const handleSaveAttendance = async () => {
    try {
      setSaving(true);

      // Save attendance for each student
      const promises = Object.entries(attendance).map(([enrollmentId, data]) => {
        return enrollmentService.markAttendance(enrollmentId, {
          date: selectedDate,
          attended: data.attended,
          notes: data.notes
        });
      });

      await Promise.all(promises);
      alert('Attendance saved successfully!');
      
    } catch (error) {
      console.error('Error saving attendance:', error);
      alert('Failed to save attendance');
    } finally {
      setSaving(false);
    }
  };

  const stats = {
    present: Object.values(attendance).filter(a => a.attended).length,
    absent: Object.values(attendance).filter(a => !a.attended).length,
    total: students.length
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        fontFamily: 'Montserrat, sans-serif'
      }}>
        Loading...
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#FAFAFA', padding: '24px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <h1 style={{
          fontSize: '32px',
          fontWeight: 700,
          marginBottom: '8px',
          fontFamily: 'Syne, sans-serif'
        }}>
          Attendance Tracking
        </h1>
        <p style={{
          fontSize: '16px',
          color: '#666',
          marginBottom: '32px',
          fontFamily: 'Montserrat, sans-serif'
        }}>
          {course?.title}
        </p>

        {/* Stats Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
          marginBottom: '24px'
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
          }}>
            <div style={{
              fontSize: '13px',
              color: '#666',
              marginBottom: '8px',
              fontFamily: 'Montserrat, sans-serif'
            }}>
              Total Students
            </div>
            <div style={{
              fontSize: '28px',
              fontWeight: 700,
              color: '#111',
              fontFamily: 'Montserrat, sans-serif'
            }}>
              {stats.total}
            </div>
          </div>

          <div style={{
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
          }}>
            <div style={{
              fontSize: '13px',
              color: '#666',
              marginBottom: '8px',
              fontFamily: 'Montserrat, sans-serif'
            }}>
              Present
            </div>
            <div style={{
              fontSize: '28px',
              fontWeight: 700,
              color: '#4CAF50',
              fontFamily: 'Montserrat, sans-serif'
            }}>
              {stats.present}
            </div>
          </div>

          <div style={{
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
          }}>
            <div style={{
              fontSize: '13px',
              color: '#666',
              marginBottom: '8px',
              fontFamily: 'Montserrat, sans-serif'
            }}>
              Absent
            </div>
            <div style={{
              fontSize: '28px',
              fontWeight: 700,
              color: '#F44336',
              fontFamily: 'Montserrat, sans-serif'
            }}>
              {stats.absent}
            </div>
          </div>

          <div style={{
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
          }}>
            <div style={{
              fontSize: '13px',
              color: '#666',
              marginBottom: '8px',
              fontFamily: 'Montserrat, sans-serif'
            }}>
              Attendance Rate
            </div>
            <div style={{
              fontSize: '28px',
              fontWeight: 700,
              color: '#2196F3',
              fontFamily: 'Montserrat, sans-serif'
            }}>
              {stats.total > 0 ? Math.round((stats.present / stats.total) * 100) : 0}%
            </div>
          </div>
        </div>

        {/* Filters */}
        <div style={{
          backgroundColor: 'white',
          padding: '20px',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          marginBottom: '24px'
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '16px'
          }}>
            <div>
              <label style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: 500,
                marginBottom: '8px',
                fontFamily: 'Montserrat, sans-serif',
                color: '#666'
              }}>
                Select Batch
              </label>
              <select
                value={selectedBatch}
                onChange={(e) => setSelectedBatch(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontFamily: 'Montserrat, sans-serif',
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                {batches.map(batch => (
                  <option key={batch._id} value={batch._id}>
                    {new Date(batch.startDate).toLocaleDateString()} - {batch.location}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: 500,
                marginBottom: '8px',
                fontFamily: 'Montserrat, sans-serif',
                color: '#666'
              }}>
                Select Date
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontFamily: 'Montserrat, sans-serif',
                  outline: 'none'
                }}
              />
            </div>
          </div>
        </div>

        {/* Attendance Table */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          overflow: 'hidden',
          marginBottom: '24px'
        }}>
          {students.length === 0 ? (
            <div style={{
              padding: '60px',
              textAlign: 'center',
              color: '#999',
              fontFamily: 'Montserrat, sans-serif'
            }}>
              <Users size={48} style={{ margin: '0 auto 16px', opacity: 0.5 }} />
              <p style={{ fontSize: '16px', fontWeight: 600 }}>
                No students in this batch
              </p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontFamily: 'Montserrat, sans-serif'
              }}>
                <thead>
                  <tr style={{ backgroundColor: '#F5F5F5' }}>
                    <th style={{
                      padding: '16px',
                      textAlign: 'left',
                      fontSize: '13px',
                      fontWeight: 600,
                      color: '#666',
                      borderBottom: '1px solid #eee'
                    }}>
                      #
                    </th>
                    <th style={{
                      padding: '16px',
                      textAlign: 'left',
                      fontSize: '13px',
                      fontWeight: 600,
                      color: '#666',
                      borderBottom: '1px solid #eee'
                    }}>
                      Student Name
                    </th>
                    <th style={{
                      padding: '16px',
                      textAlign: 'left',
                      fontSize: '13px',
                      fontWeight: 600,
                      color: '#666',
                      borderBottom: '1px solid #eee'
                    }}>
                      Email
                    </th>
                    <th style={{
                      padding: '16px',
                      textAlign: 'center',
                      fontSize: '13px',
                      fontWeight: 600,
                      color: '#666',
                      borderBottom: '1px solid #eee'
                    }}>
                      Attendance
                    </th>
                    <th style={{
                      padding: '16px',
                      textAlign: 'left',
                      fontSize: '13px',
                      fontWeight: 600,
                      color: '#666',
                      borderBottom: '1px solid #eee'
                    }}>
                      Notes
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((student, index) => (
                    <tr key={student.enrollmentId} style={{ borderBottom: '1px solid #f5f5f5' }}>
                      <td style={{ padding: '16px', fontSize: '14px', color: '#666' }}>
                        {index + 1}
                      </td>
                      <td style={{ padding: '16px' }}>
                        <div style={{
                          fontSize: '14px',
                          fontWeight: 600,
                          color: '#111'
                        }}>
                          {student.studentName}
                        </div>
                      </td>
                      <td style={{ padding: '16px', fontSize: '13px', color: '#666' }}>
                        {student.studentEmail}
                      </td>
                      <td style={{ padding: '16px', textAlign: 'center' }}>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                          <button
                            onClick={() => handleAttendanceChange(student.enrollmentId, true)}
                            style={{
                              padding: '8px 16px',
                              backgroundColor: attendance[student.enrollmentId]?.attended 
                                ? '#4CAF50' 
                                : '#E0E0E0',
                              color: attendance[student.enrollmentId]?.attended 
                                ? 'white' 
                                : '#666',
                              border: 'none',
                              borderRadius: '6px',
                              fontSize: '13px',
                              fontWeight: 600,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                              fontFamily: 'Montserrat, sans-serif',
                              transition: 'all 0.2s'
                            }}
                          >
                            <CheckCircle size={16} />
                            Present
                          </button>

                          <button
                            onClick={() => handleAttendanceChange(student.enrollmentId, false)}
                            style={{
                              padding: '8px 16px',
                              backgroundColor: attendance[student.enrollmentId]?.attended === false
                                ? '#F44336' 
                                : '#E0E0E0',
                              color: attendance[student.enrollmentId]?.attended === false
                                ? 'white' 
                                : '#666',
                              border: 'none',
                              borderRadius: '6px',
                              fontSize: '13px',
                              fontWeight: 600,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                              fontFamily: 'Montserrat, sans-serif',
                              transition: 'all 0.2s'
                            }}
                          >
                            <XCircle size={16} />
                            Absent
                          </button>
                        </div>
                      </td>
                      <td style={{ padding: '16px' }}>
                        <input
                          type="text"
                          value={attendance[student.enrollmentId]?.notes || ''}
                          onChange={(e) => handleNotesChange(student.enrollmentId, e.target.value)}
                          placeholder="Add notes (optional)"
                          style={{
                            width: '100%',
                            padding: '8px 12px',
                            border: '1px solid #ddd',
                            borderRadius: '6px',
                            fontSize: '13px',
                            fontFamily: 'Montserrat, sans-serif',
                            outline: 'none'
                          }}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Save Button */}
        {students.length > 0 && (
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button
              onClick={handleSaveAttendance}
              disabled={saving}
              style={{
                padding: '14px 28px',
                backgroundColor: '#2196F3',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: 600,
                cursor: saving ? 'not-allowed' : 'pointer',
                opacity: saving ? 0.7 : 1,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontFamily: 'Montserrat, sans-serif',
                boxShadow: '0 4px 12px rgba(33, 150, 243, 0.3)'
              }}
            >
              <Save size={20} />
              {saving ? 'Saving...' : 'Save Attendance'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AttendanceTracking;
