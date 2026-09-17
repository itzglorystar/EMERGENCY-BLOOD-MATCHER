export function BloodBadge({ type, size = 'md' }) {
  const sizes = {
    sm: 'h-7 min-w-7 px-1.5 text-[11px]',
    md: 'h-8 min-w-8 px-2 text-xs',
    lg: 'h-10 min-w-10 px-2.5 text-sm',
  }
  return (
    <span
      className={`inline-flex items-center justify-center rounded-md bg-ebm-700 font-bold text-white shadow-sm ${sizes[size]}`}
    >
      {type}
    </span>
  )
}

export function StatusPill({ status }) {
  const map = {
    Available: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
    Active: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
    Matched: 'bg-sky-50 text-sky-700 ring-sky-200',
    Completed: 'bg-slate-100 text-slate-600 ring-slate-200',
    Confirmed: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
    Declined: 'bg-gray-100 text-gray-500 ring-gray-200',
    Unavailable: 'bg-gray-100 text-gray-500 ring-gray-200',
    Cancelled: 'bg-gray-100 text-gray-500 ring-gray-200',
    'High (Emergency)': 'bg-red-50 text-ebm-700 ring-red-200',
    Medium: 'bg-amber-50 text-amber-700 ring-amber-200',
    Low: 'bg-blue-50 text-blue-700 ring-blue-200',
    Adequate: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
    Critical: 'bg-red-50 text-ebm-700 ring-red-200',
  }
  const cls = map[status] || 'bg-gray-50 text-gray-600 ring-gray-200'
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${cls}`}>
      {status}
    </span>
  )
}

export function Avatar({ name, src, size = 'md' }) {
  const sizes = {
    sm: 'h-10 w-10 text-sm',
    md: 'h-14 w-14 text-base',
    lg: 'h-24 w-24 text-3xl',
    xl: 'h-28 w-28 text-3xl',
  }
  const initials = name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0])
    .join('')
    .toUpperCase()

  return (
    <div className={`relative shrink-0 overflow-hidden rounded-full bg-ebm-100 ring-2 ring-white shadow ${sizes[size]}`}>
      {src ? (
        <img src={src} alt={name} className="h-full w-full object-cover" />
      ) : (
        <div className="flex h-full w-full items-center justify-center font-bold text-ebm-700">{initials}</div>
      )}
    </div>
  )
}

export function StatCard({ icon: Icon, label, value, subtitle, tone = 'red' }) {
  const tones = {
    red: 'bg-ebm-50 text-ebm-700',
    green: 'bg-emerald-50 text-emerald-700',
    blue: 'bg-sky-50 text-sky-700',
    amber: 'bg-amber-50 text-amber-700',
  }
  return (
    <div className="card p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_12px_32px_rgba(139,0,0,0.08)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-muted">{label}</p>
          <p className="mt-1 text-3xl font-bold tracking-tight text-ink">{value}</p>
          {subtitle ? <p className="mt-1 text-xs text-muted">{subtitle}</p> : null}
        </div>
        <div className={`rounded-xl p-2.5 ${tones[tone]}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  )
}

export function BloodDropLogo({ className = 'h-10 w-10' }) {
  return (
    <svg viewBox="0 0 32 32" className={className} fill="none" aria-hidden="true">
      <rect width="32" height="32" rx="8" fill="currentColor" className="text-white/15" />
      <path
        d="M16 5C16 5 8 13.6 8 20.1C8 24.4 11.6 28 16 28C20.4 28 24 24.4 24 20.1C24 13.6 16 5 16 5Z"
        fill="currentColor"
        className="text-white"
      />
    </svg>
  )
}
