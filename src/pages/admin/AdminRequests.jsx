import { BloodBadge, StatusPill } from '../../components/ui'
import { useApp } from '../../context/AppContext'

export default function AdminRequests() {
  const { requests } = useApp()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">Blood requests</h1>
        <p className="mt-1 text-sm text-muted">Every request created by verified hospitals, loaded from the live database.</p>
      </div>

      <section className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-surface text-xs uppercase tracking-wide text-muted">
              <tr>
                {['Request ID', 'Patient', 'Blood group', 'Units', 'Hospital', 'Needed by', 'Matches', 'Status'].map((heading) => (
                  <th key={heading} className="px-5 py-3 font-semibold">{heading}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {requests.length === 0 ? (
                <tr>
                  <td className="px-5 py-10 text-center text-muted" colSpan={8}>
                    No blood requests have been submitted yet.
                  </td>
                </tr>
              ) : (
                requests.map((request) => (
                  <tr key={request.id} className="border-t border-black/5 hover:bg-ebm-50/40">
                    <td className="px-5 py-3 font-mono text-xs font-semibold">{request.publicId}</td>
                    <td className="px-5 py-3">{request.patient}</td>
                    <td className="px-5 py-3">
                      <BloodBadge type={request.bloodGroup} size="sm" />
                    </td>
                    <td className="px-5 py-3">{request.units}</td>
                    <td className="px-5 py-3">{request.hospital}</td>
                    <td className="px-5 py-3">{request.neededBy}</td>
                    <td className="px-5 py-3">{request.matchesFound || 0}</td>
                    <td className="px-5 py-3">
                      <StatusPill status={request.status} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
