import React, { useState } from 'react'
import { Search, Wrench, AlertTriangle, CheckCircle, Clock, FileText, ThumbsUp, ThumbsDown, Eye } from 'lucide-react'
import { vehicles, getVehicleById } from '../data/mockData'
import { useMaintenance } from '../context/MaintenanceContext'

const statusLabel = { scheduled: 'Scheduled', in_progress: 'In Progress', completed: 'Completed' }

const reimbStyle = {
    pending: { label: 'Pending', color: '#fbbf24', bg: 'rgba(245,158,11,0.12)' },
    approved: { label: 'Approved', color: '#34d399', bg: 'rgba(16,185,129,0.12)' },
    rejected: { label: 'Rejected', color: '#f87171', bg: 'rgba(239,68,68,0.12)' },
}

export default function Maintenance() {
    const { records, vehicleStatuses, approveReimbursement, rejectReimbursement, updateStatus } = useMaintenance()
    const [search, setSearch] = useState('')
    const [filter, setFilter] = useState('all')
    const [reimbFilter, setReimbFilter] = useState('all')
    const [billPreview, setBillPreview] = useState(null) // { url, name }

    // ── Filtered records ──
    const filtered = records.filter(r => {
        const matchStatus = filter === 'all' || r.status === filter
        const matchReimb = reimbFilter === 'all' || r.reimbursementStatus === reimbFilter
        const q = search.toLowerCase()
        const v = getVehicleById(r.vehicleId)
        const matchSearch = !q
            || r.type.toLowerCase().includes(q)
            || (r.workshop || '').toLowerCase().includes(q)
            || (v && v.regNo.toLowerCase().includes(q))
            || (r.driverName || '').toLowerCase().includes(q)
        return matchStatus && matchReimb && matchSearch
    })

    const maintenanceVehicles = vehicles.filter(v => (vehicleStatuses[v.id] || v.status) === 'maintenance')
    const pendingReimb = records.filter(r => r.reimbursementStatus === 'pending')

    return (
        <div>
            {/* Page header */}
            <div className="page-header">
                <div>
                    <h1>Maintenance</h1>
                    <p>Review driver-submitted maintenance requests, approve bills, and monitor fleet health</p>
                </div>
            </div>

            {/* Alerts */}
            {pendingReimb.length > 0 && (
                <div style={{ marginBottom: 16, background: 'rgba(59,130,246,0.07)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: 12, padding: '12px 18px', display: 'flex', alignItems: 'center', gap: 10 }}>
                    <FileText size={16} style={{ color: '#60a5fa', flexShrink: 0 }} />
                    <div>
                        <strong style={{ color: '#93c5fd' }}>{pendingReimb.length} reimbursement request{pendingReimb.length > 1 ? 's' : ''} pending your approval</strong>
                        <span style={{ color: '#64748b', fontSize: 12, marginLeft: 8 }}>Review bills and approve or reject below.</span>
                    </div>
                </div>
            )}
            {maintenanceVehicles.length > 0 && (
                <div className="alert-banner warning" style={{ marginBottom: 24 }}>
                    <AlertTriangle size={17} style={{ flexShrink: 0 }} />
                    <div><strong>{maintenanceVehicles.length} vehicle(s) currently under maintenance:</strong> {maintenanceVehicles.map(v => v.regNo).join(', ')} — unavailable for dispatch.</div>
                </div>
            )}

            {/* Summary cards */}
            <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', marginBottom: 24 }}>
                {[
                    { label: 'Scheduled', count: records.filter(r => r.status === 'scheduled').length, cls: 'amber', Icon: Clock },
                    { label: 'In Progress', count: records.filter(r => r.status === 'in_progress').length, cls: 'blue', Icon: Wrench },
                    { label: 'Completed', count: records.filter(r => r.status === 'completed').length, cls: 'green', Icon: CheckCircle },
                    { label: 'Pending Bills', count: pendingReimb.length, cls: 'red', Icon: FileText },
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
                    <span className="table-title">Maintenance Requests</span>
                    <div className="table-actions">
                        <div className="filter-tabs">
                            {['all', 'scheduled', 'in_progress', 'completed'].map(s => (
                                <button key={s} className={`filter-tab${filter === s ? ' active' : ''}`} onClick={() => setFilter(s)}>
                                    {s === 'all' ? 'All' : statusLabel[s]}
                                </button>
                            ))}
                        </div>
                        <div className="filter-tabs" style={{ gap: 4 }}>
                            {['all', 'pending', 'approved', 'rejected'].map(s => (
                                <button key={s} className={`filter-tab${reimbFilter === s ? ' active' : ''}`} onClick={() => setReimbFilter(s)} style={{ fontSize: 11 }}>
                                    {s === 'all' ? 'All Bills' : s.charAt(0).toUpperCase() + s.slice(1)}
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
                            <th>Driver</th>
                            <th>Workshop</th>
                            <th>Date</th>
                            <th>Cost (₹)</th>
                            <th>Bill</th>
                            <th>Status</th>
                            <th>Reimbursement</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.map(r => {
                            const v = getVehicleById(r.vehicleId)
                            const rs = reimbStyle[r.reimbursementStatus] || reimbStyle.pending
                            const vStatus = vehicleStatuses[r.vehicleId]
                            return (
                                <tr key={r.id} style={r.reimbursementStatus === 'pending' ? { background: 'rgba(59,130,246,0.03)' } : {}}>
                                    <td style={{ fontFamily: 'monospace', color: 'var(--text-muted)', fontSize: 12 }}>{r.id}</td>
                                    <td>
                                        <div style={{ fontWeight: 600, fontSize: 13 }}>{v ? v.regNo : r.vehicleId}</div>
                                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{v ? `${v.make} ${v.model}` : ''}</div>
                                        {vStatus === 'maintenance' && r.status !== 'completed' && (
                                            <span style={{ fontSize: 10, fontWeight: 700, color: '#fbbf24', background: 'rgba(245,158,11,0.1)', padding: '2px 6px', borderRadius: 6, display: 'inline-block', marginTop: 3 }}>Under Service</span>
                                        )}
                                    </td>
                                    <td>
                                        <div style={{ fontWeight: 600 }}>{r.type}</div>
                                        {r.description && <div style={{ fontSize: 11, color: 'var(--text-muted)', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.description}</div>}
                                    </td>
                                    <td style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{r.driverName || '—'}</td>
                                    <td style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{r.workshop || '—'}</td>
                                    <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>{r.scheduledDate}</td>
                                    <td style={{ fontWeight: 700 }}>{r.cost ? `₹${r.cost.toLocaleString()}` : '—'}</td>
                                    <td>
                                        {r.billUrl ? (
                                            <button
                                                onClick={() => setBillPreview({ url: r.billUrl, name: r.billFileName })}
                                                style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 700, color: '#60a5fa', background: 'rgba(59,130,246,0.08)', border: 'none', borderRadius: 7, padding: '5px 10px', cursor: 'pointer', fontFamily: 'inherit' }}
                                            >
                                                <Eye size={12} /> View Bill
                                            </button>
                                        ) : (
                                            <span style={{ fontSize: 12, color: '#334155' }}>No bill</span>
                                        )}
                                    </td>
                                    <td><span className={`badge ${r.status}`}>{statusLabel[r.status]}</span></td>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                            <span style={{ fontSize: 11, fontWeight: 700, color: rs.color, background: rs.bg, padding: '3px 8px', borderRadius: 100, whiteSpace: 'nowrap' }}>{rs.label}</span>
                                            {r.reimbursementStatus === 'pending' && (
                                                <div style={{ display: 'flex', gap: 4 }}>
                                                    <button
                                                        title="Approve reimbursement"
                                                        onClick={() => approveReimbursement(r.id)}
                                                        style={{ background: 'rgba(16,185,129,0.1)', border: 'none', borderRadius: 6, padding: '5px 7px', cursor: 'pointer', color: '#34d399', display: 'flex', alignItems: 'center' }}
                                                    >
                                                        <ThumbsUp size={13} />
                                                    </button>
                                                    <button
                                                        title="Reject reimbursement"
                                                        onClick={() => rejectReimbursement(r.id)}
                                                        style={{ background: 'rgba(239,68,68,0.1)', border: 'none', borderRadius: 6, padding: '5px 7px', cursor: 'pointer', color: '#f87171', display: 'flex', alignItems: 'center' }}
                                                    >
                                                        <ThumbsDown size={13} />
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            )
                        })}
                        {filtered.length === 0 && (
                            <tr><td colSpan={10} style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>No maintenance records found</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Bill preview modal */}
            {billPreview && (
                <div
                    onClick={() => setBillPreview(null)}
                    style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
                >
                    <div
                        onClick={e => e.stopPropagation()}
                        style={{ background: '#0f1829', border: '1px solid rgba(59,130,246,0.2)', borderRadius: 18, padding: 24, maxWidth: 700, width: '100%', maxHeight: '85vh', display: 'flex', flexDirection: 'column', gap: 16 }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div style={{ fontSize: 14, fontWeight: 700, color: '#f1f5f9' }}>{billPreview.name || 'Bill Preview'}</div>
                            <div style={{ display: 'flex', gap: 10 }}>
                                <a href={billPreview.url} target="_blank" rel="noreferrer" style={{ fontSize: 12, color: '#60a5fa', fontWeight: 600 }}>Open in new tab</a>
                                <button onClick={() => setBillPreview(null)} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: 20, lineHeight: 1 }}>×</button>
                            </div>
                        </div>
                        <div style={{ flex: 1, overflow: 'auto', borderRadius: 10, background: '#0a1422', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 300 }}>
                            {billPreview.name?.endsWith('.pdf') ? (
                                <iframe src={billPreview.url} title="Bill" style={{ width: '100%', height: 500, border: 'none', borderRadius: 10 }} />
                            ) : (
                                <img src={billPreview.url} alt="Bill" style={{ maxWidth: '100%', maxHeight: 500, borderRadius: 10, objectFit: 'contain' }} />
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
