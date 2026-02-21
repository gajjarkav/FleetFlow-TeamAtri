import React, { useState } from 'react'
import { User, Phone, CreditCard, Calendar, Star, Route, Edit3, Save, X } from 'lucide-react'
import { drivers, getDaysUntilExpiry } from '../../data/mockData'
import { useAuth } from '../../context/AuthContext'

export default function DriverProfile() {
    const { user } = useAuth()
    const driver = drivers.find(d => d.id === user?.driverId) || drivers[0]
    const daysToExpiry = getDaysUntilExpiry(driver.licenseExpiry)

    const [editing, setEditing] = useState(false)
    const [form, setForm] = useState({ name: driver.name, contact: driver.contact })
    const [saved, setSaved] = useState(false)

    const handleSave = () => {
        setEditing(false)
        setSaved(true)
        setTimeout(() => setSaved(false), 2500)
    }

    const licenseStatus =
        daysToExpiry <= 0 ? { label: 'Expired', cls: 'maintenance', color: '#f87171' } :
            daysToExpiry <= 30 ? { label: `Expires in ${daysToExpiry}d`, cls: 'maintenance', color: '#f87171' } :
                daysToExpiry <= 90 ? { label: `Expires in ${daysToExpiry}d`, cls: 'in_use', color: '#fbbf24' } :
                    { label: 'Valid', cls: 'available', color: '#34d399' }

    return (
        <div>
            <div className="driver-page-header">
                <h1>My Profile</h1>
                <p>Your driver information, license status, and performance metrics</p>
            </div>

            {/* Save toast */}
            {saved && (
                <div style={{ background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 10, padding: '12px 18px', marginBottom: 18, display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: '#34d399', fontWeight: 600 }}>
                    ✓ Profile updated successfully
                </div>
            )}

            {/* Profile Hero */}
            <div className="profile-card">
                <div className="profile-avatar-lg">{user?.avatar || driver.name.charAt(0)}</div>
                <div style={{ flex: 1 }}>
                    <div className="profile-name">{editing ? form.name : driver.name}</div>
                    <div className="profile-role">Staff Driver · FleetFlow</div>
                    <div className="profile-email">{user?.email || 'driver@fleetflow.com'}</div>
                    <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
                        <span className={`badge ${licenseStatus.cls}`}>{licenseStatus.label}</span>
                        <span className="badge available">{driver.status === 'available' ? 'Available' : driver.status}</span>
                    </div>
                </div>
                {!editing ? (
                    <button className="driver-action-btn primary" onClick={() => setEditing(true)}>
                        <Edit3 size={14} /> Edit Profile
                    </button>
                ) : (
                    <div style={{ display: 'flex', gap: 8 }}>
                        <button className="driver-action-btn success" onClick={handleSave}><Save size={14} /> Save</button>
                        <button className="driver-action-btn danger" onClick={() => setEditing(false)}><X size={14} /> Cancel</button>
                    </div>
                )}
            </div>

            <div className="driver-info-grid">
                {/* Personal Info */}
                <div className="driver-info-card">
                    <div className="driver-info-card-title"><User size={14} /> Personal Information</div>

                    {editing ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            <div>
                                <label style={{ fontSize: 11, color: '#64748b', fontWeight: 600, display: 'block', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.6px' }}>Full Name</label>
                                <input
                                    style={{ width: '100%', background: '#0a1422', border: '1px solid rgba(59,130,246,0.2)', borderRadius: 8, padding: '10px 12px', fontSize: 13, color: '#f1f5f9', fontFamily: 'inherit', boxSizing: 'border-box' }}
                                    value={form.name}
                                    onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                                />
                            </div>
                            <div>
                                <label style={{ fontSize: 11, color: '#64748b', fontWeight: 600, display: 'block', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.6px' }}>Contact</label>
                                <input
                                    style={{ width: '100%', background: '#0a1422', border: '1px solid rgba(59,130,246,0.2)', borderRadius: 8, padding: '10px 12px', fontSize: 13, color: '#f1f5f9', fontFamily: 'inherit', boxSizing: 'border-box' }}
                                    value={form.contact}
                                    onChange={e => setForm(p => ({ ...p, contact: e.target.value }))}
                                />
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="driver-info-row"><span className="driver-info-row-label">Full Name</span><span className="driver-info-row-value">{driver.name}</span></div>
                            <div className="driver-info-row"><span className="driver-info-row-label">Contact</span><span className="driver-info-row-value">{driver.contact}</span></div>
                            <div className="driver-info-row"><span className="driver-info-row-label">Driver ID</span><span className="driver-info-row-value" style={{ fontFamily: 'monospace', fontSize: 12 }}>{driver.id}</span></div>
                            <div className="driver-info-row"><span className="driver-info-row-label">Joined</span><span className="driver-info-row-value">{driver.joiningDate}</span></div>
                        </>
                    )}
                </div>

                {/* License */}
                <div className="driver-info-card">
                    <div className="driver-info-card-title"><CreditCard size={14} /> License Details</div>
                    <div className="driver-info-row"><span className="driver-info-row-label">License No.</span><span className="driver-info-row-value" style={{ fontFamily: 'monospace', fontSize: 12 }}>{driver.licenseNo}</span></div>
                    <div className="driver-info-row">
                        <span className="driver-info-row-label">Expiry Date</span>
                        <span className="driver-info-row-value" style={{ color: licenseStatus.color }}>{driver.licenseExpiry}</span>
                    </div>
                    <div className="driver-info-row"><span className="driver-info-row-label">Status</span><span className={`badge ${licenseStatus.cls}`}>{licenseStatus.label}</span></div>
                    {daysToExpiry <= 90 && daysToExpiry > 0 && (
                        <div style={{ marginTop: 12, background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 8, padding: '10px 12px', fontSize: 12, color: '#fbbf24' }}>
                            ⚠ Please renew your license before {driver.licenseExpiry}
                        </div>
                    )}
                </div>

                {/* Performance */}
                <div className="driver-info-card">
                    <div className="driver-info-card-title"><Star size={14} /> Performance</div>
                    <div className="driver-info-row"><span className="driver-info-row-label">Rating</span>
                        <span className="driver-info-row-value" style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                            <span style={{ color: '#fbbf24' }}>★</span> {driver.rating.toFixed(1)} / 5.0
                        </span>
                    </div>
                    <div className="driver-info-row"><span className="driver-info-row-label">Trips Completed</span><span className="driver-info-row-value">{driver.tripsCompleted}</span></div>
                    <div className="driver-info-row"><span className="driver-info-row-label">Avg per Month</span><span className="driver-info-row-value">{Math.round(driver.tripsCompleted / 36)}</span></div>
                    <div className="driver-info-row"><span className="driver-info-row-label">Status</span><span className="badge available">Active Driver</span></div>
                </div>
            </div>
        </div>
    )
}
