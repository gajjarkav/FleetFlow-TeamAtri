import React, { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { Truck, Route, Star, Fuel, CalendarCheck, Bell, MapPin, Wrench, User, CheckCircle, Clock, Plus, X, Send } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useMaintenance } from '../../context/MaintenanceContext'
import { drivers, trips, vehicles, getDaysUntilExpiry } from '../../data/mockData'

const RECENT_ACTIVITY = [
    { id: 1, text: 'Trip T004 completed – Surat to Ahmedabad', time: '2h ago', type: 'success' },
    { id: 2, text: 'New trip invitation received – T009', time: '4h ago', type: 'info' },
    { id: 3, text: 'Vehicle GJ-01-AA-1234 service due in 14 days', time: '1d ago', type: 'warning' },
]

const ISSUE_TYPES = [
    'Oil & Filter Change', 'Brake Replacement', 'Tyre Rotation',
    'Engine Overhaul', 'Transmission Service', 'Suspension Check',
    'CNG Kit Calibration', 'Battery Replacement',
    'Tyre Puncture', 'Coolant Leak', 'Electrical Issue', 'Other',
]

const quickActions = [
    { to: '/driver/invitations', label: 'Invitations', icon: Bell, color: 'blue', bg: 'rgba(59,130,246,0.15)' },
    { to: '/driver/active-trip', label: 'Active Trip', icon: MapPin, color: '#34d399', bg: 'rgba(16,185,129,0.15)' },
    { to: '/driver/maintenance', label: 'Maintenance', icon: Wrench, color: '#fbbf24', bg: 'rgba(245,158,11,0.15)' },
    { to: '/driver/profile', label: 'My Profile', icon: User, color: '#a78bfa', bg: 'rgba(139,92,246,0.15)' },
]

const defaultForm = { vehicleId: '', type: ISSUE_TYPES[0], description: '', scheduledDate: '', workshop: '', cost: '' }

export default function DriverDashboard() {
    const { user } = useAuth()
    const { addRecord } = useMaintenance()
    const navigate = useNavigate()
    const driver = drivers.find(d => d.id === user?.driverId) || drivers[0]
    const driverTrips = trips.filter(t => t.driverId === driver.id)
    const completedTrips = driverTrips.filter(t => t.status === 'completed')
    const activeTrip = driverTrips.find(t => t.status === 'in_progress')
    const daysToExpiry = getDaysUntilExpiry(driver.licenseExpiry)

    const [showMaintForm, setShowMaintForm] = useState(false)
    const [form, setForm] = useState(defaultForm)
    const [errors, setErrors] = useState({})
    const [successMsg, setSuccessMsg] = useState('')

    const f = (k) => (e) => { setForm(p => ({ ...p, [k]: e.target.value })); setErrors(p => ({ ...p, [k]: undefined })) }

    const validate = () => {
        const e = {}
        if (!form.vehicleId) e.vehicleId = 'Select a vehicle'
        if (!form.scheduledDate) e.scheduledDate = 'Date required'
        if (!form.description.trim()) e.description = 'Describe the issue'
        return e
    }

    const handleSubmit = (ev) => {
        ev.preventDefault()
        const e = validate()
        if (Object.keys(e).length) { setErrors(e); return }
        addRecord({
            ...form,
            cost: form.cost ? +form.cost : 0,
            workshop: form.workshop || 'Pending Assignment',
            driverId: driver.id,
            driverName: driver.name,
            status: 'in_progress',
        })
        setShowMaintForm(false)
        setForm(defaultForm)
        setErrors({})
        setSuccessMsg('Maintenance request submitted! Vehicle locked for service.')
        setTimeout(() => setSuccessMsg(''), 4000)
    }

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

            {/* Success toast */}
            {successMsg && (
                <div style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 12, padding: '13px 18px', display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20, fontSize: 13, color: '#34d399', fontWeight: 600 }}>
                    <CheckCircle size={17} /> {successMsg}
                </div>
            )}

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

            {/* ── Schedule Maintenance Card ─────────────── */}
            <div style={{ marginTop: 28, marginBottom: 28 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                    <h3 style={{ fontSize: 14, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.8px', margin: 0 }}>
                        Schedule Maintenance
                    </h3>
                    <button
                        onClick={() => { setShowMaintForm(p => !p); setForm(defaultForm); setErrors({}) }}
                        style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 700, color: showMaintForm ? '#94a3b8' : '#fbbf24', background: showMaintForm ? 'rgba(255,255,255,0.04)' : 'rgba(245,158,11,0.1)', border: `1px solid ${showMaintForm ? 'rgba(255,255,255,0.08)' : 'rgba(245,158,11,0.25)'}`, borderRadius: 9, padding: '7px 14px', cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s' }}
                    >
                        {showMaintForm ? <><X size={13} /> Cancel</> : <><Plus size={13} /> New Request</>}
                    </button>
                </div>

                {showMaintForm ? (
                    /* ── Expanded form ── */
                    <div style={{ background: '#0f1829', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 16, padding: '22px 24px' }}>
                        <div style={{ fontSize: 13, color: '#64748b', marginBottom: 18 }}>
                            Submitting this form will mark the vehicle as <strong style={{ color: '#fbbf24' }}>Under Maintenance</strong> and notify fleet admin.
                        </div>
                        <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px 20px' }}>
                            {/* Vehicle */}
                            <div style={{ gridColumn: 'span 2' }}>
                                <label style={lbl}>Vehicle *</label>
                                <select style={{ ...inp, borderColor: errors.vehicleId ? '#f87171' : 'rgba(245,158,11,0.2)' }} value={form.vehicleId} onChange={f('vehicleId')}>
                                    <option value="">— Select vehicle —</option>
                                    {vehicles.map(v => <option key={v.id} value={v.id}>{v.regNo} – {v.make} {v.model}</option>)}
                                </select>
                                {errors.vehicleId && <span style={err}>{errors.vehicleId}</span>}
                            </div>
                            {/* Issue type */}
                            <div style={{ gridColumn: 'span 2' }}>
                                <label style={lbl}>Issue / Service Type</label>
                                <select style={inp} value={form.type} onChange={f('type')}>
                                    {ISSUE_TYPES.map(t => <option key={t}>{t}</option>)}
                                </select>
                            </div>
                            {/* Description */}
                            <div style={{ gridColumn: 'span 2' }}>
                                <label style={lbl}>Describe the Issue *</label>
                                <textarea
                                    style={{ ...inp, minHeight: 72, resize: 'vertical', borderColor: errors.description ? '#f87171' : 'rgba(245,158,11,0.2)' }}
                                    placeholder="What did you notice or hear?"
                                    value={form.description}
                                    onChange={f('description')}
                                />
                                {errors.description && <span style={err}>{errors.description}</span>}
                            </div>
                            {/* Date */}
                            <div>
                                <label style={lbl}>Preferred Date *</label>
                                <input type="date" style={{ ...inp, borderColor: errors.scheduledDate ? '#f87171' : 'rgba(245,158,11,0.2)' }} value={form.scheduledDate} onChange={f('scheduledDate')} />
                                {errors.scheduledDate && <span style={err}>{errors.scheduledDate}</span>}
                            </div>
                            {/* Cost */}
                            <div>
                                <label style={lbl}>Est. Cost ₹ <span style={{ color: '#475569' }}>(optional)</span></label>
                                <input type="number" style={inp} placeholder="5000" value={form.cost} onChange={f('cost')} />
                            </div>
                            {/* Workshop */}
                            <div style={{ gridColumn: 'span 2' }}>
                                <label style={lbl}>Preferred Workshop <span style={{ color: '#475569' }}>(optional)</span></label>
                                <input style={inp} placeholder="e.g. Tata ExPress Fleet, Ahmedabad" value={form.workshop} onChange={f('workshop')} />
                            </div>
                            {/* Buttons */}
                            <div style={{ gridColumn: 'span 2', display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 4 }}>
                                <button type="button" onClick={() => { setShowMaintForm(false); setErrors({}) }} style={{ background: '#0a1422', border: '1px solid rgba(59,130,246,0.15)', color: '#94a3b8', borderRadius: 10, padding: '10px 18px', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600, fontSize: 13 }}>
                                    Cancel
                                </button>
                                <button type="submit" style={{ display: 'flex', alignItems: 'center', gap: 7, background: 'linear-gradient(135deg,#f59e0b,#d97706)', border: 'none', color: '#0a0e1a', borderRadius: 10, padding: '10px 22px', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 800, fontSize: 13 }}>
                                    <Send size={14} /> Submit Request
                                </button>
                            </div>
                        </form>
                    </div>
                ) : (
                    /* ── Collapsed call-to-action tile ── */
                    <button
                        onClick={() => setShowMaintForm(true)}
                        style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 16, background: '#0f1829', border: '1px dashed rgba(245,158,11,0.25)', borderRadius: 14, padding: '18px 22px', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left', transition: 'border-color 0.2s' }}
                        onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(245,158,11,0.5)'}
                        onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(245,158,11,0.25)'}
                    >
                        <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(245,158,11,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <Wrench size={22} color="#fbbf24" />
                        </div>
                        <div>
                            <div style={{ fontSize: 14, fontWeight: 700, color: '#f1f5f9' }}>Report a Vehicle Issue</div>
                            <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>Schedule maintenance and notify fleet admin instantly</div>
                        </div>
                        <div style={{ marginLeft: 'auto', background: 'rgba(245,158,11,0.1)', borderRadius: 8, padding: '6px 12px', fontSize: 12, fontWeight: 700, color: '#fbbf24', display: 'flex', alignItems: 'center', gap: 5 }}>
                            <Plus size={13} /> Request
                        </div>
                    </button>
                )}
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

// ── Inline styles ──
const lbl = {
    display: 'block', fontSize: 11, fontWeight: 700,
    color: '#64748b', textTransform: 'uppercase',
    letterSpacing: '0.7px', marginBottom: 6,
}
const inp = {
    width: '100%', boxSizing: 'border-box',
    background: '#0a1422', border: '1px solid rgba(245,158,11,0.2)',
    borderRadius: 9, padding: '10px 13px', fontSize: 13,
    color: '#f1f5f9', fontFamily: 'inherit',
}
const err = {
    display: 'block', fontSize: 11, color: '#f87171', marginTop: 4,
}
