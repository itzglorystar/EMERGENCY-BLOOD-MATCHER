import { MapPin, Phone } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { maskPatientName } from '../utils/roles'
import { BloodBadge, StatusPill } from './ui'

export default function IncomingRequestCard({ request }) {
  const { user, respondToRequest } = useApp()
  const decision = request.donorDecision?.[user.id]
  const accepted = decision === 'accepted'
  const declined = decision === 'declined'
  const available = user.available !== false

  return (
    <article className="card p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-bold text-ink">
            Patient {accepted ? request.patient : maskPatientName(request.patient)}
          </p>
          <p className="mt-1 text-sm text-muted">{request.hospital}</p>
        </div>
        <BloodBadge type={request.bloodGroup} />
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
        <span className="font-semibold">{request.units} Units</span>
        <StatusPill status={request.urgency} />
        <span className="inline-flex items-center gap-1 text-xs font-medium text-ebm-700">
          <MapPin className="h-3.5 w-3.5" />
          {Number(request.distanceKm || 0).toFixed(1)} km
        </span>
        {accepted ? <StatusPill status="Confirmed" /> : null}
        {declined ? <StatusPill status="Declined" /> : null}
      </div>

      {accepted ? (
        <div className="mt-4 rounded-xl bg-emerald-50 p-4 text-sm">
          <p className="font-semibold text-emerald-800">Requester contact</p>
          <p className="mt-1 flex items-center gap-2 text-emerald-900">
            <Phone className="h-4 w-4" />
            {request.hospitalContact}
          </p>
          <p className="mt-1 flex items-center gap-2 text-emerald-900">
            <MapPin className="h-4 w-4" />
            {request.hospitalLocation}
          </p>
        </div>
      ) : null}

      {!accepted && !declined ? (
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            className="btn-success"
            disabled={!available}
            onClick={() => respondToRequest(request.id, 'accepted')}
          >
            Accept
          </button>
          <button type="button" className="btn-muted" onClick={() => respondToRequest(request.id, 'declined')}>
            Decline
          </button>
          {!available ? (
            <p className="w-full text-xs text-muted">Turn on availability to accept requests.</p>
          ) : null}
        </div>
      ) : null}
    </article>
  )
}
