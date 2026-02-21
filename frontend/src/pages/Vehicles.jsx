import React, { useState } from 'react'
import { Truck, Plus, Search, Fuel, Gauge, Calendar, AlertTriangle } from 'lucide-react'
import Modal from '../components/Modal'
import { vehicles as initialVehicles } from '../data/mockData'

const statusLabel = { available: 'Available', in_use: 'In Use', maintenance: 'Maintenance' }

const defaultForm = { regNo: '', make: '', model: '', year: '', type: 'Light Truck', capacity: '', fuelType: 'Diesel', odometer: '' }
const vehicleTypes = ['Light Truck', 'Pickup', 'Medium Truck', 'Heavy Truck', 'Mini Bus', 'Van']
const fuelTypes = ['Diesel', 'Petrol', 'CNG', 'Electric']
const statusFilters = ['all', 'available', 'in_use', 'maintenance']

export default function Vehicles() {
    const [vehicles, setVehicles] = useState(initialVehicles)
    const [filter, setFilter] = useState('all')
    const [search, setSearch] = useState('')
    const [showModal, setShowModal] = useState(false)
    const [form, setForm] = useState(defaultForm)
    const [errors, setErrors] = useState({})

    const filtered = vehicles.filter(v => {
        const matchStatus = filter === 'all' || v.status === filter
        const q = search.toLowerCase()
        const matchSearch = !q || v.regNo.toLowerCase().includes(q) || v.make.toLowerCase().includes(q) || v.model.toLowerCase().includes(q)
        return matchStatus && matchSearch
    })

    const validate = () => {
        const e = {}
        if (!form.regNo.trim()) e.regNo = 'Registration number is required'
        if (!form.make.trim()) e.make = 'Make is required'
        if (!form.model.trim()) e.model = 'Model is required'
        if (!form.year || +form.year < 2000 || +form.year > 2026) e.year = 'Valid year required'
        if (!form.capacity || +form.capacity <= 0) e.capacity = 'Capacity must be > 0 kg'
        if (!form.odometer || +form.odometer < 0) e.odometer = 'Odometer reading required'
        return e
    }

    const handleSubmit = () => {
        const e = validate()
        if (Object.keys(e).length) { setErrors(e); return }
        const newV = {
            id: `V${String(vehicles.length + 1).padStart(3, '0')}`,
            ...form,
            year: +form.year,
            capacity: +form.capacity,
            odometer: +form.odometer,
            status: 'available',
            lastService: '—',
            nextService: '—',
        }
        setVehicles(prev => [newV, ...prev])
        setShowModal(false)
        setForm(defaultForm)
        setErrors({})
    }

    const f = (k) => (e) => { setForm(p => ({ ...p, [k]: e.target.value })); setErrors(p => ({ ...p, [k]: undefined })) }

    return (
        <div>
            <div className="page-header">
                <div>
                    <h1>Vehicles</h1>
                    <p>Manage your fleet vehicles, statuses, and specifications</p>
                </div>
                <button className="btn btn-primary" onClick={() => { setShowModal(true); setForm(defaultForm); setErrors({}) }}>
                    <Plus size={16} /> Add Vehicle
                </button>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-3 mb-4" style={{ flexWrap: 'wrap' }}>
                <div className="filter-tabs">
                    {statusFilters.map(s => (
                        <button key={s} className={`filter-tab${filter === s ? ' active' : ''}`} onClick={() => setFilter(s)}>
                            {s === 'all' ? 'All' : statusLabel[s] || s} {s !== 'all' && `(${vehicles.filter(v => v.status === s).length})`}
                        </button>
                    ))}
                </div>
                <div className="search-input-wrap" style={{ marginLeft: 'auto' }}>
                    <Search size={14} className="search-icon" />
                    <input className="search-input" placeholder="Search vehicles..." value={search} onChange={e => setSearch(e.target.value)} />
                </div>
            </div>

            {/* Vehicle Grid */}
            <div className="vehicle-grid">
                {filtered.map(v => (
                    <div key={v.id} className={`vehicle-card ${v.status}`}>
                        <div className="vehicle-card-header">
                            <div className="vehicle-icon-wrap">
                                <Truck size={22} />
                            </div>
                            <span className={`badge ${v.status}`}>{statusLabel[v.status]}</span>
                        </div>
                        <div className="vehicle-reg">{v.regNo}</div>
                        <div className="vehicle-model">{v.make} {v.model} · {v.year} · {v.type}</div>

                        {v.status === 'maintenance' && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 10, fontSize: 12, color: 'var(--warning)' }}>
                                <AlertTriangle size={13} /> Under maintenance – not available for dispatch
                            </div>
                        )}

                        <div className="vehicle-stats">
                            <div className="vehicle-stat-item">
                                <span className="vehicle-stat-label"><Gauge size={9} style={{ display: 'inline' }} /> Capacity</span>
                                <span className="vehicle-stat-value">{v.capacity.toLocaleString()} kg</span>
                            </div>
                            <div className="vehicle-stat-item">
                                <span className="vehicle-stat-label"><Fuel size={9} style={{ display: 'inline' }} /> Fuel</span>
                                <span className="vehicle-stat-value">{v.fuelType}</span>
                            </div>
                            <div className="vehicle-stat-item">
                                <span className="vehicle-stat-label">Odometer</span>
                                <span className="vehicle-stat-value">{v.odometer.toLocaleString()} km</span>
                            </div>
                            <div className="vehicle-stat-item">
                                <span className="vehicle-stat-label"><Calendar size={9} style={{ display: 'inline' }} /> Next Service</span>
                                <span className="vehicle-stat-value" style={{ fontSize: 11 }}>{v.nextService}</span>
                            </div>
                        </div>
                    </div>
                ))}
                {filtered.length === 0 && (
                    <div style={{ gridColumn: '1/-1' }}>
                        <div className="empty-state">
                            <div className="empty-state-icon"><Truck size={48} /></div>
                            <h3>No vehicles found</h3>
                            <p>Try adjusting your filters or add a new vehicle.</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Add Vehicle Modal */}
            {showModal && (
                <Modal title="Add New Vehicle" onClose={() => setShowModal(false)}
                    footer={<>
                        <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                        <button className="btn btn-primary" onClick={handleSubmit}><Plus size={15} /> Add Vehicle</button>
                    </>}
                >
                    <div className="form-grid">
                        <div className="form-group">
                            <label className="form-label">Registration Number *</label>
                            <input className={`form-control${errors.regNo ? ' error' : ''}`} placeholder="GJ-01-AA-0000" value={form.regNo} onChange={f('regNo')} />
                            {errors.regNo && <span className="form-error">{errors.regNo}</span>}
                        </div>
                        <div className="form-group">
                            <label className="form-label">Vehicle Type</label>
                            <select className="form-control" value={form.type} onChange={f('type')}>
                                {vehicleTypes.map(t => <option key={t}>{t}</option>)}
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Make *</label>
                            <input className={`form-control${errors.make ? ' error' : ''}`} placeholder="e.g. Tata Motors" value={form.make} onChange={f('make')} />
                            {errors.make && <span className="form-error">{errors.make}</span>}
                        </div>
                        <div className="form-group">
                            <label className="form-label">Model *</label>
                            <input className={`form-control${errors.model ? ' error' : ''}`} placeholder="e.g. Ace Gold" value={form.model} onChange={f('model')} />
                            {errors.model && <span className="form-error">{errors.model}</span>}
                        </div>
                        <div className="form-group">
                            <label className="form-label">Year *</label>
                            <input className={`form-control${errors.year ? ' error' : ''}`} type="number" placeholder="2023" value={form.year} onChange={f('year')} />
                            {errors.year && <span className="form-error">{errors.year}</span>}
                        </div>
                        <div className="form-group">
                            <label className="form-label">Fuel Type</label>
                            <select className="form-control" value={form.fuelType} onChange={f('fuelType')}>
                                {fuelTypes.map(f => <option key={f}>{f}</option>)}
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Cargo Capacity (kg) *</label>
                            <input className={`form-control${errors.capacity ? ' error' : ''}`} type="number" placeholder="1000" value={form.capacity} onChange={f('capacity')} />
                            {errors.capacity && <span className="form-error">{errors.capacity}</span>}
                        </div>
                        <div className="form-group">
                            <label className="form-label">Odometer (km) *</label>
                            <input className={`form-control${errors.odometer ? ' error' : ''}`} type="number" placeholder="0" value={form.odometer} onChange={f('odometer')} />
                            {errors.odometer && <span className="form-error">{errors.odometer}</span>}
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    )
}
