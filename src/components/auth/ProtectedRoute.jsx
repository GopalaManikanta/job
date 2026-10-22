import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { toast } from 'react-toastify'
import { useEffect } from 'react'

export default function ProtectedRoute({ children, allowedRoles }) {
  const { user, isAuthenticated } = useAuth()
  const location = useLocation()

  useEffect(() => {
    if (isAuthenticated && allowedRoles && !allowedRoles.includes(user?.role)) {
      toast.warning(
        `Access restricted! Redirected to your ${user?.role === 'candidate' ? 'Job Seeker' : 'Recruiter'} dashboard.`
      )
    }
  }, [isAuthenticated, allowedRoles, user?.role])

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}
