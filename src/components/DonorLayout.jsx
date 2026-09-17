import {
  Bell,
  ClipboardList,
  HeartHandshake,
  LayoutDashboard,
  Menu,
  Settings,
  UserRound,
} from 'lucide-react'
import { useState } from 'react'
import { Link, Outlet } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import Sidebar from './Sidebar'
import { Avatar } from './ui'

const DONOR_NAV = [
  { to: '/donor/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/donor/requests', label: 'Blood Requests', icon: ClipboardList },
  { to: '/donor/history', label: 'Donation History', icon: HeartHandshake },
  { to: '/donor/profile', label: 'Profile', icon: UserRound },
  { to: '/donor/settings', label: 'Settings', icon: Settings },
]

export default function DonorLayout() {
  const { user, unreadCount, toast } = useApp()
  const [open, setOpen] = useState(false)

  return (
    <div className="flex min-h-screen bg-surface">
      <Sidebar open={open} onClose={() => setOpen(false)} items={DONOR_NAV} />
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
              <p className="text-sm font-bold text-ink">Donor Portal</p>
              <p className="text-xs font-semibold tracking-[0.16em] text-ebm-700">FIND. MATCH. SAVE.</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/donor/notifications" className="relative rounded-xl p-2 hover:bg-black/5">
              <Bell className="h-5 w-5 text-ink" />
              {unreadCount > 0 ? (
                <span className="absolute right-1 top-1 h-4 min-w-4 rounded-full bg-ebm-700 px-1 text-center text-[10px] font-bold text-white">
                  {unreadCount}
                </span>
              ) : null}
            </Link>
            <Link to="/donor/profile" className="flex items-center gap-2 rounded-full pr-2 hover:bg-black/5">
              <Avatar name={user.fullName} src={user.avatar} size="sm" />
              <span className="hidden text-sm font-semibold md:block">{user.fullName}</span>
            </Link>
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
