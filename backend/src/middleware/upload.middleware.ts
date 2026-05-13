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

// Configure storage for COURSES (with subdirectories for different file types)
const courseStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    let uploadPath = 'uploads/courses/';
    if (file.fieldname === 'video' || file.fieldname === 'lessonVideo' || file.mimetype.startsWith('video/')) {
      uploadPath = 'uploads/courses/videos/';
    } else if (file.fieldname === 'pdf' || file.fieldname === 'lessonPdf' || file.mimetype === 'application/pdf') {
      uploadPath = 'uploads/courses/pdfs/';
    } else {
      uploadPath = 'uploads/courses/thumbnails/';
    }
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
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

// File filter for COURSES (accept all - validate in controller if needed)
const courseFileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const videoTypes = /mp4|mov|avi|mkv|webm|wmv|flv|m4v/i;
  const imageTypes = /jpeg|jpg|png|gif|webp/i;
  const pdfType = /pdf/i;
  const ext = path.extname(file.originalname).toLowerCase().replace('.', '');

  if (
    file.mimetype.startsWith('video/') ||
    file.mimetype.startsWith('image/') ||
    file.mimetype === 'application/pdf' ||
    videoTypes.test(ext) ||
    imageTypes.test(ext) ||
    pdfType.test(ext)
  ) {
    cb(null, true);
  } else {
    cb(null, true); // Accept all files for now — validate in controller if needed
  }
};

// Configure multer for SERVICES
export const upload = multer({
  storage: serviceStorage,
  limits: {
    fileSize: 500 * 1024 * 1024, // 500MB
  },
  fileFilter: imageFilter,
});

// Configure multer for COURSES (multiple files)
export const uploadCourseFiles = multer({
  storage: courseStorage,
  fileFilter: courseFileFilter,
  limits: {
    fileSize: 500 * 1024 * 1024, // 500MB per file
    files: 20, // up to 20 files (lessons + thumbnail + PDFs)
  },
}).fields([
  { name: 'thumbnail', maxCount: 1 },
  { name: 'video', maxCount: 1 },
  { name: 'lessonVideo', maxCount: 10 },
  { name: 'lessonPdf', maxCount: 10 },
  { name: 'pdf', maxCount: 10 },
  { name: 'image', maxCount: 5 },
]);

// Keep old uploadCourse for backward compatibility (single file)
export const uploadCourse = multer({
  storage: courseStorage,
  limits: {
    fileSize: 500 * 1024 * 1024, // 500MB
  },
  fileFilter: imageFilter,
});

// Configure multer for LESSONS (videos and PDFs)
export const uploadLesson = multer({
  storage: lessonStorage,
  limits: {
    fileSize: 500 * 1024 * 1024, // 500MB for videos
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
        message: 'File is too large. Maximum size is 500MB for videos, 10MB for PDFs.',
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