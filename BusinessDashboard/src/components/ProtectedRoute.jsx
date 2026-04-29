import { useSelector } from 'react-redux'
import { Navigate } from 'react-router-dom'
import { selectCurrentBusiness, selectIsAuthenticated, selectBusinessStatus } from '@/redux/slices/businessAuthSlice'
import SuspendedAccount from './SuspendedAccount'
import { isTypeAllowed } from '@/lib/business-features'

export default function ProtectedRoute({ children, allowedTypes }) {
  const isAuthenticated = useSelector(selectIsAuthenticated)
  const status = useSelector(selectBusinessStatus)
  const business = useSelector(selectCurrentBusiness)

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  // Only allow access if business is approved
  if (status === 'suspended') {
    return <SuspendedAccount />
  }

  if (status !== 'approved') {
    return <Navigate to="/login" replace />
  }

  if (!isTypeAllowed(business?.businessType, allowedTypes)) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}
