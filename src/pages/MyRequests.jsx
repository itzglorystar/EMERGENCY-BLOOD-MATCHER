import { useNavigate } from 'react-router-dom'
import { BloodBadge, StatusPill } from '../components/ui'
import { useApp } from '../context/AppContext'

export default function MyRequests() {
  const { requests, setCurrentRequestId } = useApp()
  const navigate = useNavigate()

  return (
    <div>
      <h1 className="page-title">My Requests</h1>
      <p className="mt-1 text-sm text-muted">Every blood request you have submitted through EBM.</p>
      <div className="card mt-6 overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-surface text-xs uppercase tracking-wide text-muted">
            <tr>
              {['Request ID', 'Patient', 'Blood Group', 'Units', 'Hospital', 'Needed By', 'Status', 'Action'].map((h) => (
                <th key={h} className="px-5 py-3 font-semibold">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {requests.length === 0 ? (
              <tr>
                <td className="px-5 py-8 text-center text-sm text-muted" colSpan={8}>
                  No blood requests yet.
                </td>
              </tr>
            ) : (
              requests.map((r) => (
              <tr key={r.id} className="border-t border-black/5 hover:bg-ebm-50/40">
                <td className="px-5 py-3 font-mono text-xs font-semibold">{r.publicId || r.id}</td>
                <td className="px-5 py-3">{r.patient}</td>
                <td className="px-5 py-3"><BloodBadge type={r.bloodGroup} size="sm" /></td>
                <td className="px-5 py-3">{r.units}</td>
                <td className="px-5 py-3">{r.hospital}</td>
                <td className="px-5 py-3">{r.neededBy}</td>
                <td className="px-5 py-3"><StatusPill status={r.status} /></td>
                <td className="px-5 py-3">
                  <button
                    type="button"
                    className="btn-primary !px-3 !py-1.5 text-xs"
                    onClick={() => {
                      setCurrentRequestId(r.id)
                      navigate('/request-status')
                    }}
                  >
                    View
                  </button>
                </td>
              </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
