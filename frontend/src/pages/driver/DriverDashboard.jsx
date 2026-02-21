import React from 'react'
import { NavLink } from 'react-router-dom'
import { Truck, Route, Star, Fuel, CalendarCheck, Bell, MapPin, Wrench, User, CheckCircle, Clock } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { drivers, trips, getDaysUntilExpiry } from '../../data/mockData'

const RECENT_ACTIVITY = [
    { id: 1, text: 'Trip T004 completed – Surat to Ahmedabad', time: '2h ago', type: 'success' },
    { id: 2, text: 'New trip invitation received – T009', time: '4h ago', type: 'info' },
    { id: 3, text: 'Vehicle GJ-01-AA-1234 service due in 14 days', time: '1d ago', type: 'warning' },
]

const quickActions = [
    { to: '/driver/invitations', label: 'Invitations', icon: Bell, color: 'blue', bg: 'rgba(59,130,246,0.15)' },
    { to: '/driver/active-trip', label: 'Active Trip', icon: MapPin, color: '#34d399', bg: 'rgba(16,185,129,0.15)' },
    { to: '/driver/maintenance', label: 'Maintenance', icon: Wrench, color: '#fbbf24', bg: 'rgba(245,158,11,0.15)' },
    { to: '/driver/profile', label: 'My Profile', icon: User, color: '#a78bfa', bg: 'rgba(139,92,246,0.15)' },
]

export default function DriverDashboard() {
    const { user } = useAuth()
    const driver = drivers.find(d => d.id === user?.driverId) || drivers[0]
    const driverTrips = trips.filter(t => t.driverId === driver.id)
    const completedTrips = driverTrips.filter(t => t.status === 'completed')
    const activeTrip = driverTrips.find(t => t.status === 'in_progress')
    const daysToExpiry = getDaysUntilExpiry(driver.licenseExpiry)

    return (
        <div>
            {/* Hero Card */}
            <div className="driver-hero-card">
                <div className="driver-hero-left">
                    <h2>Welcome back, {driver.name.split(' ')[0]} 👋</h2>
                    <p>
                        {activeTrip
                            ? `You have an active trip: ${activeTrip.from} → ${activeTrip.to}`
                            : 'No active trips – you\'re ready to accept new assignments'}
                    </p>
                </div>
                <div className="driver-hero-status">
                    <div className={`driver-status-badge ${activeTrip ? 'on-trip' : 'on-duty'}`}>
                        <span className="driver-status-dot" />
                        {activeTrip ? 'On Trip' : 'On Duty'}
                    </div>
                    <span style={{ fontSize: 12, color: '#475569' }}>
                        {new Date('2026-02-21').toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}
                    </span>
                </div>
            </div>

            {/* KPI Stats */}
            <div className="driver-stats-row">
                <div className="driver-stat-card">
                    <div className="driver-stat-card-icon blue"><Route size={20} /></div>
                    <div className="driver-stat-value">{completedTrips.length}</div>
                    <div className="driver-stat-label">Trips Completed</div>
                </div>
                <div className="driver-stat-card">
                    <div className="driver-stat-card-icon green"><Star size={20} /></div>
                    <div className="driver-stat-value">{driver.rating.toFixed(1)}</div>
                    <div className="driver-stat-label">Driver Rating</div>
                </div>
                <div className="driver-stat-card">
                    <div className="driver-stat-card-icon amber"><Fuel size={20} /></div>
                    <div className="driver-stat-value">{(driver.tripsCompleted * 142).toLocaleString()} km</div>
                    <div className="driver-stat-label">Total Distance</div>
                </div>
                <div className="driver-stat-card">
                    <div className="driver-stat-card-icon" style={{ background: daysToExpiry <= 30 ? 'rgba(239,68,68,0.15)' : 'rgba(16,185,129,0.15)', color: daysToExpiry <= 30 ? '#f87171' : '#34d399' }}>
                        <CalendarCheck size={20} />
                    </div>
                    <div className="driver-stat-value" style={{ color: daysToExpiry <= 30 ? '#f87171' : '#f1f5f9', fontSize: 18 }}>
                        {daysToExpiry <= 0 ? 'Expired' : `${daysToExpiry}d`}
                    </div>
                    <div className="driver-stat-label">License Expiry</div>
                </div>
            </div>

            {/* Quick Actions */}
            <div style={{ marginBottom: 8 }}>
                <h3 style={{ fontSize: 14, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 14 }}>Quick Actions</h3>
            </div>
            <div className="quick-action-grid">
                {quickActions.map(a => (
                    <NavLink key={a.to} to={a.to} className="quick-action-card">
                        <div className="quick-action-icon" style={{ background: a.bg }}>
                            <a.icon size={22} color={a.color} />
                        </div>
                        <span className="quick-action-label">{a.label}</span>
                    </NavLink>
                ))}
            </div>

            {/* Active Trip Banner */}
            {activeTrip && (
                <div style={{ background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: 14, padding: '18px 22px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#3b82f6', display: 'inline-block', animation: 'pulse 2s infinite' }} />
                            <span style={{ fontSize: 12, fontWeight: 700, color: '#60a5fa', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Active Trip</span>
                        </div>
                        <div style={{ fontSize: 15, fontWeight: 700, color: '#f1f5f9' }}>{activeTrip.from} → {activeTrip.to}</div>
                        <div style={{ fontSize: 12, color: '#64748b', marginTop: 3 }}>Cargo: {activeTrip.cargoWeight} kg · {activeTrip.distanceKm} km</div>
                    </div>
                    <NavLink to="/driver/active-trip" className="driver-action-btn primary" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6 }}>
                        <MapPin size={15} /> View Trip
                    </NavLink>
                </div>
            )}

            {/* Recent Activity */}
            <div>
                <h3 style={{ fontSize: 14, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 14 }}>Recent Activity</h3>
                <div className="driver-info-card">
                    {RECENT_ACTIVITY.map((a, i) => (
                        <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 0', borderBottom: i < RECENT_ACTIVITY.length - 1 ? '1px solid rgba(59,130,246,0.07)' : 'none' }}>
                            <div style={{ width: 30, height: 30, borderRadius: 9, background: a.type === 'success' ? 'rgba(16,185,129,0.1)' : a.type === 'warning' ? 'rgba(245,158,11,0.1)' : 'rgba(59,130,246,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                {a.type === 'success' ? <CheckCircle size={14} color="#34d399" /> : a.type === 'warning' ? <Clock size={14} color="#fbbf24" /> : <Bell size={14} color="#60a5fa" />}
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: 13, color: '#cbd5e1', fontWeight: 500 }}>{a.text}</div>
                                <div style={{ fontSize: 11, color: '#475569', marginTop: 2 }}>{a.time}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
