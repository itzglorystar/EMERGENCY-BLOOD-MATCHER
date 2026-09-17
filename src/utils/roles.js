export function homePath(role) {
  return role === 'donor' ? '/donor/dashboard' : '/dashboard'
}

export function maskPatientName(fullName = '') {
  const parts = fullName.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return 'Patient'
  if (parts.length === 1) return parts[0]
  return `${parts[0]} ${parts[1][0].toUpperCase()}.`
}

export function parseDateOnly(isoDate) {
  if (!isoDate) return null
  const match = String(isoDate).match(/^(\d{4})-(\d{2})-(\d{2})/)
  if (match) {
    return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]))
  }
  const date = new Date(isoDate)
  if (Number.isNaN(date.getTime())) return null
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

export function toDateOnly(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function addMonths(isoDate, months = 3) {
  const date = parseDateOnly(isoDate)
  if (!date) return null
  date.setMonth(date.getMonth() + months)
  return toDateOnly(date)
}

export function formatLongDate(isoDate) {
  const date = parseDateOnly(isoDate)
  if (!date) return '—'
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

export function isOnOrBeforeToday(isoDate) {
  const date = parseDateOnly(isoDate)
  if (!date) return true
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  date.setHours(0, 0, 0, 0)
  return date.getTime() <= today.getTime()
}

export function totalUnits(records = []) {
  return records.reduce((sum, item) => sum + Number(item.units || 0), 0)
}

export function latestDonationOn(user, donations = []) {
  const dates = [user?.lastDonation, ...donations.map((item) => item.donatedOn)].filter(Boolean)
  if (dates.length === 0) return null
  return dates.sort((a, b) => {
    const left = parseDateOnly(a)
    const right = parseDateOnly(b)
    return (right?.getTime() || 0) - (left?.getTime() || 0)
  })[0]
}

export function nextEligibleOn(_user, lastDonation) {
  if (!lastDonation) return null
  return addMonths(lastDonation, 3)
}

export function stripPassword(account) {
  const { password, ...rest } = account
  return rest
}
