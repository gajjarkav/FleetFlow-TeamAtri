import React, { useState } from 'react'
import { Plus, Search, AlertTriangle, CheckCircle, MapPin, Weight } from 'lucide-react'
import Modal from '../components/Modal'
import Toast, { useToast } from '../components/Toast'
import { trips as initialTrips, vehicles, drivers, getVehicleById, getDriverById, getDaysUntilExpiry } from '../data/mockData'

const statusLabel = { in_progress: 'In Progress', completed: 'Completed', scheduled: 'Scheduled', cancelled: 'Cancelled' }
const defaultForm = { vehicleId: '', driverId: '', origin: '', destination: '', cargoWeight: '', notes: '' }

export default function Trips() {
    const [trips, setTrips] = useState(initialTrips)
    const [search, setSearch] = useState('')
    const [statusFilter, setStatusFilter] = useState('all')
    const [showModal, setShowModal] = useState(false)
    const [form, setForm] = useState(defaultForm)
    const [errors, setErrors] = useState({})
    const { toasts, addToast, removeToast } = useToast()

    const filtered = trips.filter(t => {
        const matchStatus = statusFilter === 'all' || t.status === statusFilter
        const q = search.toLowerCase()
        const v = getVehicleById(t.vehicleId)
        const d = getDriverById(t.driverId)
        const matchSearch = !q || t.id.toLowerCase().includes(q) || t.origin.toLowerCase().includes(q) || t.destination.toLowerCase().includes(q) || (v && v.regNo.toLowerCase().includes(q)) || (d && d.name.toLowerCase().includes(q))
        return matchStatus && matchSearch
    })

    const availableVehicles = vehicles.filter(v => v.status === 'available')
    const availableDrivers = drivers.filter(d => {
        const days = getDaysUntilExpiry(d.licenseExpiry)
        return d.status === 'available' && days > 0
    })

    const validate = () => {
        const e = {}
        if (!form.vehicleId) { e.vehicleId = 'Select a vehicle'; }
        if (!form.driverId) { e.driverId = 'Select a driver'; }
        if (!form.origin.trim()) e.origin = 'Origin is required'
        if (!form.destination.trim()) e.destination = 'Destination is required'
        if (!form.cargoWeight || +form.cargoWeight < 0) { e.cargoWeight = 'Enter valid cargo weight'; }

        if (form.vehicleId && form.cargoWeight) {
            const v = getVehicleById(form.vehicleId)
            if (v && +form.cargoWeight > v.capacity) {
                e.cargoWeight = `Cargo (${form.cargoWeight} kg) exceeds vehicle capacity (${v.capacity} kg). Reduce load!`
            }
        }
        return e
    }

    const handleSubmit = () => {
        const e = validate()
        if (Object.keys(e).length) {
            setErrors(e)
            if (e.cargoWeight && e.cargoWeight.includes('exceeds')) {
                addToast({ type: 'error', title: 'Dispatch Blocked', msg: `Cargo exceeds vehicle capacity. This trip cannot be dispatched.` })
            }
            return
        }
        const newT = {
            id: `T${String(trips.length + 1).padStart(3, '0')}`,
            ...form,
            cargoWeight: +form.cargoWeight,
            status: 'scheduled',
            startDate: '2026-02-22',
            endDate: null,
            distanceKm: null,
            fuelUsed: null,
        }
        setTrips(prev => [newT, ...prev])
        setShowModal(false)
        setForm(defaultForm)
        setErrors({})
        addToast({ type: 'success', title: 'Trip Scheduled', msg: `New trip from ${newT.origin} to ${newT.destination} has been dispatched.` })
    }

    const f = (k) => (e) => { setForm(p => ({ ...p, [k]: e.target.value })); setErrors(p => ({ ...p, [k]: undefined })) }

    const selectedVehicle = form.vehicleId ? getVehicleById(form.vehicleId) : null

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
                {Object.entries({ 'In Progress': 'in_progress', 'Scheduled': 'scheduled', 'Completed': 'completed', 'Cancelled': 'cancelled' }).map(([label, st]) => (
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
                            {['all', 'in_progress', 'scheduled', 'completed', 'cancelled'].map(s => (
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
                            <th>Route</th>
                            <th>Vehicle</th>
                            <th>Driver</th>
                            <th>Cargo</th>
                            <th>Date</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.map(t => {
                            const v = getVehicleById(t.vehicleId)
                            const d = getDriverById(t.driverId)
                            return (
                                <tr key={t.id}>
                                    <td style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--accent-blue-light)' }}>{t.id}</td>
                                    <td>
                                        <div className="flex items-center gap-2">
                                            <MapPin size={13} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                                            <div>
                                                <div style={{ fontWeight: 600, fontSize: 12 }}>{t.origin}</div>
                                                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>ÔåÆ {t.destination}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td style={{ fontSize: 12 }}>{v ? v.regNo : t.vehicleId}</td>
                                    <td style={{ fontSize: 12 }}>{d ? d.name : t.driverId}</td>
                                    <td>
                                        <div className="flex items-center gap-1">
                                            <Weight size={12} style={{ color: 'var(--text-muted)' }} />
                                            <span>{t.cargoWeight?.toLocaleString()} kg</span>
                                        </div>
                                    </td>
                                    <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>{t.startDate}</td>
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
                        <button className="btn btn-primary" onClick={handleSubmit}><CheckCircle size={15} /> Dispatch Trip</button>
                    </>}
                >
                    {availableVehicles.length === 0 && (
                        <div className="alert-banner warning" style={{ marginBottom: 16 }}>
                            <AlertTriangle size={15} /> No vehicles available for dispatch. All are either in use or under maintenance.
                        </div>
                    )}
                    {availableDrivers.length === 0 && (
                        <div className="alert-banner danger" style={{ marginBottom: 16 }}>
                            <AlertTriangle size={15} /> No eligible drivers available. Check license status and current assignments.
                        </div>
                    )}

                    <div className="form-grid">
                        <div className="form-group full">
                            <label className="form-label">Vehicle *
                                <span style={{ marginLeft: 8, fontSize: 10, color: 'var(--text-muted)', fontWeight: 400 }}>
                                    Only available vehicles shown (maintenance vehicles excluded)
                                </span>
                            </label>
                            <select className={`form-control${errors.vehicleId ? ' error' : ''}`} value={form.vehicleId} onChange={f('vehicleId')}>
                                <option value="">ÔÇö Select Vehicle ÔÇö</option>
                                {availableVehicles.map(v => (
                                    <option key={v.id} value={v.id}>{v.regNo} ÔÇô {v.make} {v.model} ({v.capacity.toLocaleString()} kg cap.)</option>
                                ))}
                            </select>
                            {errors.vehicleId && <span className="form-error"><AlertTriangle size={12} /> {errors.vehicleId}</span>}
                        </div>
                        <div className="form-group full">
                            <label className="form-label">Driver *
                                <span style={{ marginLeft: 8, fontSize: 10, color: 'var(--text-muted)', fontWeight: 400 }}>
                                    Only drivers with valid licenses shown
                                </span>
                            </label>
                            <select className={`form-control${errors.driverId ? ' error' : ''}`} value={form.driverId} onChange={f('driverId')}>
                                <option value="">ÔÇö Select Driver ÔÇö</option>
                                {availableDrivers.map(d => (
                                    <option key={d.id} value={d.id}>{d.name} ÔÇô License: {d.licenseNo}</option>
                                ))}
                            </select>
                            {errors.driverId && <span className="form-error"><AlertTriangle size={12} /> {errors.driverId}</span>}
                        </div>
                        <div className="form-group">
                            <label className="form-label">Origin *</label>
                            <input className={`form-control${errors.origin ? ' error' : ''}`} placeholder="e.g. Ahmedabad Depot" value={form.origin} onChange={f('origin')} />
                            {errors.origin && <span className="form-error">{errors.origin}</span>}
                        </div>
                        <div className="form-group">
                            <label className="form-label">Destination *</label>
                            <input className={`form-control${errors.destination ? ' error' : ''}`} placeholder="e.g. Surat Warehouse" value={form.destination} onChange={f('destination')} />
                            {errors.destination && <span className="form-error">{errors.destination}</span>}
                        </div>
                        <div className="form-group full">
                            <label className="form-label">
                                Cargo Weight (kg) *
                                {selectedVehicle && (
                                    <span style={{ marginLeft: 8, fontSize: 11, color: 'var(--text-muted)', fontWeight: 400 }}>
                                        Max: {selectedVehicle.capacity.toLocaleString()} kg
                                    </span>
                                )}
                            </label>
                            <input
                                className={`form-control${errors.cargoWeight ? ' error' : ''}`}
                                type="number"
                                placeholder="e.g. 500"
                                value={form.cargoWeight}
                                onChange={f('cargoWeight')}
                            />
                            {selectedVehicle && form.cargoWeight && +form.cargoWeight > 0 && (
                                <div style={{ marginTop: 6 }}>
                                    <div style={{ height: 4, background: 'var(--border-color)', borderRadius: 2, overflow: 'hidden' }}>
                                        <div style={{
                                            height: '100%',
                                            width: `${Math.min(100, (+form.cargoWeight / selectedVehicle.capacity) * 100)}%`,
                                            background: +form.cargoWeight > selectedVehicle.capacity ? 'var(--danger)' : +form.cargoWeight > selectedVehicle.capacity * 0.8 ? 'var(--warning)' : 'var(--success)',
                                            borderRadius: 2,
                                            transition: 'width 0.3s ease',
                                        }} />
                                    </div>
                                    <span style={{ fontSize: 11, color: +form.cargoWeight > selectedVehicle.capacity ? 'var(--danger)' : 'var(--text-muted)' }}>
                                        {Math.round((+form.cargoWeight / selectedVehicle.capacity) * 100)}% of capacity
                                    </span>
                                </div>
                            )}
                            {errors.cargoWeight && <span className="form-error"><AlertTriangle size={12} /> {errors.cargoWeight}</span>}
                        </div>
                        <div className="form-group full">
                            <label className="form-label">Notes</label>
                            <input className="form-control" placeholder="Optional notes..." value={form.notes} onChange={f('notes')} />
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    )
}