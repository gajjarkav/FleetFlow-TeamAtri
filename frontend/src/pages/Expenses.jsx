import React, { useState } from 'react'
import { Plus, Search, Fuel, Wrench, DollarSign, TrendingUp } from 'lucide-react'
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts'
import Modal from '../components/Modal'
import { expenses as initialExpenses, vehicles, trips, getVehicleById, monthlyExpenses } from '../data/mockData'

const catLabel = { fuel: 'Fuel', maintenance: 'Maintenance', toll: 'Toll', other: 'Other' }
const catIcon = { fuel: Fuel, maintenance: Wrench, toll: TrendingUp, other: DollarSign }
const defaultForm = { vehicleId: '', category: 'fuel', amount: '', liters: '', date: '', description: '' }

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload?.length) {
        return (
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-hover)', borderRadius: 8, padding: '10px 14px', fontSize: 12 }}>
                <div style={{ color: 'var(--text-secondary)', marginBottom: 4, fontWeight: 600 }}>{label}</div>
                {payload.map(p => <div key={p.name} style={{ color: p.fill, fontWeight: 700 }}>₹{p.value?.toLocaleString()} {p.name}</div>)}
            </div>
        )
    }
    return null
}

export default function Expenses() {
    const [expenses, setExpenses] = useState(initialExpenses)
    const [search, setSearch] = useState('')
    const [catFilter, setCatFilter] = useState('all')
    const [showModal, setShowModal] = useState(false)
    const [form, setForm] = useState(defaultForm)
    const [errors, setErrors] = useState({})

    const filtered = expenses.filter(e => {
        const matchCat = catFilter === 'all' || e.category === catFilter
        const q = search.toLowerCase()
        const v = getVehicleById(e.vehicleId)
        const matchSearch = !q || e.description.toLowerCase().includes(q) || (v && v.regNo.toLowerCase().includes(q))
        return matchCat && matchSearch
    })

    const totalFuel = expenses.filter(e => e.category === 'fuel').reduce((s, e) => s + e.amount, 0)
    const totalMaint = expenses.filter(e => e.category === 'maintenance').reduce((s, e) => s + e.amount, 0)
    const totalToll = expenses.filter(e => e.category === 'toll').reduce((s, e) => s + e.amount, 0)
    const totalAll = totalFuel + totalMaint + totalToll

    const validate = () => {
        const e = {}
        if (!form.vehicleId) e.vehicleId = 'Select a vehicle'
        if (!form.amount || +form.amount <= 0) e.amount = 'Valid amount required'
        if (!form.date) e.date = 'Date is required'
        if (!form.description.trim()) e.description = 'Description is required'
        return e
    }

    const handleSubmit = () => {
        const e = validate()
        if (Object.keys(e).length) { setErrors(e); return }
        const newE = {
            id: `E${String(expenses.length + 1).padStart(3, '0')}`,
            ...form,
            amount: +form.amount,
            liters: form.liters ? +form.liters : null,
            tripId: null,
            pricePerLiter: null,
            recordedBy: 'Fleet Manager',
        }
        setExpenses(prev => [newE, ...prev])
        setShowModal(false)
        setForm(defaultForm)
        setErrors({})
    }

    const f = (k) => (e) => { setForm(p => ({ ...p, [k]: e.target.value })); setErrors(p => ({ ...p, [k]: undefined })) }

    return (
        <div>
            <div className="page-header">
                <div>
                    <h1>Expenses</h1>
                    <p>Track fuel costs, maintenance expenses, and calculate fleet operational costs</p>
                </div>
                <button className="btn btn-primary" onClick={() => { setShowModal(true); setForm(defaultForm); setErrors({}) }}>
                    <Plus size={16} /> Add Expense
                </button>
            </div>

            {/* KPI Cards */}
            <div className="stat-grid" style={{ marginBottom: 24 }}>
                <div className="stat-card">
                    <div className="stat-icon blue"><DollarSign size={22} /></div>
                    <div className="stat-info">
                        <div className="stat-value" style={{ fontSize: 22 }}>₹{totalAll.toLocaleString()}</div>
                        <div className="stat-label">Total Expenses</div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon amber"><Fuel size={22} /></div>
                    <div className="stat-info">
                        <div className="stat-value" style={{ fontSize: 22 }}>₹{totalFuel.toLocaleString()}</div>
                        <div className="stat-label">Fuel Costs</div>
                        <div className="stat-trend neutral" style={{ fontSize: 11 }}>
                            {Math.round((totalFuel / totalAll) * 100)}% of total
                        </div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon red"><Wrench size={22} /></div>
                    <div className="stat-info">
                        <div className="stat-value" style={{ fontSize: 22 }}>₹{totalMaint.toLocaleString()}</div>
                        <div className="stat-label">Maintenance Costs</div>
                        <div className="stat-trend neutral" style={{ fontSize: 11 }}>
                            {Math.round((totalMaint / totalAll) * 100)}% of total
                        </div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon green"><TrendingUp size={22} /></div>
                    <div className="stat-info">
                        <div className="stat-value" style={{ fontSize: 22 }}>₹18.4</div>
                        <div className="stat-label">Avg Cost / km</div>
                        <div className="stat-trend up" style={{ fontSize: 11 }}>Based on completed trips</div>
                    </div>
                </div>
            </div>

            {/* Monthly Chart */}
            <div className="chart-card" style={{ marginBottom: 24 }}>
                <div className="chart-card-title">Monthly Expense Breakdown</div>
                <div className="chart-card-subtitle">Last 6 months – Fuel, Maintenance & Tolls (₹)</div>
                <ResponsiveContainer width="100%" height={240}>
                    <BarChart data={monthlyExpenses} barSize={20}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(59,130,246,0.08)" />
                        <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v / 1000).toFixed(0)}k`} />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend formatter={(v) => <span style={{ color: 'var(--text-secondary)', fontSize: 12 }}>{v}</span>} />
                        <Bar dataKey="fuel" name="Fuel" fill="#3b82f6" radius={[3, 3, 0, 0]} stackId="a" />
                        <Bar dataKey="maintenance" name="Maintenance" fill="#f59e0b" radius={[3, 3, 0, 0]} stackId="a" />
                        <Bar dataKey="toll" name="Toll" fill="#10b981" radius={[3, 3, 0, 0]} stackId="a" />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* Expense Table */}
            <div className="table-container">
                <div className="table-header">
                    <span className="table-title">Expense Log</span>
                    <div className="table-actions">
                        <div className="filter-tabs">
                            {['all', 'fuel', 'maintenance', 'toll'].map(s => (
                                <button key={s} className={`filter-tab${catFilter === s ? ' active' : ''}`} onClick={() => setCatFilter(s)}>
                                    {s === 'all' ? 'All' : catLabel[s]}
                                </button>
                            ))}
                        </div>
                        <div className="search-input-wrap">
                            <Search size={14} className="search-icon" />
                            <input className="search-input" placeholder="Search expenses..." value={search} onChange={e => setSearch(e.target.value)} />
                        </div>
                    </div>
                </div>
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Vehicle</th>
                            <th>Category</th>
                            <th>Description</th>
                            <th>Date</th>
                            <th>Liters</th>
                            <th>Amount (₹)</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.map(e => {
                            const v = getVehicleById(e.vehicleId)
                            const Icon = catIcon[e.category] || DollarSign
                            return (
                                <tr key={e.id}>
                                    <td style={{ fontFamily: 'monospace', color: 'var(--text-muted)', fontSize: 12 }}>{e.id}</td>
                                    <td>
                                        <div style={{ fontWeight: 600, fontSize: 12 }}>{v ? v.regNo : e.vehicleId}</div>
                                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{v ? `${v.make} ${v.model}` : ''}</div>
                                    </td>
                                    <td>
                                        <span className={`badge ${e.category === 'fuel' ? 'in_use' : e.category === 'maintenance' ? 'maintenance' : 'available'}`}>
                                            {catLabel[e.category]}
                                        </span>
                                    </td>
                                    <td style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{e.description}</td>
                                    <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>{e.date}</td>
                                    <td style={{ fontSize: 12 }}>{e.liters ? `${e.liters}L` : '—'}</td>
                                    <td style={{ fontWeight: 700, color: 'var(--accent-blue-light)' }}>₹{e.amount.toLocaleString()}</td>
                                </tr>
                            )
                        })}
                        {filtered.length === 0 && (
                            <tr><td colSpan={7} style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>No expenses found</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {showModal && (
                <Modal title="Add Expense Record" onClose={() => setShowModal(false)}
                    footer={<>
                        <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                        <button className="btn btn-primary" onClick={handleSubmit}><Plus size={15} /> Add Expense</button>
                    </>}
                >
                    <div className="form-grid">
                        <div className="form-group">
                            <label className="form-label">Vehicle *</label>
                            <select className={`form-control${errors.vehicleId ? ' error' : ''}`} value={form.vehicleId} onChange={f('vehicleId')}>
                                <option value="">— Select —</option>
                                {vehicles.map(v => <option key={v.id} value={v.id}>{v.regNo} – {v.make} {v.model}</option>)}
                            </select>
                            {errors.vehicleId && <span className="form-error">{errors.vehicleId}</span>}
                        </div>
                        <div className="form-group">
                            <label className="form-label">Category</label>
                            <select className="form-control" value={form.category} onChange={f('category')}>
                                {Object.entries(catLabel).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Amount (₹) *</label>
                            <input className={`form-control${errors.amount ? ' error' : ''}`} type="number" placeholder="5000" value={form.amount} onChange={f('amount')} />
                            {errors.amount && <span className="form-error">{errors.amount}</span>}
                        </div>
                        <div className="form-group">
                            <label className="form-label">Date *</label>
                            <input className={`form-control${errors.date ? ' error' : ''}`} type="date" value={form.date} onChange={f('date')} />
                            {errors.date && <span className="form-error">{errors.date}</span>}
                        </div>
                        {form.category === 'fuel' && (
                            <div className="form-group">
                                <label className="form-label">Liters (optional)</label>
                                <input className="form-control" type="number" placeholder="45.5" value={form.liters} onChange={f('liters')} />
                            </div>
                        )}
                        <div className={`form-group ${form.category === 'fuel' ? '' : 'full'}`}>
                            <label className="form-label">Description *</label>
                            <input className={`form-control${errors.description ? ' error' : ''}`} placeholder="e.g. Diesel fill – Ahmedabad pump" value={form.description} onChange={f('description')} />
                            {errors.description && <span className="form-error">{errors.description}</span>}
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    )
}
