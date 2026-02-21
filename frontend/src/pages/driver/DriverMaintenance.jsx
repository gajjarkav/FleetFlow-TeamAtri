import React, { useState, useRef } from 'react'
import { Wrench, AlertTriangle, CheckCircle, Clock, Truck, Plus, X, Send, Upload, FileText, RotateCcw } from 'lucide-react'
import { vehicles, getVehicleById, drivers } from '../../data/mockData'
import { useAuth } from '../../context/AuthContext'
import { useMaintenance } from '../../context/MaintenanceContext'

const ISSUE_TYPES = [
    'Oil & Filter Change', 'Brake Replacement', 'Tyre Rotation',
    'Engine Overhaul', 'Transmission Service', 'Suspension Check',
    'CNG Kit Calibration', 'Battery Replacement',
    'Tyre Puncture', 'Coolant Leak', 'Electrical Issue',
    'AC / Heating Issue', 'Windshield Crack', 'Other',
]

const defaultForm = { vehicleId: '', type: ISSUE_TYPES[0], description: '', scheduledDate: '', workshop: '', cost: '' }

const statusStyle = {
    scheduled: { label: 'Scheduled', color: '#fbbf24', bg: 'rgba(245,158,11,0.1)', Icon: Clock },
    in_progress: { label: 'In Progress', color: '#60a5fa', bg: 'rgba(59,130,246,0.1)', Icon: Wrench },
    completed: { label: 'Completed', color: '#34d399', bg: 'rgba(16,185,129,0.1)', Icon: CheckCircle },
}

const reimbStyle = {
    pending: { label: 'Pending Review', color: '#fbbf24', bg: 'rgba(245,158,11,0.12)' },
    approved: { label: 'Reimbursed ✓', color: '#34d399', bg: 'rgba(16,185,129,0.12)' },
    rejected: { label: 'Rejected', color: '#f87171', bg: 'rgba(239,68,68,0.12)' },
}

export default function DriverMaintenance() {
    const { user } = useAuth()
    const { records, addRecord, attachBill, markDone, getVehicleStatus } = useMaintenance()
    const driver = drivers.find(d => d.id === user?.driverId) || drivers[0]

    const driverRecords = records.filter(r => r.driverId === driver.id)
    const activeRecords = driverRecords.filter(r => r.status !== 'completed')
    const historyRecords = driverRecords.filter(r => r.status === 'completed')

    const [showForm, setShowForm] = useState(false)
    const [form, setForm] = useState(defaultForm)
    const [errors, setErrors] = useState({})
    const [submitted, setSubmitted] = useState(false)
    const [confirmDone, setConfirmDone] = useState(null) // recordId
    const fileRefs = useRef({})

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
            driverId: driver.id,
            driverName: driver.name,
            status: 'in_progress',
        })
        setShowForm(false)
        setForm(defaultForm)
        setErrors({})
        setSubmitted(true)
        setTimeout(() => setSubmitted(false), 4000)
    }

    const handleFileChange = (recordId, e) => {
        const file = e.target.files[0]
        if (file) attachBill(recordId, file)
    }

    const handleMarkDone = (record) => {
        markDone(record.id, record.vehicleId)
        setConfirmDone(null)
    }

    const assignedVehicle = vehicles.find(v => v.status === 'available') || vehicles[0]

    return (
        <div>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 24 }}>
                <div>
                    <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: '#f1f5f9' }}>Maintenance</h1>
                    <p style={{ margin: '4px 0 0', fontSize: 13, color: '#64748b' }}>Report issues, upload bills, and track reimbursements</p>
                </div>
                <button className="driver-action-btn primary" onClick={() => { setShowForm(true); setForm(defaultForm); setErrors({}) }}>
                    <Plus size={15} /> Report an Issue
                </button>
            </div>

            {/* Success toast */}
            {submitted && (
                <div style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 12, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20, fontSize: 13, color: '#34d399', fontWeight: 600 }}>
                    <CheckCircle size={18} />
                    Request submitted! Vehicle is now marked as Under Maintenance. Upload your bill once service is done.
                </div>
            )}

            {/* ── Inline Report Form ───────────────────── */}
            {showForm && (
                <div style={{ background: '#0f1829', border: '1px solid rgba(59,130,246,0.25)', borderRadius: 16, padding: '24px', marginBottom: 28, position: 'relative' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                        <div>
                            <div style={{ fontSize: 15, fontWeight: 800, color: '#f1f5f9' }}>Report a Maintenance Issue</div>
                            <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>Vehicle will be locked for maintenance until you mark it done</div>
                        </div>
                        <button onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', color: '#475569', cursor: 'pointer', padding: 4 }}>
                            <X size={18} />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px 20px' }}>
                        <div style={{ gridColumn: 'span 2' }}>
                            <label style={lblStyle}>Vehicle *</label>
                            <select style={{ ...inputStyle, borderColor: errors.vehicleId ? '#f87171' : 'rgba(59,130,246,0.2)' }} value={form.vehicleId} onChange={f('vehicleId')}>
                                <option value="">— Select vehicle —</option>
                                {vehicles.map(v => <option key={v.id} value={v.id}>{v.regNo} – {v.make} {v.model}</option>)}
                            </select>
                            {errors.vehicleId && <span style={errStyle}>{errors.vehicleId}</span>}
                        </div>

                        <div style={{ gridColumn: 'span 2' }}>
                            <label style={lblStyle}>Issue / Service Type</label>
                            <select style={inputStyle} value={form.type} onChange={f('type')}>
                                {ISSUE_TYPES.map(t => <option key={t}>{t}</option>)}
                            </select>
                        </div>

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

                        <div>
                            <label style={lblStyle}>Preferred Service Date *</label>
                            <input type="date" style={{ ...inputStyle, borderColor: errors.scheduledDate ? '#f87171' : 'rgba(59,130,246,0.2)' }} value={form.scheduledDate} onChange={f('scheduledDate')} />
                            {errors.scheduledDate && <span style={errStyle}>{errors.scheduledDate}</span>}
                        </div>

                        <div>
                            <label style={lblStyle}>Estimated Cost ₹ <span style={{ color: '#475569' }}>(optional)</span></label>
                            <input type="number" style={inputStyle} placeholder="5000" value={form.cost} onChange={f('cost')} />
                        </div>

                        <div style={{ gridColumn: 'span 2' }}>
                            <label style={lblStyle}>Preferred Workshop <span style={{ color: '#475569' }}>(optional)</span></label>
                            <input style={inputStyle} placeholder="e.g. Tata ExPress Fleet, Ahmedabad" value={form.workshop} onChange={f('workshop')} />
                        </div>

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

            {/* ── Active Requests ───────────────────────── */}
            <div style={{ marginBottom: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <h3 style={sectionHeader}>Active Requests ({activeRecords.length})</h3>
            </div>

            {activeRecords.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 32 }}>
                    {activeRecords.map(r => {
                        const v = getVehicleById(r.vehicleId)
                        const ss = statusStyle[r.status] || statusStyle.scheduled
                        const rs = reimbStyle[r.reimbursementStatus] || reimbStyle.pending
                        return (
                            <div key={r.id} style={{ background: '#0f1829', border: '1px solid rgba(59,130,246,0.15)', borderRadius: 14, padding: '18px 20px' }}>
                                {/* Top row */}
                                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 14 }}>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontSize: 14, fontWeight: 800, color: '#f1f5f9', marginBottom: 3 }}>{r.type}</div>
                                        <div style={{ fontSize: 12, color: '#64748b' }}>
                                            {v ? `${v.regNo} · ${v.make} ${v.model}` : r.vehicleId} · {r.scheduledDate}
                                        </div>
                                        {r.description && <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 4, fontStyle: 'italic' }}>"{r.description}"</div>}
                                        {r.workshop && r.workshop !== 'Pending Assignment' && (
                                            <div style={{ fontSize: 11, color: '#475569', marginTop: 4 }}>Workshop: {r.workshop}</div>
                                        )}
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6, flexShrink: 0 }}>
                                        <span style={{ fontSize: 11, fontWeight: 700, color: ss.color, background: ss.bg, padding: '4px 10px', borderRadius: 100 }}>{ss.label}</span>
                                        <span style={{ fontSize: 11, fontWeight: 700, color: rs.color, background: rs.bg, padding: '4px 10px', borderRadius: 100 }}>{rs.label}</span>
                                        {r.cost > 0 && <span style={{ fontSize: 12, fontWeight: 700, color: '#94a3b8' }}>₹{r.cost.toLocaleString()}</span>}
                                    </div>
                                </div>

                                {/* Bill upload section */}
                                <div style={{ borderTop: '1px solid rgba(59,130,246,0.08)', paddingTop: 14, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                        {r.billUrl ? (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                <a href={r.billUrl} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#60a5fa', fontWeight: 600, textDecoration: 'none', background: 'rgba(59,130,246,0.08)', padding: '6px 12px', borderRadius: 8 }}>
                                                    <FileText size={14} /> {r.billFileName || 'View Bill'}
                                                </a>
                                                <button
                                                    onClick={() => fileRefs.current[r.id]?.click()}
                                                    style={{ fontSize: 11, color: '#64748b', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
                                                >
                                                    <RotateCcw size={12} /> Replace
                                                </button>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => fileRefs.current[r.id]?.click()}
                                                style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#94a3b8', background: 'rgba(255,255,255,0.04)', border: '1px dashed rgba(59,130,246,0.25)', borderRadius: 8, padding: '7px 14px', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600 }}
                                            >
                                                <Upload size={13} /> Upload Bill / Receipt
                                            </button>
                                        )}
                                        <input
                                            ref={el => fileRefs.current[r.id] = el}
                                            type="file"
                                            accept="image/*,application/pdf"
                                            style={{ display: 'none' }}
                                            onChange={(e) => handleFileChange(r.id, e)}
                                        />
                                    </div>

                                    {/* Mark Done */}
                                    {r.status !== 'completed' && (
                                        confirmDone === r.id ? (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                <span style={{ fontSize: 12, color: '#fbbf24' }}>Vehicle will be marked available. Confirm?</span>
                                                <button onClick={() => handleMarkDone(r)} style={{ fontSize: 12, background: 'rgba(16,185,129,0.12)', border: 'none', color: '#34d399', borderRadius: 8, padding: '6px 14px', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 700 }}>Yes, Done</button>
                                                <button onClick={() => setConfirmDone(null)} style={{ fontSize: 12, background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontFamily: 'inherit' }}>Cancel</button>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => setConfirmDone(r.id)}
                                                style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 700, color: '#34d399', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 8, padding: '7px 16px', cursor: 'pointer', fontFamily: 'inherit' }}
                                            >
                                                <CheckCircle size={14} /> Mark as Done
                                            </button>
                                        )
                                    )}
                                </div>
                            </div>
                        )
                    })}
                </div>
            ) : (
                <div style={{ background: '#0f1829', border: '1px solid rgba(59,130,246,0.1)', borderRadius: 14, padding: '32px 20px', textAlign: 'center', marginBottom: 32 }}>
                    <div style={{ fontSize: 36, marginBottom: 10 }}>🔧</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#cbd5e1', marginBottom: 6 }}>No active maintenance requests</div>
                    <div style={{ fontSize: 13, color: '#475569' }}>Use "Report an Issue" to notify fleet admin of vehicle problems.</div>
                </div>
            )}

            {/* ── History ───────────────────────────────── */}
            {historyRecords.length > 0 && (
                <>
                    <h3 style={{ ...sectionHeader, marginBottom: 14 }}>History ({historyRecords.length})</h3>
                    <div className="driver-info-card">
                        {historyRecords.map((r, i) => {
                            const v = getVehicleById(r.vehicleId)
                            const rs = reimbStyle[r.reimbursementStatus] || reimbStyle.pending
                            return (
                                <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '13px 0', borderBottom: i < historyRecords.length - 1 ? '1px solid rgba(59,130,246,0.07)' : 'none' }}>
                                    <div style={{ width: 34, height: 34, borderRadius: 9, background: 'rgba(16,185,129,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                        <CheckCircle size={16} color="#34d399" />
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ fontSize: 13, fontWeight: 700, color: '#f1f5f9' }}>{r.type}</div>
                                        <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>
                                            {v ? v.regNo : r.vehicleId} · Completed {r.completedDate || r.scheduledDate}
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 5, flexShrink: 0 }}>
                                        <span style={{ fontSize: 11, fontWeight: 700, color: rs.color, background: rs.bg, padding: '3px 9px', borderRadius: 100 }}>{rs.label}</span>
                                        {r.cost > 0 && <span style={{ fontSize: 12, color: '#64748b' }}>₹{r.cost.toLocaleString()}</span>}
                                        {r.billUrl && (
                                            <a href={r.billUrl} target="_blank" rel="noreferrer" style={{ fontSize: 11, color: '#60a5fa', display: 'flex', alignItems: 'center', gap: 4 }}>
                                                <FileText size={11} /> Bill
                                            </a>
                                        )}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </>
            )}
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
    fontSize: 12, fontWeight: 700, color: '#475569',
    textTransform: 'uppercase', letterSpacing: '0.8px', margin: '0 0 14px',
}
