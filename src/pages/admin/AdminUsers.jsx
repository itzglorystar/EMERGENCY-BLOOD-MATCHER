import { useMemo, useState } from 'react'
import { BloodBadge, StatusPill } from '../../components/ui'
import { relativeTime } from '../../data/constants'
import { useApp } from '../../context/AppContext'
import { accountStatusLabel, formatLongDate } from '../../utils/roles'

const FILTERS = [
  { id: 'all', label: 'All donors' },
  { id: 'active', label: 'Active' },
  { id: 'suspended', label: 'Suspended' },
]

export default function AdminUsers() {
  const { directory, donations, setAccountStatus } = useApp()
  const [filter, setFilter] = useState('all')
  const [query, setQuery] = useState('')
  const [busyId, setBusyId] = useState('')

  const donationCountByDonor = useMemo(() => {
    const counts = {}
    donations.forEach((item) => {
      if (!item.donorId) return
      counts[item.donorId] = (counts[item.donorId] || 0) + Number(item.units || 0)
    })
    return counts
  }, [donations])

  const users = useMemo(() => {
    const needle = query.trim().toLowerCase()
    return directory
      .filter((item) => item.role === 'donor')
      .filter((item) => filter === 'all' || item.accountStatus === filter)
      .filter((item) => {
        if (!needle) return true
        return [item.fullName, item.email, item.phone, item.bloodGroup, item.city]
          .join(' ')
          .toLowerCase()
          .includes(needle)
      })
  }, [directory, filter, query])

  const run = async (id, status, reason) => {
    setBusyId(id)
    await setAccountStatus(id, status, reason)
    setBusyId('')
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="page-title">Users</h1>
          <p className="mt-1 text-sm text-muted">Donor accounts from the live registry. Suspended donors cannot receive or accept requests.</p>
        </div>
        <input
          className="input max-w-xs"
          placeholder="Search name, email, blood group"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <div className="flex flex-wrap gap-2">
        {FILTERS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setFilter(item.id)}
            className={`rounded-full px-3 py-1.5 text-sm font-semibold ${
              filter === item.id ? 'bg-ebm-700 text-white' : 'bg-white text-muted ring-1 ring-black/5'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      <section className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-surface text-xs uppercase tracking-wide text-muted">
              <tr>
                {['Donor', 'Blood group', 'City', 'Units', 'Joined', 'Status', 'Actions'].map((heading) => (
                  <th key={heading} className="px-5 py-3 font-semibold">{heading}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td className="px-5 py-10 text-center text-muted" colSpan={7}>
                    No donor accounts match this view.
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="border-t border-black/5 hover:bg-ebm-50/40">
                    <td className="px-5 py-4">
                      <p className="font-semibold">{user.fullName || '—'}</p>
                      <p className="text-xs text-muted">{user.email}</p>
                    </td>
                    <td className="px-5 py-4">
                      {user.bloodGroup ? <BloodBadge type={user.bloodGroup} size="sm" /> : '—'}
                    </td>
                    <td className="px-5 py-4">{user.city || '—'}</td>
                    <td className="px-5 py-4">{donationCountByDonor[user.id] || 0}</td>
                    <td className="px-5 py-4 text-muted">{relativeTime(user.createdAt) || formatLongDate(user.createdAt)}</td>
                    <td className="px-5 py-4">
                      <StatusPill status={accountStatusLabel(user.accountStatus)} />
                    </td>
                    <td className="px-5 py-4">
                      {user.accountStatus === 'suspended' ? (
                        <button
                          type="button"
                          className="btn-success !px-3 !py-1.5 text-xs"
                          disabled={busyId === user.id}
                          onClick={() => run(user.id, 'active')}
                        >
                          Reactivate
                        </button>
                      ) : (
                        <button
                          type="button"
                          className="btn-outline !px-3 !py-1.5 text-xs"
                          disabled={busyId === user.id}
                          onClick={() => run(user.id, 'suspended', 'Suspended by administrator')}
                        >
                          Suspend
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
