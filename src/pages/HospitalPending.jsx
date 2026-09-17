import { Clock3, LogOut, ShieldCheck } from 'lucide-react'
import { Navigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { formatLongDate, homePath } from '../utils/roles'

export default function HospitalPending() {
  const { user, logout } = useApp()

  if (user?.accountStatus === 'active') {
    return <Navigate to={homePath(user.role, user.accountStatus)} replace />
  }
  if (user?.accountStatus === 'rejected' || user?.accountStatus === 'suspended') {
    return <Navigate to="/account-blocked" replace />
  }

  return (
    <div className="grid min-h-screen place-items-center bg-surface px-6 py-12">
      <div className="card w-full max-w-lg p-8 text-center">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-amber-50 text-amber-700">
          <Clock3 className="h-7 w-7" />
        </div>
        <h1 className="mt-5 text-2xl font-bold">Hospital under review</h1>
        <p className="mt-2 text-sm text-muted">
          {user.fullName} was submitted to EBM. An administrator must verify this hospital before you can request blood or view donors.
        </p>
        <dl className="mt-6 space-y-2 rounded-2xl bg-surface px-4 py-4 text-left text-sm">
          <div className="flex justify-between gap-3">
            <dt className="text-muted">Hospital</dt>
            <dd className="font-semibold">{user.fullName}</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-muted">Email</dt>
            <dd className="font-semibold">{user.email}</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-muted">Submitted</dt>
            <dd className="font-semibold">{formatLongDate(user.createdAt) || 'Today'}</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-muted">Status</dt>
            <dd className="font-semibold text-amber-700">Pending review</dd>
          </div>
        </dl>
        <p className="mt-4 flex items-center justify-center gap-2 text-xs text-muted">
          <ShieldCheck className="h-4 w-4 text-ebm-700" />
          This page updates automatically after approval.
        </p>
        <button type="button" className="btn-outline mt-6" onClick={logout}>
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      </div>
    </div>
  )
}
