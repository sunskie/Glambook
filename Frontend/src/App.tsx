// Frontend/src/App.tsx
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ChatProvider } from './context/ChatContext';
import { Toaster } from 'react-hot-toast';
import BreadcrumbPageWrapper from './components/common/BreadcrumbPageWrapper';

// Auth Pages
import LandingPage from './pages/auth/LandingPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';

//Admin Pages
import AdminLayout from './Layouts/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import UserManagement from './pages/admin/UserManagement';
import VendorManagement from './pages/admin/VendorManagement';
import ServiceManagement from './pages/admin/ServiceManagement';
import CourseManagement from './pages/admin/CourseManagement';
import BookingManagement from './pages/admin/BookingManagement';
import EnrollmentManagement from './pages/admin/EnrollmentManagement';
import DisputeManagement from './pages/admin/DisputeManagement';
import AdminMessages from './pages/admin/AdminMessages';
import AdminProfilePage from './pages/admin/AdminProfilePage';

// Vendor Pages
import VendorDashboard from './pages/Vendor/VendorDashboard';
import VendorServices from './pages/Vendor/VendorServices';
import CreateService from './pages/Vendor/CreateService';
import EditService from './pages/Vendor/EditService';
import VendorBookings from './pages/Vendor/VendorBookings';
import VendorCourseDashboard from './pages/Vendor/VendorCourseDashboard';
import CreateCourse from './pages/Vendor/CreateCourse';
import EditCourse from './pages/Vendor/EditCourse';
import VendorAttendance from './pages/Vendor/VendorAttendance';
import AvailabilityPage from './pages/Vendor/AvailabilityPage';
import VendorDisputesPage from './pages/Vendor/VendorDisputesPage';
import QuizApprovals from './pages/Vendor/QuizApprovals';

// Client Pages
import ClientDashboard from './pages/Client/ClientDashboard';
import BrowseLandingPage from './pages/Client/BrowseLandingPage';
import BrowsePage from './pages/Client/BrowsePage';
import BookingPage from './pages/Client/BookingPage';
import ClientBookings from './pages/Client/ClientBookings';
import CourseBrowse from './pages/Client/CourseBrowse';
import CourseCompare from './pages/Client/CourseCompare';
import CourseDetail from './pages/Client/CourseDetail';
import CourseEnrollment from './pages/Client/CourseEnrollment';
import EnrollmentSuccess from './pages/Client/EnrollmentSuccess';
import MyCourses from './pages/Client/MyCourses';
import LearningDashboard from './pages/Client/LearningDashboard';
import MessagesPage from './pages/Client/MessagesPage';
import ProfilePage from './pages/Client/ProfilePage';
import ComparePage from './pages/Client/ComparePage';
import PaymentSuccess from './pages/Client/PaymentSuccess';
import PaymentFailure from './pages/Client/PaymentFailure';
import PaymentPage from './pages/Client/PaymentPage';
import CoursePaymentSuccess from './pages/payment/CoursePaymentSuccess';
import VendorMessagesPage from './pages/Vendor/VendorMessagesPage';
import VendorProfilePage from './pages/Vendor/VendorProfilePage';
import FloatingMessagesPill from './components/common/FloatingMessagesPill';
import ChatButton from './components/chat/ChatButton';
import QuizPage from './pages/Client/QuizPage';
import CertificatePage from './pages/Client/CertificatePage';
import CreateQuizPage from './pages/Vendor/CreateQuizPage';
import CoursePlayer from './pages/Client/CoursePlayer';
import CourseQuiz from './pages/Client/CourseQuiz';
import CourseCertificate from './pages/Client/CourseCertificate';
import OnlineCertificate from './pages/Client/OnlineCertificate';
import VerifyCertificate from './pages/VerifyCertificate';
import ErrorBoundary from './components/common/ErrorBoundary';
import TermsAndConditions from './pages/TermsAndConditions';
import ClientSettings from './pages/Client/Settings';
import VendorSettings from './pages/Vendor/Settings';
import AdminSettings from './pages/admin/Settings';

function AppContent() {
  const location = useLocation();

  const hideFloatingMessages =
    location.pathname.includes('/certificate') ||
    location.pathname.startsWith('/verify/');

  return (
    <>
      <Routes>
          {/* Landing Page Routes */}
           <Route path="/" element={<LandingPage />} />
          {/* Auth Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password/:token" element={<ResetPasswordPage />} />

          {/* Public Routes */}
          <Route path="/terms-and-conditions" element={<TermsAndConditions />} />

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
          <Route path="disputes" element={<DisputeManagement />} />
          <Route path="messages" element={<AdminMessages />} />
          <Route path="profile" element={<AdminProfilePage />} />
          <Route path="settings" element={<AdminSettings />} />
          </Route>

          <Route path="/vendor/dashboard" element={<VendorDashboard />} />
          <Route path="/vendor/services" element={<VendorServices />} />
          <Route path="/vendor/create-service" element={<CreateService />} />
          <Route path="/vendor/edit-service/:id" element={<EditService />} />
          <Route path="/vendor/bookings" element={<VendorBookings />} />
          <Route path="/vendor/disputes" element={<VendorDisputesPage />} />
          <Route path="/vendor/profile" element={<VendorProfilePage />} />
          <Route path="/vendor/courses" element={<BreadcrumbPageWrapper><VendorCourseDashboard /></BreadcrumbPageWrapper>} />
          <Route path="/vendor/courses/create" element={<CreateCourse />} />
          <Route path="/vendor/courses/:id/edit" element={<BreadcrumbPageWrapper><EditCourse /></BreadcrumbPageWrapper>} />
          <Route path="/vendor/courses/:id/attendance" element={<BreadcrumbPageWrapper><VendorAttendance /></BreadcrumbPageWrapper>} />
          <Route path="/vendor/quiz/create" element={<CreateQuizPage />} />
          <Route path="/vendor/availability" element={<AvailabilityPage />} />
          <Route path="/vendor/quiz-approvals" element={<QuizApprovals />} />
          <Route path="/vendor/settings" element={<VendorSettings />} />

          {/* Client Routes */}
          <Route path="/client/dashboard" element={<ClientDashboard />} />
          <Route path="/client/browse" element={<BrowseLandingPage />} />
          <Route path="/client/browse/services" element={<BrowsePage />} />
          <Route path="/client/browse/courses" element={<CourseBrowse />} />
          <Route path="/client/courses/compare" element={<CourseCompare />} />
          <Route path="/client/services" element={<Navigate to="/client/browse/services" replace />} />
          <Route path="/client/book/:serviceId" element={<BookingPage />} />
          <Route path="/client/bookings" element={<BreadcrumbPageWrapper><ClientBookings /></BreadcrumbPageWrapper>} />
          <Route path="/client/courses/:id" element={<BreadcrumbPageWrapper><CourseDetail /></BreadcrumbPageWrapper>} />
          <Route path="/client/enroll/:id" element={<BreadcrumbPageWrapper><CourseEnrollment /></BreadcrumbPageWrapper>} />
          <Route path="/client/enrollment-success/:id" element={<EnrollmentSuccess />} />
          <Route path="/client/my-courses" element={<BreadcrumbPageWrapper><MyCourses /></BreadcrumbPageWrapper>} />
          <Route path="/client/learning/:id" element={<Navigate to="/client/my-courses" replace />} />
          <Route path="/client/courses/:courseId/learn" element={
            <ErrorBoundary fallback={
              <div style={{ padding: '2rem', textAlign: 'center', color: 'white', fontFamily: 'Montserrat, sans-serif' }}>
                <h2 style={{ fontFamily: 'Syne, sans-serif', marginBottom: '16px' }}>Something went wrong loading this course.</h2>
                <button 
                  onClick={() => window.location.href = '/client/my-courses'}
                  style={{ padding: '12px 24px', backgroundColor: '#E91E63', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 700, cursor: 'pointer' }}
                >
                  Back to My Courses
                </button>
              </div>
            }>
              <CoursePlayer />
            </ErrorBoundary>
          } />
          <Route path="/client/courses/:courseId/quiz" element={<CourseQuiz />} />
          <Route path="/client/courses/:courseId/certificate" element={<CourseCertificate />} />
          <Route path="/client/courses/:courseId/online-certificate" element={<OnlineCertificate />} />
          <Route path="/verify/:certId" element={<VerifyCertificate />} />
          <Route path="/client/quiz/:enrollmentId" element={<QuizPage />} />
          <Route path="/client/profile" element={<ProfilePage />} />
          <Route path="/client/compare" element={<ComparePage />} />
          <Route path="/client/settings" element={<ClientSettings />} />

          {/* Client Payment Routes */}
          <Route path="/client/payment" element={<PaymentPage />} />
          <Route path="/client/payment/success" element={<PaymentSuccess />} />
          <Route path="/client/payment/failure" element={<PaymentFailure />} />

          {/* Certificate — PUBLIC, no auth */}
          <Route path="/certificate/:certificateId" element={<CertificatePage />} />

          {/* Payment Routes — PUBLIC, no auth (eSewa redirects here) */}
          <Route path="/payment/success" element={<PaymentSuccess />} />
          <Route path="/payment/failure" element={<PaymentFailure />} />
          <Route path="/payment/course-success" element={<CoursePaymentSuccess />} />
          <Route path="/payment/course-failure" element={<PaymentFailure />} />

          {/* Messages Routes */}
          <Route path="/client/messages" element={<MessagesPage />} />
          <Route path="/vendor/messages" element={<VendorMessagesPage />} />

          {/* Default Route */}
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
        {!hideFloatingMessages && <FloatingMessagesPill />}
        <ChatButton id="global-chat-button" />
    </>
  );
}

function App() {
  return (
    <BrowserRouter>  {/* ✅ BrowserRouter FIRST */}
      <AuthProvider>  {/* ✅ AuthProvider INSIDE BrowserRouter */}
        <ChatProvider>  {/* ✅ ChatProvider INSIDE AuthProvider */}
          <Toaster position="top-right" />
          <AppContent />
        </ChatProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
