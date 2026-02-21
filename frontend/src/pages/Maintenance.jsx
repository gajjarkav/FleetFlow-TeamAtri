import React, { useState } from 'react'
import { Plus, Search, Wrench, AlertTriangle, CheckCircle, Clock, ChevronDown } from 'lucide-react'
import Modal from '../components/Modal'
import { vehicles, getVehicleById } from '../data/mockData'
import { useMaintenance } from '../context/MaintenanceContext'

const statusLabel = { scheduled: 'Scheduled', in_progress: 'In Progress', completed: 'Completed' }
const maintTypes = ['Oil & Filter Change', 'Brake Replacement', 'Tyre Rotation', 'Engine Overhaul', 'Transmission Service', 'Suspension Check', 'CNG Kit Calibration', 'Battery Replacement', 'Other']
const defaultForm = { vehicleId: '', type: maintTypes[0], description: '', scheduledDate: '', workshop: '', cost: '' }

export default function Maintenance() {
    const { records, addRecord, updateStatus } = useMaintenance()
    const [search, setSearch] = useState('')
    const [filter, setFilter] = useState('all')
    const [showModal, setShowModal] = useState(false)
    const [form, setForm] = useState(defaultForm)
    const [errors, setErrors] = useState({})

    const filtered = records.filter(r => {
        const matchStatus = filter === 'all' || r.status === filter
        const q = search.toLowerCase()
        const v = getVehicleById(r.vehicleId)
        const matchSearch = !q || r.type.toLowerCase().includes(q) || (r.workshop || '').toLowerCase().includes(q) || (v && v.regNo.toLowerCase().includes(q))
        return matchStatus && matchSearch
    })

    const validate = () => {
        const e = {}
        if (!form.vehicleId) e.vehicleId = 'Select a vehicle'
        if (!form.scheduledDate) e.scheduledDate = 'Schedule date is required'
        if (!form.workshop.trim()) e.workshop = 'Workshop name is required'
        if (!form.cost || +form.cost <= 0) e.cost = 'Estimated cost is required'
        return e
    }

    const handleSubmit = () => {
        const e = validate()
        if (Object.keys(e).length) { setErrors(e); return }
        addRecord({ ...form, cost: +form.cost })
        setShowModal(false)
        setForm(defaultForm)
        setErrors({})
    }

    const f = (k) => (e) => { setForm(p => ({ ...p, [k]: e.target.value })); setErrors(p => ({ ...p, [k]: undefined })) }

    const maintenanceVehicles = vehicles.filter(v => v.status === 'maintenance')

    // Driver-submitted records (tagged with source)
    const driverRequests = records.filter(r => r.reportedByDriver)

    return (
        <div>
            <div className="page-header">
                <div>
                    <h1>Maintenance</h1>
                    <p>Track vehicle service records, schedule repairs, and monitor fleet health</p>
                </div>
                <button className="btn btn-primary" onClick={() => { setShowModal(true); setForm(defaultForm); setErrors({}) }}>
                    <Plus size={16} /> Schedule Maintenance
                </button>
            </div>

            {/* Driver-reported requests banner */}
            {driverRequests.length > 0 && (
                <div className="alert-banner info" style={{ marginBottom: 18, background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: 12, padding: '12px 18px', display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Wrench size={16} style={{ color: '#60a5fa', flexShrink: 0 }} />
                    <div>
                        <strong style={{ color: '#93c5fd' }}>{driverRequests.length} driver-submitted request{driverRequests.length > 1 ? 's' : ''}</strong>
                        <span style={{ color: '#64748b', fontSize: 12, marginLeft: 8 }}>Review and take action below.</span>
                    </div>
                </div>
            )}

            {maintenanceVehicles.length > 0 && (
                <div className="alert-banner warning" style={{ marginBottom: 24 }}>
                    <AlertTriangle size={17} style={{ flexShrink: 0 }} />
                    <div><strong>{maintenanceVehicles.length} vehicle(s) locked for maintenance:</strong> {maintenanceVehicles.map(v => v.regNo).join(', ')} — unavailable for trip dispatch.</div>
                </div>
            )}

            {/* Summary cards */}
            <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', marginBottom: 24 }}>
                {[
                    { label: 'Scheduled', count: records.filter(r => r.status === 'scheduled').length, cls: 'amber', Icon: Clock },
                    { label: 'In Progress', count: records.filter(r => r.status === 'in_progress').length, cls: 'blue', Icon: Wrench },
                    { label: 'Completed', count: records.filter(r => r.status === 'completed').length, cls: 'green', Icon: CheckCircle },
                    { label: 'Total Cost', count: `₹${records.reduce((s, r) => s + (r.cost || 0), 0).toLocaleString()}`, cls: 'red', Icon: AlertTriangle },
                ].map(s => (
                    <div key={s.label} className="stat-card">
                        <div className={`stat-icon ${s.cls}`}><s.Icon size={20} /></div>
                        <div className="stat-info">
                            <div className="stat-value" style={{ fontSize: 20 }}>{s.count}</div>
                            <div className="stat-label">{s.label}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Table */}
            <div className="table-container">
                <div className="table-header">
                    <span className="table-title">Maintenance Records</span>
                    <div className="table-actions">
                        <div className="filter-tabs">
                            {['all', 'scheduled', 'in_progress', 'completed'].map(s => (
                                <button key={s} className={`filter-tab${filter === s ? ' active' : ''}`} onClick={() => setFilter(s)}>
                                    {s === 'all' ? 'All' : statusLabel[s]}
                                </button>
                            ))}
                        </div>
                        <div className="search-input-wrap">
                            <Search size={14} className="search-icon" />
                            <input className="search-input" placeholder="Search records..." value={search} onChange={e => setSearch(e.target.value)} />
                        </div>
                    </div>
                </div>
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Vehicle</th>
                            <th>Service Type</th>
                            <th>Workshop</th>
                            <th>Scheduled</th>
                            <th>Cost (₹)</th>
                            <th>Source</th>
                            <th>Status</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.map(r => {
                            const v = getVehicleById(r.vehicleId)
                            return (
                                <tr key={r.id} style={r.reportedByDriver ? { background: 'rgba(59,130,246,0.04)' } : {}}>
                                    <td style={{ fontFamily: 'monospace', color: 'var(--text-muted)', fontSize: 12 }}>{r.id}</td>
                                    <td>
                                        <div style={{ fontWeight: 600, fontSize: 13 }}>{v ? v.regNo : r.vehicleId}</div>
                                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{v ? `${v.make} ${v.model}` : ''}</div>
                                    </td>
                                    <td>
                                        <div style={{ fontWeight: 600 }}>{r.type}</div>
                                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{r.technician && r.technician !== 'N/A' ? `Tech: ${r.technician}` : ''}</div>
                                    </td>
                                    <td style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{r.workshop || '—'}</td>
                                    <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>{r.scheduledDate}</td>
                                    <td style={{ fontWeight: 700 }}>₹{r.cost?.toLocaleString()}</td>
                                    <td>
                                        {r.reportedByDriver
                                            ? <span style={{ fontSize: 11, fontWeight: 700, color: '#60a5fa', background: 'rgba(59,130,246,0.1)', padding: '3px 8px', borderRadius: 100 }}>Driver</span>
                                            : <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Admin</span>}
                                    </td>
                                    <td><span className={`badge ${r.status}`}>{statusLabel[r.status]}</span></td>
                                    <td>
                                        {r.status !== 'completed' && (
                                            <select
                                                value={r.status}
                                                onChange={e => updateStatus(r.id, e.target.value)}
                                                style={{ background: '#0a1422', border: '1px solid rgba(59,130,246,0.2)', borderRadius: 7, color: '#cbd5e1', fontSize: 12, padding: '5px 8px', cursor: 'pointer', fontFamily: 'inherit' }}
                                            >
                                                <option value="scheduled">Scheduled</option>
                                                <option value="in_progress">In Progress</option>
                                                <option value="completed">Completed</option>
                                            </select>
                                        )}
                                        {r.status === 'completed' && <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Done</span>}
                                    </td>
                                </tr>
                            )
                        })}
                        {filtered.length === 0 && (
                            <tr><td colSpan={9} style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>No maintenance records found</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {showModal && (
                <Modal title="Schedule Maintenance" onClose={() => setShowModal(false)}
                    footer={<>
                        <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                        <button className="btn btn-primary" onClick={handleSubmit}><Wrench size={15} /> Schedule</button>
                    </>}
                >
                    <div className="form-grid">
                        <div className="form-group full">
                            <label className="form-label">Vehicle *</label>
                            <select className={`form-control${errors.vehicleId ? ' error' : ''}`} value={form.vehicleId} onChange={f('vehicleId')}>
                                <option value="">— Select Vehicle —</option>
                                {vehicles.map(v => <option key={v.id} value={v.id}>{v.regNo} – {v.make} {v.model}</option>)}
                            </select>
                            {errors.vehicleId && <span className="form-error">{errors.vehicleId}</span>}
                        </div>
                        <div className="form-group full">
                            <label className="form-label">Service Type</label>
                            <select className="form-control" value={form.type} onChange={f('type')}>
                                {maintTypes.map(t => <option key={t}>{t}</option>)}
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Scheduled Date *</label>
                            <input className={`form-control${errors.scheduledDate ? ' error' : ''}`} type="date" value={form.scheduledDate} onChange={f('scheduledDate')} />
                            {errors.scheduledDate && <span className="form-error">{errors.scheduledDate}</span>}
                        </div>
                        <div className="form-group">
                            <label className="form-label">Estimated Cost (₹) *</label>
                            <input className={`form-control${errors.cost ? ' error' : ''}`} type="number" placeholder="5000" value={form.cost} onChange={f('cost')} />
                            {errors.cost && <span className="form-error">{errors.cost}</span>}
                        </div>
                        <div className="form-group full">
                            <label className="form-label">Workshop / Service Center *</label>
                            <input className={`form-control${errors.workshop ? ' error' : ''}`} placeholder="e.g. Tata ExPress Fleet, Ahmedabad" value={form.workshop} onChange={f('workshop')} />
                            {errors.workshop && <span className="form-error">{errors.workshop}</span>}
                        </div>
                        <div className="form-group full">
                            <label className="form-label">Description</label>
                            <input className="form-control" placeholder="Optional description..." value={form.description} onChange={f('description')} />
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    )
}
