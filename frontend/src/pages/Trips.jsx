import React, { useState, useEffect } from 'react'
import { Plus, Search, AlertTriangle, CheckCircle } from 'lucide-react'
import Modal from '../components/Modal'
import Toast, { useToast } from '../components/Toast'
import { tripApi, vehicleApi, authApi } from '../services/api'

const statusLabel = { assigned: 'Assigned', in_progress: 'In Progress', completed: 'Completed', cancelled: 'Cancelled' }
const defaultForm = { vehicle_id: '', dispatcher_id: '', total_km: '', start_time: '', end_time: '', payment_amount: '' }

export default function Trips() {
    const [trips, setTrips] = useState([])
    const [vehicles, setVehicles] = useState([])
    const [dispatchers, setDispatchers] = useState([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [statusFilter, setStatusFilter] = useState('all')
    const [showModal, setShowModal] = useState(false)
    const [form, setForm] = useState(defaultForm)
    const [errors, setErrors] = useState({})
    const [submitting, setSubmitting] = useState(false)
    const { toasts, addToast, removeToast } = useToast()

    const fetchData = async () => {
        try {
            const [t, v, d] = await Promise.all([tripApi.list(), vehicleApi.list(), authApi.listDispatchers()])
            setTrips(t)
            setVehicles(v)
            setDispatchers(d)
        } catch (err) {
            console.error('Failed to load trips:', err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { fetchData() }, [])

    const getVehicle = (id) => vehicles.find(v => v.id === id)
    const getDispatcher = (id) => dispatchers.find(d => d.id === id)

    const filtered = trips.filter(t => {
        const matchStatus = statusFilter === 'all' || t.status === statusFilter
        const q = search.toLowerCase()
        const v = getVehicle(t.vehicle_id)
        const d = getDispatcher(t.dispatcher_id)
        const matchSearch = !q || String(t.id).includes(q) || (v && v.plate_number.toLowerCase().includes(q)) || (d && (d.name || '').toLowerCase().includes(q))
        return matchStatus && matchSearch
    })

    const availableVehicles = vehicles.filter(v => v.status === 'available')
    const availableDispatchers = dispatchers // backend enforces availability

    const validate = () => {
        const e = {}
        if (!form.vehicle_id) e.vehicle_id = 'Select a vehicle'
        if (!form.dispatcher_id) e.dispatcher_id = 'Select a dispatcher'
        if (!form.total_km || +form.total_km <= 0) e.total_km = 'Valid distance required'
        if (!form.start_time) e.start_time = 'Start time is required'
        if (!form.end_time) e.end_time = 'End time is required'
        if (!form.payment_amount || +form.payment_amount < 0) e.payment_amount = 'Valid payment required'
        return e
    }

    const handleSubmit = async () => {
        const e = validate()
        if (Object.keys(e).length) { setErrors(e); return }
        setSubmitting(true)
        try {
            const payload = {
                vehicle_id: +form.vehicle_id,
                dispatcher_id: +form.dispatcher_id,
                total_km: +form.total_km,
                start_time: new Date(form.start_time).toISOString(),
                end_time: new Date(form.end_time).toISOString(),
                payment_amount: +form.payment_amount,
            }
            await tripApi.create(payload)
            setShowModal(false)
            setForm(defaultForm)
            setErrors({})
            fetchData()
            addToast({ type: 'success', title: 'Trip Created', msg: 'New trip has been assigned successfully.' })
        } catch (err) {
            setErrors({ submit: err.message })
            addToast({ type: 'error', title: 'Failed', msg: err.message })
        } finally {
            setSubmitting(false)
        }
    }

    const f = (k) => (e) => { setForm(p => ({ ...p, [k]: e.target.value })); setErrors(p => ({ ...p, [k]: undefined })) }

    if (loading) return <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>Loading trips...</div>

    return (
        <div>
            <Toast toasts={toasts} onRemove={removeToast} />

            <div className="page-header">
                <div>
                    <h1>Trips</h1>
                    <p>Dispatch trips, track active routes, and manage logistics assignments</p>
                </div>
                <button className="btn btn-primary" onClick={() => { setShowModal(true); setForm(defaultForm); setErrors({}) }}>
                    <Plus size={16} /> Dispatch Trip
                </button>
            </div>

            {/* Stats row */}
            <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', marginBottom: 24 }}>
                {Object.entries({ 'Assigned': 'assigned', 'In Progress': 'in_progress', 'Completed': 'completed', 'Cancelled': 'cancelled' }).map(([label, st]) => (
                    <div key={st} className="stat-card" style={{ cursor: 'pointer' }} onClick={() => setStatusFilter(st)}>
                        <div className="stat-info">
                            <div className="stat-value" style={{ fontSize: 22 }}>{trips.filter(t => t.status === st).length}</div>
                            <div className="stat-label">{label}</div>
                        </div>
                        <span className={`badge ${st}`}>{label}</span>
                    </div>
                ))}
            </div>

            {/* Table */}
            <div className="table-container">
                <div className="table-header">
                    <span className="table-title">Trip Records</span>
                    <div className="table-actions">
                        <div className="filter-tabs">
                            {['all', 'assigned', 'in_progress', 'completed', 'cancelled'].map(s => (
                                <button key={s} className={`filter-tab${statusFilter === s ? ' active' : ''}`} onClick={() => setStatusFilter(s)}>
                                    {s === 'all' ? 'All' : statusLabel[s]}
                                </button>
                            ))}
                        </div>
                        <div className="search-input-wrap">
                            <Search size={14} className="search-icon" />
                            <input className="search-input" placeholder="Search trips..." value={search} onChange={e => setSearch(e.target.value)} />
                        </div>
                    </div>
                </div>
                <table>
                    <thead>
                        <tr>
                            <th>Trip ID</th>
                            <th>Vehicle</th>
                            <th>Dispatcher</th>
                            <th>Distance</th>
                            <th>Payment</th>
                            <th>Start</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.map(t => {
                            const v = getVehicle(t.vehicle_id)
                            const d = getDispatcher(t.dispatcher_id)
                            return (
                                <tr key={t.id}>
                                    <td style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--accent-blue-light)' }}>#{t.id}</td>
                                    <td style={{ fontSize: 12 }}>{v ? `${v.plate_number} (${v.name})` : `Vehicle #${t.vehicle_id}`}</td>
                                    <td style={{ fontSize: 12 }}>{d ? d.name : `Dispatcher #${t.dispatcher_id}`}</td>
                                    <td style={{ fontWeight: 600 }}>{t.total_km} km</td>
                                    <td style={{ fontWeight: 600, color: 'var(--accent-blue-light)' }}>₹{(+t.payment_amount).toLocaleString()}</td>
                                    <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>{t.start_time ? new Date(t.start_time).toLocaleDateString() : '—'}</td>
                                    <td><span className={`badge ${t.status}`}>{statusLabel[t.status]}</span></td>
                                </tr>
                            )
                        })}
                        {filtered.length === 0 && (
                            <tr><td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>No trips found</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Dispatch Modal */}
            {showModal && (
                <Modal title="Dispatch New Trip" onClose={() => setShowModal(false)}
                    footer={<>
                        <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                        <button className="btn btn-primary" onClick={handleSubmit} disabled={submitting}>
                            {submitting ? 'Creating...' : <><CheckCircle size={15} /> Dispatch Trip</>}
                        </button>
                    </>}
                >
                    {errors.submit && (
                        <div style={{ fontSize: 12, color: 'var(--danger)', background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.18)', borderRadius: 8, padding: '10px 13px', marginBottom: 14 }}>
                            {errors.submit}
                        </div>
                    )}
                    {availableVehicles.length === 0 && (
                        <div className="alert-banner warning" style={{ marginBottom: 16 }}>
                            <AlertTriangle size={15} /> No vehicles available for dispatch.
                        </div>
                    )}

                    <div className="form-grid">
                        <div className="form-group full">
                            <label className="form-label">Vehicle *</label>
                            <select className={`form-control${errors.vehicle_id ? ' error' : ''}`} value={form.vehicle_id} onChange={f('vehicle_id')}>
                                <option value="">— Select Vehicle —</option>
                                {availableVehicles.map(v => (
                                    <option key={v.id} value={v.id}>{v.plate_number} – {v.name} ({v.capacity_kg} kg cap.)</option>
                                ))}
                            </select>
                            {errors.vehicle_id && <span className="form-error"><AlertTriangle size={12} /> {errors.vehicle_id}</span>}
                        </div>
                        <div className="form-group full">
                            <label className="form-label">Dispatcher *</label>
                            <select className={`form-control${errors.dispatcher_id ? ' error' : ''}`} value={form.dispatcher_id} onChange={f('dispatcher_id')}>
                                <option value="">— Select Dispatcher —</option>
                                {availableDispatchers.map(d => (
                                    <option key={d.id} value={d.id}>{d.name} – {d.email}</option>
                                ))}
                            </select>
                            {errors.dispatcher_id && <span className="form-error"><AlertTriangle size={12} /> {errors.dispatcher_id}</span>}
                        </div>
                        <div className="form-group">
                            <label className="form-label">Total Distance (km) *</label>
                            <input className={`form-control${errors.total_km ? ' error' : ''}`} type="number" placeholder="e.g. 265" value={form.total_km} onChange={f('total_km')} />
                            {errors.total_km && <span className="form-error">{errors.total_km}</span>}
                        </div>
                        <div className="form-group">
                            <label className="form-label">Payment Amount (₹) *</label>
                            <input className={`form-control${errors.payment_amount ? ' error' : ''}`} type="number" placeholder="e.g. 5000" value={form.payment_amount} onChange={f('payment_amount')} />
                            {errors.payment_amount && <span className="form-error">{errors.payment_amount}</span>}
                        </div>
                        <div className="form-group">
                            <label className="form-label">Start Time *</label>
                            <input className={`form-control${errors.start_time ? ' error' : ''}`} type="datetime-local" value={form.start_time} onChange={f('start_time')} />
                            {errors.start_time && <span className="form-error">{errors.start_time}</span>}
                        </div>
                        <div className="form-group">
                            <label className="form-label">End Time *</label>
                            <input className={`form-control${errors.end_time ? ' error' : ''}`} type="datetime-local" value={form.end_time} onChange={f('end_time')} />
                            {errors.end_time && <span className="form-error">{errors.end_time}</span>}
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    )
}
