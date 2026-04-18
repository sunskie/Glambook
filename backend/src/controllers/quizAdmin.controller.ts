// backend/src/controllers/quizAdmin.controller.ts
import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { logger } from '../utils/logger';
import Quiz from '../models/Quiz.model';
import Course from '../models/Course.model';

// ─── POST /api/quiz/create ──────────────────────────────────────────────────────
// Vendor only — creates or replaces the quiz for one of their courses
export const createQuiz = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const userRole = req.user?.role;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }

    if (userRole !== 'vendor' && userRole !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only vendors can create quizzes',
      });
    }

    const { courseId, questions, passingScore } = req.body;

    if (!courseId) {
      return res.status(400).json({ success: false, message: 'courseId is required' });
    }

    if (!Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({ success: false, message: 'At least one question is required' });
    }

    // Validate each question
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.question || !Array.isArray(q.options) || q.options.length < 2) {
        return res.status(400).json({
          success: false,
          message: `Question ${i + 1} is invalid: must have question text and at least 2 options`,
        });
      }
      if (typeof q.correctAnswer !== 'number' || q.correctAnswer < 0 || q.correctAnswer >= q.options.length) {
        return res.status(400).json({
          success: false,
          message: `Question ${i + 1}: correctAnswer must be a valid option index`,
        });
      }
    }

    // Verify the course belongs to this vendor (admin can bypass)
    if (userRole !== 'admin') {
      const course = await Course.findOne({ _id: courseId, vendorId: userId });
      if (!course) {
        return res.status(403).json({
          success: false,
          message: 'Course not found or you do not own this course',
        });
      }
    }

    // Upsert — create or replace existing quiz for this course
    const quiz = await Quiz.findOneAndUpdate(
      { courseId },
      {
        courseId,
        questions,
        passingScore: passingScore ?? 70,
      },
      { upsert: true, new: true, runValidators: true }
    );

    logger.info(`Quiz created/updated for course ${courseId} by vendor ${userId}`);

    return res.status(201).json({
      success: true,
      message: 'Quiz created successfully',
      data: quiz,
    });
  } catch (error: any) {
    logger.error('createQuiz error:', error);
    return res.status(500).json({ success: false, message: 'Failed to create quiz', error: error.message });
  }
};
