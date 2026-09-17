import { Eye, EyeOff } from 'lucide-react'
import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import RoleToggle from '../components/RoleToggle'
import WelcomeSlider from '../components/WelcomeSlider'
import { useApp } from '../context/AppContext'
import { homePath } from '../utils/roles'

export default function Login() {
  const { isAuthenticated, authLoading, user, login, sendPasswordReset } = useApp()
  const navigate = useNavigate()
  const [role, setRole] = useState('hospital')
  const [showPassword, setShowPassword] = useState(false)
  const [form, setForm] = useState({ identifier: '', password: '' })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [forgotOpen, setForgotOpen] = useState(false)
  const [resetEmail, setResetEmail] = useState('')
  const [resetSent, setResetSent] = useState(false)
  const [resetError, setResetError] = useState('')

  if (authLoading) {
    return <div className="grid min-h-screen place-items-center text-sm font-medium text-muted">Loading EBM…</div>
  }
  if (isAuthenticated) return <Navigate to={homePath(user?.role)} replace />

  const switchRole = (next) => {
    setRole(next)
    setError('')
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    if (!form.identifier.trim() || !form.password.trim()) {
      setError('Please enter your email and password.')
      return
    }
    setBusy(true)
    setError('')
    const result = await login(form.identifier, form.password, role)
    setBusy(false)
    if (!result.ok) {
      setError(result.error || `Invalid ${role} credentials.`)
      return
    }
    navigate(homePath(result.role || role))
  }

  const onReset = async () => {
    setResetError('')
    if (!resetEmail.includes('@')) {
      setResetError('Enter the email for this account.')
      return
    }
    const result = await sendPasswordReset(resetEmail)
    if (!result.ok) {
      setResetError(result.error)
      return
    }
    setResetSent(true)
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <WelcomeSlider className="h-56 w-full sm:h-72 lg:h-screen" />

      <section className="flex items-center justify-center bg-white px-6 py-12">
        <div className="w-full max-w-md">
          <h2 className="text-3xl font-extrabold text-ink">Welcome Back!</h2>
          <p className="mt-2 text-sm text-muted">Choose your portal, then sign in.</p>

          <form className="mt-8 space-y-4" onSubmit={onSubmit}>
            <RoleToggle value={role} onChange={switchRole} />
            <div>
              <label className="label" htmlFor="identifier">
                Email
              </label>
              <input
                id="identifier"
                className="input"
                placeholder={role === 'hospital' ? 'hospital@email.com' : 'you@email.com'}
                value={form.identifier}
                onChange={(e) => setForm({ ...form, identifier: e.target.value })}
                autoComplete="username"
              />
            </div>
            <div>
              <label className="label" htmlFor="password">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  className="input pr-12"
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-ink"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div className="flex justify-end">
              <button
                type="button"
                className="text-sm font-semibold text-ebm-700 hover:underline"
                onClick={() => {
                  setForgotOpen(true)
                  setResetEmail(form.identifier)
                }}
              >
                Forgot password?
              </button>
            </div>
            {error ? <p className="text-sm font-medium text-ebm-700">{error}</p> : null}
            <button type="submit" className="btn-primary w-full" disabled={busy}>
              {busy ? 'Signing in…' : 'Login'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-muted">
            Don&apos;t have an account?{' '}
            <Link to="/register" className="font-semibold text-ebm-700 hover:underline">
              Register
            </Link>
          </p>
        </div>
      </section>

      {forgotOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="card w-full max-w-md p-6">
            <h3 className="text-lg font-bold">Reset password</h3>
            <p className="mt-1 text-sm text-muted">Enter your email and we&apos;ll send a reset link.</p>
            <input
              className="input mt-4"
              placeholder="you@email.com"
              value={resetEmail}
              onChange={(e) => setResetEmail(e.target.value)}
            />
            {resetSent ? <p className="mt-3 text-sm font-medium text-emerald-700">Reset link sent. Check your inbox.</p> : null}
            {resetError ? <p className="mt-3 text-sm font-medium text-ebm-700">{resetError}</p> : null}
            <div className="mt-5 flex justify-end gap-2">
              <button type="button" className="btn-ghost" onClick={() => { setForgotOpen(false); setResetSent(false); setResetError('') }}>
                Close
              </button>
              <button type="button" className="btn-primary" onClick={onReset}>
                Send link
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
