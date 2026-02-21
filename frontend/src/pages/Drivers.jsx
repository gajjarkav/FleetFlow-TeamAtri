import React, { useState, useEffect } from 'react'
import { Plus, Search, User, Phone, CreditCard, Trash2 } from 'lucide-react'
import Modal from '../components/Modal'
import { authApi } from '../services/api'

const getDaysUntilExpiry = (dateStr) => {
    if (!dateStr) return 999
    const today = new Date()
    const expiry = new Date(dateStr)
    return Math.ceil((expiry - today) / (1000 * 60 * 60 * 24))
}

const getLicenseStatus = (expiry) => {
    const days = getDaysUntilExpiry(expiry)
    if (days <= 0) return { label: 'Expired', cls: 'expired', color: 'var(--danger)' }
    if (days <= 30) return { label: `Expires in ${days}d`, cls: 'expired', color: 'var(--danger)' }
    if (days <= 90) return { label: `Expires in ${days}d`, cls: 'warning', color: 'var(--warning)' }
    return { label: `Valid (${days}d left)`, cls: 'available', color: 'var(--success)' }
}

const defaultForm = { name: '', email: '', password: '', mobile_number: '', license_number: '', license_expiry: '' }

export default function Drivers() {
    const [dispatchers, setDispatchers] = useState([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [showModal, setShowModal] = useState(false)
    const [form, setForm] = useState(defaultForm)
    const [errors, setErrors] = useState({})
    const [submitting, setSubmitting] = useState(false)

    const fetchDispatchers = async () => {
        try {
            const data = await authApi.listDispatchers()
            setDispatchers(data)
        } catch (err) {
            console.error('Failed to load dispatchers:', err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { fetchDispatchers() }, [])

    const filtered = dispatchers.filter(d => {
        const q = search.toLowerCase()
        return !q || (d.name || '').toLowerCase().includes(q) || d.email.toLowerCase().includes(q) || (d.license_number || '').toLowerCase().includes(q)
    })

    const validate = () => {
        const e = {}
        if (!form.name.trim()) e.name = 'Name is required'
        if (!form.email.trim()) e.email = 'Email is required'
        if (!form.password || form.password.length < 4) e.password = 'Password required (min 4 chars)'
        if (!form.mobile_number.trim()) e.mobile_number = 'Mobile number is required'
        if (!form.license_number.trim()) e.license_number = 'License number is required'
        if (!form.license_expiry) e.license_expiry = 'License expiry date is required'
        return e
    }

    const handleSubmit = async () => {
        const e = validate()
        if (Object.keys(e).length) { setErrors(e); return }
        setSubmitting(true)
        try {
            await authApi.createDispatcher({
                name: form.name.trim(),
                email: form.email.trim(),
                password: form.password,
                mobile_number: form.mobile_number.trim(),
                license_number: form.license_number.trim(),
                license_expiry: new Date(form.license_expiry).toISOString(),
            })
            setShowModal(false)
            setForm(defaultForm)
            setErrors({})
            fetchDispatchers()
        } catch (err) {
            setErrors({ submit: err.message })
        } finally {
            setSubmitting(false)
        }
    }

    const handleDelete = async (id) => {
        if (!confirm('Delete this dispatcher?')) return
        try {
            await authApi.deleteDispatcher(id)
            fetchDispatchers()
        } catch (err) {
            alert(err.message)
        }
    }

    const f = (k) => (e) => { setForm(p => ({ ...p, [k]: e.target.value })); setErrors(p => ({ ...p, [k]: undefined })) }

    if (loading) return <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>Loading dispatchers...</div>

    return (
        <div>
            <div className="page-header">
                <div>
                    <h1>Dispatchers</h1>
                    <p>Dispatcher registry, license compliance, and management</p>
                </div>
                <button className="btn btn-primary" onClick={() => { setShowModal(true); setForm(defaultForm); setErrors({}) }}>
                    <Plus size={16} /> Add Dispatcher
                </button>
            </div>

            {/* Compliance Summary */}
            <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', marginBottom: 24 }}>
                {[
                    { label: 'Total Dispatchers', value: dispatchers.length, cls: 'blue' },
                    { label: 'License Warning', value: dispatchers.filter(d => { const x = getDaysUntilExpiry(d.license_expiry); return x > 0 && x <= 90 }).length, cls: 'amber' },
                    { label: 'License Expired', value: dispatchers.filter(d => getDaysUntilExpiry(d.license_expiry) <= 0).length, cls: 'red' },
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
                        <div className="search-input-wrap">
                            <Search size={14} className="search-icon" />
                            <input className="search-input" placeholder="Search dispatchers..." value={search} onChange={e => setSearch(e.target.value)} />
                        </div>
                    </div>
                </div>
                <table>
                    <thead>
                        <tr>
                            <th>Dispatcher</th>
                            <th>Email</th>
                            <th>Mobile</th>
                            <th>License No.</th>
                            <th>License Expiry</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.map(d => {
                            const lic = getLicenseStatus(d.license_expiry)
                            return (
                                <tr key={d.id}>
                                    <td>
                                        <div className="flex items-center gap-2">
                                            <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(59,130,246,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-blue-light)', fontWeight: 700, fontSize: 13 }}>
                                                {(d.name || '?').charAt(0)}
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
                                        <span style={{ color: lic.color, fontWeight: 600, fontSize: 12 }}>{lic.label}</span>
                                    </td>
                                    <td>
                                        <button
                                            onClick={() => handleDelete(d.id)}
                                            style={{ background: 'rgba(239,68,68,0.08)', border: 'none', borderRadius: 6, padding: '5px 8px', cursor: 'pointer', color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 600, fontFamily: 'inherit' }}
                                        >
                                            <Trash2 size={13} /> Remove
                                        </button>
                                    </td>
                                </tr>
                            )
                        })}
                        {filtered.length === 0 && (
                            <tr><td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>No dispatchers found</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Add Dispatcher Modal */}
            {showModal && (
                <Modal title="Add Dispatcher" onClose={() => setShowModal(false)}
                    footer={<>
                        <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                        <button className="btn btn-primary" onClick={handleSubmit} disabled={submitting}>
                            {submitting ? 'Adding...' : <><Plus size={15} /> Add Dispatcher</>}
                        </button>
                    </>}
                >
                    {errors.submit && (
                        <div style={{ fontSize: 12, color: 'var(--danger)', background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.18)', borderRadius: 8, padding: '10px 13px', marginBottom: 14 }}>
                            {errors.submit}
                        </div>
                    )}
                    <div className="form-grid">
                        <div className="form-group">
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
                            <input className={`form-control${errors.password ? ' error' : ''}`} type="password" placeholder="Min. 4 characters" value={form.password} onChange={f('password')} />
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
                        <div className="form-group">
                            <label className="form-label">License Expiry *</label>
                            <input className={`form-control${errors.license_expiry ? ' error' : ''}`} type="date" value={form.license_expiry} onChange={f('license_expiry')} />
                            {errors.license_expiry && <span className="form-error">{errors.license_expiry}</span>}
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    )
}
