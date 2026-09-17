export const BLOOD_GROUPS = ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-']

export const URGENCY_LEVELS = ['High (Emergency)', 'Medium', 'Low']

export const FLOW_STEPS = [
  { id: 1, label: 'Request Blood', path: '/request' },
  { id: 2, label: 'Find Matches', path: '/matches' },
  { id: 3, label: 'Donor Details', path: '/donors' },
  { id: 4, label: 'Confirm & Contact', path: '/confirm' },
  { id: 5, label: 'Donation', path: '/donation' },
  { id: 6, label: 'Request Status', path: '/request-status' },
  { id: 7, label: 'Save Life', path: '/save-life' },
]

export const RECIPIENT_COMPATIBLE_DONORS = {
  'O-': ['O-'],
  'O+': ['O-', 'O+'],
  'A-': ['O-', 'A-'],
  'A+': ['O-', 'O+', 'A-', 'A+'],
  'B-': ['O-', 'B-'],
  'B+': ['O-', 'O+', 'B-', 'B+'],
  'AB-': ['O-', 'A-', 'B-', 'AB-'],
  'AB+': ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'],
}

export function compatibleDonorGroups(neededGroup) {
  return RECIPIENT_COMPATIBLE_DONORS[neededGroup] || [neededGroup]
}

export function formatNeededBy(iso) {
  if (!iso) return '—'
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return iso
  return date
    .toLocaleString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
    .replace(',', ' |')
}

export function relativeTime(iso) {
  if (!iso) return ''
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ''
  const diff = Date.now() - date.getTime()
  const mins = Math.max(0, Math.round(diff / 60000))
  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins} min${mins === 1 ? '' : 's'} ago`
  const hours = Math.round(mins / 60)
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`
  const days = Math.round(hours / 24)
  return `${days} day${days === 1 ? '' : 's'} ago`
}

export function ageFromDob(iso) {
  if (!iso) return null
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return null
  const now = new Date()
  let age = now.getFullYear() - date.getFullYear()
  const month = now.getMonth() - date.getMonth()
  if (month < 0 || (month === 0 && now.getDate() < date.getDate())) age -= 1
  return age
}
