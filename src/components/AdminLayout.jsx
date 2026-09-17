import {
  Bell,
  Building2,
  ClipboardList,
  LayoutDashboard,
  Menu,
  Shield,
  Users,
} from 'lucide-react'
import { useState } from 'react'
import { Link, Outlet } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import Sidebar from './Sidebar'
import { Avatar } from './ui'

export default function AdminLayout() {
  const { user, toast, directory } = useApp()
  const [open, setOpen] = useState(false)
  const pendingHospitals = directory.filter((item) => item.role === 'hospital' && item.accountStatus === 'pending').length

  const items = [
    { to: '/admin/dashboard', label: 'Overview', icon: LayoutDashboard },
    { to: '/admin/hospitals', label: 'Hospitals', icon: Building2, badge: pendingHospitals > 0, badgeCount: pendingHospitals },
    { to: '/admin/users', label: 'Users', icon: Users },
    { to: '/admin/requests', label: 'Requests', icon: ClipboardList },
  ]

  return (
    <div className="flex min-h-screen bg-surface">
      <Sidebar
        open={open}
        onClose={() => setOpen(false)}
        items={items}
        footerNote={(
          <div className="mb-2 flex items-center gap-2 px-3 text-[11px] font-semibold uppercase tracking-wide text-white/50">
            <Shield className="h-3.5 w-3.5" />
            Administrator
          </div>
        )}
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex items-center justify-between gap-3 border-b border-black/5 bg-white/90 px-4 py-3 backdrop-blur md:px-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="rounded-xl p-2 hover:bg-black/5 lg:hidden"
              onClick={() => setOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div>
              <p className="text-sm font-bold text-ink">Admin Console</p>
              <p className="text-xs font-semibold tracking-[0.16em] text-ebm-700">VERIFY. MATCH. SAVE.</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {pendingHospitals > 0 ? (
              <Link to="/admin/hospitals" className="hidden items-center gap-2 rounded-xl bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-800 sm:flex">
                <Bell className="h-3.5 w-3.5" />
                {pendingHospitals} awaiting review
              </Link>
            ) : null}
            <div className="flex items-center gap-2 rounded-full pr-2">
              <Avatar name={user.fullName} src={user.avatar} size="sm" />
              <span className="hidden max-w-[180px] truncate text-sm font-semibold md:block">{user.fullName}</span>
            </div>
          </div>
        </header>
        <main className="flex-1 p-4 md:p-6">
          <div className="fade-up">
            <Outlet />
          </div>
        </main>
      </div>
      {toast ? (
        <div className="fixed bottom-5 right-5 z-50 rounded-xl bg-ink px-4 py-3 text-sm font-medium text-white shadow-lg">
          {toast.message}
        </div>
      ) : null}
    </div>
  )
}
