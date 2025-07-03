import React, { Suspense, useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from './contexts/AuthContext'
import { useLanguage } from './contexts/LanguageContext'
import Banner from './components/ui/Banner'
import LoadingSpinner from './components/ui/LoadingSpinner'
import ErrorBoundary from './components/ui/ErrorBoundary'
import WhatsAppButton from './components/ui/WhatsAppButton'
import Header from './components/layout/Header'
import Footer from './components/layout/Footer'
import DevSidebar from './components/layout/DevSidebar'

// Lazy load pages
const LandingPage = React.lazy(() => import('./pages/LandingPage'))
const Login = React.lazy(() => import('./pages/auth/Login'))
const Register = React.lazy(() => import('./pages/auth/Register'))
const Services = React.lazy(() => import('./pages/Services'))
const About = React.lazy(() => import('./pages/About'))
const Contact = React.lazy(() => import('./pages/Contact'))
const MessagesPage = React.lazy(() => import('./pages/MessagesPage'))
const ClientDashboard = React.lazy(() => import('./pages/client/Dashboard'))
const ClientAppointments = React.lazy(() => import('./pages/client/Appointments'))
const ClientBooking = React.lazy(() => import('./pages/client/Booking'))
const ClientFeedback = React.lazy(() => import('./pages/client/Feedback'))
const ClientProfile = React.lazy(() => import('./pages/client/Profile'))
const AdminDashboard = React.lazy(() => import('./pages/admin/Dashboard'))
const AdminUsers = React.lazy(() => import('./pages/admin/Users'))
const AdminServices = React.lazy(() => import('./pages/admin/Services'))
const AdminAppointments = React.lazy(() => import('./pages/admin/Appointments'))
const AdminProfile = React.lazy(() => import('./pages/admin/Profile'))
const AdminAnnouncements = React.lazy(()=> import('./pages/admin/Announcements'))
const AdminStaff = React.lazy(()=> import('./pages/admin/Staff'))
const AdminFeedback = React.lazy(()=> import('./pages/admin/Feedback'))
const StaffDashboard = React.lazy(() => import('./pages/staff/Dashboard'))
const StaffSchedule = React.lazy(() => import('./pages/staff/Schedule'))
const StaffProfile = React.lazy(() => import('./pages/staff/Profile'))

// Development mode - bypass authentication
const DevProtectedRoute = ({ children }) => {
  return children;
};

const pageVariants = {
  initial: { opacity: 0, x: -20 },
  in: { opacity: 1, x: 0 },
  out: { opacity: 0, x: 20 },
}

const pageTransition = {
  type: 'tween',
  ease: 'anticipate',
  duration: 0.3,
}

function App() {
  const { language } = useLanguage()

  useEffect(() => {
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr'
    document.documentElement.lang = language
  }, [language])

  const renderMotionPage = (Component) => (
    <motion.div
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      transition={pageTransition}
    >
      <Component />
    </motion.div>
  )

  return (
    <ErrorBoundary>
      <div className="min-h-screen gradient-bg">
        <Banner />
        <DevSidebar />

        <AnimatePresence mode="wait">
          <Suspense fallback={<LoadingSpinner />}>
            <Routes>
              {/* Public Pages */}
              <Route path="/" element={renderMotionPage(LandingPage)} />
              <Route path="/login" element={renderMotionPage(Login)} />
              <Route path="/register" element={renderMotionPage(Register)} />
              <Route path="/services" element={renderMotionPage(Services)} />
              <Route path="/about" element={renderMotionPage(About)} />
              <Route path="/contact" element={renderMotionPage(Contact)} />

              {/* Messages Route - Available to all authenticated users */}
              <Route
                path="/messages"
                element={
                  <DevProtectedRoute>
                    {renderMotionPage(MessagesPage)}
                  </DevProtectedRoute>
                }
              />

              {/* Updated Client Routes */}
              <Route
                path="/client/dashboard"
                element={
                  <DevProtectedRoute>
                    {renderMotionPage(ClientDashboard)}
                  </DevProtectedRoute>
                }
              />
              <Route
                path="/client/appointments"
                element={
                  <DevProtectedRoute>
                    {renderMotionPage(ClientAppointments)}
                  </DevProtectedRoute>
                }
              />
              <Route
                path="/client/booking"
                element={
                  <DevProtectedRoute>
                    {renderMotionPage(ClientBooking)}
                  </DevProtectedRoute>
                }
              />
              
              <Route
                path="/client/profile"
                element={
                  <DevProtectedRoute>
                    {renderMotionPage(ClientProfile)}
                  </DevProtectedRoute>
                }
              />

              <Route
                path="/client/feedback"
                element={
                  <DevProtectedRoute>
                    {renderMotionPage(ClientFeedback)}
                  </DevProtectedRoute>
                }
              />

              {/* Admin Routes */}
            <Route
              path="/admin"
              element={
                <DevProtectedRoute>
                  {renderMotionPage(AdminDashboard)}
                </DevProtectedRoute>
              }
            />
            <Route
              path="/admin/users"
              element={
                <DevProtectedRoute>
                  {renderMotionPage(AdminUsers)}
                </DevProtectedRoute>
              }
            />
            <Route
              path="/admin/services"
              element={
                <DevProtectedRoute>
                  {renderMotionPage(AdminServices)}
                </DevProtectedRoute>
              }
            />
            <Route
              path="/admin/appointments"
              element={
                <DevProtectedRoute>
                  {renderMotionPage(AdminAppointments)}
                </DevProtectedRoute>
              }
            />
            <Route
              path="/admin/profile"
              element={
                <DevProtectedRoute>
                  {renderMotionPage(AdminProfile)}
                </DevProtectedRoute>
              }
            />
            <Route
              path="/admin/announcements"
              element={
                <DevProtectedRoute>
                  {renderMotionPage(AdminAnnouncements)}
                </DevProtectedRoute>
              }
            />
            <Route
              path="/admin/staff"
              element={
                <DevProtectedRoute>
                  {renderMotionPage(AdminStaff)}
                </DevProtectedRoute>
              }
            />
            <Route
              path="/admin/feedback"
              element={
                <DevProtectedRoute>
                  {renderMotionPage(AdminFeedback)}
                </DevProtectedRoute>
              }
            />

            {/* Staff Routes */}
            <Route
              path="/staff"
              element={
                <DevProtectedRoute>
                  {renderMotionPage(StaffDashboard)}
                </DevProtectedRoute>
              }
            />
            <Route
              path="/staff/schedule"
              element={
                <DevProtectedRoute>
                  {renderMotionPage(StaffSchedule)}
                </DevProtectedRoute>
              }
            />
            <Route
              path="/staff/profile"
              element={
                <DevProtectedRoute>
                  {renderMotionPage(StaffProfile)}
                </DevProtectedRoute>
              }
            />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </AnimatePresence>

        <WhatsAppButton />
      </div>
    </ErrorBoundary>
  )
}

export default App