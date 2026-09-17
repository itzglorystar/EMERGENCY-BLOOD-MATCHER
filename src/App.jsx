import { Navigate, Route, Routes, useParams } from 'react-router-dom'
import AdminLayout from './components/AdminLayout'
import AppLayout from './components/AppLayout'
import DonorLayout from './components/DonorLayout'
import RequireRole, { RequireAuth, RoleHome } from './components/RequireRole'
import { useApp } from './context/AppContext'
import Login from './pages/Login'
import Register from './pages/Register'
import HospitalPending from './pages/HospitalPending'
import AccountBlocked from './pages/AccountBlocked'
import Dashboard from './pages/Dashboard'
import RequestBlood from './pages/RequestBlood'
import MatchingDonors from './pages/MatchingDonors'
import DonorDetails from './pages/DonorDetails'
import ConfirmContact from './pages/ConfirmContact'
import Donation from './pages/Donation'
import RequestStatus from './pages/RequestStatus'
import SaveLife from './pages/SaveLife'
import Profile from './pages/Profile'
import Notifications from './pages/Notifications'
import MyRequests from './pages/MyRequests'
import Donations from './pages/Donations'
import BloodStock from './pages/BloodStock'
import Settings from './pages/Settings'
import DonorDashboard from './pages/donor/DonorDashboard'
import DonorRequests from './pages/donor/DonorRequests'
import DonorHistory from './pages/donor/DonorHistory'
import DonorProfile from './pages/donor/DonorProfile'
import DonorNotifications from './pages/donor/DonorNotifications'
import DonorSettings from './pages/donor/DonorSettings'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminHospitals from './pages/admin/AdminHospitals'
import AdminUsers from './pages/admin/AdminUsers'
import AdminRequests from './pages/admin/AdminRequests'

function DonorRedirect() {
  const { selectedDonorId, matchingDonors } = useApp()
  const id = selectedDonorId || matchingDonors[0]?.id
  if (!id) return <Navigate to="/matches" replace />
  return <Navigate to={`/donors/${id}`} replace />
}

function ConfirmRedirect() {
  const { selectedDonorId, matchingDonors } = useApp()
  const id = selectedDonorId || matchingDonors[0]?.id
  if (!id) return <Navigate to="/matches" replace />
  return <Navigate to={`/confirm/${id}`} replace />
}

const DONOR_PORTAL_SLUGS = ['dashboard', 'requests', 'history', 'profile', 'notifications', 'settings']

function HospitalDonorPage() {
  const { id } = useParams()
  if (DONOR_PORTAL_SLUGS.includes(id)) {
    return <Navigate to={`/donor/${id}`} replace />
  }
  return <DonorDetails />
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route
        path="/hospital/pending"
        element={
          <RequireRole role="hospital" allowInactive>
            <HospitalPending />
          </RequireRole>
        }
      />
      <Route
        path="/account-blocked"
        element={
          <RequireAuth>
            <AccountBlocked />
          </RequireAuth>
        }
      />
      <Route path="/" element={<RoleHome />} />

      <Route
        element={
          <RequireRole role="admin">
            <AdminLayout />
          </RequireRole>
        }
      >
        <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/hospitals" element={<AdminHospitals />} />
        <Route path="/admin/users" element={<AdminUsers />} />
        <Route path="/admin/requests" element={<AdminRequests />} />
      </Route>

      <Route
        element={
          <RequireRole role="donor">
            <DonorLayout />
          </RequireRole>
        }
      >
        <Route path="/donor/dashboard" element={<DonorDashboard />} />
        <Route path="/donor/requests" element={<DonorRequests />} />
        <Route path="/donor/history" element={<DonorHistory />} />
        <Route path="/donor/profile" element={<DonorProfile />} />
        <Route path="/donor/notifications" element={<DonorNotifications />} />
        <Route path="/donor/settings" element={<DonorSettings />} />
      </Route>

      <Route
        element={
          <RequireRole role="hospital">
            <AppLayout />
          </RequireRole>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/request" element={<RequestBlood />} />
        <Route path="/matches" element={<MatchingDonors />} />
        <Route path="/donors" element={<DonorRedirect />} />
        <Route path="/donors/:id" element={<DonorDetails />} />
        <Route path="/donor/:id" element={<HospitalDonorPage />} />
        <Route path="/confirm" element={<ConfirmRedirect />} />
        <Route path="/confirm/:id" element={<ConfirmContact />} />
        <Route path="/donation" element={<Donation />} />
        <Route path="/request-status" element={<RequestStatus />} />
        <Route path="/status" element={<RequestStatus />} />
        <Route path="/save-life" element={<SaveLife />} />
        <Route path="/my-requests" element={<MyRequests />} />
        <Route path="/donations" element={<Donations />} />
        <Route path="/blood-stock" element={<BloodStock />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/settings" element={<Settings />} />
      </Route>

      <Route path="*" element={<RoleHome />} />
    </Routes>
  )
}
