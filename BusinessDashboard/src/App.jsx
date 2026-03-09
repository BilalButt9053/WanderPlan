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
import MenuPage from './pages/menu'
import ProtectedRoute from './components/ProtectedRoute'
import { loadPendingBusiness, selectIsAuthenticated, selectIsLoading, selectCurrentToken, setCredentials, logout, setLoading } from './redux/slices/businessAuthSlice'
import { useGetBusinessProfileQuery } from './redux/api/businessApi'
import './App.css'
import SettingsPage from './pages/settings'

function App() {
  const dispatch = useDispatch()
  const isAuthenticated = useSelector(selectIsAuthenticated)
  const isLoading = useSelector(selectIsLoading)
  const token = useSelector(selectCurrentToken)

  // Try to fetch business profile if token exists
  const { data: profileData, error: profileError, isLoading: isProfileLoading, isSuccess, isError } = useGetBusinessProfileQuery(undefined, {
    skip: !token || isAuthenticated, // Skip if no token or already authenticated
  })

  useEffect(() => {
    // Load pending business data on app mount
    dispatch(loadPendingBusiness())
  }, [dispatch])

  // Handle profile data to restore session
  useEffect(() => {
    if (profileData && isSuccess) {
      // API returns business object directly, not wrapped in { business: ... }
      dispatch(setCredentials({ business: profileData }))
    }
  }, [profileData, isSuccess, dispatch])

  // Handle profile error (invalid token)
  useEffect(() => {
    if (profileError || isError) {
      console.log('Token validation failed:', profileError)
      dispatch(logout())
    }
  }, [profileError, isError, dispatch])

  // Set loading to false when profile check completes without token
  useEffect(() => {
    if (!token && isLoading) {
      dispatch(setLoading(false))
    }
  }, [token, isLoading, dispatch])

  // Also set loading to false when profile query completes (success or error)
  useEffect(() => {
    if (token && !isProfileLoading && isLoading && !isAuthenticated) {
      // Profile check completed but no auth set - set loading to false
      if (!isSuccess && !isError) {
        // Query hasn't started yet, wait
        return
      }
      dispatch(setLoading(false))
    }
  }, [token, isProfileLoading, isLoading, isAuthenticated, isSuccess, isError, dispatch])

  // Show loading only while profile is being fetched
  if (token && isProfileLoading && !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

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
        <Route path="/dashboard/menu" element={
          <ProtectedRoute>
            <MenuPage />
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
