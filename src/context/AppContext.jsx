import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { compatibleDonorGroups } from '../data/constants'
import { supabase } from '../lib/supabase'
import {
  mapDonation,
  mapDonor,
  mapIncoming,
  mapNotification,
  mapProfile,
  mapRequest,
  mapStock,
  profileWritePayload,
} from '../lib/mappers'

const FLOW_KEY = 'ebm-flow-v3'
const AppContext = createContext(null)

function loadFlow() {
  try {
    return JSON.parse(sessionStorage.getItem(FLOW_KEY) || '{}')
  } catch {
    return {}
  }
}

export function AppProvider({ children }) {
  const flow = loadFlow()
  const [authLoading, setAuthLoading] = useState(true)
  const [session, setSession] = useState(null)
  const [user, setUser] = useState(null)
  const [requests, setRequests] = useState([])
  const [donations, setDonations] = useState([])
  const [notifications, setNotifications] = useState([])
  const [donors, setDonors] = useState([])
  const [incomingRequests, setIncomingRequests] = useState([])
  const [bloodStock, setBloodStock] = useState([])
  const [currentRequestId, setCurrentRequestId] = useState(flow.currentRequestId || null)
  const [selectedDonorId, setSelectedDonorId] = useState(flow.selectedDonorId || null)
  const [contactedDonorIds, setContactedDonorIds] = useState(flow.contactedDonorIds || [])
  const [showAllDonors, setShowAllDonors] = useState(false)
  const [toast, setToast] = useState(null)
  const completedOnce = useRef(new Set())
  const userRef = useRef(null)
  const currentRequestIdRef = useRef(currentRequestId)
  userRef.current = user
  currentRequestIdRef.current = currentRequestId

  const isAuthenticated = Boolean(session && user)
  const role = user?.role || null
  const currentRequest = requests.find((r) => r.id === currentRequestId) || requests[0] || null

  const matchingDonors = useMemo(() => {
    if (role !== 'hospital') return []
    const needed = currentRequest?.bloodGroup
    if (!needed) return donors
    const allowed = new Set(compatibleDonorGroups(needed))
    return donors.filter((d) => allowed.has(d.bloodGroup)).sort((a, b) => a.distanceKm - b.distanceKm)
  }, [currentRequest?.bloodGroup, donors, role])

  const selectedDonor =
    donors.find((d) => d.id === selectedDonorId) || matchingDonors[0] || donors[0] || null

  const unreadCount = notifications.filter((n) => !n.read).length

  const refreshData = useCallback(async (profile = userRef.current) => {
    if (!profile?.id) return

    if (profile.role === 'hospital') {
      const [reqRes, donRes, noteRes, donorRes, stockRes, contactRes] = await Promise.all([
        supabase.from('blood_requests').select('*').eq('created_by', profile.id).order('created_at', { ascending: false }),
        supabase.from('donations').select('*').order('donated_on', { ascending: false }),
        supabase.from('notifications').select('*').eq('user_id', profile.id).order('created_at', { ascending: false }),
        supabase.from('profiles').select('*').eq('role', 'donor'),
        supabase.from('blood_stock').select('*').order('blood_type'),
        supabase.from('request_contacts').select('donor_id, request_id'),
      ])

      const mappedRequests = (reqRes.data || []).map(mapRequest)
      setRequests(mappedRequests)
      setDonations((donRes.data || []).map(mapDonation))
      setNotifications((noteRes.data || []).map(mapNotification))
      setDonors((donorRes.data || []).map(mapDonor))
      setBloodStock((stockRes.data || []).map(mapStock))
      setIncomingRequests([])

      const previousId = currentRequestIdRef.current
      const activeId = previousId && mappedRequests.some((r) => r.id === previousId)
        ? previousId
        : mappedRequests[0]?.id || null
      if (activeId !== previousId) setCurrentRequestId(activeId)

      const activeContacts = (contactRes.data || [])
        .filter((row) => !activeId || row.request_id === activeId)
        .map((row) => row.donor_id)
      setContactedDonorIds(activeContacts)
      return
    }

    const [donRes, noteRes, incomingRes] = await Promise.all([
      supabase.from('donations').select('*').eq('donor_id', profile.id).order('donated_on', { ascending: false }),
      supabase.from('notifications').select('*').eq('user_id', profile.id).order('created_at', { ascending: false }),
      supabase.rpc('donor_incoming_requests'),
    ])

    setDonations((donRes.data || []).map(mapDonation))
    setNotifications((noteRes.data || []).map(mapNotification))
    setIncomingRequests((incomingRes.data || []).map((row) => mapIncoming(row, profile.id)))
    setRequests([])
    setDonors([])
    setBloodStock([])
  }, [])

  const loadProfile = useCallback(async (userId) => {
    const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle()
    if (error) throw error
    if (data) return mapProfile(data)
    await new Promise((resolve) => setTimeout(resolve, 400))
    const retry = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle()
    return mapProfile(retry.data)
  }, [])

  useEffect(() => {
    let cancelled = false

    const applySession = async (nextSession) => {
      setSession(nextSession)
      if (!nextSession?.user) {
        setUser(null)
        setRequests([])
        setDonations([])
        setNotifications([])
        setDonors([])
        setIncomingRequests([])
        setBloodStock([])
        setAuthLoading(false)
        return
      }
      try {
        const profile = await loadProfile(nextSession.user.id)
        if (cancelled) return
        setUser(profile)
      } catch (err) {
        console.error(err)
        if (!cancelled) setToast({ type: 'error', message: 'Could not load your profile.' })
      } finally {
        if (!cancelled) setAuthLoading(false)
      }
    }

    supabase.auth.getSession().then(({ data }) => {
      if (!cancelled) applySession(data.session)
    })

    const { data: sub } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      applySession(nextSession)
    })

    return () => {
      cancelled = true
      sub.subscription.unsubscribe()
    }
  }, [loadProfile])

  useEffect(() => {
    if (userRef.current?.id) refreshData(userRef.current)
  }, [refreshData, user?.id])

  useEffect(() => {
    sessionStorage.setItem(
      FLOW_KEY,
      JSON.stringify({ currentRequestId, selectedDonorId, contactedDonorIds }),
    )
  }, [currentRequestId, selectedDonorId, contactedDonorIds])

  useEffect(() => {
    if (!toast) return undefined
    const id = setTimeout(() => setToast(null), 2800)
    return () => clearTimeout(id)
  }, [toast])

  useEffect(() => {
    if (!user?.id) return undefined
    const channel = supabase
      .channel(`ebm-${user.id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'notifications', filter: `user_id=eq.${user.id}` },
        () => { refreshData(user) },
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'blood_requests' },
        () => { refreshData(user) },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [refreshData, user])

  const login = async (identifier, password, selectedRole) => {
    const email = identifier.trim().toLowerCase()
    if (!email.includes('@')) {
      return { ok: false, error: 'Sign in with the email address for this portal.' }
    }
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) return { ok: false, error: error.message }
    const profile = await loadProfile(data.user.id)
    if (!profile) {
      await supabase.auth.signOut()
      return { ok: false, error: 'Profile was not created. Try registering again.' }
    }
    if (profile.role !== selectedRole) {
      await supabase.auth.signOut()
      return { ok: false, error: `This account belongs to the ${profile.role} portal.` }
    }
    setUser(profile)
    setSession(data.session)
    setToast({ type: 'success', message: `Welcome back to EBM, ${profile.fullName}.` })
    return { ok: true, role: profile.role }
  }

  const register = async (payload) => {
    const email = payload.email.trim().toLowerCase()
    const { data, error } = await supabase.auth.signUp({
      email,
      password: payload.password,
      options: {
        data: {
          role: payload.role,
          full_name: payload.fullName,
          phone: payload.phone || '',
          blood_group: payload.role === 'donor' ? payload.bloodGroup : null,
          gender: payload.gender || '',
          city: 'Yaoundé',
        },
      },
    })
    if (error) return { ok: false, error: error.message }
    if (!data.session) {
      return {
        ok: true,
        needsConfirm: true,
        role: payload.role,
        error: 'Account created. Confirm your email, then sign in.',
      }
    }
    const profile = await loadProfile(data.user.id)
    setUser(profile)
    setSession(data.session)
    setToast({ type: 'success', message: 'Account created. Welcome to EBM.' })
    return { ok: true, role: profile?.role || payload.role }
  }

  const sendPasswordReset = async (email) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
      redirectTo: `${window.location.origin}/login`,
    })
    if (error) return { ok: false, error: error.message }
    return { ok: true }
  }

  const logout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    sessionStorage.removeItem(FLOW_KEY)
  }

  const updateProfile = async (payload) => {
    if (!user?.id) return
    const { error } = await supabase.from('profiles').update(profileWritePayload(payload)).eq('id', user.id)
    if (error) {
      setToast({ type: 'error', message: error.message })
      return
    }
    const profile = await loadProfile(user.id)
    setUser(profile)
    setToast({ type: 'success', message: 'Profile updated.' })
  }

  const setAvailability = async (available) => {
    if (!user?.id) return
    setUser((prev) => ({ ...prev, available }))
    const { error } = await supabase.from('profiles').update({ available }).eq('id', user.id)
    if (error) {
      setUser((prev) => ({ ...prev, available: !available }))
      setToast({ type: 'error', message: error.message })
    }
  }

  const createRequest = async (form) => {
    const { data, error } = await supabase
      .from('blood_requests')
      .insert({
        public_id: '',
        created_by: user.id,
        patient_name: form.patientName,
        blood_group: form.bloodGroup,
        units: form.units,
        hospital_name: form.hospital,
        hospital_contact: user.phone || '',
        hospital_location: user.address || user.city || 'Yaoundé',
        distance_km: 2.5,
        needed_by: form.neededBy ? new Date(form.neededBy).toISOString() : null,
        urgency: form.urgency,
      })
      .select('*')
      .single()
    if (error) {
      setToast({ type: 'error', message: error.message })
      return null
    }
    const mapped = mapRequest(data)
    setCurrentRequestId(mapped.id)
    setContactedDonorIds([])
    setShowAllDonors(false)
    await refreshData(user)
    setToast({ type: 'success', message: `${mapped.matchesFound || 0} matching donors found.` })
    return mapped
  }

  const selectDonor = (id) => {
    setSelectedDonorId(id)
  }

  const contactDonor = async (donor) => {
    if (!currentRequest?.id) return
    const already = contactedDonorIds.includes(donor.id)
    if (!already) {
      const { error } = await supabase.from('request_contacts').insert({
        request_id: currentRequest.id,
        donor_id: donor.id,
      })
      if (error && !String(error.message).toLowerCase().includes('duplicate')) {
        setToast({ type: 'error', message: error.message })
        return
      }
      setContactedDonorIds((prev) => [...prev, donor.id])
      await refreshData(user)
    }
    setSelectedDonorId(donor.id)
    setToast({ type: 'success', message: `Contacting ${donor.name}…` })
  }

  const confirmDonation = async () => {
    if (!currentRequest?.id) return
    const { error } = await supabase
      .from('blood_requests')
      .update({
        in_progress_count: Math.max(currentRequest.inProgress || 0, 1),
        status: currentRequest.status === 'Completed' ? currentRequest.status : 'Matched',
      })
      .eq('id', currentRequest.id)
    if (error) {
      setToast({ type: 'error', message: error.message })
      return
    }
    await refreshData(user)
    setToast({ type: 'success', message: `Donation with ${selectedDonor?.name || 'the donor'} is in progress.` })
  }

  const completeRequest = async () => {
    if (!currentRequest?.id || currentRequest.status === 'Completed') return
    if (completedOnce.current.has(currentRequest.id)) return
    completedOnce.current.add(currentRequest.id)

    const { error } = await supabase
      .from('blood_requests')
      .update({
        status: 'Completed',
        completed_units: Math.max(currentRequest.completed || 0, currentRequest.units || 1),
        in_progress_count: 0,
      })
      .eq('id', currentRequest.id)
    if (error) {
      completedOnce.current.delete(currentRequest.id)
      setToast({ type: 'error', message: error.message })
      return
    }

    await supabase.from('donations').insert({
      ref: '',
      donor_id: selectedDonor?.id || null,
      request_id: currentRequest.id,
      donated_on: new Date().toISOString().slice(0, 10),
      blood_group: currentRequest.bloodGroup,
      units: currentRequest.units,
      hospital_name: currentRequest.hospital,
      status: 'Completed',
    })
    await refreshData(user)
  }

  const cancelRequest = async () => {
    if (!currentRequest?.id) return
    const { error } = await supabase.from('blood_requests').update({ status: 'Cancelled' }).eq('id', currentRequest.id)
    if (error) {
      setToast({ type: 'error', message: error.message })
      return
    }
    await refreshData(user)
    setToast({ type: 'info', message: 'Request cancelled.' })
  }

  const respondToRequest = async (requestId, decision) => {
    if (!user?.id) return
    const { error } = await supabase.from('request_responses').insert({
      request_id: requestId,
      donor_id: user.id,
      decision,
    })
    if (error) {
      setToast({ type: 'error', message: error.message })
      return
    }
    await refreshData(user)
    if (decision === 'accepted') {
      setToast({ type: 'success', message: 'Request confirmed. Hospital contact is now visible.' })
    } else {
      setToast({ type: 'info', message: 'Request declined.' })
    }
  }

  const markAllNotificationsRead = async () => {
    if (!user?.id) return
    await supabase.from('notifications').update({ read: true }).eq('user_id', user.id).eq('read', false)
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }

  const markNotificationRead = async (id) => {
    await supabase.from('notifications').update({ read: true }).eq('id', id)
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))
  }

  const value = {
    authLoading,
    isAuthenticated,
    user,
    role,
    requests,
    donations,
    notifications,
    incomingRequests,
    bloodStock,
    donors: role === 'hospital' ? donors : [],
    matchingDonors,
    currentRequest,
    currentRequestId,
    setCurrentRequestId,
    selectedDonor: role === 'hospital' ? selectedDonor : null,
    selectedDonorId,
    contactedDonorIds,
    showAllDonors,
    setShowAllDonors,
    unreadCount,
    toast,
    setToast,
    login,
    register,
    sendPasswordReset,
    logout,
    updateProfile,
    setAvailability,
    createRequest,
    selectDonor,
    contactDonor,
    confirmDonation,
    completeRequest,
    cancelRequest,
    respondToRequest,
    markAllNotificationsRead,
    markNotificationRead,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
