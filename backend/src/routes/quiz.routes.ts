// backend/src/routes/quiz.routes.ts
import { Router } from 'express';
import { protect } from '../middleware/auth.middleware';
import { getQuizByCourse, submitQuiz, verifyCertificate } from '../controllers/quiz.controller';
import { createQuiz } from '../controllers/quizAdmin.controller';

const router = Router();

// PUBLIC — verify a certificate (no auth)
router.get('/verify/:certificateId', verifyCertificate);

// Protected routes
router.post('/create', protect, createQuiz);
router.get('/course/:courseId', protect, getQuizByCourse);
router.post('/submit', protect, submitQuiz);

export default router;
