import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../utils/api';

const CourseQuiz = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState<any>(null);
  const [enrollment, setEnrollment] = useState<any>(null);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!courseId) return;
    api.get(`/courses/${courseId}`)
      .then((res: any) => setCourse(res?.data?.course || res?.data || null))
      .catch(() => {});
    api.get('/enrollments/my')
      .then((res: any) => {
        const all = res?.data?.enrollments || res?.enrollments || [];
        const found = all.find((e: any) => (e.courseId?._id || e.courseId) === courseId);
        setEnrollment(found || null);
      })
      .catch(() => {});
  }, [courseId]);

  const questions = course?.quiz?.questions || [];

  const handleSubmit = async () => {
    if (!enrollment) return;
    setSubmitting(true);
    try {
      const res: any = await api.post('/enrollments/quiz/submit', {
        enrollmentId: enrollment._id,
        answers,
      });
      setResult(res?.data || res);
      setSubmitted(true);
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to submit quiz');
    } finally { setSubmitting(false); }
  };

  if (!course) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Montserrat, sans-serif' }}>Loading...</div>
  );

  if (enrollment?.progress < 100) return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' as const, alignItems: 'center', justifyContent: 'center', fontFamily: 'Montserrat, sans-serif', gap: '16px' }}>
      <span style={{ fontSize: '48px' }}>🔒</span>
      <h2 style={{ margin: 0, fontFamily: 'Syne, sans-serif' }}>Complete all lessons first</h2>
      <p style={{ color: '#6B7280' }}>You need 100% progress to unlock the quiz.</p>
      <button onClick={() => navigate(`/client/courses/${courseId}/learn`)}
        style={{ padding: '12px 24px', backgroundColor: '#E91E63', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 700, cursor: 'pointer', fontFamily: 'Montserrat, sans-serif' }}>
        Continue Learning
      </button>
    </div>
  );

  if (submitted && result) return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' as const, alignItems: 'center', justifyContent: 'center', fontFamily: 'Montserrat, sans-serif', backgroundColor: '#F8F9FC', padding: '40px' }}>
      <div style={{ backgroundColor: 'white', borderRadius: '24px', padding: '48px', maxWidth: '500px', width: '100%', textAlign: 'center' as const, boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }}>
        <span style={{ fontSize: '64px' }}>{result.passed ? '🎉' : '😔'}</span>
        <h2 style={{ margin: '16px 0 8px', fontFamily: 'Syne, sans-serif', fontSize: '28px' }}>
          {result.passed ? 'Congratulations!' : 'Not quite there yet'}
        </h2>
        <p style={{ color: '#6B7280', fontSize: '16px', margin: '0 0 24px' }}>
          You scored <strong style={{ color: result.passed ? '#10B981' : '#E91E63', fontSize: '24px' }}>{result.score}%</strong>
        </p>
        <p style={{ color: '#374151', fontSize: '14px', margin: '0 0 32px' }}>
          {result.passed ? 'You passed! Your certificate has been generated.' : 'You need 70% to pass. Review the lessons and try again.'}
        </p>
        {result.passed ? (
          <button onClick={() => navigate(`/client/courses/${courseId}/certificate`)}
            style={{ width: '100%', padding: '14px', backgroundColor: '#10B981', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 800, fontSize: '15px', cursor: 'pointer', fontFamily: 'Montserrat, sans-serif' }}>
            View My Certificate 🎓
          </button>
        ) : (
          <button onClick={() => navigate(`/client/courses/${courseId}/learn`)}
            style={{ width: '100%', padding: '14px', backgroundColor: '#E91E63', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 800, fontSize: '15px', cursor: 'pointer', fontFamily: 'Montserrat, sans-serif' }}>
            Review Course
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F8F9FC', fontFamily: 'Montserrat, sans-serif', padding: '40px' }}>
      <div style={{ maxWidth: '720px', margin: '0 auto' }}>
        <button onClick={() => navigate(`/client/courses/${courseId}/learn`)}
          style={{ background: 'none', border: 'none', color: '#6B7280', cursor: 'pointer', fontSize: '13px', fontWeight: 600, marginBottom: '24px', fontFamily: 'Montserrat, sans-serif' }}>
          ← Back to Course
        </button>
        <h1 style={{ margin: '0 0 8px', fontFamily: 'Syne, sans-serif', fontSize: '28px', fontWeight: 800 }}>Final Quiz</h1>
        <p style={{ margin: '0 0 32px', color: '#6B7280' }}>Answer all questions. You need 70% to pass and earn your certificate.</p>

        {questions.length === 0 ? (
          <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '40px', textAlign: 'center' as const }}>
            <p style={{ color: '#6B7280' }}>No quiz questions have been added for this course yet.</p>
          </div>
        ) : (
          <>
            {questions.map((q: any, i: number) => (
              <div key={i} style={{ backgroundColor: 'white', borderRadius: '16px', padding: '24px', marginBottom: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                <p style={{ margin: '0 0 16px', fontWeight: 700, fontSize: '15px', color: '#111' }}>
                  {i + 1}. {q.question}
                </p>
                <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '8px' }}>
                  {q.options?.map((opt: string, oi: number) => (
                    <label key={oi} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderRadius: '10px', border: `2px solid ${answers[i] === oi ? '#5B62B3' : '#E5E7EB'}`, backgroundColor: answers[i] === oi ? '#EEF2FF' : 'white', cursor: 'pointer', transition: 'all 0.15s' }}>
                      <input type="radio" name={`q${i}`} checked={answers[i] === oi} onChange={() => setAnswers(prev => ({ ...prev, [i]: oi }))}
                        style={{ accentColor: '#5B62B3' }} />
                      <span style={{ fontSize: '14px', color: '#374151' }}>{opt}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}

            <button
              onClick={handleSubmit}
              disabled={submitting || Object.keys(answers).length < questions.length}
              style={{
                width: '100%', padding: '16px',
                backgroundColor: Object.keys(answers).length < questions.length ? '#E5E7EB' : '#E91E63',
                color: Object.keys(answers).length < questions.length ? '#9CA3AF' : 'white',
                border: 'none', borderRadius: '14px', fontWeight: 800,
                fontSize: '16px', cursor: Object.keys(answers).length < questions.length ? 'not-allowed' : 'pointer',
                fontFamily: 'Montserrat, sans-serif', marginTop: '8px',
              }}
            >
              {submitting ? 'Submitting...' : `Submit Quiz (${Object.keys(answers).length}/${questions.length} answered)`}
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default CourseQuiz;
