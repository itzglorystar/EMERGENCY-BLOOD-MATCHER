import { useState } from 'react'
import { useApp } from '../context/AppContext'

export default function Settings() {
  const { user } = useApp()
  const [prefs, setPrefs] = useState({
    emailAlerts: true,
    smsAlerts: true,
    matchPush: true,
  })

  return (
    <div className="max-w-2xl">
      <h1 className="page-title">Settings</h1>
      <p className="mt-1 text-sm text-muted">Notification preferences for {user.email}.</p>

      <div className="card mt-6 divide-y divide-black/5">
        {[
          ['emailAlerts', 'Email alerts', 'Receive request and match updates by email'],
          ['smsAlerts', 'SMS alerts', 'Get urgent donor confirmations by SMS'],
          ['matchPush', 'Match notifications', 'Alert me when a nearby compatible donor is found'],
        ].map(([key, title, desc]) => (
          <label key={key} className="flex cursor-pointer items-center justify-between gap-4 px-5 py-4">
            <span>
              <span className="block font-semibold">{title}</span>
              <span className="text-sm text-muted">{desc}</span>
            </span>
            <input
              type="checkbox"
              className="h-4 w-4 accent-ebm-700"
              checked={prefs[key]}
              onChange={(e) => setPrefs({ ...prefs, [key]: e.target.checked })}
            />
          </label>
        ))}
      </div>
    </div>
  )
}
