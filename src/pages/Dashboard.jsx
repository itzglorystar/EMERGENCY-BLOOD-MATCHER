import { Activity, Droplets, HeartHandshake, Users } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { StatCard, BloodBadge, StatusPill } from '../components/ui'
import { useApp } from '../context/AppContext'

export default function Dashboard() {
  const { requests, donations, matchingDonors, setCurrentRequestId } = useApp()
  const navigate = useNavigate()
  const active = requests.filter((r) => r.status === 'Active' || r.status === 'Matched').length

  const openRequest = (id) => {
    setCurrentRequestId(id)
    navigate('/request-status')
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="mt-1 text-sm text-muted">Your emergency matching overview for Yaoundé.</p>
        </div>
        <Link to="/request" className="btn-primary">
          Request Blood
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={Activity} label="Active Requests" value={active} subtitle="Currently searching or matched" tone="red" />
        <StatCard icon={Users} label="Matches Found" value={matchingDonors.length} subtitle="Compatible donors nearby" tone="blue" />
        <StatCard icon={Droplets} label="Donations Made" value={donations.length} subtitle="Completed units given" tone="green" />
        <StatCard icon={HeartHandshake} label="Lives Impacted" value={donations.length} subtitle="Patients reached through EBM" tone="amber" />
      </div>

      <section className="card overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4">
          <h2 className="font-bold">My Recent Requests</h2>
          <Link to="/my-requests" className="text-sm font-semibold text-ebm-700 hover:underline">
            View all
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-surface text-xs uppercase tracking-wide text-muted">
              <tr>
                {['Request ID', 'Patient', 'Blood Group', 'Units', 'Hospital', 'Needed By', 'Status', 'Action'].map((h) => (
                  <th key={h} className="px-5 py-3 font-semibold">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {requests.length === 0 ? (
                <tr>
                  <td className="px-5 py-8 text-center text-sm text-muted" colSpan={8}>
                    No requests yet. Create the first blood request to start matching donors.
                  </td>
                </tr>
              ) : (
                requests.slice(0, 4).map((r) => (
                <tr key={r.id} className="border-t border-black/5 hover:bg-ebm-50/40">
                  <td className="px-5 py-3 font-mono text-xs font-semibold">{r.publicId || r.id}</td>
                  <td className="px-5 py-3">{r.patient}</td>
                  <td className="px-5 py-3">
                    <BloodBadge type={r.bloodGroup} size="sm" />
                  </td>
                  <td className="px-5 py-3">{r.units}</td>
                  <td className="px-5 py-3">{r.hospital}</td>
                  <td className="px-5 py-3">{r.neededBy}</td>
                  <td className="px-5 py-3">
                    <StatusPill status={r.status} />
                  </td>
                  <td className="px-5 py-3">
                    <button type="button" className="btn-primary !px-3 !py-1.5 text-xs" onClick={() => openRequest(r.id)}>
                      View
                    </button>
                  </td>
                </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="card overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4">
          <h2 className="font-bold">Donation History</h2>
          <Link to="/donations" className="text-sm font-semibold text-ebm-700 hover:underline">
            View all
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-surface text-xs uppercase tracking-wide text-muted">
              <tr>
                {['Ref', 'Date', 'Blood Group', 'Units', 'Hospital/Location', 'Status'].map((h) => (
                  <th key={h} className="px-5 py-3 font-semibold">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {donations.length === 0 ? (
                <tr>
                  <td className="px-5 py-8 text-center text-sm text-muted" colSpan={6}>
                    No donations recorded yet.
                  </td>
                </tr>
              ) : (
                donations.slice(0, 5).map((d) => (
                <tr key={d.ref} className="border-t border-black/5 hover:bg-ebm-50/40">
                  <td className="px-5 py-3 font-mono text-xs font-semibold">{d.ref}</td>
                  <td className="px-5 py-3">{d.date}</td>
                  <td className="px-5 py-3">
                    <BloodBadge type={d.bloodGroup} size="sm" />
                  </td>
                  <td className="px-5 py-3">{d.units}</td>
                  <td className="px-5 py-3">{d.hospital}</td>
                  <td className="px-5 py-3">
                    <StatusPill status={d.status} />
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
