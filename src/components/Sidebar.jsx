import { LogOut, X } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { BloodDropLogo } from './ui'

export default function Sidebar({ open, onClose, items }) {
  const { unreadCount, logout } = useApp()

  return (
    <>
      <div
        className={`fixed inset-0 z-30 bg-black/40 transition-opacity lg:hidden ${open ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
        onClick={onClose}
      />
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-72 flex-col bg-gradient-to-b from-ebm-950 via-ebm-800 to-ebm-900 text-white shadow-2xl transition-transform duration-300 lg:static lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between px-5 py-6">
          <div className="flex items-center gap-3">
            <BloodDropLogo className="h-11 w-11" />
            <div>
              <p className="text-lg font-extrabold tracking-tight">EBM</p>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/70">
                Find. Match. Save.
              </p>
            </div>
          </div>
          <button type="button" className="rounded-lg p-1 hover:bg-white/10 lg:hidden" onClick={onClose}>
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 pb-4">
          {items.map((item) => {
            const Icon = item.icon
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-white text-ebm-800 shadow-sm'
                      : 'text-white/80 hover:bg-white/10 hover:text-white'
                  }`
                }
              >
                <Icon className="h-4 w-4" />
                <span className="flex-1">{item.label}</span>
                {item.badge && unreadCount > 0 ? (
                  <span className="rounded-full bg-white px-2 py-0.5 text-[11px] font-bold text-ebm-700">
                    {unreadCount}
                  </span>
                ) : null}
              </NavLink>
            )
          })}
        </nav>

        <div className="p-3">
          <button
            type="button"
            onClick={logout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-white/80 transition-all hover:bg-white/10 hover:text-white"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </aside>
    </>
  )
}
