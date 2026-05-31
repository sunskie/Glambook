import express from 'express';
import { protect } from '../middleware/auth.middleware';
import { authorize } from '../middleware/role.middleware';
import { uploadCourseFiles, uploadLesson } from '../middleware/upload.middleware';
import {
  createCourse,
  getAllCourses,
  getCourseById,
  getMyCourses,
  updateCourse,
  deleteCourse,
  addLesson,
  addBatch,
} from '../controllers/Course.controller';

const router = express.Router();

const checkVendorApproval = (req: any, res: any, next: any) => {
  if (req.user.role === 'vendor' && !req.user.isApproved) {
    return res.status(403).json({
      message: 'Your vendor account is pending approval. Please wait for admin approval before creating courses.',
    });
  }
  next();
};

// Temp lesson file upload (used during course creation flow)
router.post(
  '/temp/lessons/upload',
  protect,
  authorize('vendor'),
  uploadLesson.single('file'),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }
      res.json({
        message: 'File uploaded successfully',
        fileUrl: `/uploads/lessons/${req.file.filename}`,
        fileSize: req.file.size,
        fileType: req.file.mimetype,
        fileName: req.file.originalname,
      });
    } catch (error: any) {
      res.status(500).json({ message: 'Failed to upload file' });
    }
  }
);

// Vendor routes (must come before /:id to avoid route conflicts)
router.get('/vendor/my-courses', protect, authorize('vendor'), getMyCourses);

// Public/client routes
router.get('/', protect, getAllCourses);
router.get('/:id', protect, getCourseById);

// Course CRUD
router.post(
  '/',
  protect,
  authorize('vendor'),
  checkVendorApproval,
  uploadCourseFiles, // ← handles thumbnail, lessonVideo, lessonPdf, pdf, image
  createCourse
);

router.put(
  '/:id',
  protect,
  authorize('vendor'),
  uploadCourseFiles,
  updateCourse
);

router.delete('/:id', protect, authorize('vendor', 'admin'), deleteCourse);
router.post('/:id/lessons', protect, authorize('vendor'), addLesson);
router.post('/:id/batches', protect, authorize('vendor'), addBatch);

// Per-course lesson file upload
router.post(
  '/:id/lessons/upload',
  protect,
  authorize('vendor'),
  uploadLesson.single('file'),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }
      res.json({
        message: 'File uploaded successfully',
        fileUrl: `/uploads/lessons/${req.file.filename}`,
        fileSize: req.file.size,
        fileType: req.file.mimetype,
        fileName: req.file.originalname,
      });
    } catch (error: any) {
      res.status(500).json({ message: 'Failed to upload file' });
    }
  }
);

export default router;