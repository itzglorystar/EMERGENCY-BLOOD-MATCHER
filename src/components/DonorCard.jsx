import { MapPin } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Avatar, BloodBadge, StatusPill } from './ui'

export default function DonorCard({ donor }) {
  return (
    <article className="card flex flex-col gap-4 p-5 transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_14px_36px_rgba(139,0,0,0.1)]">
      <div className="flex items-start gap-3">
        <Avatar name={donor.name} src={donor.avatar} />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="truncate font-semibold text-ink">{donor.name}</h3>
            <BloodBadge type={donor.bloodGroup} />
          </div>
          <p className="mt-1 flex items-center gap-1 text-sm text-muted">
            <MapPin className="h-3.5 w-3.5 text-ebm-700" />
            {donor.city}
          </p>
              <p className="mt-0.5 text-xs font-medium text-ebm-700">{Number(donor.distanceKm || 0).toFixed(1)} km away</p>
        </div>
      </div>
      <div className="flex items-center justify-between gap-2">
        <div>
          <StatusPill status={donor.status} />
          <p className="mt-1.5 text-xs text-muted">Can donate: {donor.canDonate}</p>
        </div>
        <Link to={`/donors/${donor.id}`} className="btn-primary !px-3 !py-2 text-xs">
          View Profile
        </Link>
      </div>
    </article>
  )
}
