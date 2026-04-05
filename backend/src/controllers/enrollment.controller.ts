// backend/src/controllers/enrollment.controller.ts
import { Request, Response } from 'express';
import Enrollment from '../models/Enrollment.model';
import Course from '../models/Course.model';
import mongoose from 'mongoose';
import { logger } from '../utils/logger';

const isValidObjectId = (id: string): boolean => {
  return mongoose.Types.ObjectId.isValid(id);
};

// Create Enrollment (Client enrolls in course with batch selection)
export const createEnrollment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { 
      courseId, 
      selectedBatchId, 
      clientName, 
      clientPhone, 
      clientEmail 
    } = req.body;
    
    const clientId = (req as any).user._id;

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

    // Get course details
    const course = await Course.findById(courseId).populate('vendorId');
    
    if (!course) {
      res.status(404).json({ success: false, message: 'Course not found' });
      return;
    }

    if (course.status !== 'approved' && course.status !== 'active') {
      res.status(400).json({ 
        success: false, 
        message: 'This course is not available for enrollment' 
      });
      return;
    }

    // Check if already enrolled
    const existingEnrollment = await Enrollment.findOne({
      courseId,
      clientId,
      status: { $in: ['enrolled', 'completed'] },
    });

    if (existingEnrollment) {
      res.status(400).json({
        success: false,
        message: 'You are already enrolled in this course',
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
    const finalPrice = course.discountPrice || course.price;

    // Create enrollment
    const enrollment = await Enrollment.create({
      courseId,
      clientId,
      vendorId: course.vendorId,
      ...batchData,
      totalPrice: finalPrice,
      clientName: clientName.trim(),
      clientPhone: clientPhone?.trim() || "",
      clientEmail: clientEmail.toLowerCase().trim(),
      status: 'enrolled',
      paymentStatus: 'pending', // Will be updated after payment
      progress: 0,
      lessonsProgress,
      completedLessons: 0,
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
        select: 'title category imageUrl price duration level instructorName lessons batches',
      })
      .populate('vendorId', 'name email phone')
      .sort({ createdAt: -1 })
      .lean();

    logger.info('Client enrollments fetched', {
      clientId,
      count: enrollments.length,
    });

    res.status(200).json({
      success: true,
      count: enrollments.length,
      data: enrollments,
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
    const lessonProgress = enrollment.lessonsProgress.find(
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
    const completedCount = enrollment.lessonsProgress.filter(
      (lp: any) => lp.completed
    ).length;

    enrollment.completedLessons = completedCount;

    // Calculate progress percentage
    if (enrollment.totalLessons > 0) {
      enrollment.progress = Math.round((completedCount / enrollment.totalLessons) * 100);
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

    if (enrollment.vendorId.toString() !== vendorId.toString()) {
      res.status(403).json({ success: false, message: 'Not authorized' });
      return;
    }

    // Add or update attendance
    const attendanceDate = new Date(date);
    const existingIndex = enrollment.practicalAttendance.findIndex(
      (att: any) => new Date(att.date).toDateString() === attendanceDate.toDateString()
    );

    if (existingIndex >= 0) {
      // Update existing
      (enrollment.practicalAttendance[existingIndex] as any).attended = attended;
      (enrollment.practicalAttendance[existingIndex] as any).notes = notes || '';
    } else {
      // Add new
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

    if (enrollment.vendorId.toString() !== vendorId.toString()) {
      res.status(403).json({ success: false, message: 'Not authorized' });
      return;
    }

    enrollment.status = status;
    
    if (status === 'completed') {
      enrollment.progress = 100;
      enrollment.completionDate = new Date();
      // Mark all lessons as completed
      enrollment.lessonsProgress.forEach((lp: any) => {
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
