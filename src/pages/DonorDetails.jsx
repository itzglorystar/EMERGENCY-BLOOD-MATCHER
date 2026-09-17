import { Calendar, MapPin, Phone, User, Weight } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { Avatar, BloodBadge, StatusPill } from '../components/ui'

const DETAIL_FIELDS = (donor) => [
  { label: 'Age', value: donor.age ? `${donor.age} years` : '—', icon: User },
  { label: 'Gender', value: donor.gender, icon: User },
  { label: 'Last Donation', value: donor.lastDonation, icon: Calendar },
  { label: 'Weight', value: `${donor.weight} kg`, icon: Weight },
  { label: 'Contact', value: donor.contact, icon: Phone },
  { label: 'Location', value: donor.location, icon: MapPin },
  { label: 'Can Donate', value: donor.canDonate, icon: Calendar },
  { label: 'Notes', value: donor.notes, icon: User },
]

export default function DonorDetails() {
  const { id } = useParams()
  const { donors, selectDonor, contactDonor } = useApp()
  const navigate = useNavigate()
  const donor = donors.find((d) => d.id === id)

  if (!donor) {
    return (
      <div className="card max-w-xl p-6">
        <h1 className="text-xl font-bold">Donor not found</h1>
        <p className="mt-2 text-sm text-muted">Choose a match from the donor list.</p>
        <button type="button" className="btn-primary mt-4" onClick={() => navigate('/matches')}>
          Back to matches
        </button>
      </div>
    )
  }

  const onContact = () => {
    selectDonor(donor.id)
    contactDonor(donor)
    navigate(`/confirm/${donor.id}`)
  }

  return (
    <div className="max-w-4xl">
      <div className="card overflow-hidden">
        <div className="bg-gradient-to-r from-ebm-900 to-ebm-700 px-6 py-8 text-white">
          <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center">
            <Avatar name={donor.name} src={donor.avatar} size="lg" />
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl font-bold">{donor.name}</h1>
                <BloodBadge type={donor.bloodGroup} size="lg" />
              </div>
              <p className="mt-2 flex items-center gap-1 text-sm text-white/80">
                <MapPin className="h-4 w-4" />
                {Number(donor.distanceKm || 0).toFixed(1)} km away · {donor.city}
              </p>
              <div className="mt-3">
                <StatusPill status={donor.status} />
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-4 p-6 sm:grid-cols-2">
          {DETAIL_FIELDS(donor).map((item) => (
            <div key={item.label} className="rounded-xl bg-surface p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted">{item.label}</p>
              <p className="mt-1 font-semibold text-ink">{item.value}</p>
            </div>
          ))}
        </div>

        <div className="px-6 pb-6">
          <button type="button" className="btn-primary w-full py-4 text-base" onClick={onContact}>
            <Phone className="h-5 w-5" />
            Contact Donor
          </button>
        </div>
      </div>
    </div>
  )
}
