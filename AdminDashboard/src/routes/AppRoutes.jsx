import { Routes, Route, Navigate } from 'react-router-dom';
import { AdminLayout } from '@/components/admin-layout';
import { ProtectedRoute, AuthRoute } from '@/components/ProtectedRoute';

// Import pages
import AnalyticsPage from '@/pages/analytics';
import BusinessesPage from '@/pages/businesses';
import DealsPage from '@/pages/deals';
import GamificationPage from '@/pages/gamification';
import ReportsPage from '@/pages/reports';
import ReviewsPage from '@/pages/reviews';
import SettingsPage from '@/pages/settings';
import UsersPage from '@/pages/users';
import DashboardPage from '@/pages/dashboard';

// Import auth pages
import SignInPage from '@/pages/sign-in';
import SignUpPage from '@/pages/sign-up';
import VerifyOtpPage from '@/pages/verify-otp';

function AppRoutes() {
  return (
    <Routes>
      {/* Auth Routes */}
      <Route path="/auth/sign-in" element={<AuthRoute><SignInPage /></AuthRoute>} />
      <Route path="/auth/sign-up" element={<AuthRoute><SignUpPage /></AuthRoute>} />
      <Route path="/auth/verify-otp" element={<VerifyOtpPage />} />
      
      {/* Protected Admin Routes */}
      <Route path="/" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
        <Route index element={<DashboardPage />} />
        <Route path="users" element={<UsersPage />} />
        <Route path="businesses" element={<BusinessesPage />} />
        <Route path="reviews" element={<ReviewsPage />} />
        <Route path="deals" element={<DealsPage />} />
        <Route path="analytics" element={<AnalyticsPage />} />
        <Route path="gamification" element={<GamificationPage />} />
        <Route path="reports" element={<ReportsPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>
      
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default AppRoutes;
