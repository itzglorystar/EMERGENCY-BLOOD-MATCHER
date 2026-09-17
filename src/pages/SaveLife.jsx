import { Heart, PartyPopper } from 'lucide-react'
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'

export default function SaveLife() {
  const { currentRequest, completeRequest, selectedDonor } = useApp()
  const navigate = useNavigate()

  useEffect(() => {
    completeRequest()
    // complete once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="mx-auto max-w-xl text-center">
      <div className="card p-10">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-ebm-50 text-ebm-700">
          <Heart className="heartbeat h-8 w-8 fill-current" />
        </div>
        <p className="mt-4 text-xs font-bold uppercase tracking-[0.22em] text-ebm-700">FIND. MATCH. SAVE.</p>
        <h1 className="mt-3 text-3xl font-extrabold">You helped save a life.</h1>
        <p className="mt-3 text-sm text-muted">
          {selectedDonor?.name || 'A donor'}&apos;s {currentRequest?.bloodGroup} donation for {currentRequest?.patient} at{' '}
          {currentRequest?.hospital} is recorded as complete.
        </p>
        <div className="mt-6 flex items-center justify-center gap-2 text-sm font-semibold text-emerald-700">
          <PartyPopper className="h-4 w-4" />
          Request {currentRequest?.publicId || currentRequest?.id} marked completed
        </div>
        <button type="button" className="btn-primary mt-8 w-full" onClick={() => navigate('/dashboard')}>
          Back to dashboard
        </button>
      </div>
    </div>
  )
}
