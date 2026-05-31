// backend/src/controllers/enrollment.controller.ts
import { Request, Response } from 'express';
import Enrollment from '../models/Enrollment.model';
import Course from '../models/Course.model';
import Quiz from '../models/Quiz.model';
import mongoose from 'mongoose';
import { logger } from '../utils/logger';

const isValidObjectId = (id: string): boolean => {
  return mongoose.Types.ObjectId.isValid(id);
};

// Helper: Check and update certificate eligibility
const checkCertificateEligibility = async (enrollmentId: string) => {
  try {
    const enrollment = await Enrollment.findById(enrollmentId);
    if (!enrollment) return;

    const eligible =
      enrollment.onlineCompleted === true &&
      enrollment.quizPassed === true &&
      enrollment.attendancePercentage >= 80 &&
      enrollment.practicalPassed === true;

    if (eligible !== enrollment.certificateEligible) {
      await Enrollment.findByIdAndUpdate(
        enrollmentId,
        { certificateEligible: eligible },
        { runValidators: false }
      );
    }
  } catch (error) {
    logger.error('Error checking certificate eligibility:', error);
  }
};

// Create Enrollment (Client enrolls in course with batch selection)
export const createEnrollment = async (req: Request, res: Response): Promise<void> => {
  try {
    const clientId = (req as any).user._id;

    // Remove orphaned enrollments where course no longer exists
    try {
      const orphaned = await Enrollment.find({
        clientId
      }).populate('courseId');

      const orphanedIds = orphaned
        .filter((e: any) => e.courseId === null)
        .map(e => e._id);

      if (orphanedIds.length > 0) {
        await Enrollment.deleteMany({ _id: { $in: orphanedIds } });
        console.log('Deleted orphaned enrollments:', orphanedIds);
      }
    } catch (cleanupError) {
      console.error('Orphan cleanup error:', cleanupError);
    }


    const {
      courseId,
      selectedBatchId,
      clientName,
      clientPhone,
      clientEmail,
      paymentMethod,
      transactionId,
    } = req.body;

    console.log('Enrollment create called by:', (req as any).user?._id);
    console.log('Enrollment body:', req.body);

    // Validation
    if (!courseId || !clientName || !clientEmail) {
      res.status(400).json({
        success: false,
        message: 'Please provide all required fields',
      });
      return;
    }

    if (!isValidObjectId(courseId)) {
      res.status(400).json({ success: false, message: 'Invalid course ID' });
      return;
    }

    // Check if client has phone number in profile
    const User = (await import('../models/User.model')).default;
    const client = await User.findById(clientId).select('name email phone role');
    if (!client) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    if (!client.phone || String(client.phone).trim() === '') {
      res.status(400).json({
        success: false,
        message: 'Please add your phone number in your profile before enrolling',
        requiresPhone: true,
      });
      return;
    }

    // Get course details
    const course = await Course.findById(courseId).populate('vendorId');

    if (!course) {
      res.status(404).json({ success: false, message: 'Course not found' });
      return;
    }

    if (!course.vendorId) {
      res.status(400).json({ success: false, message: 'Course has no vendor assigned' });
      return;
    }

    if (course.status !== 'approved' && course.status !== 'active') {
      res.status(400).json({
        success: false,
        message: 'This course is not available for enrollment'
      });
      return;
    }

    // Clean up abandoned pending_payment enrollments for this user+course
    try {
      await Enrollment.deleteMany({
        clientId: clientId,
        courseId: courseId,
        status: 'pending_payment' as any,
      });
    } catch (cleanupErr) {
      // non-fatal, continue
    }

    // Check if already enrolled
    const existingEnrollment = await Enrollment.findOne({
      courseId,
      clientId,
      status: { $in: ['enrolled', 'completed', 'pending_payment'] },
    });

    if (existingEnrollment) {
      // If payment was cancelled/abandoned, allow re-enrollment by 
      // deleting the stuck pending_payment enrollment
      if ((existingEnrollment.status as string) === 'pending_payment') {
        await Enrollment.deleteOne({ _id: existingEnrollment._id });
        // abandoned payment — allow fresh enrollment
      } else {
        res.status(400).json({
          success: false,
          message: 'You are already enrolled in this course',
        });
        return;
      }
    }

    // Enforce max 2 active enrollments (excluding deleted courses)
    const activeEnrollments = await Enrollment.find({
      clientId,
      status: { $in: ['enrolled', 'active'] },
      progress: { $lt: 100 },
    }).populate('courseId');

    const validEnrollments = activeEnrollments.filter((e: any) => e.courseId != null);

    if (validEnrollments.length >= 2) {
      res.status(400).json({
        success: false,
        message: 'You can only be enrolled in 2 active courses at a time. Complete or drop a course before enrolling in a new one.',
      });
      return;
    }

    // Handle batch selection for physical classes
    let batchData: any = {
      selectedBatchId: null,
      batchStartDate: null,
      batchEndDate: null,
      batchLocation: null,
    };

    if (selectedBatchId && course.courseFormat.physicalClasses) {
      const selectedBatch = course.batches.find(
        (b: any) => b._id.toString() === selectedBatchId
      );

      if (!selectedBatch) {
        res.status(400).json({
          success: false,
          message: 'Selected batch not found'
        });
        return;
      }

      if ((selectedBatch as any).seatsRemaining <= 0) {
        res.status(400).json({
          success: false,
          message: 'Selected batch is full',
        });
        return;
      }

      batchData = {
        selectedBatchId: selectedBatch.id.toString(),
        batchStartDate: (selectedBatch as any).startDate,
        batchEndDate: (selectedBatch as any).endDate,
        batchLocation: (selectedBatch as any).location,
      };

      // Decrease batch seats
      await Course.updateOne(
        { _id: courseId, 'batches._id': selectedBatchId },
        { $inc: { 'batches.$.seatsRemaining': -1 } }
      );
    }

    // Initialize lesson progress
    const lessonsProgress = course.lessons.map((lesson: any) => ({
      lessonId: lesson._id.toString(),
      completed: false,
      completedAt: null,
      timeSpent: 0,
    }));

    // Calculate price (use discount if available)
    const finalPrice = course.discountPrice || course.price || 0;

    // Determine payment status
    const isFree = !finalPrice || finalPrice === 0;
    const paymentStatus = isFree ? 'free' : 'pending';

    // Create enrollment
    const enrollment = await Enrollment.create({
      courseId,
      clientId,
      vendorId: course.vendorId,
      ...batchData,
      totalPrice: finalPrice,
      totalAmount: finalPrice,
      advanceAmount: 0,
      remainingAmount: finalPrice,
      clientName: clientName.trim(),
      clientPhone: clientPhone?.trim() || "",
      clientEmail: clientEmail.toLowerCase().trim(),
      status: (isFree || paymentMethod === 'mock' ? 'enrolled' : 'pending_payment') as any,
      paymentStatus,
      paymentMethod: paymentMethod || (isFree ? 'free' : null),
      transactionId: transactionId || null,
      progress: 0,
      lessonsProgress,
      completedLessons: [],
      totalLessons: course.lessons.length,
      practicalAttendance: [],
    });

    // Update course enrollment count
    await Course.findByIdAndUpdate(courseId, {
      $inc: { enrollmentCount: 1 },
    });

    const populatedEnrollment = await Enrollment.findById(enrollment._id)
      .populate('courseId')
      .populate('vendorId', 'name email phone')
      .populate('clientId', 'name email');

    logger.info('Enrollment created', {
      enrollmentId: enrollment._id,
      clientId,
      courseId,
      batchId: selectedBatchId,
      paymentStatus,
    });

    res.status(201).json({
      success: true,
      message: 'Successfully enrolled in course',
      data: populatedEnrollment,
    });
  } catch (error: any) {
    logger.error('Create enrollment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to enroll in course',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// Get Client Enrollments (My Courses)
export const getClientEnrollments = async (req: Request, res: Response): Promise<void> => {
  try {
    const clientId = (req as any).user._id;
    const { status } = req.query;

    const query: any = { clientId };
    if (status && status !== 'all') {
      query.status = status;
    }

    const enrollments = await Enrollment.find(query)
      .populate({
        path: 'courseId',
        populate: { path: 'vendorId', select: 'name profileImage' }
      })
      .sort({ createdAt: -1 })
      .lean();

    logger.info('Client enrollments fetched', {
      clientId,
      count: enrollments.length,
    });

    res.status(200).json({
      success: true,
      count: enrollments.length,
      enrollments,
    });
  } catch (error: any) {
    logger.error('Get client enrollments error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch enrollments',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// Get Single Enrollment with Full Course Details (Learning Dashboard)
export const getEnrollmentById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = (req as any).user._id.toString();
    const userRole = (req as any).user.role;

    if (!isValidObjectId(id)) {
      res.status(400).json({ success: false, message: 'Invalid enrollment ID' });
      return;
    }

    const enrollment = await Enrollment.findById(id)
      .populate({
        path: 'courseId',
        populate: { path: 'vendorId', select: 'name email phone' }
      })
      .populate('clientId', 'name email phone')
      .lean();

    if (!enrollment) {
      res.status(404).json({ success: false, message: 'Enrollment not found' });
      return;
    }

    // Authorization check
    const isClient = enrollment.clientId && (enrollment.clientId as any)._id.toString() === userId;
    const isVendor = enrollment.vendorId && enrollment.vendorId.toString() === userId;
    const isAdmin = userRole === 'admin';

    if (!isClient && !isVendor && !isAdmin) {
      res.status(403).json({ success: false, message: 'Not authorized' });
      return;
    }

    res.status(200).json({ success: true, data: enrollment });
  } catch (error: any) {
    logger.error('Get enrollment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch enrollment',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// Get Enrollment By Course (for Online Certificate - only checks progress + quiz)
export const getEnrollmentByCourse = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user._id.toString();
    const { courseId } = req.params;

    if (!isValidObjectId(courseId)) {
      res.status(400).json({ success: false, message: 'Invalid course ID' });
      return;
    }

    const enrollment = await Enrollment.findOne({
      clientId: userId,
      courseId,
    })
      .populate({
        path: 'courseId',
        populate: { path: 'vendorId', select: 'name' }
      })
      .populate('clientId', 'name email');

    if (!enrollment) {
      res.status(404).json({ success: false, message: 'Enrollment not found' });
      return;
    }

    const onlineCertEligible = enrollment.progress === 100 && enrollment.quizPassed === true;

    if (!onlineCertEligible) {
      res.status(403).json({
        success: false,
        message: 'Complete all lessons and pass the quiz first',
        progress: enrollment.progress,
        quizPassed: enrollment.quizPassed,
      });
      return;
    }

    res.status(200).json({ success: true, data: enrollment });
  } catch (error: any) {
    logger.error('Get enrollment by course error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch enrollment',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// Update Lesson Progress (Mark lesson as complete)
export const updateLessonProgress = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params; // enrollment ID
    const { lessonId, completed, timeSpent } = req.body;
    const clientId = (req as any).user._id;

    if (!isValidObjectId(id)) {
      res.status(400).json({ success: false, message: 'Invalid enrollment ID' });
      return;
    }

    const enrollment = await Enrollment.findById(id);

    if (!enrollment) {
      res.status(404).json({ success: false, message: 'Enrollment not found' });
      return;
    }

    if (enrollment.clientId.toString() !== clientId.toString()) {
      res.status(403).json({ success: false, message: 'Not authorized' });
      return;
    }

    // Find and update lesson progress
    const lessonProgress = (enrollment.lessonsProgress ?? []).find(
      (lp: any) => lp.lessonId === lessonId
    );

    if (!lessonProgress) {
      res.status(404).json({ success: false, message: 'Lesson not found in enrollment' });
      return;
    }

    // Update lesson progress
    (lessonProgress as any).completed = completed;
    if (completed && !(lessonProgress as any).completedAt) {
      (lessonProgress as any).completedAt = new Date();
    }
    if (timeSpent) {
      (lessonProgress as any).timeSpent = timeSpent;
    }

    // Recalculate completed lessons count
    const completedCount = (enrollment.lessonsProgress ?? []).filter(
      (lp: any) => lp.completed
    ).length;

    // Calculate progress percentage
    if ((enrollment.totalLessons ?? 0) > 0) {
      enrollment.progress = Math.round((completedCount / (enrollment.totalLessons ?? 1)) * 100);
    }

    // Auto-complete course if all lessons done
    if (enrollment.progress === 100 && enrollment.status === 'enrolled') {
      enrollment.status = 'completed';
      enrollment.completionDate = new Date();
    }

    await enrollment.save();

    logger.info('Lesson progress updated', {
      enrollmentId: id,
      lessonId,
      completed,
      newProgress: enrollment.progress,
    });

    res.status(200).json({
      success: true,
      message: 'Progress updated successfully',
      data: {
        progress: enrollment.progress,
        completedLessons: enrollment.completedLessons,
        totalLessons: enrollment.totalLessons,
        status: enrollment.status,
      },
    });
  } catch (error: any) {
    logger.error('Update lesson progress error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update progress',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// Get Vendor Enrollments (Students)
export const getVendorEnrollments = async (req: Request, res: Response): Promise<void> => {
  try {
    const vendorId = (req as any).user._id;
    const { status, courseId } = req.query;

    const query: any = { vendorId };
    
    if (status && status !== 'all') {
      query.status = status;
    }
    
    if (courseId) {
      query.courseId = courseId;
    }

    const enrollments = await Enrollment.find(query)
      .populate('courseId', 'title category imageUrl price duration')
      .populate('clientId', 'name email phone')
      .sort({ enrollmentDate: -1 })
      .lean();

    logger.info('Vendor enrollments fetched', {
      vendorId,
      count: enrollments.length,
    });

    res.status(200).json({
      success: true,
      count: enrollments.length,
      data: enrollments,
    });
  } catch (error: any) {
    logger.error('Get vendor enrollments error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch enrollments',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// Mark Attendance (Vendor)
export const markAttendance = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params; // enrollment ID
    const { date, attended, notes } = req.body;
    const vendorId = (req as any).user._id;

    if (!isValidObjectId(id)) {
      res.status(400).json({ success: false, message: 'Invalid enrollment ID' });
      return;
    }

    const enrollment = await Enrollment.findById(id);

    if (!enrollment) {
      res.status(404).json({ success: false, message: 'Enrollment not found' });
      return;
    }

    if (!enrollment.vendorId || enrollment.vendorId.toString() !== vendorId.toString()) {
      res.status(403).json({ success: false, message: 'Not authorized' });
      return;
    }

    // Add or update attendance
    const attendanceDate = new Date(date);
    if (!enrollment.practicalAttendance) enrollment.practicalAttendance = [];
    const existingIndex = enrollment.practicalAttendance.findIndex(
      (att: any) => new Date(att.date).toDateString() === attendanceDate.toDateString()
    );

    if (existingIndex >= 0) {
      (enrollment.practicalAttendance[existingIndex] as any).attended = attended;
      (enrollment.practicalAttendance[existingIndex] as any).notes = notes || '';
    } else {
      enrollment.practicalAttendance.push({
        date: attendanceDate,
        attended,
        notes: notes || '',
      } as any);
    }

    await enrollment.save();

    logger.info('Attendance marked', {
      enrollmentId: id,
      date,
      attended,
    });

    res.status(200).json({
      success: true,
      message: 'Attendance marked successfully',
      data: enrollment,
    });
  } catch (error: any) {
    logger.error('Mark attendance error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark attendance',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// Cancel Enrollment
export const cancelEnrollment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const clientId = (req as any).user._id;

    if (!isValidObjectId(id)) {
      res.status(400).json({ success: false, message: 'Invalid enrollment ID' });
      return;
    }

    const enrollment = await Enrollment.findById(id);

    if (!enrollment) {
      res.status(404).json({ success: false, message: 'Enrollment not found' });
      return;
    }

    if (enrollment.clientId.toString() !== clientId.toString()) {
      res.status(403).json({ success: false, message: 'Not authorized' });
      return;
    }

    if (enrollment.status === 'cancelled') {
      res.status(400).json({ success: false, message: 'Already cancelled' });
      return;
    }

    if (enrollment.status === 'completed') {
      res.status(400).json({ success: false, message: 'Cannot cancel completed course' });
      return;
    }

    enrollment.status = 'cancelled';
    await enrollment.save();

    // Restore batch seat if applicable
    if (enrollment.selectedBatchId) {
      await Course.updateOne(
        { _id: enrollment.courseId, 'batches._id': enrollment.selectedBatchId },
        { $inc: { 'batches.$.seatsRemaining': 1 } }
      );
    }

    // Decrease enrollment count
    await Course.findByIdAndUpdate(enrollment.courseId, {
      $inc: { enrollmentCount: -1 },
    });

    logger.info('Enrollment cancelled', { enrollmentId: id, clientId });

    res.status(200).json({
      success: true,
      message: 'Enrollment cancelled successfully',
      data: enrollment,
    });
  } catch (error: any) {
    logger.error('Cancel enrollment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel enrollment',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// Update Enrollment Status (Vendor - mark as completed, etc.)
export const updateEnrollmentStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const vendorId = (req as any).user._id;

    if (!isValidObjectId(id)) {
      res.status(400).json({ success: false, message: 'Invalid enrollment ID' });
      return;
    }

    const validStatuses = ['enrolled', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      res.status(400).json({ success: false, message: 'Invalid status' });
      return;
    }

    const enrollment = await Enrollment.findById(id);

    if (!enrollment) {
      res.status(404).json({ success: false, message: 'Enrollment not found' });
      return;
    }

    if (!enrollment.vendorId || enrollment.vendorId.toString() !== vendorId.toString()) {
      res.status(403).json({ success: false, message: 'Not authorized' });
      return;
    }

    enrollment.status = status;
    
    if (status === 'completed') {
      enrollment.progress = 100;
      enrollment.completionDate = new Date();
      (enrollment.lessonsProgress ?? []).forEach((lp: any) => {
        if (!lp.completed) {
          lp.completed = true;
          lp.completedAt = new Date();
        }
      });
    }

    await enrollment.save();

    logger.info('Enrollment status updated', {
      enrollmentId: id,
      vendorId,
      newStatus: status,
    });

    res.status(200).json({
      success: true,
      message: 'Status updated successfully',
      data: enrollment,
    });
  } catch (error: any) {
    logger.error('Update enrollment status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update status',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// Update Payment Status
export const updatePaymentStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { paymentStatus } = req.body;

    if (!isValidObjectId(id)) {
      res.status(400).json({ success: false, message: 'Invalid enrollment ID' });
      return;
    }

    const enrollment = await Enrollment.findById(id);

    if (!enrollment) {
      res.status(404).json({ success: false, message: 'Enrollment not found' });
      return;
    }

    enrollment.paymentStatus = paymentStatus;
    
    if (paymentStatus === 'completed') {
      enrollment.paymentDate = new Date();
    }

    await enrollment.save();

    res.status(200).json({
      success: true,
      message: 'Payment status updated',
      data: enrollment,
    });
  } catch (error: any) {
    logger.error('Update payment status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update payment status',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// Mark a lesson as complete and update progress
export const markLessonComplete = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { enrollmentId, lessonId } = req.body;

    const enrollment = await Enrollment.findOne({ _id: enrollmentId, clientId: user._id });
    if (!enrollment) {
      res.status(404).json({ success: false, message: 'Enrollment not found' });
      return;
    }

    const lessonObjId = new mongoose.Types.ObjectId(lessonId);
    const alreadyDone = (enrollment.completedLessons as mongoose.Types.ObjectId[])
      .some((id: mongoose.Types.ObjectId) => id.toString() === lessonObjId.toString());

    if (!alreadyDone) {
      (enrollment.completedLessons as mongoose.Types.ObjectId[]).push(lessonObjId);
    }

    const course = await Course.findById(enrollment.courseId);
    const totalLessons = course?.lessons?.length || 1;
    enrollment.progress = Math.round(
      ((enrollment.completedLessons as mongoose.Types.ObjectId[]).length / totalLessons) * 100
    );
    enrollment.lastAccessedAt = new Date();
    enrollment.lastLessonId = lessonObjId;

    if (enrollment.progress >= 100) {
      enrollment.status = 'completed';
    }

    await enrollment.save();
    res.json({ success: true, progress: enrollment.progress, enrollment });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Submit quiz
export const submitQuiz = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { enrollmentId, answers } = req.body;

    const enrollment = await Enrollment.findOne({ _id: enrollmentId, clientId: user._id })
      .populate('courseId');
    if (!enrollment) return res.status(404).json({ success: false, message: 'Enrollment not found' });
    if (enrollment.progress < 100) return res.status(400).json({ success: false, message: 'Complete all lessons before taking the quiz' });

    const course = enrollment.courseId as any;

    const quiz = await Quiz.findOne({ courseId: course._id });
    const questions = quiz?.questions || [];
    if (questions.length === 0) return res.status(400).json({ success: false, message: 'No quiz available' });

    let correct = 0;
    questions.forEach((q: any, i: number) => {
      if (answers[i] !== undefined && answers[i] === q.correctAnswer) correct++;
    });
    const score = Math.round((correct / questions.length) * 100);
    const passed = score >= 70;

    await Enrollment.updateOne(
      { _id: enrollment._id },
      {
        $set: {
          quizScore: score,
          quizAttempts: (enrollment.quizAttempts || 0) + 1,
          quizPassed: passed,
          quizStatus: passed ? 'pending_approval' : 'failed'
        }
      }
    );

    res.json({ success: true, score, passed, quizStatus: passed ? 'pending_approval' : 'failed' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Approve quiz (vendor only)
export const approveQuiz = async (req: Request, res: Response) => {
  try {
    const { enrollmentId } = req.params;
    const enrollment = await Enrollment.findById(enrollmentId).populate('courseId clientId');

    if (!enrollment) {
      return res.status(404).json({ success: false, message: 'Enrollment not found' });
    }

    if (enrollment.quizStatus !== 'pending_approval') {
      return res.status(400).json({ success: false, message: 'Quiz is not pending approval' });
    }

    if (!enrollment.quizPassed) {
      return res.status(400).json({ success: false, message: 'Quiz was not passed' });
    }

    enrollment.certificateIssued = true;
    enrollment.certificateId = `GLB-${new Date().getFullYear()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
    enrollment.certificateIssuedAt = new Date();
    enrollment.quizStatus = 'approved';
    enrollment.status = 'completed';

    await enrollment.save();

    res.json({ success: true, message: 'Quiz approved and certificate issued', certificateId: enrollment.certificateId });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Reject quiz (vendor only)
export const rejectQuiz = async (req: Request, res: Response) => {
  try {
    const { enrollmentId } = req.params;
    const { reason } = req.body;

    const enrollment = await Enrollment.findById(enrollmentId);

    if (!enrollment) {
      return res.status(404).json({ success: false, message: 'Enrollment not found' });
    }

    if (enrollment.quizStatus !== 'pending_approval') {
      return res.status(400).json({ success: false, message: 'Quiz is not pending approval' });
    }

    enrollment.quizStatus = 'rejected';
    enrollment.quizAttempts = 0;
    enrollment.quizScore = undefined;
    enrollment.quizPassed = false;

    await enrollment.save();

    res.json({ success: true, message: 'Quiz rejected. Student can retake the quiz.' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get pending approvals (vendor only)
export const getPendingApprovals = async (req: Request, res: Response) => {
  try {
    const vendorId = (req as any).user._id;

    const pendingApprovals = await Enrollment.find({
      quizStatus: 'pending_approval',
    })
      .populate({
        path: 'courseId',
        match: { vendorId: vendorId },
      })
      .populate('clientId', 'name email')
      .lean();

    const filtered = pendingApprovals.filter((e: any) => e.courseId !== null);

    res.json({ success: true, data: filtered });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get certificate data (Final Professional Certificate)
export const getCertificate = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { courseId } = req.params;

    const enrollment = await Enrollment.findOne({ clientId: user._id, courseId })
      .populate({ path: 'courseId', populate: { path: 'vendorId', select: 'name' } })
      .populate('clientId', 'name email');

    if (!enrollment) {
      return res.status(404).json({ success: false, message: 'Enrollment not found' });
    }

    const finalCertificateEligible =
      enrollment.progress === 100 &&
      enrollment.quizPassed === true &&
      enrollment.attendancePercentage >= 80 &&
      enrollment.practicalPassed === true;

    if (!finalCertificateEligible) {
      return res.status(404).json({ success: false, message: 'You are not eligible for the final certificate yet' });
    }

    res.json({ success: true, data: { enrollment, certificateId: enrollment.certificateId } });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Mark Attendance New - Mark student present/absent for a date
export const markAttendanceNew = async (req: Request, res: Response) => {
  try {
    const { enrollmentId } = req.params;
    const { date, status } = req.body;
    const vendorId = (req as any).user._id;

    if (!isValidObjectId(enrollmentId)) {
      return res.status(400).json({ success: false, message: 'Invalid enrollment ID' });
    }

    const enrollment = await Enrollment.findById(enrollmentId);
    if (!enrollment) {
      return res.status(404).json({ success: false, message: 'Enrollment not found' });
    }

    const course = await Course.findById(enrollment.courseId);
    if (!course || course.vendorId.toString() !== vendorId.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const attendanceDate = new Date(date);
    const existingIndex = enrollment.attendanceLog.findIndex(
      (log: any) => new Date(log.date).toDateString() === attendanceDate.toDateString()
    );

    if (existingIndex >= 0) {
      enrollment.attendanceLog[existingIndex].status = status;
    } else {
      enrollment.attendanceLog.push({ date: attendanceDate, status, markedBy: vendorId });
      enrollment.totalClasses = (enrollment.totalClasses || 0) + 1;
    }

    const attended = enrollment.attendanceLog.filter((l: any) => l.status === 'present').length;
    enrollment.attendedClasses = attended;
    enrollment.attendancePercentage = enrollment.totalClasses > 0
      ? Math.round((attended / enrollment.totalClasses) * 100)
      : 0;

    await Enrollment.findByIdAndUpdate(
      enrollmentId,
      {
        attendanceLog: enrollment.attendanceLog,
        totalClasses: enrollment.totalClasses,
        attendedClasses: enrollment.attendedClasses,
        attendancePercentage: enrollment.attendancePercentage,
      },
      { runValidators: false }
    );

    await checkCertificateEligibility(enrollmentId);

    const updated = await Enrollment.findById(enrollmentId).populate('clientId', 'name email');

    // ✅ FIX: null guard before accessing updated fields
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Enrollment not found after update' });
    }

    logger.info('Attendance marked', {
      enrollmentId,
      date,
      status,
      attendance: `${updated.attendedClasses}/${updated.totalClasses}`,
    });

    res.json({ success: true, message: 'Attendance marked', data: updated });
  } catch (error: any) {
    logger.error('Mark attendance error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Approve Practical - Mark practical training as passed
export const approvePractical = async (req: Request, res: Response) => {
  try {
    const { enrollmentId } = req.params;
    const vendorId = (req as any).user._id;

    if (!isValidObjectId(enrollmentId)) {
      return res.status(400).json({ success: false, message: 'Invalid enrollment ID' });
    }

    const enrollment = await Enrollment.findById(enrollmentId);
    if (!enrollment) {
      return res.status(404).json({ success: false, message: 'Enrollment not found' });
    }

    const course = await Course.findById(enrollment.courseId);
    if (!course || course.vendorId.toString() !== vendorId.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    await Enrollment.findByIdAndUpdate(
      enrollmentId,
      { practicalPassed: true },
      { runValidators: false }
    );

    await checkCertificateEligibility(enrollmentId);

    const updated = await Enrollment.findById(enrollmentId).populate('clientId', 'name email');

    // ✅ FIX: null guard
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Enrollment not found after update' });
    }

    logger.info('Practical approved', { enrollmentId, vendorId });

    res.json({ success: true, message: 'Practical approved', data: updated });
  } catch (error: any) {
    logger.error('Approve practical error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Public certificate verification by certificate ID
export const verifyCertificate = async (req: Request, res: Response): Promise<void> => {
  try {
    const { certId } = req.params;
 
    if (!certId || typeof certId !== 'string' || certId.trim() === '') {
      res.status(400).json({ valid: false, message: 'Invalid certificate ID format' });
      return;
    }
 
    const id = certId.trim();
 
    // Strategy 1: exact match on certificateId field (GLB-YYYY-XXXXXX issued via approveQuiz)
    let enrollment = await Enrollment.findOne({ certificateId: id })
      .populate('courseId', 'title lessons')
      .populate('clientId', 'name email')
      .lean();
 
    // Strategy 2: OC-XXXXXXXX format generated by OnlineCertificate frontend
    // format is OC-{last 8 chars of _id uppercased}
    if (!enrollment && id.startsWith('OC-')) {
      const suffix = id.replace('OC-', '').toLowerCase();
      const all = await Enrollment.find({ quizPassed: true })
        .populate('courseId', 'title lessons')
        .populate('clientId', 'name email')
        .lean();
      enrollment = all.find((e: any) =>
        e._id.toString().slice(-8).toUpperCase() === suffix.toUpperCase()
      ) ?? null;
    }
 
    // Strategy 3: legacy GLB- format — match last 6 chars of _id
    if (!enrollment && id.includes('-')) {
      const suffix = id.split('-').pop()?.toLowerCase();
      if (suffix && suffix.length >= 6) {
        const all = await Enrollment.find({ quizPassed: true })
          .populate('courseId', 'title lessons')
          .populate('clientId', 'name email')
          .lean();
        enrollment = all.find((e: any) =>
          e._id.toString().slice(-suffix.length).toLowerCase() === suffix
        ) ?? null;
      }
    }
 
    if (!enrollment) {
      res.status(404).json({ valid: false, message: 'Certificate not found or invalid' });
      return;
    }
 
    // Must have passed quiz and completed all lessons
    const totalLessons =
      (enrollment.courseId as any)?.lessons?.length ||
      enrollment.totalLessons ||
      1;
 
    const completedCount =
      enrollment.completedLessons?.length || 0;
 
    const progress =
      enrollment.progress ??
      Math.round((completedCount / totalLessons) * 100);
 
    if (progress < 100 || !enrollment.quizPassed) {
      res.status(403).json({
        valid: false,
        message: 'Certificate conditions not met',
      });
      return;
    }
 
    res.status(200).json({
      valid: true,
      student: { name: (enrollment.clientId as any)?.name || 'Student' },
      course:  { title: (enrollment.courseId as any)?.title || 'Course' },
      vendor: 'GlamBook Academy',
      quizScore: enrollment.quizScore,
      completedLessons: completedCount,
      totalLessons,
      progress,
      completionDate:
        (enrollment as any).onlineCertificateIssuedAt ||
        (enrollment as any).quizSubmittedAt ||
        (enrollment as any).updatedAt ||
        new Date(),
      attendanceStatus:
        ((enrollment as any).attendancePercentage || 0) >= 80 ? 'verified' : 'pending',
      practicalStatus: (enrollment as any).practicalPassed ? 'approved' : 'pending',
      certId: id,
      verifiedAt: new Date(),
    });
  } catch (error: any) {
    logger.error('Verify certificate error:', error);
    res.status(500).json({ valid: false, message: error.message });
  }
};
// Get Course Students - Vendor gets all students for a course with full progress
export const getCourseStudents = async (req: Request, res: Response) => {
  try {
    const { courseId } = req.params;
    const vendorId = (req as any).user._id;

    if (!isValidObjectId(courseId)) {
      return res.status(400).json({ success: false, message: 'Invalid course ID' });
    }

    const course = await Course.findById(courseId);
    if (!course || course.vendorId.toString() !== vendorId.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const enrollments = await Enrollment.find({ courseId })
      .populate('clientId', 'name email phone')
      .lean();

    logger.info('Course students fetched', { courseId, count: enrollments.length });

    res.json({ success: true, data: enrollments });
  } catch (error: any) {
    logger.error('Get course students error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};