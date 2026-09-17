import { Activity, Calendar, Droplets, HeartHandshake } from 'lucide-react'
import IncomingRequestCard from '../../components/IncomingRequestCard'
import { BloodBadge, StatCard, StatusPill } from '../../components/ui'
import { useApp } from '../../context/AppContext'
import {
  formatLongDate,
  isOnOrBeforeToday,
  latestDonationOn,
  nextEligibleOn,
  totalUnits,
} from '../../utils/roles'

export default function DonorDashboard() {
  const { user, donations, incomingRequests, setAvailability } = useApp()
  const available = user.available !== false
  const lastDonation = latestDonationOn(user, donations)
  const nextEligibleDate = lastDonation ? nextEligibleOn(user, lastDonation) : null
  const hasDonated = Boolean(lastDonation)
  const waiting = hasDonated && nextEligibleDate && !isOnOrBeforeToday(nextEligibleDate)
  const unitsGiven = totalUnits(donations)

  return (
    <div className="space-y-6">
      <section className="card flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="page-title">Welcome back, {user.fullName} 🩸</h1>
          <p className="mt-1 text-sm text-muted">Incoming requests are matched to your {user.bloodGroup} blood group only.</p>
        </div>
        <button
          type="button"
          onClick={() => setAvailability(!available)}
          className="text-left"
          aria-pressed={available}
        >
          <StatusPill status={available ? 'Available' : 'Unavailable'} />
          <p className={`mt-2 text-sm font-semibold ${available ? 'text-emerald-700' : 'text-muted'}`}>
            {available ? 'Available to donate' : 'You are currently unavailable'}
          </p>
        </button>
      </section>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <div className="card flex items-center justify-between p-5">
          <div>
            <p className="text-sm font-medium text-muted">Blood Group</p>
            <div className="mt-2">
              <BloodBadge type={user.bloodGroup || '—'} size="lg" />
            </div>
          </div>
          <Droplets className="h-5 w-5 text-ebm-700" />
        </div>
        <StatCard icon={Droplets} label="Total Donations" value={unitsGiven} subtitle={unitsGiven === 1 ? 'Unit recorded' : 'Units recorded'} tone="green" />
        <StatCard icon={HeartHandshake} label="Lives Impacted" value={unitsGiven} subtitle="Based on units you have given" tone="amber" />
        <StatCard
          icon={Calendar}
          label="Last Donation"
          value={hasDonated ? formatLongDate(lastDonation) : '—'}
          subtitle={hasDonated ? 'Most recent unit' : 'Never donated'}
          tone="blue"
        />
        <StatCard
          icon={Activity}
          label="Next Eligible"
          value={!hasDonated ? '—' : waiting ? formatLongDate(nextEligibleDate) : 'Eligible now'}
          subtitle={!hasDonated ? 'No donation recorded yet' : waiting ? 'Last donation + 3 months' : 'Waiting period complete'}
          tone="red"
        />
      </div>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold">Incoming Requests</h2>
          <p className="text-sm text-muted">{incomingRequests.length} matching {user.bloodGroup}</p>
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          {incomingRequests.length === 0 ? (
            <div className="card p-6 text-sm text-muted">No incoming requests for your blood group yet.</div>
          ) : (
            incomingRequests.map((request) => (
              <IncomingRequestCard key={request.id} request={request} />
            ))
          )}
        </div>
      </section>

      <section className="card overflow-hidden">
        <div className="px-5 py-4">
          <h2 className="font-bold">Donation History</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-surface text-xs uppercase tracking-wide text-muted">
              <tr>
                {['Ref', 'Date', 'Blood Group', 'Units', 'Hospital', 'Status'].map((h) => (
                  <th key={h} className="px-5 py-3 font-semibold">{h}</th>
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
                donations.map((d) => (
                  <tr key={d.ref} className="border-t border-black/5">
                    <td className="px-5 py-3 font-mono text-xs font-semibold">{d.ref}</td>
                    <td className="px-5 py-3">{d.date}</td>
                    <td className="px-5 py-3"><BloodBadge type={d.bloodGroup} size="sm" /></td>
                    <td className="px-5 py-3">{d.units}</td>
                    <td className="px-5 py-3">{d.hospital}</td>
                    <td className="px-5 py-3"><StatusPill status={d.status} /></td>
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
