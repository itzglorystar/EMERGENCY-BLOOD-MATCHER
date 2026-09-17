import { Minus, Plus, Search } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BLOOD_GROUPS, URGENCY_LEVELS } from '../data/constants'
import { useApp } from '../context/AppContext'
import { BloodBadge } from '../components/ui'

export default function RequestBlood() {
  const { createRequest, user } = useApp()
  const navigate = useNavigate()
  const [busy, setBusy] = useState(false)
  const [form, setForm] = useState({
    patientName: '',
    bloodGroup: 'O+',
    units: 2,
    hospital: user?.fullName || '',
    urgency: 'High (Emergency)',
    neededBy: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString().slice(0, 16),
  })

  const onSubmit = async (e) => {
    e.preventDefault()
    setBusy(true)
    const created = await createRequest(form)
    setBusy(false)
    if (created) navigate('/matches')
  }

  return (
    <div>
      <h1 className="page-title">Request Blood</h1>
      <p className="mt-1 text-sm text-muted">Tell us what the patient needs. We&apos;ll match nearby compatible donors instantly.</p>

      <form onSubmit={onSubmit} className="card mt-6 max-w-3xl space-y-5 p-6">
        <div className="grid gap-5 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className="label" htmlFor="patientName">
              Patient Name
            </label>
            <input
              id="patientName"
              className="input"
              value={form.patientName}
              onChange={(e) => setForm({ ...form, patientName: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="label">Blood Group Needed</label>
            <div className="grid grid-cols-4 gap-2">
              {BLOOD_GROUPS.map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setForm({ ...form, bloodGroup: g })}
                  className={`flex items-center justify-center rounded-xl border p-2 transition-all ${
                    form.bloodGroup === g
                      ? 'border-ebm-700 bg-ebm-50 ring-2 ring-ebm-700/20'
                      : 'border-gray-200 hover:border-ebm-700/40'
                  }`}
                >
                  <BloodBadge type={g} size="sm" />
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="label">Units Needed</label>
            <div className="flex h-11 items-center overflow-hidden rounded-xl border border-gray-200 bg-white">
              <button
                type="button"
                className="flex h-full w-12 items-center justify-center text-ebm-700 transition hover:bg-ebm-50"
                onClick={() => setForm({ ...form, units: Math.max(1, form.units - 1) })}
                aria-label="Decrease units"
              >
                <Minus className="h-4 w-4" />
              </button>
              <div className="flex-1 text-center text-lg font-bold">{form.units}</div>
              <button
                type="button"
                className="flex h-full w-12 items-center justify-center text-ebm-700 transition hover:bg-ebm-50"
                onClick={() => setForm({ ...form, units: Math.min(10, form.units + 1) })}
                aria-label="Increase units"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div>
            <label className="label" htmlFor="hospital">
              Hospital / Location
            </label>
            <input
              id="hospital"
              className="input"
              value={form.hospital}
              onChange={(e) => setForm({ ...form, hospital: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="label" htmlFor="urgency">
              Urgency Level
            </label>
            <select
              id="urgency"
              className="input"
              value={form.urgency}
              onChange={(e) => setForm({ ...form, urgency: e.target.value })}
            >
              {URGENCY_LEVELS.map((u) => (
                <option key={u}>{u}</option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="label" htmlFor="neededBy">
              Needed By
            </label>
            <input
              id="neededBy"
              type="datetime-local"
              className="input"
              value={form.neededBy}
              onChange={(e) => setForm({ ...form, neededBy: e.target.value })}
              required
            />
          </div>
        </div>

        <button type="submit" className="btn-primary w-full py-4 text-base" disabled={busy}>
          <Search className="h-5 w-5" />
          {busy ? 'Finding donors…' : 'Find Matching Donors'}
        </button>
      </form>
    </div>
  )
}
