import React, { useState, useEffect } from 'react'
import { Truck, Plus, Search, Gauge, AlertTriangle, Trash2, RefreshCw } from 'lucide-react'
import Modal from '../components/Modal'
import { listVehiclesApi, createVehicleApi, updateVehicleApi, deleteVehicleApi } from '../api/vehicles'

// Backend status values: available | on_trip | in_shop | retired
const statusLabel = { available: 'Available', on_trip: 'On Trip', in_shop: 'In Shop', retired: 'Retired' }
const statusFilters = ['all', 'available', 'on_trip', 'in_shop', 'retired']
const categories = ['Light Truck', 'Pickup', 'Medium Truck', 'Heavy Truck', 'Mini Bus', 'Van', 'Other']

const defaultForm = { name: '', category: categories[0], plate_number: '', region: '', capacity_kg: '', odometer: '' }

export default function Vehicles() {
    const [vehicles, setVehicles] = useState([])
    const [loading, setLoading] = useState(true)
    const [fetchError, setFetchError] = useState('')
    const [filter, setFilter] = useState('all')
    const [search, setSearch] = useState('')
    const [showModal, setShowModal] = useState(false)
    const [form, setForm] = useState(defaultForm)
    const [errors, setErrors] = useState({})
    const [saving, setSaving] = useState(false)

    const load = () => {
        setLoading(true)
        listVehiclesApi()
            .then(setVehicles)
            .catch(e => setFetchError(e.message))
            .finally(() => setLoading(false))
    }

    useEffect(load, [])

    const filtered = vehicles.filter(v => {
        const matchStatus = filter === 'all' || v.status === filter
        const q = search.toLowerCase()
        const matchSearch = !q || v.plate_number.toLowerCase().includes(q) || v.name.toLowerCase().includes(q) || v.region.toLowerCase().includes(q)
        return matchStatus && matchSearch
    })

    const validate = () => {
        const e = {}
        if (!form.name.trim()) e.name = 'Vehicle name is required'
        if (!form.plate_number.trim()) e.plate_number = 'Plate number is required'
        if (!form.region.trim()) e.region = 'Region is required'
        if (!form.capacity_kg || +form.capacity_kg <= 0) e.capacity_kg = 'Capacity must be > 0 kg'
        if (form.odometer === '' || +form.odometer < 0) e.odometer = 'Odometer reading required'
        return e
    }

    const handleSubmit = async () => {
        const e = validate()
        if (Object.keys(e).length) { setErrors(e); return }
        setSaving(true)
        try {
            const created = await createVehicleApi({
                name: form.name.trim(),
                category: form.category,
                plate_number: form.plate_number.trim(),
                region: form.region.trim(),
                capacity_kg: +form.capacity_kg,
                odometer: +form.odometer,
                status: 'available',
            })
            setVehicles(prev => [created, ...prev])
            setShowModal(false)
            setForm(defaultForm)
            setErrors({})
        } catch (err) {
            setErrors({ _api: err.message })
        } finally {
            setSaving(false)
        }
    }

    const handleStatusChange = async (id, newStatus) => {
        try {
            const updated = await updateVehicleApi(id, { status: newStatus })
            setVehicles(prev => prev.map(v => v.id === id ? updated : v))
        } catch (err) {
            alert('Failed to update status: ' + err.message)
        }
    }

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this vehicle?')) return
        try {
            await deleteVehicleApi(id)
            setVehicles(prev => prev.filter(v => v.id !== id))
        } catch (err) {
            alert('Failed to delete: ' + err.message)
        }
    }

    const f = (k) => (e) => { setForm(p => ({ ...p, [k]: e.target.value })); setErrors(p => ({ ...p, [k]: undefined })) }

    return (
        <div>
            <div className="page-header">
                <div>
                    <h1>Vehicles</h1>
                    <p>Manage your fleet vehicles, statuses, and specifications</p>
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                    <button className="btn btn-secondary" onClick={load} title="Refresh"><RefreshCw size={15} /></button>
                    <button className="btn btn-primary" onClick={() => { setShowModal(true); setForm(defaultForm); setErrors({}) }}>
                        <Plus size={16} /> Add Vehicle
                    </button>
                </div>
            </div>

            {fetchError && <div className="alert-banner danger"><AlertTriangle size={17} /><div>{fetchError}</div></div>}

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

            {loading ? (
                <div style={{ color: 'var(--text-secondary)', padding: 32 }}>Loading vehiclesâ€¦</div>
            ) : (
            <div className="vehicle-grid">
                {filtered.map(v => (
                    <div key={v.id} className={`vehicle-card ${v.status}`}>
                        <div className="vehicle-card-header">
                            <div className="vehicle-icon-wrap"><Truck size={22} /></div>
                            <span className={`badge ${v.status}`}>{statusLabel[v.status] || v.status}</span>
                        </div>
                        <div className="vehicle-reg">{v.plate_number}</div>
                        <div className="vehicle-model">{v.name} Â· {v.category} Â· {v.region}</div>

                        {v.status === 'in_shop' && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 10, fontSize: 12, color: 'var(--warning)' }}>
                                <AlertTriangle size={13} /> Under maintenance â€“ not available for dispatch
                            </div>
                        )}

                        <div className="vehicle-stats">
                            <div className="vehicle-stat-item">
                                <span className="vehicle-stat-label"><Gauge size={9} style={{ display: 'inline' }} /> Capacity</span>
                                <span className="vehicle-stat-value">{v.capacity_kg.toLocaleString()} kg</span>
                            </div>
                            <div className="vehicle-stat-item">
                                <span className="vehicle-stat-label">Odometer</span>
                                <span className="vehicle-stat-value">{v.odometer.toLocaleString()} km</span>
                            </div>
                            <div className="vehicle-stat-item">
                                <span className="vehicle-stat-label">Region</span>
                                <span className="vehicle-stat-value">{v.region}</span>
                            </div>
                        </div>

                        {/* Status change + delete controls */}
                        <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                            <select
                                className="form-control"
                                style={{ flex: 1, fontSize: 12, padding: '4px 8px', height: 30 }}
                                value={v.status}
                                onChange={e => handleStatusChange(v.id, e.target.value)}
                            >
                                {Object.entries(statusLabel).map(([val, lbl]) => <option key={val} value={val}>{lbl}</option>)}
                            </select>
                            <button
                                onClick={() => handleDelete(v.id)}
                                style={{ background: 'rgba(239,68,68,0.12)', border: 'none', borderRadius: 6, padding: '4px 8px', cursor: 'pointer', color: '#f87171' }}
                                title="Delete"
                            ><Trash2 size={14} /></button>
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
            )}

            {/* Add Vehicle Modal */}
            {showModal && (
                <Modal title="Add New Vehicle" onClose={() => setShowModal(false)}
                    footer={<>
                        <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                        <button className="btn btn-primary" onClick={handleSubmit} disabled={saving}>
                            <Plus size={15} /> {saving ? 'Savingâ€¦' : 'Add Vehicle'}
                        </button>
                    </>}
                >
                    <div className="form-grid">
                        {errors._api && <div className="form-error" style={{ gridColumn: '1/-1' }}>{errors._api}</div>}
                        <div className="form-group">
                            <label className="form-label">Vehicle Name *</label>
                            <input className={`form-control${errors.name ? ' error' : ''}`} placeholder="e.g. Tata Ace Gold" value={form.name} onChange={f('name')} />
                            {errors.name && <span className="form-error">{errors.name}</span>}
                        </div>
                        <div className="form-group">
                            <label className="form-label">Category</label>
                            <select className="form-control" value={form.category} onChange={f('category')}>
                                {categories.map(c => <option key={c}>{c}</option>)}
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Plate Number *</label>
                            <input className={`form-control${errors.plate_number ? ' error' : ''}`} placeholder="GJ-01-AA-0000" value={form.plate_number} onChange={f('plate_number')} />
                            {errors.plate_number && <span className="form-error">{errors.plate_number}</span>}
                        </div>
                        <div className="form-group">
                            <label className="form-label">Region / Base *</label>
                            <input className={`form-control${errors.region ? ' error' : ''}`} placeholder="e.g. Ahmedabad" value={form.region} onChange={f('region')} />
                            {errors.region && <span className="form-error">{errors.region}</span>}
                        </div>
                        <div className="form-group">
                            <label className="form-label">Cargo Capacity (kg) *</label>
                            <input className={`form-control${errors.capacity_kg ? ' error' : ''}`} type="number" placeholder="1000" value={form.capacity_kg} onChange={f('capacity_kg')} />
                            {errors.capacity_kg && <span className="form-error">{errors.capacity_kg}</span>}
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
