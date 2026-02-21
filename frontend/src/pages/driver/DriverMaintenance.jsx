import React, { useState } from 'react'
import { Wrench, AlertTriangle, CheckCircle, Clock, Truck, Plus, X, Send } from 'lucide-react'
import { vehicles, getVehicleById, drivers } from '../../data/mockData'
import { useAuth } from '../../context/AuthContext'
import { useMaintenance } from '../../context/MaintenanceContext'

const statusStyle = {
    scheduled: { label: 'Scheduled', cls: 'scheduled' },
    in_progress: { label: 'In Progress', cls: 'in_use' },
    completed: { label: 'Completed', cls: 'available' },
}

const ISSUE_TYPES = [
    'Oil & Filter Change', 'Brake Replacement', 'Tyre Rotation',
    'Engine Overhaul', 'Transmission Service', 'Suspension Check',
    'CNG Kit Calibration', 'Battery Replacement',
    'Tyre Puncture', 'Coolant Leak', 'Electrical Issue',
    'AC / Heating Issue', 'Windshield Crack', 'Other',
]

const defaultForm = { vehicleId: '', type: ISSUE_TYPES[0], description: '', scheduledDate: '', workshop: '', cost: '' }

export default function DriverMaintenance() {
    const { user } = useAuth()
    const { records, addRecord, updateStatus } = useMaintenance()
    const driver = drivers.find(d => d.id === user?.driverId) || drivers[0]

    // Driver's personally-reported records
    const driverReported = records.filter(r => r.reportedBy === driver.id)
    // All other records (fleet-wide, for awareness)
    const fleetRecords = records.filter(r => !r.reportedBy).slice(0, 6)

    // Assigned vehicle: first one associated with driver or fallback
    const assignedVehicle = vehicles.find(v => v.status === 'available') || vehicles[0]

    const [showForm, setShowForm] = useState(false)
    const [form, setForm] = useState(defaultForm)
    const [errors, setErrors] = useState({})
    const [submitted, setSubmitted] = useState(false)

    const f = (k) => (e) => { setForm(p => ({ ...p, [k]: e.target.value })); setErrors(p => ({ ...p, [k]: undefined })) }

    const validate = () => {
        const e = {}
        if (!form.vehicleId) e.vehicleId = 'Select your vehicle'
        if (!form.scheduledDate) e.scheduledDate = 'Date is required'
        if (!form.description.trim()) e.description = 'Please describe the issue'
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
            reportedByDriver: true,   // admin sees this tag
            reportedBy: driver.id,
            driverName: driver.name,
        })

        setShowForm(false)
        setForm(defaultForm)
        setErrors({})
        setSubmitted(true)
        setTimeout(() => setSubmitted(false), 3000)
    }

    const hasServiceAlert = assignedVehicle.status === 'maintenance'

    return (
        <div>
            <div className="driver-page-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                <div>
                    <h1>Maintenance</h1>
                    <p>Report issues for your vehicle or track your requests</p>
                </div>
                <button className="driver-action-btn primary" onClick={() => { setShowForm(true); setForm(defaultForm); setErrors({}) }}>
                    <Plus size={15} /> Report an Issue
                </button>
            </div>

            {/* Success toast */}
            {submitted && (
                <div style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 12, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20, fontSize: 13, color: '#34d399', fontWeight: 600 }}>
                    <CheckCircle size={18} />
                    Request submitted! Fleet admin has been notified.
                </div>
            )}

            {/* Assigned Vehicle Status */}
            <div className="driver-hero-card" style={{ marginBottom: 24 }}>
                <div className="driver-hero-left">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                        <div style={{ width: 40, height: 40, background: 'rgba(59,130,246,0.15)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Truck size={20} color="#60a5fa" />
                        </div>
                        <div>
                            <div style={{ fontSize: 11, color: '#475569', fontWeight: 600, letterSpacing: '0.6px', textTransform: 'uppercase' }}>Assigned Vehicle</div>
                            <div style={{ fontSize: 18, fontWeight: 800, color: '#f1f5f9' }}>{assignedVehicle.regNo}</div>
                        </div>
                    </div>
                    <p>{assignedVehicle.make} {assignedVehicle.model} · {assignedVehicle.type} · {assignedVehicle.fuelType}</p>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-end' }}>
                    <div className={`driver-status-badge ${hasServiceAlert ? 'on-trip' : 'on-duty'}`}>
                        <span className="driver-status-dot" />
                        {hasServiceAlert ? 'Under Service' : 'Operational'}
                    </div>
                    <div style={{ fontSize: 12, color: '#475569' }}>Next service: {assignedVehicle.nextService}</div>
                </div>
            </div>

            {/* Alert if under maintenance */}
            {hasServiceAlert && (
                <div style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 12, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                    <AlertTriangle size={18} color="#fbbf24" />
                    <div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: '#fbbf24' }}>Vehicle Under Maintenance</div>
                        <div style={{ fontSize: 12, color: '#78716c', marginTop: 2 }}>This vehicle is currently being serviced and may not be available for trips.</div>
                    </div>
                </div>
            )}

            {/* ── Inline Report Form ───────────────────── */}
            {showForm && (
                <div style={{ background: '#0f1829', border: '1px solid rgba(59,130,246,0.2)', borderRadius: 16, padding: '24px', marginBottom: 28, position: 'relative' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                        <div>
                            <div style={{ fontSize: 15, fontWeight: 800, color: '#f1f5f9' }}>Report a Vehicle Issue</div>
                            <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>This request will be sent directly to fleet admin</div>
                        </div>
                        <button onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', color: '#475569', cursor: 'pointer', padding: 4 }}>
                            <X size={18} />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px 20px' }}>
                        {/* Vehicle select */}
                        <div style={{ gridColumn: 'span 2' }}>
                            <label style={lblStyle}>Vehicle *</label>
                            <select
                                style={{ ...inputStyle, borderColor: errors.vehicleId ? '#f87171' : 'rgba(59,130,246,0.2)' }}
                                value={form.vehicleId}
                                onChange={f('vehicleId')}
                            >
                                <option value="">— Select vehicle —</option>
                                {vehicles.map(v => <option key={v.id} value={v.id}>{v.regNo} – {v.make} {v.model}</option>)}
                            </select>
                            {errors.vehicleId && <span style={errStyle}>{errors.vehicleId}</span>}
                        </div>

                        {/* Issue Type */}
                        <div style={{ gridColumn: 'span 2' }}>
                            <label style={lblStyle}>Issue / Service Type</label>
                            <select style={inputStyle} value={form.type} onChange={f('type')}>
                                {ISSUE_TYPES.map(t => <option key={t}>{t}</option>)}
                            </select>
                        </div>

                        {/* Description */}
                        <div style={{ gridColumn: 'span 2' }}>
                            <label style={lblStyle}>Describe the Issue *</label>
                            <textarea
                                style={{ ...inputStyle, minHeight: 80, resize: 'vertical', borderColor: errors.description ? '#f87171' : 'rgba(59,130,246,0.2)' }}
                                placeholder="Describe what you observed or heard..."
                                value={form.description}
                                onChange={f('description')}
                            />
                            {errors.description && <span style={errStyle}>{errors.description}</span>}
                        </div>

                        {/* Preferred date */}
                        <div>
                            <label style={lblStyle}>Preferred Service Date *</label>
                            <input
                                type="date"
                                style={{ ...inputStyle, borderColor: errors.scheduledDate ? '#f87171' : 'rgba(59,130,246,0.2)' }}
                                value={form.scheduledDate}
                                onChange={f('scheduledDate')}
                            />
                            {errors.scheduledDate && <span style={errStyle}>{errors.scheduledDate}</span>}
                        </div>

                        {/* Estimated cost */}
                        <div>
                            <label style={lblStyle}>Estimated Cost ₹ <span style={{ color: '#475569' }}>(optional)</span></label>
                            <input
                                type="number"
                                style={inputStyle}
                                placeholder="5000"
                                value={form.cost}
                                onChange={f('cost')}
                            />
                        </div>

                        {/* Workshop preference */}
                        <div style={{ gridColumn: 'span 2' }}>
                            <label style={lblStyle}>Preferred Workshop <span style={{ color: '#475569' }}>(optional)</span></label>
                            <input
                                style={inputStyle}
                                placeholder="e.g. Tata ExPress Fleet, Ahmedabad"
                                value={form.workshop}
                                onChange={f('workshop')}
                            />
                        </div>

                        {/* Buttons */}
                        <div style={{ gridColumn: 'span 2', display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                            <button type="button" onClick={() => setShowForm(false)} style={{ background: '#0a1422', border: '1px solid rgba(59,130,246,0.15)', color: '#94a3b8', borderRadius: 10, padding: '10px 20px', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600, fontSize: 13 }}>
                                Cancel
                            </button>
                            <button type="submit" className="driver-action-btn primary" style={{ padding: '10px 24px' }}>
                                <Send size={15} /> Submit Request
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* ── My Reported Requests ─────────────────── */}
            <h3 style={sectionHeader}>My Requests ({driverReported.length})</h3>
            {driverReported.length > 0 ? (
                <div className="driver-info-card" style={{ marginBottom: 28 }}>
                    {driverReported.map((m, i) => {
                        const v = getVehicleById(m.vehicleId)
                        const s = statusStyle[m.status] || statusStyle.scheduled
                        return (
                            <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 0', borderBottom: i < driverReported.length - 1 ? '1px solid rgba(59,130,246,0.07)' : 'none' }}>
                                <div style={{ width: 36, height: 36, borderRadius: 10, background: m.status === 'completed' ? 'rgba(16,185,129,0.1)' : m.status === 'in_progress' ? 'rgba(59,130,246,0.1)' : 'rgba(245,158,11,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                    {m.status === 'completed' ? <CheckCircle size={16} color="#34d399" /> : m.status === 'in_progress' ? <Wrench size={16} color="#60a5fa" /> : <Clock size={16} color="#fbbf24" />}
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ fontSize: 13, fontWeight: 700, color: '#f1f5f9' }}>{m.type}</div>
                                    <div style={{ fontSize: 12, color: '#64748b', margin: '2px 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                        {v ? v.regNo : m.vehicleId} · {m.scheduledDate}
                                        {m.description ? ` · ${m.description}` : ''}
                                    </div>
                                    {m.workshop && m.workshop !== 'Pending Assignment' && (
                                        <div style={{ fontSize: 11, color: '#475569' }}>Workshop: {m.workshop}</div>
                                    )}
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6, flexShrink: 0 }}>
                                    <span className={`badge ${s.cls}`}>{s.label}</span>
                                    {m.status === 'scheduled' && (
                                        <button
                                            onClick={() => updateStatus(m.id, 'in_progress')}
                                            style={{ fontSize: 11, color: '#60a5fa', background: 'rgba(59,130,246,0.08)', border: 'none', borderRadius: 7, padding: '4px 10px', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600 }}
                                        >
                                            Mark In Progress
                                        </button>
                                    )}
                                    {m.status === 'in_progress' && (
                                        <button
                                            onClick={() => updateStatus(m.id, 'completed')}
                                            style={{ fontSize: 11, color: '#34d399', background: 'rgba(16,185,129,0.08)', border: 'none', borderRadius: 7, padding: '4px 10px', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600 }}
                                        >
                                            Mark Completed
                                        </button>
                                    )}
                                </div>
                            </div>
                        )
                    })}
                </div>
            ) : (
                <div className="driver-empty" style={{ marginBottom: 28, padding: '28px 20px' }}>
                    <div style={{ fontSize: 36, marginBottom: 10 }}>🔧</div>
                    <h3>No requests submitted yet</h3>
                    <p>Use the "Report an Issue" button to notify fleet admin of any vehicle problems.</p>
                </div>
            )}

            {/* ── Fleet-Wide Upcoming (read-only) ─────── */}
            <h3 style={sectionHeader}>Fleet-Wide Scheduled Services</h3>
            <div className="driver-info-card">
                {fleetRecords.length > 0 ? fleetRecords.map((m, i) => {
                    const v = getVehicleById(m.vehicleId)
                    const s = statusStyle[m.status] || statusStyle.scheduled
                    return (
                        <div key={m.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: i < fleetRecords.length - 1 ? '1px solid rgba(59,130,246,0.07)' : 'none' }}>
                            <div>
                                <div style={{ fontSize: 13, fontWeight: 600, color: '#cbd5e1' }}>{v ? v.regNo : m.vehicleId} – {m.type}</div>
                                <div style={{ fontSize: 11, color: '#475569' }}>{m.scheduledDate} · {m.workshop || '—'}</div>
                            </div>
                            <span className={`badge ${s.cls}`} style={{ fontSize: 11 }}>{s.label}</span>
                        </div>
                    )
                }) : (
                    <div style={{ fontSize: 13, color: '#475569', textAlign: 'center', padding: '20px 0' }}>No upcoming fleet maintenance</div>
                )}
            </div>
        </div>
    )
}

// ── Inline styles ──
const lblStyle = {
    display: 'block', fontSize: 11, fontWeight: 700,
    color: '#64748b', textTransform: 'uppercase',
    letterSpacing: '0.7px', marginBottom: 6,
}
const inputStyle = {
    width: '100%', boxSizing: 'border-box',
    background: '#0a1422', border: '1px solid rgba(59,130,246,0.2)',
    borderRadius: 9, padding: '11px 13px', fontSize: 13,
    color: '#f1f5f9', fontFamily: 'inherit',
}
const errStyle = {
    display: 'block', fontSize: 11, color: '#f87171', marginTop: 4,
}
const sectionHeader = {
    fontSize: 13, fontWeight: 700, color: '#475569',
    textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 14,
}
