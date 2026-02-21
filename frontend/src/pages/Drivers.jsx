import React, { useState, useEffect } from 'react'
import { Plus, Search, User, Phone, AlertTriangle, Trash2, RefreshCw } from 'lucide-react'
import Modal from '../components/Modal'
import { listDispatchersApi, createDispatcherApi, deleteDispatcherApi } from '../api/auth'

/**
 * Drivers page = Dispatchers management.
 * Backend: GET/POST/DELETE /auth/dispatchers
 * duty_status: available | unavailable
 */

const dutyLabel = { available: 'Available', unavailable: 'Off Duty' }

const defaultForm = {
    name: '',
    email: '',
    password: '',
    mobile_number: '',
    license_number: '',
    license_expiry: '',
}

export default function Drivers() {
    const [drivers, setDrivers] = useState([])
    const [loading, setLoading] = useState(true)
    const [fetchError, setFetchError] = useState('')
    const [search, setSearch] = useState('')
    const [statusFilter, setStatusFilter] = useState('all')
    const [showModal, setShowModal] = useState(false)
    const [form, setForm] = useState(defaultForm)
    const [errors, setErrors] = useState({})
    const [saving, setSaving] = useState(false)

    const load = () => {
        setLoading(true)
        listDispatchersApi()
            .then(setDrivers)
            .catch(e => setFetchError(e.message))
            .finally(() => setLoading(false))
    }

    useEffect(load, [])

    const filtered = drivers.filter(d => {
        const matchStatus = statusFilter === 'all' || d.duty_status === statusFilter
        const q = search.toLowerCase()
        const matchSearch = !q
            || (d.name || '').toLowerCase().includes(q)
            || d.email.toLowerCase().includes(q)
            || (d.license_number || '').toLowerCase().includes(q)
        return matchStatus && matchSearch
    })

    const validate = () => {
        const e = {}
        if (!form.name.trim()) e.name = 'Name is required'
        if (!form.email.trim()) e.email = 'Email is required'
        if (!form.password.trim()) e.password = 'Password is required'
        if (!form.mobile_number.trim()) e.mobile_number = 'Mobile number is required'
        if (!form.license_number.trim()) e.license_number = 'License number is required'
        if (!form.license_expiry) e.license_expiry = 'License expiry date is required'
        return e
    }

    const handleSubmit = async () => {
        const e = validate()
        if (Object.keys(e).length) { setErrors(e); return }
        setSaving(true)
        try {
            const created = await createDispatcherApi({
                ...form,
                license_expiry: new Date(form.license_expiry).toISOString(),
            })
            setDrivers(prev => [created, ...prev])
            setShowModal(false)
            setForm(defaultForm)
            setErrors({})
        } catch (err) {
            setErrors({ _api: err.message })
        } finally {
            setSaving(false)
        }
    }

    const handleDelete = async (id) => {
        if (!window.confirm('Remove this dispatcher?')) return
        try {
            await deleteDispatcherApi(id)
            setDrivers(prev => prev.filter(d => d.id !== id))
        } catch (err) {
            alert('Failed to delete: ' + err.message)
        }
    }

    const f = (k) => (e) => { setForm(p => ({ ...p, [k]: e.target.value })); setErrors(p => ({ ...p, [k]: undefined })) }

    const fmtExpiry = (dt) => {
        if (!dt) return '—'
        const d = new Date(dt)
        const days = Math.ceil((d - Date.now()) / 86400000)
        const dateStr = d.toLocaleDateString('en-IN')
        if (days <= 0) return { label: `Expired (${dateStr})`, color: 'var(--danger)' }
        if (days <= 30) return { label: `${dateStr} (${days}d)`, color: 'var(--danger)' }
        if (days <= 90) return { label: `${dateStr} (${days}d)`, color: 'var(--warning)' }
        return { label: dateStr, color: 'var(--success)' }
    }

    return (
        <div>
            <div className="page-header">
                <div>
                    <h1>Drivers / Dispatchers</h1>
                    <p>Dispatcher registry, license compliance, and account management</p>
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                    <button className="btn btn-secondary" onClick={load} title="Refresh"><RefreshCw size={15} /></button>
                    <button className="btn btn-primary" onClick={() => { setShowModal(true); setForm(defaultForm); setErrors({}) }}>
                        <Plus size={16} /> Add Dispatcher
                    </button>
                </div>
            </div>

            {fetchError && <div className="alert-banner danger"><AlertTriangle size={17} /><div>{fetchError}</div></div>}

            {/* Compliance Summary */}
            <div className="stat-grid" style={{ marginBottom: 24 }}>
                {[
                    { label: 'Total Dispatchers', value: drivers.length, cls: 'blue' },
                    { label: 'Available', value: drivers.filter(d => d.duty_status === 'available').length, cls: 'green' },
                    { label: 'Off Duty', value: drivers.filter(d => d.duty_status !== 'available').length, cls: 'amber' },
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
                    <span className="table-title">Dispatcher Registry</span>
                    <div className="table-actions">
                        <div className="filter-tabs">
                            {['all', 'available', 'unavailable'].map(s => (
                                <button key={s} className={`filter-tab${statusFilter === s ? ' active' : ''}`} onClick={() => setStatusFilter(s)}>
                                    {s === 'all' ? 'All' : dutyLabel[s] || s}
                                </button>
                            ))}
                        </div>
                        <div className="search-input-wrap">
                            <Search size={14} className="search-icon" />
                            <input className="search-input" placeholder="Search dispatchers..." value={search} onChange={e => setSearch(e.target.value)} />
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div style={{ color: 'var(--text-secondary)', padding: 32 }}>Loading dispatchers…</div>
                ) : (
                <table>
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Mobile</th>
                            <th>License No.</th>
                            <th>License Expiry</th>
                            <th>Duty Status</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.map(d => {
                            const expiryInfo = fmtExpiry(d.license_expiry)
                            return (
                                <tr key={d.id}>
                                    <td>
                                        <div className="flex items-center gap-2">
                                            <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(59,130,246,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-blue-light)', fontWeight: 700, fontSize: 13 }}>
                                                {(d.name || d.email).charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: 600 }}>{d.name || '—'}</div>
                                                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>ID: {d.id}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td style={{ fontSize: 12 }}>{d.email}</td>
                                    <td>
                                        <div className="flex items-center gap-2">
                                            <Phone size={13} style={{ color: 'var(--text-muted)' }} />
                                            {d.mobile_number || '—'}
                                        </div>
                                    </td>
                                    <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{d.license_number || '—'}</td>
                                    <td>
                                        {d.license_expiry ? (
                                            <div className="flex items-center gap-2">
                                                {typeof expiryInfo === 'object' && expiryInfo.color !== 'var(--success)' && <AlertTriangle size={13} style={{ color: expiryInfo.color }} />}
                                                <span style={{ color: typeof expiryInfo === 'object' ? expiryInfo.color : 'var(--success)', fontWeight: 600, fontSize: 12 }}>
                                                    {typeof expiryInfo === 'object' ? expiryInfo.label : expiryInfo}
                                                </span>
                                            </div>
                                        ) : '—'}
                                    </td>
                                    <td>
                                        <span className={`badge ${d.duty_status === 'available' ? 'available' : 'off_duty'}`}>
                                            {dutyLabel[d.duty_status] || d.duty_status}
                                        </span>
                                    </td>
                                    <td>
                                        <button
                                            onClick={() => handleDelete(d.id)}
                                            style={{ background: 'rgba(239,68,68,0.12)', border: 'none', borderRadius: 6, padding: '5px 8px', cursor: 'pointer', color: '#f87171' }}
                                            title="Remove dispatcher"
                                        ><Trash2 size={14} /></button>
                                    </td>
                                </tr>
                            )
                        })}
                        {filtered.length === 0 && (
                            <tr><td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>No dispatchers found</td></tr>
                        )}
                    </tbody>
                </table>
                )}
            </div>

            {/* Add Dispatcher Modal */}
            {showModal && (
                <Modal title="Add New Dispatcher" onClose={() => setShowModal(false)}
                    footer={<>
                        <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                        <button className="btn btn-primary" onClick={handleSubmit} disabled={saving}>
                            <Plus size={15} /> {saving ? 'Saving…' : 'Add Dispatcher'}
                        </button>
                    </>}
                >
                    <div className="form-grid">
                        {errors._api && <div className="form-error" style={{ gridColumn: '1/-1' }}>{errors._api}</div>}
                        <div className="form-group full">
                            <label className="form-label">Full Name *</label>
                            <input className={`form-control${errors.name ? ' error' : ''}`} placeholder="e.g. Rajesh Patel" value={form.name} onChange={f('name')} />
                            {errors.name && <span className="form-error">{errors.name}</span>}
                        </div>
                        <div className="form-group">
                            <label className="form-label">Email *</label>
                            <input className={`form-control${errors.email ? ' error' : ''}`} type="email" placeholder="dispatcher@fleetflow.com" value={form.email} onChange={f('email')} />
                            {errors.email && <span className="form-error">{errors.email}</span>}
                        </div>
                        <div className="form-group">
                            <label className="form-label">Password *</label>
                            <input className={`form-control${errors.password ? ' error' : ''}`} type="password" placeholder="••••••••" value={form.password} onChange={f('password')} />
                            {errors.password && <span className="form-error">{errors.password}</span>}
                        </div>
                        <div className="form-group">
                            <label className="form-label">Mobile Number *</label>
                            <input className={`form-control${errors.mobile_number ? ' error' : ''}`} placeholder="+91 98765 43210" value={form.mobile_number} onChange={f('mobile_number')} />
                            {errors.mobile_number && <span className="form-error">{errors.mobile_number}</span>}
                        </div>
                        <div className="form-group">
                            <label className="form-label">License Number *</label>
                            <input className={`form-control${errors.license_number ? ' error' : ''}`} placeholder="GJ0120190012345" value={form.license_number} onChange={f('license_number')} />
                            {errors.license_number && <span className="form-error">{errors.license_number}</span>}
                        </div>
                        <div className="form-group full">
                            <label className="form-label">License Expiry Date *</label>
                            <input className={`form-control${errors.license_expiry ? ' error' : ''}`} type="date" value={form.license_expiry} onChange={f('license_expiry')} />
                            {errors.license_expiry && <span className="form-error">{errors.license_expiry}</span>}
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    )
}
