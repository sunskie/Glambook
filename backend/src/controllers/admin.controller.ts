// backend/src/controllers/admin.controller.ts
import { Request, Response } from 'express';
import User from '../models/User.model';
import Service from '../models/service.model';
import Booking from '../models/Booking.model';
import Course from '../models/Course.model';
import Enrollment from '../models/Enrollment.model';
import { logger } from '../utils/logger';

// Dashboard Stats
export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    const [
      totalUsers,
      totalVendors,
      totalClients,
      totalServices,
      totalCourses,
      totalBookings,
      totalEnrollments,
      pendingVendors,
      pendingCourses,
      activeServices,
      completedBookings
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'vendor' }),
      User.countDocuments({ role: 'client' }),
      Service.countDocuments(),
      Course.countDocuments(),
      Booking.countDocuments(),
      Enrollment.countDocuments(),
      User.countDocuments({ role: 'vendor', isApproved: false }),
      Course.countDocuments({ status: 'pending' }),
      Service.countDocuments({ status: 'active' }),
      Booking.countDocuments({ status: 'completed' })
    ]);

    // Recent activity (last 10 bookings and enrollments)
    const recentBookings = await Booking.find()
      .populate('clientId', 'name email')
      .populate('vendorId', 'name')
      .populate('serviceId', 'title')
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    const recentEnrollments = await Enrollment.find()
      .populate('clientId', 'name email')
      .populate('courseId', 'title')
      .populate('vendorId', 'name')
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    // Monthly stats (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyBookings = await Booking.aggregate([
      {
        $match: {
          createdAt: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            month: { $month: '$createdAt' },
            year: { $year: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ]);

    const monthlyEnrollments = await Enrollment.aggregate([
      {
        $match: {
          createdAt: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            month: { $month: '$createdAt' },
            year: { $year: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ]);

    res.json({
      stats: {
        totalUsers,
        totalVendors,
        totalClients,
        totalServices,
        totalCourses,
        totalBookings,
        totalEnrollments,
        pendingVendors,
        pendingCourses,
        activeServices,
        completedBookings
      },
      recentActivity: {
        bookings: recentBookings,
        enrollments: recentEnrollments
      },
      charts: {
        monthlyBookings,
        monthlyEnrollments
      }
    });

    logger.info('Dashboard stats retrieved', { adminId: req.user?.id });
  } catch (error: any) {
    logger.error('Error fetching dashboard stats', { error: error.message });
    res.status(500).json({ message: 'Failed to fetch dashboard stats' });
  }
};

// User Management
export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const { search, role, status, page = 1, limit = 20 } = req.query;

    const filter: any = {};

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    if (role) {
      filter.role = role;
    }

    if (status) {
      filter.isActive = status === 'active';
    }

    const users = await User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit))
      .lean();

    const total = await User.countDocuments(filter);

    res.json({
      users,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / Number(limit))
      }
    });

    logger.info('Users list retrieved', { adminId: req.user?.id, count: users.length });
  } catch (error: any) {
    logger.error('Error fetching users', { error: error.message });
    res.status(500).json({ message: 'Failed to fetch users' });
  }
};

export const getUserById = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.params.id).select('-password').lean();

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get additional data based on role
    let additionalData: any = {};

    if (user.role === 'vendor') {
      const services = await Service.countDocuments({ vendorId: user._id });
      const courses = await Course.countDocuments({ vendorId: user._id });
      const bookings = await Booking.countDocuments({ vendorId: user._id });
      
      additionalData = { services, courses, bookings };
    } else if (user.role === 'client') {
      const bookings = await Booking.countDocuments({ clientId: user._id });
      const enrollments = await Enrollment.countDocuments({ clientId: user._id });
      
      additionalData = { bookings, enrollments };
    }

    res.json({ user, additionalData });

    logger.info('User details retrieved', { adminId: req.user?.id, userId: req.params.id });
  } catch (error: any) {
    logger.error('Error fetching user', { error: error.message });
    res.status(500).json({ message: 'Failed to fetch user' });
  }
};

export const updateUserStatus = async (req: Request, res: Response) => {
  try {
    const { isActive } = req.body;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'User status updated', user });

    logger.info('User status updated', { 
      adminId: req.user?.id, 
      userId: req.params.id, 
      newStatus: isActive 
    });
  } catch (error: any) {
    logger.error('Error updating user status', { error: error.message });
    res.status(500).json({ message: 'Failed to update user status' });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Delete related data
    if (user.role === 'vendor') {
      await Service.deleteMany({ vendorId: user._id });
      await Course.deleteMany({ vendorId: user._id });
    } else if (user.role === 'client') {
      await Booking.deleteMany({ clientId: user._id });
      await Enrollment.deleteMany({ clientId: user._id });
    }

    res.json({ message: 'User and related data deleted successfully' });

    logger.info('User deleted', { adminId: req.user?.id, userId: req.params.id });
  } catch (error: any) {
    logger.error('Error deleting user', { error: error.message });
    res.status(500).json({ message: 'Failed to delete user' });
  }
};

// Vendor Management
export const getAllVendors = async (req: Request, res: Response) => {
  try {
    const { search, status, approved, page = 1, limit = 20 } = req.query;

    const filter: any = { role: 'vendor' };

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    if (status) {
      filter.isActive = status === 'active';
    }

    if (approved !== undefined && approved !== '') {
      filter.isApproved = approved === 'true';
    }

    const vendors = await User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit))
      .lean();

    // Get service and course counts for each vendor
    const vendorsWithStats = await Promise.all(
      vendors.map(async (vendor) => {
        const services = await Service.countDocuments({ vendorId: vendor._id });
        const courses = await Course.countDocuments({ vendorId: vendor._id });
        return { ...vendor, servicesCount: services, coursesCount: courses };
      })
    );

    const total = await User.countDocuments(filter);

    res.json({
      vendors: vendorsWithStats,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / Number(limit))
      }
    });

    logger.info('Vendors list retrieved', { adminId: req.user?.id });
  } catch (error: any) {
    logger.error('Error fetching vendors', { error: error.message });
    res.status(500).json({ message: 'Failed to fetch vendors' });
  }
};

export const approveVendor = async (req: Request, res: Response) => {
  try {
    const vendor = await User.findOneAndUpdate(
      { _id: req.params.id, role: 'vendor' },
      { isApproved: true },
      { new: true }
    ).select('-password');

    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found' });
    }

    res.json({ message: 'Vendor approved successfully', vendor });

    logger.info('Vendor approved', { adminId: req.user?.id, vendorId: req.params.id });
  } catch (error: any) {
    logger.error('Error approving vendor', { error: error.message });
    res.status(500).json({ message: 'Failed to approve vendor' });
  }
};

export const rejectVendor = async (req: Request, res: Response) => {
  try {
    const vendor = await User.findOneAndUpdate(
      { _id: req.params.id, role: 'vendor' },
      { isApproved: false },
      { new: true }
    ).select('-password');

    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found' });
    }

    res.json({ message: 'Vendor rejected', vendor });

    logger.info('Vendor rejected', { adminId: req.user?.id, vendorId: req.params.id });
  } catch (error: any) {
    logger.error('Error rejecting vendor', { error: error.message });
    res.status(500).json({ message: 'Failed to reject vendor' });
  }
};

// Service Management
export const getAllServices = async (req: Request, res: Response) => {
  try {
    const { search, vendor, category, status, page = 1, limit = 20 } = req.query;

    const filter: any = {};

    if (search) {
      filter.title = { $regex: search, $options: 'i' };
    }

    if (vendor) {
      filter.vendorId = vendor;
    }

    if (category) {
      filter.category = category;
    }

    if (status) {
      filter.status = status;
    }

    const services = await Service.find(filter)
      .populate('vendorId', 'name email')
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit))
      .lean();

    const total = await Service.countDocuments(filter);

    res.json({
      services,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / Number(limit))
      }
    });

    logger.info('Services list retrieved', { adminId: req.user?.id });
  } catch (error: any) {
    logger.error('Error fetching services', { error: error.message });
    res.status(500).json({ message: 'Failed to fetch services' });
  }
};

export const updateServiceStatus = async (req: Request, res: Response) => {
  try {
    const { status } = req.body;

    if (!['active', 'inactive', 'pending'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const service = await Service.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate('vendorId', 'name email');

    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }

    res.json({ message: 'Service status updated', service });

    logger.info('Service status updated', { 
      adminId: req.user?.id, 
      serviceId: req.params.id, 
      newStatus: status 
    });
  } catch (error: any) {
    logger.error('Error updating service status', { error: error.message });
    res.status(500).json({ message: 'Failed to update service status' });
  }
};

export const deleteService = async (req: Request, res: Response) => {
  try {
    const service = await Service.findByIdAndDelete(req.params.id);

    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }

    // Delete related bookings
    await Booking.deleteMany({ serviceId: service._id });

    res.json({ message: 'Service and related bookings deleted' });

    logger.info('Service deleted', { adminId: req.user?.id, serviceId: req.params.id });
  } catch (error: any) {
    logger.error('Error deleting service', { error: error.message });
    res.status(500).json({ message: 'Failed to delete service' });
  }
};

// Booking Management
export const getAllBookings = async (req: Request, res: Response) => {
  try {
    const { search, status, dateFrom, dateTo, page = 1, limit = 20 } = req.query;

    const filter: any = {};

    if (status) {
      filter.status = status;
    }

    if (dateFrom || dateTo) {
      filter.bookingDate = {};
      if (dateFrom) filter.bookingDate.$gte = new Date(dateFrom as string);
      if (dateTo) filter.bookingDate.$lte = new Date(dateTo as string);
    }

    const bookings = await Booking.find(filter)
      .populate('clientId', 'name email phone')
      .populate('vendorId', 'name email')
      .populate('serviceId', 'title category price')
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit))
      .lean();

    const total = await Booking.countDocuments(filter);

    res.json({
      bookings,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / Number(limit))
      }
    });

    logger.info('Bookings list retrieved', { adminId: req.user?.id });
  } catch (error: any) {
    logger.error('Error fetching bookings', { error: error.message });
    res.status(500).json({ message: 'Failed to fetch bookings' });
  }
};

// Course Management
export const getAllCourses = async (req: Request, res: Response) => {
  try {
    const { search, vendor, category, status, page = 1, limit = 20 } = req.query;

    const filter: any = {};

    if (search) {
      filter.title = { $regex: search, $options: 'i' };
    }

    if (vendor) {
      filter.vendorId = vendor;
    }

    if (category) {
      filter.category = category;
    }

    if (status) {
      filter.status = status;
    }

    const courses = await Course.find(filter)
      .populate('vendorId', 'name email')
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit))
      .lean();

    const total = await Course.countDocuments(filter);

    res.json({
      courses,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / Number(limit))
      }
    });

    logger.info('Courses list retrieved', { adminId: req.user?.id });
  } catch (error: any) {
    logger.error('Error fetching courses', { error: error.message });
    res.status(500).json({ message: 'Failed to fetch courses' });
  }
};

export const approveCourse = async (req: Request, res: Response) => {
  try {
    const course = await Course.findByIdAndUpdate(
      req.params.id,
      { status: 'approved' },
      { new: true }
    ).populate('vendorId', 'name email');

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    res.json({ message: 'Course approved successfully', course });

    logger.info('Course approved', { adminId: req.user?.id, courseId: req.params.id });
  } catch (error: any) {
    logger.error('Error approving course', { error: error.message });
    res.status(500).json({ message: 'Failed to approve course' });
  }
};

export const rejectCourse = async (req: Request, res: Response) => {
  try {
    const course = await Course.findByIdAndUpdate(
      req.params.id,
      { status: 'rejected' },
      { new: true }
    ).populate('vendorId', 'name email');

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    res.json({ message: 'Course rejected', course });

    logger.info('Course rejected', { adminId: req.user?.id, courseId: req.params.id });
  } catch (error: any) {
    logger.error('Error rejecting course', { error: error.message });
    res.status(500).json({ message: 'Failed to reject course' });
  }
};

export const deleteCourse = async (req: Request, res: Response) => {
  try {
    const course = await Course.findByIdAndDelete(req.params.id);

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Delete related enrollments
    await Enrollment.deleteMany({ courseId: course._id });

    res.json({ message: 'Course and related enrollments deleted' });

    logger.info('Course deleted', { adminId: req.user?.id, courseId: req.params.id });
  } catch (error: any) {
    logger.error('Error deleting course', { error: error.message });
    res.status(500).json({ message: 'Failed to delete course' });
  }
};

// Enrollment Management
export const getAllEnrollments = async (req: Request, res: Response) => {
  try {
    const { search, status, course, page = 1, limit = 20 } = req.query;

    const filter: any = {};

    if (status) {
      filter.status = status;
    }

    if (course) {
      filter.courseId = course;
    }

    const enrollments = await Enrollment.find(filter)
      .populate('clientId', 'name email phone')
      .populate('courseId', 'title category price')
      .populate('vendorId', 'name email')
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit))
      .lean();

    const total = await Enrollment.countDocuments(filter);

    res.json({
      enrollments,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / Number(limit))
      }
    });

    logger.info('Enrollments list retrieved', { adminId: req.user?.id });
  } catch (error: any) {
    logger.error('Error fetching enrollments', { error: error.message });
    res.status(500).json({ message: 'Failed to fetch enrollments' });
  }
};