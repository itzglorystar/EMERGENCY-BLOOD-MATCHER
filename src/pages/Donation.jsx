import { Building2, CheckCircle2, Clock, Navigation } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { Avatar, BloodBadge } from '../components/ui'

export default function Donation() {
  const { selectedDonor, currentRequest, confirmDonation } = useApp()
  const navigate = useNavigate()

  if (!selectedDonor) {
    return (
      <div className="card mx-auto max-w-xl p-6">
        <h1 className="page-title">Donation</h1>
        <p className="mt-2 text-sm text-muted">Select a donor before starting the donation step.</p>
        <button type="button" className="btn-primary mt-4" onClick={() => navigate('/matches')}>
          Back to matches
        </button>
      </div>
    )
  }

  const start = () => {
    confirmDonation()
    navigate('/request-status')
  }

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="page-title">Donation</h1>
      <p className="mt-1 text-sm text-muted">Coordinate the donation so the patient receives blood on time.</p>

      <div className="card mt-6 p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Avatar name={selectedDonor.name} src={selectedDonor.avatar} />
            <div>
              <p className="font-bold">{selectedDonor.name}</p>
              <p className="text-sm text-muted">Donor en route / available</p>
            </div>
          </div>
          <BloodBadge type={selectedDonor.bloodGroup} size="lg" />
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl bg-surface p-4">
            <Building2 className="h-4 w-4 text-ebm-700" />
            <p className="mt-2 text-xs font-semibold uppercase text-muted">Hospital</p>
            <p className="font-semibold">{currentRequest?.hospital}</p>
          </div>
          <div className="rounded-xl bg-surface p-4">
            <Clock className="h-4 w-4 text-ebm-700" />
            <p className="mt-2 text-xs font-semibold uppercase text-muted">Needed by</p>
            <p className="font-semibold">{currentRequest?.neededBy}</p>
          </div>
        </div>

        <ul className="mt-6 space-y-3 text-sm">
          <li className="flex items-center gap-2 text-emerald-700">
            <CheckCircle2 className="h-4 w-4" /> Donor contacted and confirmed
          </li>
          <li className="flex items-center gap-2 text-ink">
            <Navigation className="h-4 w-4 text-ebm-700" /> Meet at {currentRequest?.hospital}
          </li>
          <li className="flex items-center gap-2 text-ink">
            <Clock className="h-4 w-4 text-ebm-700" /> Target: {currentRequest?.units} unit(s) of {currentRequest?.bloodGroup}
          </li>
        </ul>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <button type="button" className="btn-primary flex-1" onClick={start}>
            Mark donation in progress
          </button>
          <button type="button" className="btn-outline flex-1" onClick={() => navigate('/save-life')}>
            Complete & save life
          </button>
        </div>
      </div>
    </div>
  )
}
