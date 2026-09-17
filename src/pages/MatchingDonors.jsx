import { useNavigate } from 'react-router-dom'
import DonorCard from '../components/DonorCard'
import { useApp } from '../context/AppContext'

export default function MatchingDonors() {
  const { matchingDonors, currentRequest, showAllDonors, setShowAllDonors, selectDonor } = useApp()
  const navigate = useNavigate()
  const visible = showAllDonors ? matchingDonors : matchingDonors.slice(0, 6)

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="page-title">Matching Donors Found ({matchingDonors.length})</h1>
          <p className="mt-1 text-sm text-muted">
            Compatible {currentRequest?.bloodGroup} donors near {currentRequest?.hospitalLocation || currentRequest?.hospital || 'your city'}.
          </p>
        </div>
        <button type="button" className="btn-outline" onClick={() => navigate('/request')}>
          Edit request
        </button>
      </div>

      {visible.length === 0 ? (
        <div className="card p-8 text-center text-sm text-muted">
          No compatible donors yet. Submit a request or wait for donors to join.
        </div>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {visible.map((donor) => (
            <div key={donor.id} onClick={() => selectDonor(donor.id)}>
              <DonorCard donor={donor} />
            </div>
          ))}
        </div>
      )}

      {!showAllDonors && matchingDonors.length > 6 ? (
        <div className="mt-6 text-center">
          <button
            type="button"
            className="text-sm font-semibold text-ebm-700 hover:underline"
            onClick={() => setShowAllDonors(true)}
          >
            View more donors
          </button>
        </div>
      ) : null}
    </div>
  )
}
