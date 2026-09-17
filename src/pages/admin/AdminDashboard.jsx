import { Activity, Building2, ClipboardList, Droplets, ShieldCheck, Users } from 'lucide-react'
import { Link } from 'react-router-dom'
import { BloodBadge, StatCard, StatusPill } from '../../components/ui'
import { relativeTime } from '../../data/constants'
import { useApp } from '../../context/AppContext'
import { accountStatusLabel, formatLongDate, totalUnits } from '../../utils/roles'

export default function AdminDashboard() {
  const { directory, requests, donations, setAccountStatus } = useApp()
  const hospitals = directory.filter((item) => item.role === 'hospital')
  const donors = directory.filter((item) => item.role === 'donor')
  const pending = hospitals.filter((item) => item.accountStatus === 'pending')
  const activeHospitals = hospitals.filter((item) => item.accountStatus === 'active')
  const activeRequests = requests.filter((item) => item.status === 'Active' || item.status === 'Matched')
  const unitsGiven = totalUnits(donations)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">Admin overview</h1>
        <p className="mt-1 text-sm text-muted">Live hospital verification, users, and matching activity.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={ShieldCheck} label="Pending hospitals" value={pending.length} subtitle="Awaiting verification" tone="amber" />
        <StatCard icon={Building2} label="Verified hospitals" value={activeHospitals.length} subtitle="Approved to request blood" tone="green" />
        <StatCard icon={Users} label="Registered donors" value={donors.length} subtitle="Donor accounts on EBM" tone="blue" />
        <StatCard icon={Droplets} label="Units recorded" value={unitsGiven} subtitle={`${activeRequests.length} live requests`} tone="red" />
      </div>

      <section className="card overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4">
          <div>
            <h2 className="font-bold">Hospitals awaiting approval</h2>
            <p className="text-sm text-muted">Only an administrator can verify these accounts.</p>
          </div>
          <Link to="/admin/hospitals" className="text-sm font-semibold text-ebm-700 hover:underline">
            Manage hospitals
          </Link>
        </div>
        {pending.length === 0 ? (
          <p className="px-5 pb-6 text-sm text-muted">No hospital applications waiting for review.</p>
        ) : (
          <div className="divide-y divide-black/5">
            {pending.slice(0, 5).map((hospital) => (
              <div key={hospital.id} className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-semibold">{hospital.fullName}</p>
                  <p className="text-sm text-muted">{hospital.email} · {hospital.city || 'Cameroon'}</p>
                  <p className="mt-1 text-xs text-muted">Submitted {relativeTime(hospital.createdAt) || formatLongDate(hospital.createdAt)}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button type="button" className="btn-success !px-3 !py-1.5 text-xs" onClick={() => setAccountStatus(hospital.id, 'active')}>
                    Approve
                  </button>
                  <Link to="/admin/hospitals" className="btn-outline !px-3 !py-1.5 text-xs">
                    Review
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="card overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4">
            <h2 className="font-bold">Recent users</h2>
            <Link to="/admin/users" className="text-sm font-semibold text-ebm-700 hover:underline">
              View all
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-surface text-xs uppercase tracking-wide text-muted">
                <tr>
                  {['Name', 'Role', 'Status', 'Joined'].map((heading) => (
                    <th key={heading} className="px-5 py-3 font-semibold">{heading}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {directory.filter((item) => item.role !== 'admin').slice(0, 6).map((item) => (
                  <tr key={item.id} className="border-t border-black/5">
                    <td className="px-5 py-3">
                      <p className="font-semibold">{item.fullName || '—'}</p>
                      <p className="text-xs text-muted">{item.email}</p>
                    </td>
                    <td className="px-5 py-3 capitalize">{item.role}</td>
                    <td className="px-5 py-3">
                      <StatusPill status={accountStatusLabel(item.accountStatus)} />
                    </td>
                    <td className="px-5 py-3 text-muted">{relativeTime(item.createdAt) || formatLongDate(item.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="card overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4">
            <h2 className="font-bold">Live requests</h2>
            <Link to="/admin/requests" className="text-sm font-semibold text-ebm-700 hover:underline">
              View all
            </Link>
          </div>
          {requests.length === 0 ? (
            <p className="px-5 pb-6 text-sm text-muted">No blood requests have been created yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-surface text-xs uppercase tracking-wide text-muted">
                  <tr>
                    {['Request', 'Hospital', 'Group', 'Status'].map((heading) => (
                      <th key={heading} className="px-5 py-3 font-semibold">{heading}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {requests.slice(0, 6).map((request) => (
                    <tr key={request.id} className="border-t border-black/5">
                      <td className="px-5 py-3 font-mono text-xs font-semibold">{request.publicId}</td>
                      <td className="px-5 py-3">{request.hospital}</td>
                      <td className="px-5 py-3">
                        <BloodBadge type={request.bloodGroup} size="sm" />
                      </td>
                      <td className="px-5 py-3">
                        <StatusPill status={request.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>

      <section className="card flex items-center gap-3 p-5 text-sm text-muted">
        <Activity className="h-4 w-4 text-ebm-700" />
        All figures are loaded from the live EBM database. Unverified hospitals cannot create requests or see donors.
      </section>
    </div>
  )
}
