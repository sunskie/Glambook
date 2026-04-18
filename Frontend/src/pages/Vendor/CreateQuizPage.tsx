// Frontend/src/pages/Vendor/CreateQuizPage.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Plus, Trash2, CheckCircle } from 'lucide-react';
import courseService from '../../services/api/courseService';
import api from '../../utils/api';

interface QuestionForm {
  question: string;
  options: [string, string, string, string];
  correctAnswer: number;
}

const PRIMARY = '#5B62B3';
const PINK = '#E91E63';

const emptyQuestion = (): QuestionForm => ({
  question: '',
  options: ['', '', '', ''],
  correctAnswer: 0,
});

const CreateQuizPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedCourseId = searchParams.get('courseId') || '';

  const [courses, setCourses] = useState<{ _id: string; title: string }[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState(preselectedCourseId);
  const [passingScore, setPassingScore] = useState(70);
  const [questions, setQuestions] = useState<QuestionForm[]>([emptyQuestion()]);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingCourses, setLoadingCourses] = useState(true);

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      const res = await courseService.getMyCourses();
      const list = res.data || [];
      setCourses(list);
      // If no preselected and only one course, auto-select
      if (!preselectedCourseId && list.length === 1) {
        setSelectedCourseId(list[0]._id);
      }
    } catch (err) {
      console.error('Failed to load courses', err);
    } finally {
      setLoadingCourses(false);
    }
  };

  const addQuestion = () => {
    setQuestions(prev => [...prev, emptyQuestion()]);
  };

  const removeQuestion = (index: number) => {
    if (questions.length === 1) return;
    setQuestions(prev => prev.filter((_, i) => i !== index));
  };

  const updateQuestion = (index: number, field: keyof QuestionForm, value: any) => {
    setQuestions(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const updateOption = (qIdx: number, optIdx: number, value: string) => {
    setQuestions(prev => {
      const updated = [...prev];
      const opts = [...updated[qIdx].options] as [string, string, string, string];
      opts[optIdx] = value;
      updated[qIdx] = { ...updated[qIdx], options: opts };
      return updated;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!selectedCourseId) {
      setError('Please select a course.');
      return;
    }

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.question.trim()) {
        setError(`Question ${i + 1}: Please enter the question text.`);
        return;
      }
      for (let j = 0; j < 4; j++) {
        if (!q.options[j].trim()) {
          setError(`Question ${i + 1}: All 4 options must be filled in.`);
          return;
        }
      }
    }

    try {
      setSubmitting(true);
      await api.post('/quiz/create', { courseId: selectedCourseId, questions, passingScore });
      setSuccess(true);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to create quiz. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#FAFAFA', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Montserrat, sans-serif', padding: '24px' }}>
        <div style={{ backgroundColor: 'white', borderRadius: '20px', padding: '56px 48px', maxWidth: '480px', width: '100%', textAlign: 'center', boxShadow: '0 8px 40px rgba(0,0,0,0.08)' }}>
          <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: '#DCFCE7', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
            <CheckCircle size={44} style={{ color: '#16A34A' }} />
          </div>
          <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#111', marginBottom: '12px' }}>Quiz Created!</h2>
          <p style={{ color: '#666', marginBottom: '32px' }}>Your quiz has been saved. Students who complete 100% of lessons will be able to take it.</p>
          <div style={{ display: 'flex', gap: '12px', flexDirection: 'column' }}>
            <button onClick={() => navigate('/vendor/courses')} style={{ padding: '14px', backgroundColor: PRIMARY, color: 'white', border: 'none', borderRadius: '10px', fontSize: '15px', fontWeight: 700, cursor: 'pointer', fontFamily: 'Montserrat, sans-serif' }}>
              Back to Courses
            </button>
            <button onClick={() => { setSuccess(false); setQuestions([emptyQuestion()]); setError(null); }} style={{ padding: '14px', backgroundColor: '#F3F4F6', color: '#374151', border: 'none', borderRadius: '10px', fontSize: '15px', fontWeight: 600, cursor: 'pointer', fontFamily: 'Montserrat, sans-serif' }}>
              Create Another Quiz
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#FAFAFA', fontFamily: 'Montserrat, sans-serif' }}>
      {/* Header */}
      <div style={{ backgroundColor: 'white', borderBottom: '1px solid #E5E7EB', padding: '20px 24px' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button onClick={() => navigate('/vendor/courses')} style={{ background: 'none', border: 'none', color: '#6B7280', cursor: 'pointer', fontSize: '14px', fontWeight: 600, fontFamily: 'Montserrat, sans-serif' }}>
            ← Back
          </button>
          <div>
            <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#111', margin: 0 }}>Create Final Quiz</h1>
            <p style={{ fontSize: '13px', color: '#6B7280', margin: '2px 0 0' }}>Students need ≥{passingScore}% to earn a certificate</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} style={{ maxWidth: '800px', margin: '32px auto', padding: '0 24px' }}>
        {/* Course Selector */}
        <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '28px', marginBottom: '24px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px', color: '#111' }}>Course Settings</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '16px', alignItems: 'end' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '8px' }}>
                Select Course *
              </label>
              {loadingCourses ? (
                <div style={{ padding: '12px', border: '1.5px solid #E5E7EB', borderRadius: '10px', color: '#9CA3AF', fontSize: '14px' }}>Loading courses...</div>
              ) : (
                <select
                  value={selectedCourseId}
                  onChange={e => setSelectedCourseId(e.target.value)}
                  required
                  style={{ width: '100%', padding: '12px 14px', border: '1.5px solid #E5E7EB', borderRadius: '10px', fontSize: '14px', fontFamily: 'Montserrat, sans-serif', outline: 'none', color: '#111', backgroundColor: 'white' }}
                >
                  <option value="">— Choose a course —</option>
                  {courses.map(c => (
                    <option key={c._id} value={c._id}>{c.title}</option>
                  ))}
                </select>
              )}
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '8px' }}>
                Passing Score (%)
              </label>
              <input
                type="number"
                min={50}
                max={100}
                value={passingScore}
                onChange={e => setPassingScore(Number(e.target.value))}
                style={{ width: '80px', padding: '12px 14px', border: '1.5px solid #E5E7EB', borderRadius: '10px', fontSize: '14px', fontFamily: 'Montserrat, sans-serif', outline: 'none', color: '#111', textAlign: 'center' }}
              />
            </div>
          </div>
        </div>

        {/* Questions */}
        {questions.map((q, qIdx) => (
          <div key={qIdx} style={{ backgroundColor: 'white', borderRadius: '16px', padding: '28px', marginBottom: '20px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1px solid #E5E7EB' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div style={{ fontSize: '13px', fontWeight: 700, color: PRIMARY }}>Question {qIdx + 1}</div>
              {questions.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeQuestion(qIdx)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#EF4444', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', fontWeight: 600, fontFamily: 'Montserrat, sans-serif' }}
                >
                  <Trash2 size={14} /> Remove
                </button>
              )}
            </div>

            {/* Question text */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '8px' }}>Question *</label>
              <input
                type="text"
                value={q.question}
                onChange={e => updateQuestion(qIdx, 'question', e.target.value)}
                placeholder="e.g. What is the primary ingredient in a keratin treatment?"
                required
                style={{ width: '100%', padding: '12px 14px', border: '1.5px solid #E5E7EB', borderRadius: '10px', fontSize: '14px', fontFamily: 'Montserrat, sans-serif', outline: 'none', boxSizing: 'border-box' }}
                onFocus={e => (e.target.style.borderColor = PRIMARY)}
                onBlur={e => (e.target.style.borderColor = '#E5E7EB')}
              />
            </div>

            {/* Options */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '8px' }}>Options (select the correct answer)</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {q.options.map((opt, optIdx) => (
                  <div key={optIdx} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <input
                      type="radio"
                      name={`correct-${qIdx}`}
                      checked={q.correctAnswer === optIdx}
                      onChange={() => updateQuestion(qIdx, 'correctAnswer', optIdx)}
                      style={{ width: '18px', height: '18px', accentColor: PRIMARY, flexShrink: 0, cursor: 'pointer' }}
                      title="Mark as correct answer"
                    />
                    <div style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      backgroundColor: q.correctAnswer === optIdx ? PRIMARY : '#E5E7EB',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '12px',
                      fontWeight: 700,
                      color: q.correctAnswer === optIdx ? 'white' : '#6B7280',
                      flexShrink: 0,
                      transition: 'all 0.15s',
                    }}>
                      {String.fromCharCode(65 + optIdx)}
                    </div>
                    <input
                      type="text"
                      value={opt}
                      onChange={e => updateOption(qIdx, optIdx, e.target.value)}
                      placeholder={`Option ${String.fromCharCode(65 + optIdx)}`}
                      required
                      style={{ flex: 1, padding: '10px 14px', border: `1.5px solid ${q.correctAnswer === optIdx ? PRIMARY : '#E5E7EB'}`, borderRadius: '8px', fontSize: '14px', fontFamily: 'Montserrat, sans-serif', outline: 'none', backgroundColor: q.correctAnswer === optIdx ? '#EEF0FF' : 'white' }}
                    />
                    {q.correctAnswer === optIdx && (
                      <span style={{ fontSize: '11px', color: PRIMARY, fontWeight: 700, flexShrink: 0 }}>✓ Correct</span>
                    )}
                  </div>
                ))}
              </div>
              <p style={{ fontSize: '12px', color: '#9CA3AF', marginTop: '8px' }}>Click the radio button on the left to mark the correct answer.</p>
            </div>
          </div>
        ))}

        {/* Add Question */}
        <button
          type="button"
          onClick={addQuestion}
          style={{ width: '100%', padding: '16px', backgroundColor: 'white', border: `2px dashed ${PRIMARY}`, borderRadius: '12px', color: PRIMARY, fontSize: '14px', fontWeight: 700, cursor: 'pointer', fontFamily: 'Montserrat, sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '24px', transition: 'background-color 0.15s' }}
          onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#EEF0FF')}
          onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'white')}
        >
          <Plus size={18} />
          Add Another Question
        </button>

        {/* Error */}
        {error && (
          <div style={{ backgroundColor: '#FEE2E2', border: '1px solid #FECACA', borderRadius: '10px', padding: '14px 18px', marginBottom: '20px', color: '#DC2626', fontSize: '14px', fontWeight: 500 }}>
            {error}
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={submitting}
          style={{ width: '100%', padding: '16px', backgroundColor: submitting ? '#9CA3AF' : PRIMARY, color: 'white', border: 'none', borderRadius: '12px', fontSize: '16px', fontWeight: 700, cursor: submitting ? 'not-allowed' : 'pointer', fontFamily: 'Montserrat, sans-serif', boxShadow: submitting ? 'none' : '0 4px 12px rgba(91,98,179,0.3)', marginBottom: '48px' }}
        >
          {submitting ? 'Saving Quiz...' : `Save Quiz (${questions.length} question${questions.length !== 1 ? 's' : ''})`}
        </button>
      </form>
    </div>
  );
};

export default CreateQuizPage;
