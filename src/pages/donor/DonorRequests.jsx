import IncomingRequestCard from '../../components/IncomingRequestCard'
import { useApp } from '../../context/AppContext'

export default function DonorRequests() {
  const { incomingRequests, user } = useApp()

  return (
    <div>
      <h1 className="page-title">Blood Requests</h1>
      <p className="mt-1 text-sm text-muted">
        Only requests for {user.bloodGroup} are shown. Patient identity stays masked until you accept.
      </p>
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        {incomingRequests.length === 0 ? (
          <div className="card p-6 text-sm text-muted">No matching requests right now.</div>
        ) : (
          incomingRequests.map((request) => (
            <IncomingRequestCard key={request.id} request={request} />
          ))
        )}
      </div>
    </div>
  )
}
