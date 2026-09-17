import { Building2, Droplet } from 'lucide-react'

export default function RoleToggle({ value, onChange }) {
  return (
    <div className="grid grid-cols-2 gap-2 rounded-2xl bg-surface p-1.5">
      <button
        type="button"
        onClick={() => onChange('hospital')}
        className={`flex items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all ${
          value === 'hospital' ? 'bg-white text-ebm-700 shadow-sm' : 'text-muted hover:text-ink'
        }`}
      >
        <Building2 className="h-4 w-4" />
        Hospital
      </button>
      <button
        type="button"
        onClick={() => onChange('donor')}
        className={`flex items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all ${
          value === 'donor' ? 'bg-white text-ebm-700 shadow-sm' : 'text-muted hover:text-ink'
        }`}
      >
        <Droplet className="h-4 w-4" />
        Donor
      </button>
    </div>
  )
}
