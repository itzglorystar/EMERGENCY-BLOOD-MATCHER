import { CheckCircle2, Heart, Search, Send } from 'lucide-react'

const ICONS = {
  match: { icon: Search, cls: 'bg-sky-50 text-sky-700' },
  confirmed: { icon: CheckCircle2, cls: 'bg-emerald-50 text-emerald-700' },
  sent: { icon: Send, cls: 'bg-amber-50 text-amber-700' },
  thanks: { icon: Heart, cls: 'bg-ebm-50 text-ebm-700' },
}

export default function NotificationsList({ notifications, onRead, onReadAll }) {
  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between gap-3">
        <h1 className="page-title">Notifications</h1>
        <button type="button" className="text-sm font-semibold text-ebm-700 hover:underline" onClick={onReadAll}>
          Mark all as read
        </button>
      </div>

      <div className="card mt-6 divide-y divide-black/5">
        {notifications.length === 0 ? (
          <p className="px-5 py-8 text-center text-sm text-muted">No notifications yet.</p>
        ) : null}
        {notifications.map((n) => {
          const meta = ICONS[n.type] || ICONS.sent
          const Icon = meta.icon
          return (
            <button
              type="button"
              key={n.id}
              onClick={() => onRead(n.id)}
              className={`flex w-full items-start gap-3 px-5 py-4 text-left transition hover:bg-surface ${n.read ? 'opacity-70' : ''}`}
            >
              <span className={`mt-0.5 rounded-xl p-2 ${meta.cls}`}>
                <Icon className="h-4 w-4" />
              </span>
              <span className="flex-1">
                <span className="flex items-center justify-between gap-2">
                  <span className="font-semibold text-ink">{n.title}</span>
                  <span className="text-xs text-muted">{n.time}</span>
                </span>
                <span className="mt-1 block text-sm text-muted">{n.message}</span>
              </span>
              {!n.read ? <span className="mt-2 h-2 w-2 rounded-full bg-ebm-700" /> : null}
            </button>
          )
        })}
      </div>
      <p className="mt-4 text-center text-sm font-semibold text-ebm-700">View all notifications</p>
    </div>
  )
}
