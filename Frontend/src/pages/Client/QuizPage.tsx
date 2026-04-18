// Frontend/src/pages/Client/QuizPage.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, Award, RotateCcw, ChevronRight } from 'lucide-react';
import quizService from '../../services/api/quizService';
import enrollmentService from '../../services/api/enrollmentService';

interface QuizQuestion {
  question: string;
  options: string[];
}

interface QuizData {
  _id: string;
  courseId: string;
  passingScore: number;
  questions: QuizQuestion[];
  totalQuestions: number;
  enrollmentId: string;
}

interface QuizResult {
  score: number;
  passed: boolean;
  passingScore: number;
  correctCount: number;
  totalQuestions: number;
  certificateId?: string;
  certificateUrl?: string;
}

const PRIMARY = '#5B62B3';
const PRIMARY_LIGHT = '#EEF0FF';

const QuizPage: React.FC = () => {
  const { enrollmentId } = useParams<{ enrollmentId: string }>();
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState<QuizData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [hoveredOption, setHoveredOption] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<QuizResult | null>(null);
  const [courseName, setCourseName] = useState('');

  useEffect(() => {
    if (enrollmentId) {
      loadQuiz();
    }
  }, [enrollmentId]);

  const loadQuiz = async () => {
    try {
      setLoading(true);
      setError(null);

      // 1. Fetch enrollment to get courseId and course name
      const enrollmentRes = await enrollmentService.getEnrollmentById(enrollmentId!);
      const enrollment = enrollmentRes.data;
      const courseId = typeof enrollment.courseId === 'string'
        ? enrollment.courseId
        : enrollment.courseId._id;
      setCourseName(
        typeof enrollment.courseId === 'object' ? enrollment.courseId.title : 'Course'
      );

      // 2. Fetch quiz
      const quizRes = await quizService.getQuizByCourse(courseId);
      setQuiz({ ...quizRes, enrollmentId, courseId });
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Failed to load quiz. Make sure you have completed all lessons.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOption = (optionIndex: number) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [currentQuestion]: optionIndex,
    }));
  };

  const handleNext = () => {
    if (quiz && currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    }
  };

  const handleSubmit = async () => {
    if (!quiz) return;
    setSubmitting(true);
    try {
      const answers = quiz.questions.map((_, i) =>
        selectedAnswers[i] !== undefined ? selectedAnswers[i] : -1
      );
      const res = await quizService.submitQuiz({
        courseId: quiz.courseId,
        enrollmentId: quiz.enrollmentId,
        answers,
      });
      setResult(res);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to submit quiz. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRetake = () => {
    setResult(null);
    setCurrentQuestion(0);
    setSelectedAnswers({});
  };

  // ── Loading ──────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', fontFamily: 'Montserrat, sans-serif', backgroundColor: '#FAFAFA' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '48px', height: '48px', border: `4px solid ${PRIMARY_LIGHT}`, borderTop: `4px solid ${PRIMARY}`, borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }} />
          <p style={{ color: '#666', fontSize: '16px' }}>Loading quiz...</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  // ── Error ────────────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', fontFamily: 'Montserrat, sans-serif', backgroundColor: '#FAFAFA', padding: '24px' }}>
        <div style={{ backgroundColor: 'white', borderRadius: '20px', padding: '48px', maxWidth: '500px', width: '100%', textAlign: 'center', boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>
          <XCircle size={64} style={{ color: '#EF4444', margin: '0 auto 20px' }} />
          <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#111', marginBottom: '12px' }}>Cannot Load Quiz</h2>
          <p style={{ color: '#666', marginBottom: '28px', lineHeight: '1.6' }}>{error}</p>
          <button onClick={() => navigate(-1)} style={{ padding: '12px 32px', backgroundColor: PRIMARY, color: 'white', border: 'none', borderRadius: '12px', fontSize: '15px', fontWeight: 600, cursor: 'pointer', fontFamily: 'Montserrat, sans-serif' }}>
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // ── Result Screen ──────────────────────────────────────────────────────────
  if (result) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', fontFamily: 'Montserrat, sans-serif', backgroundColor: '#FAFAFA', padding: '24px' }}>
        <div style={{ backgroundColor: 'white', borderRadius: '24px', padding: '56px 48px', maxWidth: '520px', width: '100%', textAlign: 'center', boxShadow: '0 8px 40px rgba(0,0,0,0.1)' }}>
          {result.passed ? (
            <>
              <div style={{ width: '96px', height: '96px', borderRadius: '50%', backgroundColor: '#DCFCE7', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                <CheckCircle size={52} style={{ color: '#16A34A' }} />
              </div>
              <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#111', margin: '0 0 8px' }}>Congratulations! 🎉</h1>
              <p style={{ color: '#666', fontSize: '15px', marginBottom: '32px' }}>You passed the final quiz!</p>

              <div style={{ backgroundColor: PRIMARY_LIGHT, borderRadius: '16px', padding: '24px', marginBottom: '32px' }}>
                <div style={{ fontSize: '52px', fontWeight: 800, color: PRIMARY, marginBottom: '4px' }}>{result.score}%</div>
                <div style={{ fontSize: '14px', color: '#666' }}>Your Score ({result.correctCount}/{result.totalQuestions} correct)</div>
              </div>

              <div style={{ display: 'flex', gap: '12px', flexDirection: 'column' }}>
                <button
                  onClick={() => result.certificateId && navigate(`/certificate/${result.certificateId}`)}
                  style={{ padding: '14px 28px', backgroundColor: PRIMARY, color: 'white', border: 'none', borderRadius: '12px', fontSize: '15px', fontWeight: 700, cursor: 'pointer', fontFamily: 'Montserrat, sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                >
                  <Award size={18} />
                  View Certificate
                </button>
                <button onClick={() => navigate('/client/my-courses')} style={{ padding: '14px 28px', backgroundColor: '#F3F4F6', color: '#374151', border: 'none', borderRadius: '12px', fontSize: '15px', fontWeight: 600, cursor: 'pointer', fontFamily: 'Montserrat, sans-serif' }}>
                  Back to My Courses
                </button>
              </div>
            </>
          ) : (
            <>
              <div style={{ width: '96px', height: '96px', borderRadius: '50%', backgroundColor: '#FEE2E2', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                <XCircle size={52} style={{ color: '#DC2626' }} />
              </div>
              <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#111', margin: '0 0 8px' }}>Keep Practicing</h1>
              <p style={{ color: '#666', fontSize: '15px', marginBottom: '32px' }}>
                You scored <strong>{result.score}%</strong>. You need at least <strong>{result.passingScore}%</strong> to pass.
              </p>

              <div style={{ backgroundColor: '#FEF2F2', borderRadius: '16px', padding: '24px', marginBottom: '32px' }}>
                <div style={{ fontSize: '52px', fontWeight: 800, color: '#DC2626', marginBottom: '4px' }}>{result.score}%</div>
                <div style={{ fontSize: '14px', color: '#666' }}>{result.correctCount}/{result.totalQuestions} correct — need {result.passingScore}% to pass</div>
              </div>

              <button
                onClick={handleRetake}
                style={{ width: '100%', padding: '14px 28px', backgroundColor: PRIMARY, color: 'white', border: 'none', borderRadius: '12px', fontSize: '15px', fontWeight: 700, cursor: 'pointer', fontFamily: 'Montserrat, sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
              >
                <RotateCcw size={18} />
                Retake Quiz
              </button>
            </>
          )}
        </div>
      </div>
    );
  }

  if (!quiz) return null;

  const total = quiz.questions.length;
  const currentQ = quiz.questions[currentQuestion];
  const selectedAnswer = selectedAnswers[currentQuestion];
  const isLastQuestion = currentQuestion === total - 1;
  const allAnswered = Object.keys(selectedAnswers).length === total;
  const progress = ((currentQuestion + 1) / total) * 100;

  // ── Quiz Screen ────────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#FAFAFA', fontFamily: 'Montserrat, sans-serif', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ backgroundColor: 'white', borderBottom: '1px solid #E5E7EB', padding: '16px 24px' }}>
        <div style={{ maxWidth: '720px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '12px', color: '#9CA3AF', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '2px' }}>Final Quiz</div>
            <h1 style={{ fontSize: '18px', fontWeight: 700, color: '#111', margin: 0 }}>{courseName}</h1>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '13px', color: '#6B7280' }}>
              Question <span style={{ fontWeight: 700, color: PRIMARY }}>{currentQuestion + 1}</span> of {total}
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div style={{ maxWidth: '720px', margin: '16px auto 0', height: '6px', backgroundColor: '#E5E7EB', borderRadius: '999px', overflow: 'hidden' }}>
          <div style={{ width: `${progress}%`, height: '100%', backgroundColor: PRIMARY, borderRadius: '999px', transition: 'width 0.4s ease' }} />
        </div>
      </div>

      {/* Question Area */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>
        <div style={{ backgroundColor: 'white', borderRadius: '24px', padding: '48px', maxWidth: '720px', width: '100%', boxShadow: '0 4px 24px rgba(0,0,0,0.07)' }}>
          <div style={{ fontSize: '12px', color: PRIMARY, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '16px' }}>
            Question {currentQuestion + 1}
          </div>
          <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#111', marginBottom: '36px', lineHeight: '1.4' }}>
            {currentQ.question}
          </h2>

          {/* Options */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '40px' }}>
            {currentQ.options.map((option, idx) => {
              const isSelected = selectedAnswer === idx;
              const isHovered = hoveredOption === idx;
              return (
                <button
                  key={idx}
                  onClick={() => handleSelectOption(idx)}
                  onMouseEnter={() => setHoveredOption(idx)}
                  onMouseLeave={() => setHoveredOption(null)}
                  style={{
                    width: '100%',
                    padding: '16px 20px',
                    border: `2px solid ${isSelected ? PRIMARY : isHovered ? '#D1D5DB' : '#E5E7EB'}`,
                    borderRadius: '12px',
                    backgroundColor: isSelected ? PRIMARY_LIGHT : isHovered ? '#F9FAFB' : 'white',
                    cursor: 'pointer',
                    textAlign: 'left',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    transition: 'all 0.15s ease',
                    fontFamily: 'Montserrat, sans-serif',
                  }}
                >
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    border: `2px solid ${isSelected ? PRIMARY : '#D1D5DB'}`,
                    backgroundColor: isSelected ? PRIMARY : 'transparent',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    fontSize: '13px',
                    fontWeight: 700,
                    color: isSelected ? 'white' : '#6B7280',
                    transition: 'all 0.15s ease',
                  }}>
                    {String.fromCharCode(65 + idx)}
                  </div>
                  <span style={{ fontSize: '15px', color: isSelected ? PRIMARY : '#374151', fontWeight: isSelected ? 600 : 400 }}>
                    {option}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Navigation */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            {!isLastQuestion ? (
              <button
                onClick={handleNext}
                disabled={selectedAnswer === undefined}
                style={{
                  padding: '14px 32px',
                  backgroundColor: selectedAnswer !== undefined ? PRIMARY : '#E5E7EB',
                  color: selectedAnswer !== undefined ? 'white' : '#9CA3AF',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '15px',
                  fontWeight: 700,
                  cursor: selectedAnswer !== undefined ? 'pointer' : 'not-allowed',
                  fontFamily: 'Montserrat, sans-serif',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'background-color 0.15s',
                }}
              >
                Next Question <ChevronRight size={18} />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={submitting || !allAnswered}
                style={{
                  padding: '14px 36px',
                  backgroundColor: allAnswered && !submitting ? '#10B981' : '#E5E7EB',
                  color: allAnswered && !submitting ? 'white' : '#9CA3AF',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '15px',
                  fontWeight: 700,
                  cursor: allAnswered && !submitting ? 'pointer' : 'not-allowed',
                  fontFamily: 'Montserrat, sans-serif',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'background-color 0.15s',
                }}
              >
                {submitting ? 'Submitting...' : 'Submit Quiz'}
              </button>
            )}
          </div>

          {/* Answer count pill */}
          <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '13px', color: '#9CA3AF' }}>
            {Object.keys(selectedAnswers).length} of {total} questions answered
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizPage;
