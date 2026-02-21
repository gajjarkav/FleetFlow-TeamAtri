import React, { useState } from 'react'
import { Plus, Search, User, Phone, CreditCard, Star, AlertTriangle } from 'lucide-react'
import Modal from '../components/Modal'
import { drivers as initialDrivers, getDaysUntilExpiry } from '../data/mockData'

const statusLabel = { available: 'Available', on_trip: 'On Trip', off_duty: 'Off Duty' }

const defaultForm = { name: '', contact: '', licenseNo: '', licenseExpiry: '' }

const getLicenseStatus = (expiry) => {
    const days = getDaysUntilExpiry(expiry)
    if (days <= 0) return { label: 'Expired', cls: 'expired', color: 'var(--danger)' }
    if (days <= 30) return { label: `Expires in ${days}d`, cls: 'expired', color: 'var(--danger)' }
    if (days <= 90) return { label: `Expires in ${days}d`, cls: 'warning', color: 'var(--warning)' }
    return { label: `Valid (${days}d left)`, cls: 'available', color: 'var(--success)' }
}

export default function Drivers() {
    const [drivers, setDrivers] = useState(initialDrivers)
    const [search, setSearch] = useState('')
    const [statusFilter, setStatusFilter] = useState('all')
    const [showModal, setShowModal] = useState(false)
    const [form, setForm] = useState(defaultForm)
    const [errors, setErrors] = useState({})

    const filtered = drivers.filter(d => {
        const matchStatus = statusFilter === 'all' || d.status === statusFilter
        const q = search.toLowerCase()
        const matchSearch = !q || d.name.toLowerCase().includes(q) || d.licenseNo.toLowerCase().includes(q)
        return matchStatus && matchSearch
    })

    const validate = () => {
        const e = {}
        if (!form.name.trim()) e.name = 'Name is required'
        if (!form.contact.trim()) e.contact = 'Contact is required'
        if (!form.licenseNo.trim()) e.licenseNo = 'License number is required'
        if (!form.licenseExpiry) e.licenseExpiry = 'License expiry date is required'
        return e
    }

    const handleSubmit = () => {
        const e = validate()
        if (Object.keys(e).length) { setErrors(e); return }
        const newD = {
            id: `D${String(drivers.length + 1).padStart(3, '0')}`,
            ...form,
            status: 'available',
            tripsCompleted: 0,
            rating: 5.0,
            joiningDate: '2026-02-21',
        }
        setDrivers(prev => [newD, ...prev])
        setShowModal(false)
        setForm(defaultForm)
        setErrors({})
    }

    const f = (k) => (e) => { setForm(p => ({ ...p, [k]: e.target.value })); setErrors(p => ({ ...p, [k]: undefined })) }

    return (
        <div>
            <div className="page-header">
                <div>
                    <h1>Drivers</h1>
                    <p>Driver registry, license compliance, and performance tracking</p>
                </div>
                <button className="btn btn-primary" onClick={() => { setShowModal(true); setForm(defaultForm); setErrors({}) }}>
                    <Plus size={16} /> Add Driver
                </button>
            </div>

            {/* Compliance Summary */}
            <div className="stat-grid" style={{ marginBottom: 24 }}>
                {[
                    { label: 'Total Drivers', value: drivers.length, cls: 'blue' },
                    { label: 'Available', value: drivers.filter(d => d.status === 'available').length, cls: 'green' },
                    { label: 'On Trip', value: drivers.filter(d => d.status === 'on_trip').length, cls: 'purple' },
                    { label: 'License Warning', value: drivers.filter(d => { const x = getDaysUntilExpiry(d.licenseExpiry); return x > 0 && x <= 90 }).length, cls: 'amber' },
                    { label: 'License Expired', value: drivers.filter(d => getDaysUntilExpiry(d.licenseExpiry) <= 0).length, cls: 'red' },
                ].map(s => (
                    <div key={s.label} className="stat-card">
                        <div className={`stat-icon ${s.cls}`}><User size={20} /></div>
                        <div className="stat-info">
                            <div className="stat-value" style={{ fontSize: 22 }}>{s.value}</div>
                            <div className="stat-label">{s.label}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Table */}
            <div className="table-container">
                <div className="table-header">
                    <span className="table-title">Driver Registry</span>
                    <div className="table-actions">
                        <div className="filter-tabs">
                            {['all', 'available', 'on_trip', 'off_duty'].map(s => (
                                <button key={s} className={`filter-tab${statusFilter === s ? ' active' : ''}`} onClick={() => setStatusFilter(s)}>
                                    {s === 'all' ? 'All' : statusLabel[s] || s}
                                </button>
                            ))}
                        </div>
                        <div className="search-input-wrap">
                            <Search size={14} className="search-icon" />
                            <input className="search-input" placeholder="Search drivers..." value={search} onChange={e => setSearch(e.target.value)} />
                        </div>
                    </div>
                </div>
                <table>
                    <thead>
                        <tr>
                            <th>Driver</th>
                            <th>Contact</th>
                            <th>License No.</th>
                            <th>License Expiry</th>
                            <th>Status</th>
                            <th>Trips</th>
                            <th>Rating</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.map(d => {
                            const lic = getLicenseStatus(d.licenseExpiry)
                            return (
                                <tr key={d.id}>
                                    <td>
                                        <div className="flex items-center gap-2">
                                            <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(59,130,246,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-blue-light)', fontWeight: 700, fontSize: 13 }}>
                                                {d.name.charAt(0)}
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: 600 }}>{d.name}</div>
                                                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>ID: {d.id}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="flex items-center gap-2">
                                            <Phone size={13} style={{ color: 'var(--text-muted)' }} />
                                            {d.contact}
                                        </div>
                                    </td>
                                    <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{d.licenseNo}</td>
                                    <td>
                                        <div className="flex items-center gap-2">
                                            {getDaysUntilExpiry(d.licenseExpiry) <= 90 && <AlertTriangle size={13} style={{ color: lic.color }} />}
                                            <span style={{ color: lic.color, fontWeight: 600, fontSize: 12 }}>{lic.label}</span>
                                        </div>
                                    </td>
                                    <td><span className={`badge ${d.status}`}>{statusLabel[d.status]}</span></td>
                                    <td style={{ fontWeight: 600 }}>{d.tripsCompleted}</td>
                                    <td>
                                        <div className="flex items-center gap-1">
                                            <Star size={13} style={{ color: '#fbbf24', fill: '#fbbf24' }} />
                                            <span style={{ fontWeight: 600 }}>{d.rating.toFixed(1)}</span>
                                        </div>
                                    </td>
                                </tr>
                            )
                        })}
                        {filtered.length === 0 && (
                            <tr><td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>No drivers found</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Add Driver Modal */}
            {showModal && (
                <Modal title="Add New Driver" onClose={() => setShowModal(false)}
                    footer={<>
                        <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                        <button className="btn btn-primary" onClick={handleSubmit}><Plus size={15} /> Add Driver</button>
                    </>}
                >
                    <div className="form-grid">
                        <div className="form-group full">
                            <label className="form-label">Full Name *</label>
                            <input className={`form-control${errors.name ? ' error' : ''}`} placeholder="e.g. Rajesh Patel" value={form.name} onChange={f('name')} />
                            {errors.name && <span className="form-error">{errors.name}</span>}
                        </div>
                        <div className="form-group">
                            <label className="form-label">Contact Number *</label>
                            <input className={`form-control${errors.contact ? ' error' : ''}`} placeholder="+91 98765 43210" value={form.contact} onChange={f('contact')} />
                            {errors.contact && <span className="form-error">{errors.contact}</span>}
                        </div>
                        <div className="form-group">
                            <label className="form-label">License Number *</label>
                            <input className={`form-control${errors.licenseNo ? ' error' : ''}`} placeholder="GJ0120190012345" value={form.licenseNo} onChange={f('licenseNo')} />
                            {errors.licenseNo && <span className="form-error">{errors.licenseNo}</span>}
                        </div>
                        <div className="form-group full">
                            <label className="form-label">License Expiry Date *</label>
                            <input className={`form-control${errors.licenseExpiry ? ' error' : ''}`} type="date" value={form.licenseExpiry} onChange={f('licenseExpiry')} />
                            {errors.licenseExpiry && <span className="form-error">{errors.licenseExpiry}</span>}
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    )
}