// Frontend/src/services/api/quizService.ts
import api from '../../utils/api';

export interface SubmitQuizPayload {
  courseId: string;
  enrollmentId: string;
  answers: number[];
}

const quizService = {
  // GET /quiz/course/:courseId — returns quiz (only if progress = 100%)
  getQuizByCourse: async (courseId: string) => {
    const response = await api.get(`/quiz/course/${courseId}`);
    return response.data;
  },

  // POST /quiz/submit — submit answers, returns { score, passed, certificateId? }
  submitQuiz: async (payload: SubmitQuizPayload) => {
    const response = await api.post('/quiz/submit', payload);
    return response.data;
  },

  // GET /quiz/verify/:certificateId — PUBLIC, returns certificate details
  verifyCertificate: async (certificateId: string) => {
    const response = await api.get(`/quiz/verify/${certificateId}`);
    return response.data;
  },
};

export default quizService;
