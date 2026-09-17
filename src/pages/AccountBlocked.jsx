import { LogOut, ShieldX } from 'lucide-react'
import { Navigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { accountStatusLabel, homePath } from '../utils/roles'

export default function AccountBlocked() {
  const { user, logout } = useApp()

  if (!user) return <Navigate to="/login" replace />
  if (user.accountStatus === 'pending' && user.role === 'hospital') {
    return <Navigate to="/hospital/pending" replace />
  }
  if (!user.accountStatus || user.accountStatus === 'active') {
    return <Navigate to={homePath(user.role, user.accountStatus)} replace />
  }

  const rejected = user.accountStatus === 'rejected'

  return (
    <div className="grid min-h-screen place-items-center bg-surface px-6 py-12">
      <div className="card w-full max-w-lg p-8 text-center">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-ebm-50 text-ebm-700">
          <ShieldX className="h-7 w-7" />
        </div>
        <h1 className="mt-5 text-2xl font-bold">{rejected ? 'Hospital not approved' : 'Account suspended'}</h1>
        <p className="mt-2 text-sm text-muted">
          {rejected
            ? 'An administrator reviewed this hospital and did not approve access to the EBM portal.'
            : 'An administrator suspended this account. You cannot use EBM until it is reactivated.'}
        </p>
        <div className="mt-6 rounded-2xl bg-surface px-4 py-4 text-left text-sm">
          <p className="font-semibold">{user.fullName}</p>
          <p className="text-muted">{user.email}</p>
          <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-ebm-700">
            {accountStatusLabel(user.accountStatus)}
          </p>
          {user.rejectedReason ? (
            <p className="mt-2 text-sm text-ink">{user.rejectedReason}</p>
          ) : null}
        </div>
        <button type="button" className="btn-outline mt-6" onClick={logout}>
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      </div>
    </div>
  )
}
