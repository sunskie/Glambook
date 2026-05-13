import React, { useState, useEffect } from 'react';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../../utils/api';
import VendorSidebar from '../../components/Vendor/VendorSidebar';
import showToast from '../../components/common/Toast';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const AvailabilityPage: React.FC = () => {
  const [workingDays, setWorkingDays] = useState<number[]>([1, 2, 3, 4, 5]);
  const [workingHours, setWorkingHours] = useState({ start: '09:00', end: '18:00' });
  const [slotDuration, setSlotDuration] = useState(60);
  const [blockedDates, setBlockedDates] = useState<Date[]>([]);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchAvailability();
  }, []);

  const fetchAvailability = async () => {
    try {
      const res = await api.get('/availability/my');
      const data = res.data;
      if (data) {
        setWorkingDays(data.workingDays || [1, 2, 3, 4, 5]);
        setWorkingHours(data.workingHours || { start: '09:00', end: '18:00' });
        setSlotDuration(data.slotDuration || 60);
        setBlockedDates(data.blockedDates?.map((d: string) => new Date(d)) || []);
      }
    } catch (err) {
      console.error('Failed to fetch availability:', err);
    }
  };

  const toggleDay = (day: number) => {
    setWorkingDays(prev => 
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  const toggleDate = (date: Date) => {
    const dateStr = date.toDateString();
    setBlockedDates(prev => {
      const isBlocked = prev.some(d => d.toDateString() === dateStr);
      if (isBlocked) {
        return prev.filter(d => d.toDateString() !== dateStr);
      } else {
        return [...prev, date];
      }
    });
  };

  const removeBlockedDate = (date: Date) => {
    setBlockedDates(prev => prev.filter(d => d.toDateString() !== date.toDateString()));
  };

  const generateTimeOptions = (start: number, end: number, step: number = 30) => {
    const options: string[] = [];
    for (let h = start; h <= end; h++) {
      for (let m = 0; m < 60; m += step) {
        options.push(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`);
      }
    }
    return options;
  };

  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (month: number, year: number) => {
    return new Date(year, month, 1).getDay();
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      await api.patch('/availability/my', {
        workingDays,
        workingHours,
        slotDuration,
        blockedDates,
      });
      showToast.success('Availability saved successfully');
    } catch (err: any) {
      showToast.error(err.response?.data?.message || 'Failed to save availability');
    } finally {
      setLoading(false);
    }
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentMonth, currentYear);
    const firstDay = getFirstDayOfMonth(currentMonth, currentYear);
    const days = [];

    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} />);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentYear, currentMonth, day);
      const isBlocked = blockedDates.some(d => d.toDateString() === date.toDateString());
      days.push(
        <button
          key={day}
          onClick={() => toggleDate(date)}
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '8px',
            border: isBlocked ? '2px solid #EF4444' : '1px solid #E5E7EB',
            backgroundColor: isBlocked ? '#FEE2E2' : 'white',
            color: isBlocked ? '#EF4444' : '#111',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 500,
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = isBlocked ? '#DC2626' : '#5B62B3';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = isBlocked ? '#EF4444' : '#E5E7EB';
          }}
        >
          {day}
        </button>
      );
    }

    return days;
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#FAFAFA', fontFamily: 'Montserrat, sans-serif' }}>
      <VendorSidebar />
      <div style={{ marginLeft: '280px', flex: 1, padding: '32px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ marginBottom: '32px' }}>
            <h1 style={{ fontSize: '32px', fontWeight: 700, color: '#111', margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Calendar size={32} style={{ color: '#5B62B3' }} />
              Manage Availability
            </h1>
            <p style={{ fontSize: '14px', color: '#6B7280', margin: 0 }}>Set your working hours and block dates for appointments</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            {/* Working Days */}
            <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '24px', border: '1px solid #E5E7EB', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#111', margin: '0 0 20px 0' }}>Working Days</h2>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {DAYS.map((day, index) => (
                  <button
                    key={day}
                    onClick={() => toggleDay(index)}
                    style={{
                      padding: '10px 20px',
                      borderRadius: '8px',
                      border: workingDays.includes(index) ? 'none' : '1px solid #E5E7EB',
                      backgroundColor: workingDays.includes(index) ? '#5B62B3' : 'white',
                      color: workingDays.includes(index) ? 'white' : '#6B7280',
                      fontSize: '14px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                  >
                    {day}
                  </button>
                ))}
              </div>
            </div>

            {/* Working Hours */}
            <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '24px', border: '1px solid #E5E7EB', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#111', margin: '0 0 20px 0' }}>Working Hours</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#6B7280', marginBottom: '8px' }}>Start Time</label>
                  <select
                    value={workingHours.start}
                    onChange={(e) => setWorkingHours({ ...workingHours, start: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '12px',
                      borderRadius: '8px',
                      border: '1px solid #E5E7EB',
                      fontSize: '14px',
                      color: '#111',
                      backgroundColor: 'white',
                    }}
                  >
                    {generateTimeOptions(6, 12).map(time => (
                      <option key={time} value={time}>{time}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#6B7280', marginBottom: '8px' }}>End Time</label>
                  <select
                    value={workingHours.end}
                    onChange={(e) => setWorkingHours({ ...workingHours, end: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '12px',
                      borderRadius: '8px',
                      border: '1px solid #E5E7EB',
                      fontSize: '14px',
                      color: '#111',
                      backgroundColor: 'white',
                    }}
                  >
                    {generateTimeOptions(12, 22).map(time => (
                      <option key={time} value={time}>{time}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#6B7280', marginBottom: '8px' }}>Slot Duration</label>
                  <select
                    value={slotDuration}
                    onChange={(e) => setSlotDuration(Number(e.target.value))}
                    style={{
                      width: '100%',
                      padding: '12px',
                      borderRadius: '8px',
                      border: '1px solid #E5E7EB',
                      fontSize: '14px',
                      color: '#111',
                      backgroundColor: 'white',
                    }}
                  >
                    <option value={30}>30 min</option>
                    <option value={60}>60 min</option>
                    <option value={90}>90 min</option>
                    <option value={120}>120 min</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Blocked Dates */}
          <div style={{ marginTop: '24px', backgroundColor: 'white', borderRadius: '16px', padding: '24px', border: '1px solid #E5E7EB', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#111', margin: '0 0 20px 0' }}>Blocked Dates</h2>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#111', margin: 0 }}>
                    {MONTHS[currentMonth]} {currentYear}
                  </h3>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => {
                        if (currentMonth === 0) {
                          setCurrentMonth(11);
                          setCurrentYear(currentYear - 1);
                        } else {
                          setCurrentMonth(currentMonth - 1);
                        }
                      }}
                      style={{
                        padding: '8px',
                        borderRadius: '8px',
                        border: '1px solid #E5E7EB',
                        backgroundColor: 'white',
                        cursor: 'pointer',
                      }}
                    >
                      <ChevronLeft size={20} style={{ color: '#6B7280' }} />
                    </button>
                    <button
                      onClick={() => {
                        if (currentMonth === 11) {
                          setCurrentMonth(0);
                          setCurrentYear(currentYear + 1);
                        } else {
                          setCurrentMonth(currentMonth + 1);
                        }
                      }}
                      style={{
                        padding: '8px',
                        borderRadius: '8px',
                        border: '1px solid #E5E7EB',
                        backgroundColor: 'white',
                        cursor: 'pointer',
                      }}
                    >
                      <ChevronRight size={20} style={{ color: '#6B7280' }} />
                    </button>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px', marginBottom: '8px' }}>
                  {DAYS.map(day => (
                    <div key={day} style={{ fontSize: '12px', fontWeight: 600, color: '#6B7280', textAlign: 'center' }}>
                      {day}
                    </div>
                  ))}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px' }}>
                  {renderCalendar()}
                </div>
              </div>
              
              {blockedDates.length > 0 && (
                <div style={{ width: '250px' }}>
                  <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#6B7280', marginBottom: '12px' }}>Blocked Dates</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {blockedDates.sort((a, b) => a.getTime() - b.getTime()).map((date, index) => (
                      <div
                        key={index}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '8px 12px',
                          backgroundColor: '#FEE2E2',
                          borderRadius: '8px',
                          border: '1px solid #FCA5A5',
                        }}
                      >
                        <span style={{ fontSize: '13px', color: '#DC2626', fontWeight: 500 }}>
                          {date.toLocaleDateString()}
                        </span>
                        <button
                          onClick={() => removeBlockedDate(date)}
                          style={{
                            padding: '4px 8px',
                            borderRadius: '4px',
                            border: 'none',
                            backgroundColor: '#EF4444',
                            color: 'white',
                            fontSize: '12px',
                            cursor: 'pointer',
                          }}
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Save Button */}
          <button
            onClick={handleSave}
            disabled={loading}
            style={{
              marginTop: '24px',
              width: '100%',
              padding: '16px',
              borderRadius: '12px',
              border: 'none',
              backgroundColor: '#5B62B3',
              color: 'white',
              fontSize: '16px',
              fontWeight: 700,
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
              transition: 'all 0.2s',
            }}
          >
            {loading ? 'Saving...' : 'Save Availability'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AvailabilityPage;
