import express from 'express';
import { protect } from '../middleware/auth.middleware';
import { authorize } from '../middleware/role.middleware';
import { uploadCourse, uploadLesson } from '../middleware/upload.middleware';
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

// Check if vendor is approved (add this middleware)
const checkVendorApproval = (req: any, res: any, next: any) => {
  if (req.user.role === 'vendor' && !req.user.isApproved) {
    return res.status(403).json({ 
      message: 'Your vendor account is pending approval. Please wait for admin approval before creating courses.' 
    });
  }
  next();
};
router.post('/:id/lessons/upload', protect, authorize('vendor'), uploadLesson.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const fileUrl = `/uploads/lessons/${req.file.filename}`;
    
    res.json({
      message: 'File uploaded successfully',
      fileUrl,
      fileType: req.file.mimetype,
      fileName: req.file.originalname
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to upload file' });
  }
});

// Public routes
router.get('/', protect, getAllCourses);
router.get('/:id', protect, getCourseById);

// Vendor routes
router.get('/vendor/my-courses', protect, authorize('vendor'), getMyCourses); // ← FIRST
router.get('/', protect, getAllCourses);
router.get('/:id', protect, getCourseById); // ← AFTER named routes
router.post('/', protect, authorize('vendor'), checkVendorApproval, uploadCourse.single('image'), createCourse);
router.put('/:id', protect, authorize('vendor'), uploadCourse.single('image'), updateCourse);
router.delete('/:id', protect, authorize('vendor', 'admin'), deleteCourse);
router.post('/:id/lessons', protect, authorize('vendor'), addLesson);
router.post('/:id/batches', protect, authorize('vendor'), addBatch);

export default router;