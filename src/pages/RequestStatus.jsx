import { HeartPulse, MapPin } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { BloodBadge, StatusPill } from '../components/ui'

const PINS = [
  { left: '28%', top: '38%', color: 'bg-emerald-500', label: 'Available' },
  { left: '46%', top: '32%', color: 'bg-emerald-500', label: 'Available' },
  { left: '58%', top: '52%', color: 'bg-amber-400', label: 'In progress' },
  { left: '37%', top: '62%', color: 'bg-ebm-700', label: 'Confirmed' },
  { left: '68%', top: '40%', color: 'bg-emerald-500', label: 'Available' },
  { left: '50%', top: '48%', color: 'bg-white ring-2 ring-ebm-700', label: 'Hospital' },
]

export default function RequestStatus() {
  const { currentRequest, cancelRequest, matchingDonors } = useApp()
  const navigate = useNavigate()
  const req = currentRequest

  const cancel = () => {
    cancelRequest()
    navigate('/dashboard')
  }

  return (
    <div className="space-y-6">
      <h1 className="page-title">Request Summary</h1>

      <div className="grid gap-5 lg:grid-cols-2">
        <section className="card p-6">
          <h2 className="text-lg font-bold">Request Summary</h2>
          <dl className="mt-4 grid gap-3 sm:grid-cols-2">
            <Item label="Patient" value={req?.patient} />
            <Item label="Blood Group" value={<BloodBadge type={req?.bloodGroup} />} />
            <Item label="Units" value={req?.units} />
            <Item label="Hospital" value={req?.hospital} />
            <Item label="Urgency" value={<StatusPill status={req?.urgency} />} />
            <Item label="Needed By" value={req?.neededBy} />
          </dl>
        </section>

        <section className="card p-6">
          <h2 className="text-lg font-bold">Live Request Tracking</h2>
          <dl className="mt-4 grid gap-3 sm:grid-cols-2">
            <Item label="Request ID" value={<span className="font-mono text-sm">{req?.publicId || req?.id}</span>} />
            <Item
              label="Status"
              value={req?.status === 'Completed' ? 'Donation complete' : 'Searching for donors...'}
            />
            <Item label="Matches Found" value={req?.matchesFound ?? matchingDonors.length} />
            <Item label="Confirmed" value={req?.confirmed ?? 0} />
            <Item label="In Progress" value={req?.inProgress ?? 0} />
            <Item label="Completed" value={req?.completed ?? 0} />
          </dl>
        </section>
      </div>

      <section className="card flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="rounded-xl bg-ebm-50 p-3 text-ebm-700">
            <HeartPulse className="heartbeat h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-bold">Request Status</h2>
              <StatusPill status={req?.status === 'Cancelled' ? 'Cancelled' : 'Active'} />
            </div>
            <p className="mt-1 text-sm text-muted">We are searching for the best matches near you.</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" className="btn-outline" onClick={() => navigate('/donation')}>
            Go to donation
          </button>
          <button type="button" className="btn-primary" onClick={() => navigate('/save-life')}>
            Complete & save life
          </button>
          <button type="button" className="rounded-xl bg-ebm-50 px-4 py-2.5 text-sm font-semibold text-ebm-700 hover:bg-red-100" onClick={cancel}>
            Cancel Request
          </button>
        </div>
      </section>

      <section className="card overflow-hidden">
        <div className="flex items-center justify-between border-b border-black/5 px-6 py-4">
          <h2 className="font-bold">Live map</h2>
          <p className="flex items-center gap-1 text-xs text-muted">
            <MapPin className="h-3.5 w-3.5" /> Yaoundé, Cameroon
          </p>
        </div>
        <div className="relative h-80 bg-[#d7e4d2]">
          <div className="absolute inset-6 rounded-2xl bg-[#c5d6bf] shadow-inner">
            <div className="absolute left-[18%] top-[20%] h-24 w-40 rounded-full bg-[#b7c9b0]" />
            <div className="absolute right-[12%] top-[28%] h-32 w-28 rounded-full bg-[#adc3a8]" />
            <div className="absolute bottom-[18%] left-[30%] h-20 w-52 rounded-3xl bg-[#b4cbb0]" />
            <div className="absolute left-[12%] top-[45%] h-1.5 w-2/3 rounded bg-white/50" />
            <div className="absolute left-[40%] top-[18%] h-2/3 w-1.5 rounded bg-white/40" />
            {PINS.map((pin) => (
              <div key={pin.label} className="absolute" style={{ left: pin.left, top: pin.top }}>
                <span className={`absolute inline-flex h-3 w-3 rounded-full ${pin.color} opacity-60 pin-pulse`} />
                <span className={`relative inline-flex h-3 w-3 rounded-full ${pin.color}`} title={pin.label} />
              </div>
            ))}
          </div>
        </div>
        <div className="flex flex-wrap gap-4 px-6 py-4 text-xs font-medium">
          <Legend color="bg-emerald-500" label="Available Donors" />
          <Legend color="bg-amber-400" label="In Progress" />
          <Legend color="bg-ebm-700" label="Confirmed" />
        </div>
      </section>
    </div>
  )
}

function Item({ label, value }) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wide text-muted">{label}</dt>
      <dd className="mt-1 text-sm font-semibold text-ink">{value}</dd>
    </div>
  )
}

function Legend({ color, label }) {
  return (
    <span className="inline-flex items-center gap-2">
      <span className={`h-2.5 w-2.5 rounded-full ${color}`} />
      {label}
    </span>
  )
}
