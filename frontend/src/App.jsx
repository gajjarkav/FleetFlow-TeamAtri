import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { MaintenanceProvider } from './context/MaintenanceContext'

// Layouts
import Layout from './components/Layout'
import DriverLayout from './components/DriverLayout'

// Auth Pages
import Login from './pages/Login'
import AdminLogin from './pages/AdminLogin'
import AccessDenied from './pages/AccessDenied'

// Admin Pages
import Dashboard from './pages/Dashboard'
import Vehicles from './pages/Vehicles'
import Drivers from './pages/Drivers'
import Trips from './pages/Trips'
import Maintenance from './pages/Maintenance'
import Expenses from './pages/Expenses'
import Reports from './pages/Reports'

// Driver Pages
import DriverDashboard from './pages/driver/DriverDashboard'
import RideInvitations from './pages/driver/RideInvitations'
import ActiveTrip from './pages/driver/ActiveTrip'
import DriverMaintenance from './pages/driver/DriverMaintenance'
import DriverProfile from './pages/driver/DriverProfile'

// ── Route Guards ────────────────────────────────────

/** Redirect to login if not authenticated */
function RequireAuth({ children }) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  return children
}

/** Only admins — staff get redirected to their dashboard + see AccessDenied */
function AdminRoute({ children }) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  if (user.role !== 'admin') return <AccessDenied />
  return children
}

/** Only staff/drivers — admins get redirected to admin dashboard */
function DriverRoute({ children }) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  if (user.role !== 'staff') return <AccessDenied />
  return children
}

/** Redirect logged-in users away from auth pages to their dashboard */
function PublicRoute({ children }) {
  const { user } = useAuth()
  if (!user) return children
  return <Navigate to={user.role === 'admin' ? '/dashboard' : '/driver'} replace />
}

// ── App ──────────────────────────────────────────────

export default function App() {
  return (
    <AuthProvider>
      <MaintenanceProvider>
        <BrowserRouter>
          <Routes>

            {/* ── Auth Routes ──────────────────────── */}
            <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
            <Route path="/admin-login" element={<PublicRoute><AdminLogin /></PublicRoute>} />
            <Route path="/access-denied" element={<RequireAuth><AccessDenied /></RequireAuth>} />

            {/* ── Root ─────────────────────────────── */}
            <Route path="/" element={<Navigate to="/login" replace />} />

            {/* ── Admin Routes ─────────────────────── */}
            <Route path="/" element={<AdminRoute><Layout /></AdminRoute>}>
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="vehicles" element={<Vehicles />} />
              <Route path="drivers" element={<Drivers />} />
              <Route path="trips" element={<Trips />} />
              <Route path="maintenance" element={<Maintenance />} />
              <Route path="expenses" element={<Expenses />} />
              <Route path="reports" element={<Reports />} />
            </Route>

            {/* ── Driver Routes ────────────────────── */}
            <Route path="/driver" element={<DriverRoute><DriverLayout /></DriverRoute>}>
              <Route index element={<DriverDashboard />} />
              <Route path="invitations" element={<RideInvitations />} />
              <Route path="active-trip" element={<ActiveTrip />} />
              <Route path="maintenance" element={<DriverMaintenance />} />
              <Route path="profile" element={<DriverProfile />} />
            </Route>

            {/* ── Fallback ─────────────────────────── */}
            <Route path="*" element={<Navigate to="/login" replace />} />

          </Routes>
        </BrowserRouter>
      </MaintenanceProvider>
    </AuthProvider>
  )
}
