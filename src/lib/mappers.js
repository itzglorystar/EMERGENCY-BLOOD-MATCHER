import { ageFromDob, formatNeededBy, relativeTime } from '../data/constants'
import { formatLongDate } from '../utils/roles'

export function mapProfile(row) {
  if (!row) return null
  return {
    id: row.id,
    role: row.role,
    fullName: row.full_name,
    email: row.email,
    phone: row.phone || '',
    avatar: row.avatar_url || '',
    bloodGroup: row.blood_group,
    gender: row.gender || '',
    dateOfBirth: row.date_of_birth || '',
    weight: row.weight ?? '',
    lastDonation: row.last_donation || '',
    canDonateAfter: row.can_donate_after || '',
    address: row.address || '',
    emergencyContact: row.emergency_contact || '',
    city: row.city || 'Yaoundé',
    available: row.available !== false,
    notes: row.notes || '',
    locationLabel: row.location_label || row.city,
    distanceKm: Number(row.distance_km ?? 3),
  }
}

export function mapDonor(row) {
  const age = ageFromDob(row.date_of_birth)
  return {
    id: row.id,
    name: row.full_name,
    bloodGroup: row.blood_group,
    city: row.location_label || row.city || 'Yaoundé',
    distanceKm: Number(row.distance_km ?? 0),
    status: row.available === false ? 'Unavailable' : 'Available',
    canDonate: formatLongDate(row.can_donate_after) || 'Eligible now',
    age,
    gender: row.gender || '—',
    lastDonation: formatLongDate(row.last_donation) || '—',
    weight: row.weight ?? '—',
    contact: row.phone || '',
    location: row.address || row.location_label || row.city || 'Yaoundé',
    notes: row.notes || 'Health: Healthy, No medication',
    avatar: row.avatar_url || '',
  }
}

export function mapRequest(row) {
  return {
    id: row.id,
    publicId: row.public_id,
    patient: row.patient_name,
    bloodGroup: row.blood_group,
    units: row.units,
    hospital: row.hospital_name,
    hospitalContact: row.hospital_contact,
    hospitalLocation: row.hospital_location,
    distanceKm: Number(row.distance_km ?? 0),
    neededBy: formatNeededBy(row.needed_by),
    neededByIso: row.needed_by,
    urgency: row.urgency,
    status: row.status,
    matchesFound: row.matches_found,
    confirmed: row.confirmed_count,
    inProgress: row.in_progress_count,
    completed: row.completed_units,
  }
}

export function mapIncoming(row, userId) {
  return {
    id: row.id,
    publicId: row.public_id,
    patient: row.patient_full || row.patient_display,
    bloodGroup: row.blood_group,
    units: row.units,
    hospital: row.hospital_name,
    hospitalContact: row.hospital_contact,
    hospitalLocation: row.hospital_location,
    distanceKm: Number(row.distance_km ?? 0),
    neededBy: formatNeededBy(row.needed_by),
    urgency: row.urgency,
    status: row.status,
    donorDecision: row.my_decision && userId ? { [userId]: row.my_decision } : {},
  }
}

export function mapDonation(row) {
  return {
    id: row.id,
    ref: row.ref,
    donatedOn: row.donated_on,
    date: formatLongDate(row.donated_on),
    bloodGroup: row.blood_group,
    units: row.units,
    hospital: row.hospital_name,
    status: row.status,
  }
}

export function mapNotification(row) {
  return {
    id: row.id,
    type: row.type,
    title: row.title,
    message: row.message,
    read: row.read,
    time: relativeTime(row.created_at),
  }
}

export function mapStock(row) {
  return {
    id: row.id,
    type: row.blood_type,
    units: row.units,
    status: row.status,
    hospital: row.hospital_name,
  }
}

export function profileWritePayload(payload) {
  const next = {}
  if (payload.fullName !== undefined) next.full_name = payload.fullName
  if (payload.phone !== undefined) next.phone = payload.phone
  if (payload.avatar !== undefined) next.avatar_url = payload.avatar
  if (payload.gender !== undefined) next.gender = payload.gender
  if (payload.dateOfBirth !== undefined) next.date_of_birth = payload.dateOfBirth || null
  if (payload.weight !== undefined) next.weight = payload.weight === '' ? null : payload.weight
  if (payload.lastDonation !== undefined) next.last_donation = payload.lastDonation || null
  if (payload.address !== undefined) next.address = payload.address
  if (payload.emergencyContact !== undefined) next.emergency_contact = payload.emergencyContact
  if (payload.city !== undefined) next.city = payload.city
  if (payload.available !== undefined) next.available = payload.available
  if (payload.notes !== undefined) next.notes = payload.notes
  if (payload.locationLabel !== undefined) next.location_label = payload.locationLabel
  return next
}
