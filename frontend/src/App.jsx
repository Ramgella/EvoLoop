import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';
import ProtectedRoute from './components/routing/ProtectedRoute';
import PublicOnlyRoute from './components/routing/PublicOnlyRoute';
import { NAV_ITEMS } from './config/navigation';
import { AuthProvider } from './context/AuthProvider';
import { ProfileProvider } from './context/ProfileProvider';
import { isSupabaseConfigured } from './lib/supabase';
import ConfigErrorPage from './pages/ConfigErrorPage';
import NotFoundPage from './pages/NotFoundPage';
import LoginPage from './pages/auth/LoginPage';
import SignupPage from './pages/auth/SignupPage';
import ComingSoonPage from './pages/dashboard/ComingSoonPage';
import OverviewPage from './pages/dashboard/OverviewPage';
import SettingsPage from './pages/dashboard/SettingsPage';

const comingSoonRoutes = NAV_ITEMS.filter((item) => !item.available);

export default function App() {
  if (!isSupabaseConfigured) return <ConfigErrorPage />;

  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          <Route
            path="/login"
            element={
              <PublicOnlyRoute>
                <LoginPage />
              </PublicOnlyRoute>
            }
          />
          <Route
            path="/signup"
            element={
              <PublicOnlyRoute>
                <SignupPage />
              </PublicOnlyRoute>
            }
          />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <ProfileProvider>
                  <AppLayout />
                </ProfileProvider>
              </ProtectedRoute>
            }
          >
            <Route index element={<OverviewPage />} />
            <Route path="settings" element={<SettingsPage />} />
            {comingSoonRoutes.map((item) => (
              <Route
                key={item.path}
                path={item.path}
                element={<ComingSoonPage title={item.label} description={item.description} />}
              />
            ))}
          </Route>

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
