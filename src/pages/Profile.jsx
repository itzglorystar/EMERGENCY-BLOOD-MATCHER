import { useState } from 'react'
import { Avatar, CityInput } from '../components/ui'
import { useApp } from '../context/AppContext'

export default function Profile() {
  const { user, updateProfile } = useApp()
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState(user)

  const save = (e) => {
    e.preventDefault()
    updateProfile(form)
    setEditing(false)
  }

  const fields = [
    ['fullName', 'Hospital Name'],
    ['email', 'Email'],
    ['phone', 'Phone'],
    ['city', 'City'],
    ['address', 'Address'],
    ['emergencyContact', 'Emergency Contact'],
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
            <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-ebm-700">Hospital</p>
          </div>
        </div>
        <div className="grid gap-5 md:grid-cols-2">
          {fields.map(([key, label]) => (
            <div key={key} className={key === 'address' || key === 'fullName' ? 'md:col-span-2' : ''}>
              <label className="label">{label}</label>
              {editing ? (
                key === 'city' ? (
                  <CityInput value={form[key] ?? ''} onChange={(e) => setForm({ ...form, [key]: e.target.value })} />
                ) : (
                  <input
                    className="input"
                    value={form[key] ?? ''}
                    onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                  />
                )
              ) : (
                <div className="flex min-h-11 items-center rounded-xl bg-surface px-4 text-sm font-medium">
                  {user[key] || '—'}
                </div>
              )}
            </div>
          ))}
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
