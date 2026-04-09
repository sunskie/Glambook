// Frontend/src/App.tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Toaster } from 'react-hot-toast';
import BreadcrumbPageWrapper from './components/common/BreadcrumbPageWrapper';

// Auth Pages
import LandingPage from './pages/auth/LandingPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';

//Admin Pages
import AdminLayout from './Layouts/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import UserManagement from './pages/admin/UserManagement';
import VendorManagement from './pages/admin/VendorManagement';
import ServiceManagement from './pages/admin/ServiceManagement';
import CourseManagement from './pages/admin/CourseManagement';
import BookingManagement from './pages/admin/BookingManagement';
import EnrollmentManagement from './pages/admin/EnrollmentManagement';

// Vendor Pages
import VendorDashboard from './pages/Vendor/VendorDashboard';
import CreateService from './pages/Vendor/CreateService';
import EditService from './pages/Vendor/EditService';
import VendorBookings from './pages/Vendor/VendorBookings';
import VendorCourseDashboard from './pages/Vendor/VendorCourseDashboard';
import CreateCourse from './pages/Vendor/CreateCourse';
import EditCourse from './pages/Vendor/EditCourse';
import CourseStudents from './pages/Vendor/CourseStudents';
import AttendanceTracking from './pages/Vendor/AttendenceTracking';

// Client Pages
import ClientDashboard from './pages/Client/ClientDashboard';
import BrowsePage from './pages/Client/BrowsePage';
import BookingPage from './pages/Client/BookingPage';
import ClientBookings from './pages/Client/ClientBookings';
import CourseBrowse from './pages/Client/CourseBrowse';
import CourseDetail from './pages/Client/CourseDetail';
import CourseEnrollment from './pages/Client/CourseEnrollment';
import EnrollmentSuccess from './pages/Client/EnrollmentSuccess';
import MyCourses from './pages/Client/MyCourses';
import LearningDashboard from './pages/Client/LearningDashboard';

function App() {
  return (
    <BrowserRouter>  {/* ✅ BrowserRouter FIRST */}
      <AuthProvider>  {/* ✅ AuthProvider INSIDE BrowserRouter */}
        <Toaster position="top-right" />
        <Routes>
          {/* Landing Page Routes */}
           <Route path="/" element={<LandingPage />} />
          {/* Auth Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Admin Routes */}
          <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="users" element={<UserManagement />} />
          <Route path="vendors" element={<VendorManagement />} />
          <Route path="services" element={<ServiceManagement />} />
          <Route path="courses" element={<CourseManagement />} />
          <Route path="bookings" element={<BookingManagement />} />
          <Route path="enrollments" element={<EnrollmentManagement />} />
          </Route>

          {/* Vendor Routes */}
          <Route path="/vendor/dashboard" element={<VendorDashboard />} />
          <Route path="/vendor/create-service" element={<CreateService />} />
          <Route path="/vendor/edit-service/:id" element={<EditService />} />
          <Route path="/vendor/bookings" element={<VendorBookings />} />
          <Route path="/vendor/courses" element={<BreadcrumbPageWrapper><VendorCourseDashboard /></BreadcrumbPageWrapper>} />
          <Route path="/vendor/courses/create" element={<CreateCourse />} />
          <Route path="/vendor/courses/:id/edit" element={<BreadcrumbPageWrapper><EditCourse /></BreadcrumbPageWrapper>} />
          <Route path="/vendor/courses/:id/students" element={<BreadcrumbPageWrapper><CourseStudents /></BreadcrumbPageWrapper>} />
          <Route path="/vendor/courses/:id/attendance" element={<BreadcrumbPageWrapper><AttendanceTracking /></BreadcrumbPageWrapper>} />

          {/* Client Routes */}
          <Route path="/client/dashboard" element={<ClientDashboard />} />
          <Route path="/client/services" element={<BreadcrumbPageWrapper><BrowsePage /></BreadcrumbPageWrapper>} />
          <Route path="/client/book/:serviceId" element={<BookingPage />} />
          <Route path="/client/bookings" element={<BreadcrumbPageWrapper><ClientBookings /></BreadcrumbPageWrapper>} />
          <Route path="/client/courses" element={<BreadcrumbPageWrapper><CourseBrowse /></BreadcrumbPageWrapper>} />
          <Route path="/client/courses/:id" element={<BreadcrumbPageWrapper><CourseDetail /></BreadcrumbPageWrapper>} />
          <Route path="/client/enroll/:id" element={<BreadcrumbPageWrapper><CourseEnrollment /></BreadcrumbPageWrapper>} />
          <Route path="/client/enrollment-success/:id" element={<EnrollmentSuccess />} />
          <Route path="/client/my-courses" element={<BreadcrumbPageWrapper><MyCourses /></BreadcrumbPageWrapper>} />
          <Route path="/client/learning/:id" element={<BreadcrumbPageWrapper><LearningDashboard /></BreadcrumbPageWrapper>} />

          {/* Default Route */}
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
