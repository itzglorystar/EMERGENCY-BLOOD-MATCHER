import { BloodBadge, StatusPill } from '../components/ui'
import { useApp } from '../context/AppContext'

export default function BloodStock() {
  const { bloodStock } = useApp()

  return (
    <div>
      <h1 className="page-title">Blood Stock</h1>
      <p className="mt-1 text-sm text-muted">Live inventory snapshot across partner hospitals in Cameroon.</p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {bloodStock.length === 0 ? (
          <div className="card p-6 text-sm text-muted sm:col-span-2 xl:col-span-4">
            No blood stock entries yet. Inventory will appear here after hospitals add it.
          </div>
        ) : (
          bloodStock.map((row) => (
          <article key={row.id || row.type} className="card p-5 transition hover:-translate-y-0.5 hover:shadow-md">
            <div className="flex items-center justify-between">
              <BloodBadge type={row.type} size="lg" />
              <StatusPill status={row.status} />
            </div>
            <p className="mt-4 text-3xl font-bold">{row.units}</p>
            <p className="text-xs text-muted">units available</p>
            <p className="mt-3 text-sm font-medium">{row.hospital}</p>
          </article>
          ))
        )}
      </div>
    </div>
  )
}
