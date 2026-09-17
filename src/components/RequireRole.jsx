import { Navigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { homePath } from '../utils/roles'

function LoadingScreen() {
  return <div className="grid min-h-screen place-items-center text-sm font-medium text-muted">Loading EBM…</div>
}

export default function RequireRole({ role, children }) {
  const { authLoading, isAuthenticated, user } = useApp()
  if (authLoading) return <LoadingScreen />
  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (user?.role !== role) return <Navigate to={homePath(user?.role)} replace />
  return children
}

export function RoleHome() {
  const { authLoading, isAuthenticated, user } = useApp()
  if (authLoading) return <LoadingScreen />
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return <Navigate to={homePath(user?.role)} replace />
}
