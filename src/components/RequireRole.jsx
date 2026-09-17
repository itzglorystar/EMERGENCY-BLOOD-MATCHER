import { Navigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { homePath } from '../utils/roles'

function LoadingScreen() {
  return <div className="grid min-h-screen place-items-center text-sm font-medium text-muted">Loading EBM…</div>
}

export default function RequireRole({ role, children, allowInactive = false }) {
  const { authLoading, isAuthenticated, user } = useApp()
  if (authLoading) return <LoadingScreen />
  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (user?.role !== role) return <Navigate to={homePath(user?.role, user?.accountStatus)} replace />
  if (!allowInactive && user?.accountStatus && user.accountStatus !== 'active') {
    return <Navigate to={homePath(user.role, user.accountStatus)} replace />
  }
  return children
}

export function RoleHome() {
  const { authLoading, isAuthenticated, user } = useApp()
  if (authLoading) return <LoadingScreen />
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return <Navigate to={homePath(user?.role, user?.accountStatus)} replace />
}

export function RequireAuth({ children }) {
  const { authLoading, isAuthenticated } = useApp()
  if (authLoading) return <LoadingScreen />
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return children
}
