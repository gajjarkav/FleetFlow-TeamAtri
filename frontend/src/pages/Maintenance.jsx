import React, { useState, useEffect } from 'react'
import { Search, Wrench, AlertTriangle, CheckCircle, Clock, FileText, RefreshCw } from 'lucide-react'
import { listVehiclesApi } from '../api/vehicles'
import { listMaintenanceApi, updateMaintenanceStatusApi } from '../api/maintenance'

/**
 * Maintenance status from backend: pending | approved | rejected | completed
 */
const statusLabel = { pending: 'Pending', approved: 'Approved', rejected: 'Rejected', completed: 'Completed' }

const statusStyle = {
    pending: { color: '#fbbf24', bg: 'rgba(245,158,11,0.1)', Icon: Clock },
    approved: { color: '#60a5fa', bg: 'rgba(59,130,246,0.1)', Icon: Wrench },
    rejected: { color: '#f87171', bg: 'rgba(239,68,68,0.1)', Icon: AlertTriangle },
    completed: { color: '#34d399', bg: 'rgba(16,185,129,0.1)', Icon: CheckCircle },
}

export default function Maintenance() {
    const [records, setRecords] = useState([])
    const [vehicles, setVehicles] = useState([])
    const [loading, setLoading] = useState(true)
    const [fetchError, setFetchError] = useState('')
    const [search, setSearch] = useState('')
    const [filter, setFilter] = useState('all')

    const load = () => {
        setLoading(true)
        Promise.all([listMaintenanceApi(), listVehiclesApi()])
            .then(([m, v]) => { setRecords(m); setVehicles(v) })
            .catch(e => setFetchError(e.message))
            .finally(() => setLoading(false))
    }

    useEffect(load, [])

    const vehicleById = (id) => vehicles.find(v => v.id === id)

    const filtered = records.filter(r => {
        const matchStatus = filter === 'all' || r.status === filter
        const q = search.toLowerCase()
        const veh = vehicleById(r.vehicle_id)
        const matchSearch = !q
            || r.maintenance_type.toLowerCase().includes(q)
            || (r.workshop || '').toLowerCase().includes(q)
            || (veh && veh.plate_number.toLowerCase().includes(q))
        return matchStatus && matchSearch
    })

    const handleStatusChange = async (id, newStatus) => {
        try {
            const updated = await updateMaintenanceStatusApi(id, newStatus)
            setRecords(prev => prev.map(r => r.id === id ? updated : r))
        } catch (err) {
            alert('Failed to update status: ' + err.message)
        }
    }

    const pendingCount = records.filter(r => r.status === 'pending').length

    return (
        <div>
            {/* Page header */}
            <div className="page-header">
                <div>
                    <h1>Maintenance</h1>
                    <p>Review dispatcher-submitted maintenance requests and update statuses</p>
                </div>
                <button className="btn btn-secondary" onClick={load} title="Refresh"><RefreshCw size={15} /></button>
            </div>

            {fetchError && <div className="alert-banner danger"><AlertTriangle size={17} /><div>{fetchError}</div></div>}

            {/* Pending alert */}
            {pendingCount > 0 && (
                <div style={{ marginBottom: 16, background: 'rgba(59,130,246,0.07)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: 12, padding: '12px 18px', display: 'flex', alignItems: 'center', gap: 10 }}>
                    <FileText size={16} style={{ color: '#60a5fa', flexShrink: 0 }} />
                    <div>
                        <strong style={{ color: '#93c5fd' }}>{pendingCount} maintenance request{pendingCount > 1 ? 's' : ''} pending review</strong>
                        <span style={{ color: '#64748b', fontSize: 12, marginLeft: 8 }}>Use the status dropdown below to approve or reject.</span>
                    </div>
                </div>
            )}

            {/* Summary cards */}
            <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', marginBottom: 24 }}>
                {Object.entries(statusLabel).map(([status, label]) => {
                    const { color, bg, Icon } = statusStyle[status]
                    return (
                        <div key={status} className="stat-card" style={{ cursor: 'pointer' }} onClick={() => setFilter(status)}>
                            <div className="stat-icon" style={{ background: bg, color }}><Icon size={20} /></div>
                            <div className="stat-info">
                                <div className="stat-value" style={{ fontSize: 20 }}>{records.filter(r => r.status === status).length}</div>
                                <div className="stat-label">{label}</div>
                            </div>
                        </div>
                    )
                })}
            </div>

            {/* Table */}
            <div className="table-container">
                <div className="table-header">
                    <span className="table-title">Maintenance Requests</span>
                    <div className="table-actions">
                        <div className="filter-tabs">
                            {['all', 'pending', 'approved', 'rejected', 'completed'].map(s => (
                                <button key={s} className={`filter-tab${filter === s ? ' active' : ''}`} onClick={() => setFilter(s)}>
                                    {s === 'all' ? 'All' : statusLabel[s] || s}
                                </button>
                            ))}
                        </div>
                        <div className="search-input-wrap">
                            <Search size={14} className="search-icon" />
                            <input className="search-input" placeholder="Search records..." value={search} onChange={e => setSearch(e.target.value)} />
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div style={{ color: 'var(--text-secondary)', padding: 32 }}>Loading maintenance recordsâ€¦</div>
                ) : (
                <table>
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Vehicle</th>
                            <th>Type</th>
                            <th>Description</th>
                            <th>Workshop</th>
                            <th>Date</th>
                            <th>Est. Cost (â‚¹)</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.map(r => {
                            const veh = vehicleById(r.vehicle_id)
                            const ss = statusStyle[r.status] || statusStyle.pending
                            return (
                                <tr key={r.id} style={r.status === 'pending' ? { background: 'rgba(59,130,246,0.03)' } : {}}>
                                    <td style={{ fontFamily: 'monospace', color: 'var(--text-muted)', fontSize: 12 }}>#{r.id}</td>
                                    <td>
                                        <div style={{ fontWeight: 600, fontSize: 13 }}>{veh ? veh.plate_number : `Vehicle #${r.vehicle_id}`}</div>
                                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{veh ? `${veh.name} Â· ${veh.category}` : ''}</div>
                                    </td>
                                    <td style={{ fontWeight: 600, fontSize: 13 }}>{r.maintenance_type}</td>
                                    <td style={{ fontSize: 11, color: 'var(--text-muted)', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                        {r.description || 'â€”'}
                                    </td>
                                    <td style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{r.workshop || 'â€”'}</td>
                                    <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                                        {r.date ? new Date(r.date).toLocaleDateString('en-IN') : 'â€”'}
                                    </td>
                                    <td style={{ fontWeight: 700 }}>â‚¹{Number(r.estimated_cost).toLocaleString('en-IN')}</td>
                                    <td>
                                        <select
                                            value={r.status}
                                            onChange={e => handleStatusChange(r.id, e.target.value)}
                                            style={{
                                                background: ss.bg,
                                                color: ss.color,
                                                border: 'none',
                                                borderRadius: 6,
                                                padding: '4px 8px',
                                                fontSize: 12,
                                                fontWeight: 700,
                                                cursor: 'pointer',
                                                fontFamily: 'inherit',
                                            }}
                                        >
                                            {Object.entries(statusLabel).map(([val, lbl]) => (
                                                <option key={val} value={val} style={{ background: '#0f1829', color: '#f1f5f9' }}>{lbl}</option>
                                            ))}
                                        </select>
                                    </td>
                                </tr>
                            )
                        })}
                        {filtered.length === 0 && (
                            <tr><td colSpan={8} style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>No maintenance records found</td></tr>
                        )}
                    </tbody>
                </table>
                )}
            </div>
        </div>
    )
}
