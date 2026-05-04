import { BrowserRouter, Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';

import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import EventsPage from './pages/EventsPage';
import EventDetailPage from './pages/EventDetailPage';
import EventFormPage from './pages/EventFormPage';
import MyRegistrationsPage from './pages/MyRegistrationsPage';
import MyEventsPage from './pages/MyEventsPage';
import FeedbackPage from './pages/FeedbackPage';
import MyFeedbacksPage from './pages/MyFeedbacksPage';
import AdminPage from './pages/AdminPage';
import { NotFoundPage, ForbiddenPage } from './pages/ErrorPages';

function Layout() {
  return (
    <>
      <Navbar />
      <main className="main-content">
        <Outlet />
      </main>
    </>
  );
}

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Public routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/403" element={<ForbiddenPage />} />
        <Route path="*" element={<NotFoundPage />} />

        {/* Protected routes with Navbar */}
        <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/events" element={<EventsPage />} />
          <Route path="/events/:id" element={<EventDetailPage />} />
          <Route path="/my-registrations" element={<MyRegistrationsPage />} />
          <Route path="/my-feedbacks" element={<MyFeedbacksPage />} />

          {/* Organizer/Admin */}
          <Route
            path="/events/create"
            element={
              <ProtectedRoute allowedRoles={['organizer', 'admin']}>
                <EventFormPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/events/:id/edit"
            element={
              <ProtectedRoute allowedRoles={['organizer', 'admin']}>
                <EventFormPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-events"
            element={
              <ProtectedRoute allowedRoles={['organizer', 'admin']}>
                <MyEventsPage />
              </ProtectedRoute>
            }
          />
          <Route path="/events/:id/feedback" element={<FeedbackPage />} />

          {/* Admin only */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminPage />
              </ProtectedRoute>
            }
          />
        </Route>
      </Routes>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: 'var(--color-surface)',
              color: 'var(--color-text)',
              border: '1px solid var(--color-border)',
              borderRadius: '12px',
              fontSize: '14px',
              fontWeight: '500',
              backdropFilter: 'blur(12px)',
            },
            success: { iconTheme: { primary: '#10b981', secondary: '#fff' } },
            error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
          }}
        />
        <AnimatedRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
