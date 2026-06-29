import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import PageWrapper from './components/layout/PageWrapper';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Assessment from './pages/Assessment.jsx';
import Dashboard from './pages/Dashboard';
import Recommendations from './pages/Recommendations';
import BusinessPlan from './pages/BusinessPlan';
import AIChatPage from './pages/ai/AIChatPage';
import RoadmapPage from './pages/RoadmapPage';
import ResourcesPage from './pages/ResourcesPage';
import MentorsPage from './pages/MentorsPage';
import AnalyticsDashboard from './pages/AnalyticsDashboard';
import GovernmentSchemesPage from './pages/GovernmentSchemesPage';
import FundingDashboard from './pages/FundingDashboard';
import BusinessExecutionDashboard from './pages/BusinessExecutionDashboard';
import GoalDetails from './pages/GoalDetails';
import NetworkingPage from './pages/NetworkingPage';
import AdminDashboard from './pages/AdminDashboard';
import AdminLogin from './pages/AdminLogin';
import LearningDashboard from './pages/LearningDashboard';
import CourseDetails from './pages/CourseDetails';
import LessonViewer from './pages/LessonViewer';
import QuizPage from './pages/QuizPage';
import CertificatesPage from './pages/CertificatesPage';
import NotificationsPage from './pages/NotificationsPage';
import ReportsPage from './pages/ReportsPage';

// Sprint 11
import CommunityPage from './pages/CommunityPage';
import MentorSessionsPage from './pages/MentorSessionsPage';
import ChatPage from './pages/ChatPage';

// Sprint 12 — Financial Management
import FinanceDashboard from './pages/FinanceDashboard';
import IncomePage from './pages/IncomePage';
import ExpensePage from './pages/ExpensePage';
import BudgetPage from './pages/BudgetPage';
import InvoicesPage from './pages/InvoicesPage';
import FinancialReportsPage from './pages/FinancialReportsPage';
import FinancialAdvisorPage from './pages/FinancialAdvisorPage';

import { Toaster } from 'react-hot-toast';

// Route shielding component to protect private screens
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-slate-500 animate-pulse text-sm font-medium">Validating security session...</div>
      </div>
    );
  }

  if (!user) {
    // If not logged in, send them back to login page
    return <Navigate to="/login" replace />;
  }

  return children;
};

// Route shielding for authentication pages (don't show login/register if already logged in)
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-slate-500 animate-pulse text-sm font-medium">Validating security session...</div>
      </div>
    );
  }

  if (user) {
    if (user.role === 'admin') {
      return <Navigate to="/admin" replace />;
    }
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

// Route shielding to restrict pages to admins only
const EntrepreneurRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-slate-500 animate-pulse text-sm font-medium">Validating security session...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // 'user' role indicates entrepreneur (default role)
  if (user.role !== 'user') {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

const MentorRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-slate-500 animate-pulse text-sm font-medium">Validating security session...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== 'mentor') {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-slate-500 animate-pulse text-sm font-medium">Validating security session...</div>
      </div>
    );
  }
  if (!user) {
    return <Navigate to="/admin-login" replace />;
  }
  if (user.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
};

// Main routing configuration
function App() {
  return (
    <Router>
      <ThemeProvider>
      <AuthProvider>
        <PageWrapper>
          <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Home />} />
            
            {/* Guest-only routes */}
            <Route 
              path="/login" 
              element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              } 
            />
            <Route 
              path="/admin-login" 
              element={
                <PublicRoute>
                  <AdminLogin />
                </PublicRoute>
              } 
            />
            <Route 
              path="/register" 
              element={
                <PublicRoute>
                  <Register />
                </PublicRoute>
              } 
            />
            
            {/* Protected routes */}
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/assessment" 
              element={
                <ProtectedRoute>
                  <Assessment />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/recommendations" 
              element={
                <ProtectedRoute>
                  <Recommendations />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/business-plan/:businessIdeaId" 
              element={
                <ProtectedRoute>
                  <BusinessPlan />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/ai-mentor" 
              element={
                <ProtectedRoute>
                  <AIChatPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/ai-mentor/:sessionId" 
              element={
                <ProtectedRoute>
                  <AIChatPage />
                </ProtectedRoute>
              } 
            />
            <Route
              path="/roadmap/:businessIdeaId"
              element={
                <ProtectedRoute>
                  <RoadmapPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/resources/:businessIdeaId"
              element={
                <ProtectedRoute>
                  <ResourcesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/mentors"
              element={
                <ProtectedRoute>
                  <MentorsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/analytics"
              element={
                <ProtectedRoute>
                  <AnalyticsDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/schemes"
              element={
                <ProtectedRoute>
                  <GovernmentSchemesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/funding-dashboard"
              element={
                <ProtectedRoute>
                  <FundingDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/business-execution"
              element={
                <ProtectedRoute>
                  <BusinessExecutionDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/business-execution/goals/:goalId"
              element={
                <ProtectedRoute>
                  <GoalDetails />
                </ProtectedRoute>
              }
            />
            <Route
              path="/networking"
              element={
                <ProtectedRoute>
                  <NetworkingPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <AdminDashboard />
                </AdminRoute>
              }
            />
            {/* Learning Platform Routes */}
            <Route
              path="/learning"
              element={
                <ProtectedRoute>
                  <LearningDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/courses/:id"
              element={
                <ProtectedRoute>
                  <CourseDetails />
                </ProtectedRoute>
              }
            />
            <Route
              path="/lessons/:id"
              element={
                <ProtectedRoute>
                  <LessonViewer />
                </ProtectedRoute>
              }
            />
            <Route
              path="/quizzes/:id"
              element={
                <ProtectedRoute>
                  <QuizPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/certificates"
              element={
                <ProtectedRoute>
                  <CertificatesPage />
                </ProtectedRoute>
              }
            />
            {/* Sprint 9 — Notifications & Reports */}
            <Route
              path="/notifications"
              element={
                <ProtectedRoute>
                  <NotificationsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/reports"
              element={
                <ProtectedRoute>
                  <ReportsPage />
                </ProtectedRoute>
              }
            />

            {/* Sprint 11 — Community, Sessions, Chat */}
            <Route path="/community" element={<ProtectedRoute><CommunityPage /></ProtectedRoute>} />
            <Route path="/mentor-sessions" element={<ProtectedRoute><MentorSessionsPage /></ProtectedRoute>} />
            <Route path="/chat" element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />

            {/* Sprint 12 — Financial Management */}
            <Route path="/finance" element={<ProtectedRoute><FinanceDashboard /></ProtectedRoute>} />
            <Route path="/finance/income" element={<ProtectedRoute><IncomePage /></ProtectedRoute>} />
            <Route path="/finance/expenses" element={<ProtectedRoute><ExpensePage /></ProtectedRoute>} />
            <Route path="/finance/budgets" element={<ProtectedRoute><BudgetPage /></ProtectedRoute>} />
            <Route path="/finance/invoices" element={<ProtectedRoute><InvoicesPage /></ProtectedRoute>} />
            <Route path="/finance/reports" element={<ProtectedRoute><FinancialReportsPage /></ProtectedRoute>} />
            <Route path="/finance/advisor" element={<ProtectedRoute><FinancialAdvisorPage /></ProtectedRoute>} />

            {/* Catch-all Redirect */}
            <Route path="*" element={<Navigate to="/" replace />} />          </Routes>
        </PageWrapper>
      </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;
