import { useSelector } from 'react-redux'
import { Navigate } from 'react-router-dom'
import { selectIsAuthenticated, selectBusinessStatus } from '@/redux/slices/businessAuthSlice'

export default function ProtectedRoute({ children }) {
  const isAuthenticated = useSelector(selectIsAuthenticated)
  const status = useSelector(selectBusinessStatus)

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  // Only allow access if business is approved
  if (status !== 'approved') {
    return <Navigate to="/login" replace />
  }

  return children
}
