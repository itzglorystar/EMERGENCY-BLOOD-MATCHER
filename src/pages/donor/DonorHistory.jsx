import { BloodBadge, StatusPill } from '../../components/ui'
import { useApp } from '../../context/AppContext'

export default function DonorHistory() {
  const { donations } = useApp()

  return (
    <div>
      <h1 className="page-title">Donation History</h1>
      <p className="mt-1 text-sm text-muted">Completed donations linked to your donor profile.</p>
      <div className="card mt-6 overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-surface text-xs uppercase tracking-wide text-muted">
            <tr>
              {['Ref', 'Date', 'Blood Group', 'Units', 'Hospital', 'Status'].map((h) => (
                <th key={h} className="px-5 py-3 font-semibold">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {donations.length === 0 ? (
              <tr>
                <td className="px-5 py-8 text-center text-sm text-muted" colSpan={6}>
                  No donations recorded yet.
                </td>
              </tr>
            ) : (
              donations.map((d) => (
              <tr key={d.ref} className="border-t border-black/5 hover:bg-ebm-50/40">
                <td className="px-5 py-3 font-mono text-xs font-semibold">{d.ref}</td>
                <td className="px-5 py-3">{d.date}</td>
                <td className="px-5 py-3"><BloodBadge type={d.bloodGroup} size="sm" /></td>
                <td className="px-5 py-3">{d.units}</td>
                <td className="px-5 py-3">{d.hospital}</td>
                <td className="px-5 py-3"><StatusPill status={d.status} /></td>
              </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
