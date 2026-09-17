import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import RoleToggle from '../components/RoleToggle'
import WelcomeSlider from '../components/WelcomeSlider'
import { BLOOD_GROUPS } from '../data/constants'
import { useApp } from '../context/AppContext'
import { homePath } from '../utils/roles'

export default function Register() {
  const { isAuthenticated, authLoading, user, register } = useApp()
  const navigate = useNavigate()
  const [role, setRole] = useState('donor')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    bloodGroup: 'O+',
    city: 'Yaoundé',
    address: '',
    password: '',
  })

  if (authLoading) {
    return <div className="grid min-h-screen place-items-center text-sm font-medium text-muted">Loading EBM…</div>
  }
  if (isAuthenticated) return <Navigate to={homePath(user?.role, user?.accountStatus)} replace />

  const onSubmit = async (e) => {
    e.preventDefault()
    setBusy(true)
    setError('')
    const created = await register({
      role,
      fullName: form.fullName || (role === 'hospital' ? 'New Hospital' : 'New Donor'),
      email: form.email,
      phone: form.phone,
      bloodGroup: form.bloodGroup,
      city: form.city,
      address: form.address,
      password: form.password,
    })
    setBusy(false)
    if (!created.ok) {
      setError(created.error || 'Could not create account.')
      return
    }
    if (created.needsConfirm) {
      setError(created.error)
      return
    }
    navigate(homePath(created.role, created.accountStatus))
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <WelcomeSlider className="h-56 w-full sm:h-72 lg:h-screen" />
      <section className="flex items-center justify-center bg-white px-6 py-12">
        <form className="w-full max-w-md space-y-4" onSubmit={onSubmit}>
          <h2 className="text-3xl font-extrabold">Create account</h2>
          <RoleToggle value={role} onChange={setRole} />
          <div>
            <label className="label">{role === 'hospital' ? 'Hospital name' : 'Full name'}</label>
            <input className="input" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} required />
          </div>
          <div>
            <label className="label">Email</label>
            <input type="email" className="input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          </div>
          <div>
            <label className="label">Phone</label>
            <input className="input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+237 6XX XXX XXX" />
          </div>
          {role === 'donor' ? (
            <div>
              <label className="label">Blood group</label>
              <select className="input" value={form.bloodGroup} onChange={(e) => setForm({ ...form, bloodGroup: e.target.value })}>
                {BLOOD_GROUPS.map((g) => (
                  <option key={g}>{g}</option>
                ))}
              </select>
            </div>
          ) : (
            <>
              <div>
                <label className="label">City</label>
                <input className="input" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} required />
              </div>
              <div>
                <label className="label">Hospital address</label>
                <input className="input" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Street, neighbourhood" required />
              </div>
              <p className="rounded-xl bg-amber-50 px-3 py-2 text-xs font-medium text-amber-800">
                Hospital accounts stay pending until an EBM administrator verifies and approves them.
              </p>
            </>
          )}
          <div>
            <label className="label">Password</label>
            <input type="password" className="input" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required minLength={6} />
          </div>
          {error ? <p className="text-sm font-medium text-ebm-700">{error}</p> : null}
          <button className="btn-primary w-full" type="submit" disabled={busy}>
            {busy ? 'Creating account…' : 'Register'}
          </button>
          <p className="text-center text-sm text-muted">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-ebm-700 hover:underline">
              Login
            </Link>
          </p>
        </form>
      </section>
    </div>
  )
}
