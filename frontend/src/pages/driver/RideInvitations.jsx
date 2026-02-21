import React, { useState } from 'react'
import { CheckCircle, XCircle, Clock, Truck, Package, MapPin } from 'lucide-react'
import { trips, vehicles, getVehicleById } from '../../data/mockData'
import { useAuth } from '../../context/AuthContext'

// Pending invitations — trips that are 'scheduled' (not yet dispatched to this driver officially)
const INVITATIONS_POOL = [
    {
        id: 'INV001', tripId: 'T009', from: 'Ahmedabad', to: 'Jaipur',
        vehicleId: 'V001', cargoType: 'Electronics', cargoWeight: 480,
        distanceKm: 648, scheduledDate: '2026-02-23', estimatedHours: 10,
        priority: 'high',
    },
    {
        id: 'INV002', tripId: 'T010', from: 'Surat', to: 'Mumbai',
        vehicleId: 'V003', cargoType: 'Textiles', cargoWeight: 900,
        distanceKm: 290, scheduledDate: '2026-02-22', estimatedHours: 5,
        priority: 'normal',
    },
    {
        id: 'INV003', tripId: 'T011', from: 'Vadodara', to: 'Pune',
        vehicleId: 'V005', cargoType: 'Chemicals', cargoWeight: 2100,
        distanceKm: 420, scheduledDate: '2026-02-24', estimatedHours: 7,
        priority: 'normal',
    },
]

const priorityStyle = {
    high: { background: 'rgba(239,68,68,0.1)', color: '#f87171', text: 'High Priority' },
    normal: { background: 'rgba(59,130,246,0.1)', color: '#60a5fa', text: 'Normal' },
}

export default function RideInvitations() {
    const [invitations, setInvitations] = useState(
        INVITATIONS_POOL.map(i => ({ ...i, status: 'pending' }))
    )

    const respond = (id, status) => {
        setInvitations(prev => prev.map(inv => inv.id === id ? { ...inv, status } : inv))
    }

    const pending = invitations.filter(i => i.status === 'pending')
    const resolved = invitations.filter(i => i.status !== 'pending')

    return (
        <div>
            <div className="driver-page-header">
                <h1>Ride Invitations</h1>
                <p>Review and respond to trip assignments from fleet dispatch</p>
            </div>

            {/* Counts */}
            <div style={{ display: 'flex', gap: 14, marginBottom: 28 }}>
                {[
                    { label: 'Pending', count: pending.length, color: '#60a5fa' },
                    { label: 'Accepted', count: invitations.filter(i => i.status === 'accepted').length, color: '#34d399' },
                    { label: 'Declined', count: invitations.filter(i => i.status === 'declined').length, color: '#9ca3af' },
                ].map(s => (
                    <div key={s.label} style={{ background: '#0f1829', border: '1px solid rgba(59,130,246,0.1)', borderRadius: 12, padding: '14px 22px' }}>
                        <div style={{ fontSize: 22, fontWeight: 800, color: s.color }}>{s.count}</div>
                        <div style={{ fontSize: 12, color: '#64748b', fontWeight: 500 }}>{s.label}</div>
                    </div>
                ))}
            </div>

            {/* Pending Invitations */}
            {pending.length > 0 ? (
                <>
                    <h3 style={{ fontSize: 13, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 16 }}>
                        Pending ({pending.length})
                    </h3>
                    <div className="invitation-grid" style={{ marginBottom: 32 }}>
                        {pending.map(inv => {
                            const vehicle = getVehicleById(inv.vehicleId)
                            const p = priorityStyle[inv.priority]
                            return (
                                <div key={inv.id} className="invitation-card">
                                    <div className="invitation-card-header">
                                        <span className="invitation-trip-id">{inv.tripId}</span>
                                        <span style={{ background: p.background, color: p.color, fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 100 }}>
                                            {p.text}
                                        </span>
                                    </div>

                                    <div className="invitation-card-body">
                                        {/* Route */}
                                        <div className="invitation-route">
                                            <div>
                                                <div className="invitation-location-label">From</div>
                                                <div className="invitation-location-name">{inv.from}</div>
                                            </div>
                                            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#334155' }}>
                                                <div style={{ height: 1, flex: 1, background: 'rgba(59,130,246,0.15)' }} />
                                                <MapPin size={14} color="#3b82f6" style={{ margin: '0 6px' }} />
                                                <div style={{ height: 1, flex: 1, background: 'rgba(16,185,129,0.15)' }} />
                                            </div>
                                            <div style={{ textAlign: 'right' }}>
                                                <div className="invitation-location-label">To</div>
                                                <div className="invitation-location-name">{inv.to}</div>
                                            </div>
                                        </div>

                                        {/* Meta */}
                                        <div className="invitation-meta">
                                            <div className="invitation-meta-item">
                                                <div className="invitation-meta-label">Vehicle</div>
                                                <div className="invitation-meta-value">{vehicle ? vehicle.regNo : inv.vehicleId}</div>
                                            </div>
                                            <div className="invitation-meta-item">
                                                <div className="invitation-meta-label">Cargo</div>
                                                <div className="invitation-meta-value">{inv.cargoWeight} kg</div>
                                            </div>
                                            <div className="invitation-meta-item">
                                                <div className="invitation-meta-label">Distance</div>
                                                <div className="invitation-meta-value">{inv.distanceKm} km</div>
                                            </div>
                                            <div className="invitation-meta-item">
                                                <div className="invitation-meta-label">Est. Time</div>
                                                <div className="invitation-meta-value">{inv.estimatedHours}h</div>
                                            </div>
                                            <div className="invitation-meta-item" style={{ gridColumn: 'span 2' }}>
                                                <div className="invitation-meta-label">Scheduled</div>
                                                <div className="invitation-meta-value">{inv.scheduledDate}</div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="invitation-actions">
                                        <button className="invitation-btn-accept" onClick={() => respond(inv.id, 'accepted')}>
                                            <CheckCircle size={15} /> Accept
                                        </button>
                                        <button className="invitation-btn-decline" onClick={() => respond(inv.id, 'declined')}>
                                            <XCircle size={15} /> Decline
                                        </button>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </>
            ) : (
                <div className="driver-empty" style={{ marginBottom: 32 }}>
                    <div className="driver-empty-icon"><Clock size={48} /></div>
                    <h3>No pending invitations</h3>
                    <p>All assignments have been responded to. New invitations will appear here.</p>
                </div>
            )}

            {/* Resolved */}
            {resolved.length > 0 && (
                <>
                    <h3 style={{ fontSize: 13, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 16 }}>
                        History
                    </h3>
                    <div className="invitation-grid">
                        {resolved.map(inv => (
                            <div key={inv.id} className={`invitation-card ${inv.status}`}>
                                <div className="invitation-card-header">
                                    <span className="invitation-trip-id">{inv.tripId}</span>
                                </div>
                                <div className="invitation-card-body">
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                                        <span style={{ fontWeight: 700, color: '#f1f5f9' }}>{inv.from} → {inv.to}</span>
                                    </div>
                                    <div style={{ fontSize: 12, color: '#475569' }}>{inv.distanceKm} km · {inv.cargoWeight} kg · {inv.scheduledDate}</div>
                                </div>
                                <div className="invitation-actions">
                                    <div className={`invitation-result-badge ${inv.status}`}>
                                        {inv.status === 'accepted' ? <><CheckCircle size={14} /> Accepted</> : <><XCircle size={14} /> Declined</>}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    )
}
