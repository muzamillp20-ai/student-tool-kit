import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import ToolsPage from './pages/ToolsPage';
import ToolDetailPage from './pages/ToolDetailPage';
import AskAIPage from './pages/AskAIPage';
import FavoritesPage from './pages/FavoritesPage';
import HistoryPage from './pages/HistoryPage';
import AboutPage from './pages/AboutPage';
import ProfilePage from './pages/ProfilePage';
import StudentPage from './pages/StudentPage';
import ProductivityPage from './pages/ProductivityPage';
import SettingsPage from './pages/SettingsPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import EmailVerificationPage from './pages/EmailVerificationPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import { ReactNode } from 'react';

// Protected route wrapper
function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, isAuthenticated } = useAuth();
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  if (!user.emailVerified) {
    return <Navigate to="/verify-email" replace />;
  }
  
  return <>{children}</>;
}

// Auth route wrapper (redirect to home if already logged in)
function AuthRoute({ children }: { children: ReactNode }) {
  const { user, isAuthenticated } = useAuth();
  
  if (user && isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/about" element={
        <Layout>
          <AboutPage />
        </Layout>
      } />

      {/* Auth routes (no layout) */}
      <Route path="/login" element={
        <AuthRoute>
          <LoginPage />
        </AuthRoute>
      } />
      <Route path="/signup" element={
        <AuthRoute>
          <SignupPage />
        </AuthRoute>
      } />
      <Route path="/forgot-password" element={
        <AuthRoute>
          <ForgotPasswordPage />
        </AuthRoute>
      } />
      <Route path="/verify-email" element={
        <EmailVerificationPage />
      } />

      {/* Protected routes (require auth) */}
      <Route path="/" element={
        <ProtectedRoute>
          <Layout>
            <HomePage />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/tools" element={
        <ProtectedRoute>
          <Layout>
            <ToolsPage />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/tool/:id" element={
        <ProtectedRoute>
          <Layout>
            <ToolDetailPage />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/ask-ai" element={
        <ProtectedRoute>
          <Layout>
            <AskAIPage />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/favorites" element={
        <ProtectedRoute>
          <Layout>
            <FavoritesPage />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/history" element={
        <ProtectedRoute>
          <Layout>
            <HistoryPage />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/profile" element={
        <ProtectedRoute>
          <Layout>
            <ProfilePage />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/student" element={
        <ProtectedRoute>
          <Layout>
            <StudentPage />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/productivity" element={
        <ProtectedRoute>
          <Layout>
            <ProductivityPage />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/settings" element={
        <ProtectedRoute>
          <Layout>
            <SettingsPage />
          </Layout>
        </ProtectedRoute>
      } />

      {/* Catch all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <HashRouter>
          <AppRoutes />
        </HashRouter>
      </AppProvider>
    </AuthProvider>
  );
}
