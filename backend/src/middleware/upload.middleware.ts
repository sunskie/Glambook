// backend/src/middleware/upload.middleware.ts
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { Request, Response, NextFunction } from 'express';

// Ensure upload directories exist
const uploadDirs = {
  services: 'uploads/services',
  courses: 'uploads/courses',
  lessons: 'uploads/lessons'
};

Object.values(uploadDirs).forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Configure storage for SERVICES
const serviceStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDirs.services);
  },
  filename: (req, file, cb) => {
    const uniqueId = crypto.randomBytes(16).toString('hex');
    const timestamp = Date.now();
    const ext = path.extname(file.originalname);
    const filename = `service-${timestamp}-${uniqueId}${ext}`;
    cb(null, filename);
  },
});

// Configure storage for COURSES
const courseStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDirs.courses);
  },
  filename: (req, file, cb) => {
    const uniqueId = crypto.randomBytes(16).toString('hex');
    const timestamp = Date.now();
    const ext = path.extname(file.originalname);
    const filename = `course-${timestamp}-${uniqueId}${ext}`;
    cb(null, filename);
  },
});

// Configure storage for LESSONS (videos and PDFs)
const lessonStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDirs.lessons);
  },
  filename: (req, file, cb) => {
    const uniqueId = crypto.randomBytes(16).toString('hex');
    const timestamp = Date.now();
    const ext = path.extname(file.originalname);
    const filename = `lesson-${timestamp}-${uniqueId}${ext}`;
    cb(null, filename);
  },
});

// File filter for IMAGES (services and courses)
const imageFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const allowedExtensions = /jpeg|jpg|png|gif|webp/;
  const extname = allowedExtensions.test(
    path.extname(file.originalname).toLowerCase()
  );

  const allowedMimeTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
  ];
  const mimetype = allowedMimeTypes.includes(file.mimetype);

  if (mimetype && extname) {
    console.log('Image upload accepted:', file.originalname);
    return cb(null, true);
  } else {
    console.warn('Image upload rejected:', file.originalname);
    cb(
      new Error(
        'Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed.'
      )
    );
  }
};

// File filter for LESSONS (videos and PDFs)
const lessonFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const allowedExtensions = /mp4|mov|avi|mkv|webm|pdf/;
  const extname = allowedExtensions.test(
    path.extname(file.originalname).toLowerCase()
  );

  const allowedMimeTypes = [
    'video/mp4',
    'video/quicktime',
    'video/x-msvideo',
    'video/x-matroska',
    'video/webm',
    'application/pdf',
  ];
  const mimetype = allowedMimeTypes.includes(file.mimetype);

  if (mimetype && extname) {
    console.log('Lesson file upload accepted:', file.originalname);
    return cb(null, true);
  } else {
    console.warn('Lesson file upload rejected:', file.originalname);
    cb(
      new Error(
        'Invalid file type. Only video files (MP4, MOV, AVI, MKV, WebM) and PDF files are allowed.'
      )
    );
  }
};

// Configure multer for SERVICES
export const upload = multer({
  storage: serviceStorage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: imageFilter,
});

// Configure multer for COURSES
export const uploadCourse = multer({
  storage: courseStorage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: imageFilter,
});

// Configure multer for LESSONS (videos and PDFs)
export const uploadLesson = multer({
  storage: lessonStorage,
  limits: {
    fileSize: 200 * 1024 * 1024, // 200MB for videos
  },
  fileFilter: lessonFilter,
});

// Error handler for multer
export const handleMulterError = (
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (error instanceof multer.MulterError) {
    console.error('Multer error:', error);

    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File is too large. Maximum size is 200MB for videos and 5MB for images.',
      });
    }

    return res.status(400).json({
      success: false,
      message: `Upload error: ${error.message}`,
    });
  } else if (error) {
    console.error('File upload error:', error);
    return res.status(400).json({
      success: false,
      message: error.message || 'File upload failed',
    });
  }

  next();
};

// Delete file utility
export const deleteFile = (filepath: string): void => {
  try {
    const fullPath = path.join(process.cwd(), filepath);
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
      console.log('File deleted successfully:', filepath);
    }
  } catch (error) {
    console.error('Error deleting file:', error);
  }
};