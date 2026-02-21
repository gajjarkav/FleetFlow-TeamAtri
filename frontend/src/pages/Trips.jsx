import React, { useState, useEffect } from 'react'
import { Plus, Search, AlertTriangle, CheckCircle, Route, RefreshCw } from 'lucide-react'
import Modal from '../components/Modal'
import Toast, { useToast } from '../components/Toast'
import { listTripsApi, createTripApi } from '../api/trips'
import { listVehiclesApi } from '../api/vehicles'
import { listDispatchersApi } from '../api/auth'

/**
 * Trip status from backend: assigned | in_progress | completed | cancelled
 */
const statusLabel = {
    assigned: 'Assigned',
    in_progress: 'In Progress',
    completed: 'Completed',
    cancelled: 'Cancelled',
}

const defaultForm = {
    vehicle_id: '',
    dispatcher_id: '',
    total_km: '',
    start_time: '',
    end_time: '',
    payment_amount: '',
}

export default function Trips() {
    const [trips, setTrips] = useState([])
    const [vehicles, setVehicles] = useState([])
    const [dispatchers, setDispatchers] = useState([])
    const [loading, setLoading] = useState(true)
    const [fetchError, setFetchError] = useState('')
    const [search, setSearch] = useState('')
    const [statusFilter, setStatusFilter] = useState('all')
    const [showModal, setShowModal] = useState(false)
    const [form, setForm] = useState(defaultForm)
    const [errors, setErrors] = useState({})
    const [saving, setSaving] = useState(false)
    const { toasts, addToast, removeToast } = useToast()

    const load = () => {
        setLoading(true)
        Promise.all([listTripsApi(), listVehiclesApi(), listDispatchersApi()])
            .then(([t, v, d]) => { setTrips(t); setVehicles(v); setDispatchers(d) })
            .catch(e => setFetchError(e.message))
            .finally(() => setLoading(false))
    }

    useEffect(load, [])

    const vehicleById = (id) => vehicles.find(v => v.id === id)
    const dispatcherById = (id) => dispatchers.find(d => d.id === id)

    const filtered = trips.filter(t => {
        const matchStatus = statusFilter === 'all' || t.status === statusFilter
        const q = search.toLowerCase()
        const veh = vehicleById(t.vehicle_id)
        const disp = dispatcherById(t.dispatcher_id)
        const matchSearch = !q
            || String(t.id).includes(q)
            || (veh && veh.plate_number.toLowerCase().includes(q))
            || (disp && disp.name?.toLowerCase().includes(q))
        return matchStatus && matchSearch
    })

    const validate = () => {
        const e = {}
        if (!form.vehicle_id) e.vehicle_id = 'Select a vehicle'
        if (!form.dispatcher_id) e.dispatcher_id = 'Select a dispatcher'
        if (!form.total_km || +form.total_km <= 0) e.total_km = 'Enter total KM'
        if (!form.start_time) e.start_time = 'Start time required'
        if (!form.end_time) e.end_time = 'End time required'
        if (form.start_time && form.end_time && form.start_time >= form.end_time) e.end_time = 'End must be after start'
        if (!form.payment_amount || +form.payment_amount < 0) e.payment_amount = 'Enter payment amount'
        return e
    }

    const handleSubmit = async () => {
        const e = validate()
        if (Object.keys(e).length) { setErrors(e); return }
        setSaving(true)
        try {
            const created = await createTripApi({
                vehicle_id: +form.vehicle_id,
                dispatcher_id: +form.dispatcher_id,
                total_km: +form.total_km,
                start_time: new Date(form.start_time).toISOString(),
                end_time: new Date(form.end_time).toISOString(),
                payment_amount: +form.payment_amount,
            })
            setTrips(prev => [created, ...prev])
            setShowModal(false)
            setForm(defaultForm)
            setErrors({})
            addToast({ type: 'success', title: 'Trip Created', msg: `Trip #${created.id} has been dispatched.` })
        } catch (err) {
            setErrors({ _api: err.message })
        } finally {
            setSaving(false)
        }
    }

    const f = (k) => (e) => { setForm(p => ({ ...p, [k]: e.target.value })); setErrors(p => ({ ...p, [k]: undefined })) }

    const availableVehicles = vehicles.filter(v => v.status === 'available')
    const availableDispatchers = dispatchers.filter(d => d.id)

    const fmtDT = (dt) => dt ? new Date(dt).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' }) : 'â€”'

    return (
        <div>
            <Toast toasts={toasts} onRemove={removeToast} />

            <div className="page-header">
                <div>
                    <h1>Trips</h1>
                    <p>Dispatch trips, track active routes, and manage logistics assignments</p>
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                    <button className="btn btn-secondary" onClick={load} title="Refresh"><RefreshCw size={15} /></button>
                    <button className="btn btn-primary" onClick={() => { setShowModal(true); setForm(defaultForm); setErrors({}) }}>
                        <Plus size={16} /> Dispatch Trip
                    </button>
                </div>
            </div>

            {fetchError && <div className="alert-banner danger"><AlertTriangle size={17} /><div>{fetchError}</div></div>}

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

                {loading ? (
                    <div style={{ color: 'var(--text-secondary)', padding: 32 }}>Loading tripsâ€¦</div>
                ) : (
                <table>
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Vehicle</th>
                            <th>Dispatcher</th>
                            <th>Distance</th>
                            <th>Start</th>
                            <th>End</th>
                            <th>Amount</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.map(t => {
                            const veh = vehicleById(t.vehicle_id)
                            const disp = dispatcherById(t.dispatcher_id)
                            return (
                                <tr key={t.id}>
                                    <td style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--accent-blue-light)' }}>#{t.id}</td>
                                    <td style={{ fontSize: 12 }}>
                                        {veh ? <><div style={{ fontWeight: 600 }}>{veh.plate_number}</div><div style={{ color: 'var(--text-muted)', fontSize: 11 }}>{veh.name}</div></> : `Vehicle #${t.vehicle_id}`}
                                    </td>
                                    <td style={{ fontSize: 12 }}>
                                        {disp ? <><div style={{ fontWeight: 600 }}>{disp.name || disp.email}</div><div style={{ color: 'var(--text-muted)', fontSize: 11 }}>{disp.email}</div></> : `Dispatcher #${t.dispatcher_id}`}
                                    </td>
                                    <td style={{ fontSize: 12 }}>{t.total_km} km</td>
                                    <td style={{ fontSize: 11, color: 'var(--text-muted)' }}>{fmtDT(t.start_time)}</td>
                                    <td style={{ fontSize: 11, color: 'var(--text-muted)' }}>{fmtDT(t.end_time)}</td>
                                    <td style={{ fontSize: 12, fontWeight: 600, color: '#34d399' }}>â‚¹{Number(t.payment_amount).toLocaleString('en-IN')}</td>
                                    <td><span className={`badge ${t.status}`}>{statusLabel[t.status] || t.status}</span></td>
                                </tr>
                            )
                        })}
                        {filtered.length === 0 && (
                            <tr><td colSpan={8} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>No trips found</td></tr>
                        )}
                    </tbody>
                </table>
                )}
            </div>

            {/* Dispatch Modal */}
            {showModal && (
                <Modal title="Dispatch New Trip" onClose={() => setShowModal(false)}
                    footer={<>
                        <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                        <button className="btn btn-primary" onClick={handleSubmit} disabled={saving}>
                            <CheckCircle size={15} /> {saving ? 'Dispatchingâ€¦' : 'Dispatch Trip'}
                        </button>
                    </>}
                >
                    <div className="form-grid">
                        {errors._api && <div className="form-error" style={{ gridColumn: '1/-1' }}>{errors._api}</div>}

                        <div className="form-group full">
                            <label className="form-label">Vehicle * <span style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 400 }}>(available only)</span></label>
                            <select className={`form-control${errors.vehicle_id ? ' error' : ''}`} value={form.vehicle_id} onChange={f('vehicle_id')}>
                                <option value="">â€” Select Vehicle â€”</option>
                                {availableVehicles.map(v => (
                                    <option key={v.id} value={v.id}>{v.plate_number} â€“ {v.name} ({v.capacity_kg.toLocaleString()} kg)</option>
                                ))}
                            </select>
                            {errors.vehicle_id && <span className="form-error"><AlertTriangle size={12} /> {errors.vehicle_id}</span>}
                        </div>

                        <div className="form-group full">
                            <label className="form-label">Dispatcher *</label>
                            <select className={`form-control${errors.dispatcher_id ? ' error' : ''}`} value={form.dispatcher_id} onChange={f('dispatcher_id')}>
                                <option value="">â€” Select Dispatcher â€”</option>
                                {availableDispatchers.map(d => (
                                    <option key={d.id} value={d.id}>{d.name || d.email} ({d.email})</option>
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
                            <label className="form-label">Payment Amount (â‚¹) *</label>
                            <input className={`form-control${errors.payment_amount ? ' error' : ''}`} type="number" placeholder="e.g. 15000" value={form.payment_amount} onChange={f('payment_amount')} />
                            {errors.payment_amount && <span className="form-error">{errors.payment_amount}</span>}
                        </div>

                        <div className="form-group">
                            <label className="form-label">Start Date & Time *</label>
                            <input className={`form-control${errors.start_time ? ' error' : ''}`} type="datetime-local" value={form.start_time} onChange={f('start_time')} />
                            {errors.start_time && <span className="form-error">{errors.start_time}</span>}
                        </div>

                        <div className="form-group">
                            <label className="form-label">End Date & Time *</label>
                            <input className={`form-control${errors.end_time ? ' error' : ''}`} type="datetime-local" value={form.end_time} onChange={f('end_time')} />
                            {errors.end_time && <span className="form-error">{errors.end_time}</span>}
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    )
}
