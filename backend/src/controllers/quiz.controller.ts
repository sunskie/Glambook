// backend/src/controllers/quiz.controller.ts
import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { logger } from '../utils/logger';
import Quiz from '../models/Quiz.model';
import Certificate from '../models/Certificate.model';
import Enrollment from '../models/Enrollment.model';
import User from '../models/User.model';

// ─── GET /api/quiz/course/:courseId ────────────────────────────────────────────
// Returns the quiz for a course ONLY if the authenticated user has 100% progress
export const getQuizByCourse = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { courseId } = req.params;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }

    // Find enrollment and verify 100% progress
    const enrollment = await Enrollment.findOne({
      courseId,
      clientId: userId,
    });

    if (!enrollment) {
      return res.status(403).json({
        success: false,
        message: 'You are not enrolled in this course',
      });
    }

    if (enrollment.progress < 100) {
      return res.status(403).json({
        success: false,
        message: 'You must complete all lessons before taking the final quiz',
        progress: enrollment.progress,
      });
    }

    const quiz = await Quiz.findOne({ courseId });

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'No quiz found for this course',
      });
    }

    // Return quiz WITHOUT the correctAnswer field to prevent cheating
    const safeQuestions = quiz.questions.map((q) => ({
      question: q.question,
      options: q.options,
    }));

    return res.json({
      success: true,
      data: {
        _id: quiz._id,
        courseId: quiz.courseId,
        passingScore: quiz.passingScore,
        questions: safeQuestions,
        totalQuestions: quiz.questions.length,
        enrollmentId: enrollment._id,
      },
    });
  } catch (error: any) {
    logger.error('getQuizByCourse error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch quiz', error: error.message });
  }
};

// ─── POST /api/quiz/submit ──────────────────────────────────────────────────────
// Body: { courseId, enrollmentId, answers: number[] }
export const submitQuiz = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }

    const { courseId, enrollmentId, answers } = req.body;

    if (!courseId || !enrollmentId || !Array.isArray(answers)) {
      return res.status(400).json({
        success: false,
        message: 'courseId, enrollmentId, and answers[] are required',
      });
    }

    // Load quiz
    const quiz = await Quiz.findOne({ courseId });
    if (!quiz) {
      return res.status(404).json({ success: false, message: 'Quiz not found for this course' });
    }

    // Verify enrollment belongs to this user
    const enrollment = await Enrollment.findOne({
      _id: enrollmentId,
      clientId: userId,
      courseId,
    }).populate('courseId', 'title');

    if (!enrollment) {
      return res.status(403).json({ success: false, message: 'Enrollment not found or not authorized' });
    }

    // Calculate score
    const totalQuestions = quiz.questions.length;
    let correctCount = 0;
    quiz.questions.forEach((q, index) => {
      if (answers[index] !== undefined && answers[index] === q.correctAnswer) {
        correctCount++;
      }
    });

    const score = Math.round((correctCount / totalQuestions) * 100);
    const passed = score >= quiz.passingScore;

    if (!passed) {
      return res.json({
        success: true,
        data: {
          score,
          passed: false,
          passingScore: quiz.passingScore,
          correctCount,
          totalQuestions,
        },
      });
    }

    // Generate certificate
    const year = new Date().getFullYear();
    const random = Math.floor(100000 + Math.random() * 900000); // 6-digit
    const certificateId = `GLAM-${year}-${random}`;

    // Get user's name
    const user = await User.findById(userId).select('name');
    const studentName = user?.name || enrollment.clientName || 'Student';
    const courseName = (enrollment.courseId as any)?.title || 'Course';

    // Save certificate
    await Certificate.create({
      certificateId,
      userId,
      courseId,
      enrollmentId: enrollment._id,
      studentName,
      courseName,
      issuedDate: new Date(),
      score,
      verified: true,
    });

    // Update enrollment
    await Enrollment.findByIdAndUpdate(enrollment._id, {
      certificateIssued: true,
      certificateUrl: `/certificate/${certificateId}`,
      certificateIssuedDate: new Date(),
      status: 'completed',
    });

    logger.info(`Certificate issued: ${certificateId} for user ${userId}`);

    return res.json({
      success: true,
      data: {
        score,
        passed: true,
        passingScore: quiz.passingScore,
        correctCount,
        totalQuestions,
        certificateId,
        certificateUrl: `/certificate/${certificateId}`,
      },
    });
  } catch (error: any) {
    logger.error('submitQuiz error:', error);
    return res.status(500).json({ success: false, message: 'Failed to submit quiz', error: error.message });
  }
};

// ─── GET /api/quiz/verify/:certificateId ───────────────────────────────────────
// PUBLIC — no auth required
export const verifyCertificate = async (req: AuthRequest, res: Response) => {
  try {
    const { certificateId } = req.params;

    const certificate = await Certificate.findOne({ certificateId });

    if (!certificate) {
      return res.status(404).json({
        success: false,
        message: 'Certificate not found',
      });
    }

    return res.json({
      success: true,
      data: {
        certificateId: certificate.certificateId,
        studentName: certificate.studentName,
        courseName: certificate.courseName,
        score: certificate.score,
        issuedDate: certificate.issuedDate,
        verified: certificate.verified,
      },
    });
  } catch (error: any) {
    logger.error('verifyCertificate error:', error);
    return res.status(500).json({ success: false, message: 'Failed to verify certificate', error: error.message });
  }
};
