import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import LoginPage from './pages/login'
import SignupPage from './pages/signup'
import VerifyEmailPage from './pages/verify-email'
import OnboardingPage from './pages/onboarding'
import DashboardPage from './pages/dashboard'
import ProfilePage from './pages/profile'
import DealsPage from './pages/deals'
import ReviewsPage from './pages/reviews'
import AnalyticsPage from './pages/analytics'
import POSPage from './pages/pos'
import ProtectedRoute from './components/ProtectedRoute'
import { loadPendingBusiness, selectIsAuthenticated } from './redux/slices/businessAuthSlice'
import './App.css'
import SettingsPage from './pages/settings'

function App() {
  const dispatch = useDispatch()
  const isAuthenticated = useSelector(selectIsAuthenticated)

  useEffect(() => {
    // Load pending business data on app mount
    dispatch(loadPendingBusiness())
  }, [dispatch])

  return (
    <Router>
      <Routes>
        <Route path="/" element={
          isAuthenticated ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />
        } />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/onboarding" element={<OnboardingPage />} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />
        
        {/* Protected Routes */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        } />
        <Route path="/dashboard/profile" element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        } />
        <Route path="/dashboard/deals" element={
          <ProtectedRoute>
            <DealsPage />
          </ProtectedRoute>
        } />
        <Route path="/dashboard/pos" element={
          <ProtectedRoute>
            <POSPage />
          </ProtectedRoute>
        } />
        <Route path="/dashboard/reviews" element={
          <ProtectedRoute>
            <ReviewsPage />
          </ProtectedRoute>
        } />
        <Route path="/dashboard/analytics" element={
          <ProtectedRoute>
            <AnalyticsPage />
          </ProtectedRoute>
        } />
        <Route path="/dashboard/settings" element={
          <ProtectedRoute>
            <SettingsPage />
          </ProtectedRoute>
        } />
      </Routes>
    </Router>
  )
}

export default App
