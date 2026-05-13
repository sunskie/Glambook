// backend/src/controllers/course.controller.ts
import { Request, Response } from 'express';
import Course from '../models/Course.model';
import Enrollment from '../models/Enrollment.model';
import mongoose from 'mongoose';
import { logger } from '../utils/logger';
import { deleteFile } from '../middleware/upload.middleware';

const isValidObjectId = (id: string): boolean => {
  return mongoose.Types.ObjectId.isValid(id);
};

// Create Course (Vendor)
export const createCourse = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('CREATE COURSE body:', JSON.stringify(req.body, null, 2));
    console.log('CREATE COURSE files:', req.files);
    console.log('CREATE COURSE file:', req.file);

    console.log('VALIDATION STARTED');

    const {
      title,
      description,
      category,
      price,
      discountPrice,
      duration,
      level,
      whatYouWillLearn,
      requirements,
      courseFormat,
      instructorName,
      instructorBio,
      certificateIncluded,
      lessons,
      batches,
    } = req.body;

    const vendorId = (req as any).user._id;

    // Validation
    const errors: string[] = [];
    if (!title?.trim()) errors.push('Title is required');
    if (!description?.trim()) errors.push('Description is required');
    if (!category) errors.push('Category is required');
    if (!price || isNaN(parseFloat(price)) || parseFloat(price) < 0) {
      errors.push('Valid price is required');
    }
    if (!duration || isNaN(parseInt(duration)) || parseInt(duration) <= 0) {
      errors.push('Valid duration is required');
    }
    if (!instructorName?.trim()) errors.push('Instructor name is required');

    if (errors.length > 0) {
      console.log('VALIDATION ERRORS:', errors);
      res.status(400).json({ success: false, message: 'Validation failed', errors });
      return;
    }

    // Process lessons from form data — all fields optional
    const lessonsData = req.body.lessons ?
      (Array.isArray(req.body.lessons) ? req.body.lessons : [req.body.lessons])
      : [];

    const processedLessons = lessonsData.map((lesson: any, index: number) => {
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };

      // Try to find uploaded video for this lesson
      const videoFiles = files?.['lessonVideo'] || files?.['video'] || [];
      const pdfFiles = files?.['lessonPdf'] || files?.['pdf'] || [];

      const videoFile = videoFiles[index];
      const pdfFile = pdfFiles[index];

      return {
        title: lesson.title || `Lesson ${index + 1}`,
        description: lesson.description || '',
        contentType: lesson.contentType || lesson.type || 'video',
        duration: parseInt(lesson.duration) || 0,
        isPreview: lesson.isPreview === 'true' || lesson.isPreview === true,
        videoUrl: videoFile ? `/uploads/courses/videos/${videoFile.filename}` : (lesson.videoUrl || ''),
        pdfUrl: pdfFile ? `/uploads/courses/pdfs/${pdfFile.filename}` : (lesson.pdfUrl || ''),
        order: index,
      };
    });

    // Handle thumbnail
    const thumbnailFiles = (req.files as any)?.['thumbnail'];
    const thumbnailFile = thumbnailFiles?.[0];
    const thumbnail = thumbnailFile
      ? `/uploads/courses/thumbnails/${thumbnailFile.filename}`
      : (req.body.thumbnail || '');

    // Parse JSON fields
    const parsedLearning = whatYouWillLearn ?
      (typeof whatYouWillLearn === 'string' ? JSON.parse(whatYouWillLearn) : whatYouWillLearn) : [];

    const parsedRequirements = requirements ?
      (typeof requirements === 'string' ? JSON.parse(requirements) : requirements) : [];

    const parsedFormat = courseFormat ?
      (typeof courseFormat === 'string' ? JSON.parse(courseFormat) : courseFormat) :
      { theoryHours: 0, practicalHours: 0, onlineContent: true, physicalClasses: true };

    const parsedBatches = batches ?
      (typeof batches === 'string' ? JSON.parse(batches) : batches) : [];

    const course = await Course.create({
      title: title.trim(),
      description: description.trim(),
      category,
      price: parseFloat(price),
      discountPrice: discountPrice ? parseFloat(discountPrice) : null,
      duration: parseInt(duration),
      level: level || 'beginner',
      vendorId,
      imageUrl: thumbnail || null,
      whatYouWillLearn: parsedLearning,
      requirements: parsedRequirements,
      courseFormat: parsedFormat,
      instructorName: instructorName.trim(),
      instructorBio: instructorBio || '',
      certificateIncluded: certificateIncluded === 'true' || certificateIncluded === true,
      lessons: processedLessons,
      batches: parsedBatches,
      status: 'pending',
    });

    logger.info('Course created', { courseId: course._id, vendorId, title: course.title });

    res.status(201).json({
      success: true,
      message: 'Course created successfully and pending approval',
      data: course,
    });
  } catch (error: any) {
    logger.error('Create course error:', error);
    if (req.file) {
      deleteFile(`uploads/courses/${req.file.filename}`);
    }

    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((err: any) => err.message);
      res.status(400).json({ success: false, message: 'Validation failed', errors: messages });
      return;
    }

    res.status(500).json({
      success: false,
      message: 'Failed to create course',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// Get All Courses (Browse Page)
export const getAllCourses = async (req: Request, res: Response) => {
  try {
    const { category, level, priceMin, priceMax, search, page = 1, limit = 10 } = req.query;

    const filter: any = {};

    // Temporarily return all courses (remove status filter for debugging)
    // Uncomment this for production:
    // if (req.user?.role === 'client') {
    //   filter.status = { $in: ['approved', 'active'] };
    // }

    if (category) {
      filter.category = category;
    }

    if (level) {
      filter.level = level;
    }

    if (priceMin || priceMax) {
      filter.price = {};
      if (priceMin) filter.price.$gte = Number(priceMin);
      if (priceMax) filter.price.$lte = Number(priceMax);
    }

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const courses = await Course.find(filter)
      .populate('vendorId', 'name profileImage bio')
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit))
      .lean();

    const total = await Course.countDocuments(filter);

    res.json({
      success: true,
      courses,
      total: courses.length,
    });

    logger.info('Courses retrieved', { count: courses.length, userRole: req.user?.role });
  } catch (error: any) {
    logger.error('Error fetching courses', { error: error.message });
    res.status(500).json({ message: 'Failed to fetch courses' });
  }
};

// Get Single Course (Detail Page)
export const getCourseById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      res.status(400).json({ success: false, message: 'Invalid course ID format' });
      return;
    }

    const course = await Course.findById(id)
      .populate('vendorId', 'name email phone')
      .lean();

    if (!course) {
      res.status(404).json({ success: false, message: 'Course not found' });
      return;
    }

    res.status(200).json({ success: true, data: course });
  } catch (error: any) {
    logger.error('Get course by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch course',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// Get Vendor's Courses
export const getMyCourses = async (req: Request, res: Response): Promise<void> => {
  try {
    const vendorId = (req as any).user._id;

    const courses = await Course.find({ vendorId })
      .sort({ createdAt: -1 })
      .lean();

    logger.info('Vendor courses fetched', { vendorId, count: courses.length });

    res.status(200).json({
      success: true,
      count: courses.length,
      data: courses,
    });
  } catch (error: any) {
    logger.error('Get my courses error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch courses',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// Update Course
export const updateCourse = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const vendorId = (req as any).user._id;
    const updateData = { ...req.body };

    if (!isValidObjectId(id)) {
      if (req.file) deleteFile(`uploads/courses/${req.file.filename}`);
      res.status(400).json({ success: false, message: 'Invalid course ID format' });
      return;
    }

    const course = await Course.findById(id);

    if (!course) {
      if (req.file) deleteFile(`uploads/courses/${req.file.filename}`);
      res.status(404).json({ success: false, message: 'Course not found' });
      return;
    }

    if (course.vendorId.toString() !== vendorId.toString()) {
      if (req.file) deleteFile(`uploads/courses/${req.file.filename}`);
      res.status(403).json({ success: false, message: 'Not authorized' });
      return;
    }

    // Don't allow changing vendorId or _id
    delete updateData.vendorId;
    delete updateData._id;

    // Handle image upload
    if (req.file) {
      if (course.imageUrl) {
        deleteFile(course.imageUrl);
      }
      updateData.imageUrl = `/uploads/courses/${req.file.filename}`;
    }

    // Parse JSON fields
    ['whatYouWillLearn', 'requirements', 'courseFormat', 'lessons', 'batches'].forEach(field => {
      if (updateData[field] && typeof updateData[field] === 'string') {
        try {
          updateData[field] = JSON.parse(updateData[field]);
        } catch (e) {
          // Keep as is if parsing fails
        }
      }
    });

    const updatedCourse = await Course.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      message: 'Course updated successfully',
      data: updatedCourse,
    });
  } catch (error: any) {
    logger.error('Update course error:', error);
    if (req.file) deleteFile(`uploads/courses/${req.file.filename}`);

    res.status(500).json({
      success: false,
      message: 'Failed to update course',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// Delete Course
export const deleteCourse = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = (req as any).user._id;
    const userRole = (req as any).user.role;

    if (!isValidObjectId(id)) {
      res.status(400).json({ success: false, message: 'Invalid course ID' });
      return;
    }

    const course = await Course.findById(id);

    if (!course) {
      res.status(404).json({ success: false, message: 'Course not found' });
      return;
    }

    const isOwner = course.vendorId.toString() === userId.toString();
    const isAdmin = userRole === 'admin';

    if (!isOwner && !isAdmin) {
      res.status(403).json({ success: false, message: 'Not authorized' });
      return;
    }

    if (course.imageUrl) {
      deleteFile(course.imageUrl);
    }

    await Course.findByIdAndDelete(id);

    res.status(200).json({ success: true, message: 'Course deleted successfully' });
  } catch (error: any) {
    logger.error('Delete course error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete course',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// Add Lesson to Course
export const addLesson = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { title, description, duration, contentType, contentUrl, isPreview } = req.body;
    const vendorId = (req as any).user._id;

    if (!isValidObjectId(id)) {
      res.status(400).json({ success: false, message: 'Invalid course ID' });
      return;
    }

    const course = await Course.findById(id);

    if (!course) {
      res.status(404).json({ success: false, message: 'Course not found' });
      return;
    }

    if (course.vendorId.toString() !== vendorId.toString()) {
      res.status(403).json({ success: false, message: 'Not authorized' });
      return;
    }

    const newLesson = {
      title,
      description,
      duration: parseInt(duration),
      contentType,
      contentUrl: contentUrl || null,
      orderIndex: course.lessons.length + 1,
      isPreview: isPreview || false,
    };

    course.lessons.push(newLesson as any);
    await course.save();

    res.status(200).json({
      success: true,
      message: 'Lesson added successfully',
      data: course,
    });
  } catch (error: any) {
    logger.error('Add lesson error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add lesson',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// Add Batch to Course
export const addBatch = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { startDate, endDate, location, seatsTotal, schedule } = req.body;
    const vendorId = (req as any).user._id;

    if (!isValidObjectId(id)) {
      res.status(400).json({ success: false, message: 'Invalid course ID' });
      return;
    }

    const course = await Course.findById(id);

    if (!course) {
      res.status(404).json({ success: false, message: 'Course not found' });
      return;
    }

    if (course.vendorId.toString() !== vendorId.toString()) {
      res.status(403).json({ success: false, message: 'Not authorized' });
      return;
    }

    const newBatch = {
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      location,
      seatsTotal: parseInt(seatsTotal),
      seatsRemaining: parseInt(seatsTotal),
      schedule,
      status: 'upcoming',
    };

    course.batches.push(newBatch as any);
    await course.save();

    res.status(200).json({
      success: true,
      message: 'Batch added successfully',
      data: course,
    });
  } catch (error: any) {
    logger.error('Add batch error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add batch',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};