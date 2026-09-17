export function homePath(role) {
  return role === 'donor' ? '/donor/dashboard' : '/dashboard'
}

export function maskPatientName(fullName = '') {
  const parts = fullName.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return 'Patient'
  if (parts.length === 1) return parts[0]
  return `${parts[0]} ${parts[1][0].toUpperCase()}.`
}

export function addMonths(isoDate, months = 3) {
  const date = new Date(isoDate)
  if (Number.isNaN(date.getTime())) return isoDate
  date.setMonth(date.getMonth() + months)
  return date.toISOString().slice(0, 10)
}

export function formatLongDate(isoDate) {
  if (!isoDate) return '—'
  const date = new Date(isoDate)
  if (Number.isNaN(date.getTime())) return isoDate
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

export function stripPassword(account) {
  const { password, ...rest } = account
  return rest
}
