import { useMemo, useState } from 'react'
import { StatusPill } from '../../components/ui'
import { relativeTime } from '../../data/constants'
import { useApp } from '../../context/AppContext'
import { accountStatusLabel, formatLongDate } from '../../utils/roles'

const FILTERS = [
  { id: 'pending', label: 'Pending' },
  { id: 'active', label: 'Verified' },
  { id: 'rejected', label: 'Rejected' },
  { id: 'suspended', label: 'Suspended' },
  { id: 'all', label: 'All' },
]

export default function AdminHospitals() {
  const { directory, setAccountStatus } = useApp()
  const [filter, setFilter] = useState('pending')
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState(null)
  const [reason, setReason] = useState('')
  const [busyId, setBusyId] = useState('')

  const hospitals = useMemo(() => {
    const needle = query.trim().toLowerCase()
    return directory
      .filter((item) => item.role === 'hospital')
      .filter((item) => filter === 'all' || item.accountStatus === filter)
      .filter((item) => {
        if (!needle) return true
        return [item.fullName, item.email, item.phone, item.city, item.address]
          .join(' ')
          .toLowerCase()
          .includes(needle)
      })
  }, [directory, filter, query])

  const run = async (id, status, extraReason = '') => {
    setBusyId(id)
    await setAccountStatus(id, status, extraReason)
    setBusyId('')
    if (status !== 'active') {
      setSelected(null)
      setReason('')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="page-title">Hospitals</h1>
          <p className="mt-1 text-sm text-muted">Verify new hospitals before they can use the hospital portal.</p>
        </div>
        <input
          className="input max-w-xs"
          placeholder="Search hospital, email, city"
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
                {['Hospital', 'Contact', 'Location', 'Submitted', 'Status', 'Actions'].map((heading) => (
                  <th key={heading} className="px-5 py-3 font-semibold">{heading}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {hospitals.length === 0 ? (
                <tr>
                  <td className="px-5 py-10 text-center text-muted" colSpan={6}>
                    No hospitals in this view.
                  </td>
                </tr>
              ) : (
                hospitals.map((hospital) => (
                  <tr key={hospital.id} className="border-t border-black/5 align-top hover:bg-ebm-50/40">
                    <td className="px-5 py-4">
                      <p className="font-semibold">{hospital.fullName || 'Unnamed hospital'}</p>
                      <p className="text-xs text-muted">{hospital.address || 'No address provided'}</p>
                    </td>
                    <td className="px-5 py-4">
                      <p>{hospital.email}</p>
                      <p className="text-xs text-muted">{hospital.phone || 'No phone'}</p>
                    </td>
                    <td className="px-5 py-4">{hospital.city || '—'}</td>
                    <td className="px-5 py-4 text-muted">
                      {relativeTime(hospital.createdAt) || formatLongDate(hospital.createdAt)}
                    </td>
                    <td className="px-5 py-4">
                      <StatusPill status={accountStatusLabel(hospital.accountStatus)} />
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex flex-wrap gap-2">
                        {hospital.accountStatus !== 'active' ? (
                          <button
                            type="button"
                            className="btn-success !px-3 !py-1.5 text-xs"
                            disabled={busyId === hospital.id}
                            onClick={() => run(hospital.id, 'active')}
                          >
                            {hospital.accountStatus === 'pending' ? 'Approve' : 'Activate'}
                          </button>
                        ) : (
                          <button
                            type="button"
                            className="btn-outline !px-3 !py-1.5 text-xs"
                            disabled={busyId === hospital.id}
                            onClick={() => run(hospital.id, 'suspended', 'Suspended by administrator')}
                          >
                            Suspend
                          </button>
                        )}
                        {hospital.accountStatus === 'pending' ? (
                          <button
                            type="button"
                            className="btn-ghost !px-3 !py-1.5 text-xs text-ebm-700"
                            onClick={() => { setSelected(hospital); setReason('') }}
                          >
                            Reject
                          </button>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {selected ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="card w-full max-w-md p-6">
            <h3 className="text-lg font-bold">Reject {selected.fullName}?</h3>
            <p className="mt-1 text-sm text-muted">This hospital will not be able to request blood. A reason is required.</p>
            <textarea
              className="input mt-4 h-28 py-3"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Missing licence, unverifiable contact, duplicate account…"
            />
            <div className="mt-5 flex justify-end gap-2">
              <button type="button" className="btn-ghost" onClick={() => setSelected(null)}>
                Cancel
              </button>
              <button
                type="button"
                className="btn-primary"
                disabled={!reason.trim() || busyId === selected.id}
                onClick={() => run(selected.id, 'rejected', reason)}
              >
                Reject hospital
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
