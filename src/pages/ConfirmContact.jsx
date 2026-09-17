import { MessageCircle, Phone } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { Avatar, BloodBadge } from '../components/ui'

export default function ConfirmContact() {
  const { id } = useParams()
  const { donors, currentRequest, selectedDonor } = useApp()
  const navigate = useNavigate()
  const donor = donors.find((d) => d.id === id) || selectedDonor

  if (!donor) {
    return (
      <div className="card mx-auto max-w-xl p-6">
        <h1 className="page-title">Confirm & Contact</h1>
        <p className="mt-2 text-sm text-muted">Select a donor first.</p>
        <button type="button" className="btn-primary mt-4" onClick={() => navigate('/matches')}>
          Back to matches
        </button>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="page-title">Confirm & Contact</h1>
      <p className="mt-1 text-sm text-muted">Reach the donor now, then track the request live.</p>

      <div className="card mt-6 p-6">
        <div className="flex items-center gap-4">
          <Avatar name={donor.name} src={donor.avatar} size="lg" />
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold">{donor.name}</h2>
              <BloodBadge type={donor.bloodGroup} />
            </div>
            <p className="mt-1 text-sm text-muted">{donor.contact}</p>
            <p className="text-sm text-muted">{donor.location}</p>
          </div>
        </div>

        <div className="mt-6 rounded-xl bg-surface p-4 text-sm">
          <p className="font-semibold">Suggested message</p>
          <p className="mt-2 text-muted">
            Hello {donor.name}, we have an emergency {currentRequest?.bloodGroup} request for {currentRequest?.patient} at{' '}
            {currentRequest?.hospital}. {currentRequest?.units} unit(s) needed by {currentRequest?.neededBy}. Can you donate today?
          </p>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <a href={`tel:${(donor.contact || '').replace(/\s/g, '')}`} className="btn-primary">
            <Phone className="h-4 w-4" />
            Call Donor
          </a>
          <a href={`sms:${(donor.contact || '').replace(/\s/g, '')}`} className="btn-outline">
            <MessageCircle className="h-4 w-4" />
            Send SMS
          </a>
        </div>

        <button type="button" className="btn-primary mt-6 w-full py-4" onClick={() => navigate('/request-status')}>
          Continue to Request Status
        </button>
        <button type="button" className="btn-outline mt-3 w-full" onClick={() => navigate('/donation')}>
          Go to donation step
        </button>
      </div>
    </div>
  )
}
