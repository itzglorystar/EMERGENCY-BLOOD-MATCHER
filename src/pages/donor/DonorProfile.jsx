import { useMemo, useState } from 'react'
import { Avatar, BloodBadge, StatusPill } from '../../components/ui'
import { useApp } from '../../context/AppContext'
import { addMonths, formatLongDate } from '../../utils/roles'

export default function DonorProfile() {
  const { user, updateProfile, setAvailability } = useApp()
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState(user)
  const canDonateAfter = useMemo(
    () => addMonths((editing ? form.lastDonation : user.lastDonation) || '2025-02-12', 3),
    [editing, form.lastDonation, user.lastDonation],
  )

  const save = (e) => {
    e.preventDefault()
    updateProfile({
      ...form,
      bloodGroup: user.bloodGroup,
      available: form.available,
    })
    setEditing(false)
  }

  const fields = [
    ['fullName', 'Full Name', 'text'],
    ['email', 'Email', 'email'],
    ['phone', 'Phone', 'text'],
    ['gender', 'Gender', 'text'],
    ['dateOfBirth', 'Date of Birth', 'date'],
    ['weight', 'Weight (kg)', 'number'],
    ['lastDonation', 'Last Donation', 'date'],
    ['emergencyContact', 'Emergency Contact', 'text'],
    ['address', 'Address', 'text'],
  ]

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between gap-3">
        <h1 className="page-title">Profile</h1>
        {!editing ? (
          <button type="button" className="btn-primary" onClick={() => { setForm(user); setEditing(true) }}>
            Edit Profile
          </button>
        ) : null}
      </div>

      <form onSubmit={save} className="card mt-6 p-6">
        <div className="mb-6 flex items-center gap-4 border-b border-black/5 pb-6">
          <Avatar name={user.fullName} src={user.avatar} size="lg" />
          <div>
            <p className="text-xl font-bold">{user.fullName}</p>
            <p className="text-sm text-muted">{user.email}</p>
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          {fields.map(([key, label, type]) => (
            <div key={key} className={key === 'address' ? 'md:col-span-2' : ''}>
              <label className="label">{label}</label>
              {editing ? (
                <input
                  className="input"
                  type={type}
                  value={form[key] ?? ''}
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                />
              ) : (
                <div className="flex min-h-11 items-center rounded-xl bg-surface px-4 text-sm font-medium">
                  {key === 'dateOfBirth' ? formatLongDate(user.dateOfBirth) : key === 'lastDonation' ? formatLongDate(user.lastDonation) : key === 'weight' ? `${user.weight} kg` : user[key]}
                </div>
              )}
            </div>
          ))}

          <div>
            <label className="label">Blood Group</label>
            <div className="flex h-11 items-center rounded-xl bg-surface px-4">
              <BloodBadge type={user.bloodGroup} size="sm" />
              <span className="ml-2 text-xs text-muted">Fixed — not editable</span>
            </div>
          </div>

          <div>
            <label className="label">Availability</label>
            <button
              type="button"
              className="flex h-11 w-full items-center rounded-xl bg-surface px-4"
              onClick={() => {
                if (editing) setForm({ ...form, available: !form.available })
                else setAvailability(!user.available)
              }}
            >
              <StatusPill status={(editing ? form.available : user.available) !== false ? 'Available' : 'Unavailable'} />
            </button>
          </div>

          <div className="md:col-span-2">
            <label className="label">Can donate after</label>
            <div className="flex h-11 items-center rounded-xl bg-surface px-4 text-sm font-medium">
              {formatLongDate(canDonateAfter)}
              <span className="ml-2 text-xs text-muted">(last donation + 3 months)</span>
            </div>
          </div>
        </div>

        {editing ? (
          <div className="mt-6 flex justify-end gap-2">
            <button type="button" className="btn-ghost" onClick={() => setEditing(false)}>
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              Save changes
            </button>
          </div>
        ) : null}
      </form>
    </div>
  )
}
