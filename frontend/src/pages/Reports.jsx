import React from 'react'
import {
    AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts'
import { TrendingUp, Award, BarChart3 } from 'lucide-react'
import { drivers, vehicles, trips, utilizationData, monthlyExpenses, getVehicleById, getDriverById } from '../data/mockData'

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4']

const expenseCategoryData = [
    { name: 'Fuel', value: 15004 },
    { name: 'Maintenance', value: 36500 },
    { name: 'Tolls', value: 850 },
]

const topVehicles = [...vehicles]
    .map(v => ({
        ...v,
        tripCount: trips.filter(t => t.vehicleId === v.id).length,
        totalCargo: trips.filter(t => t.vehicleId === v.id).reduce((s, t) => s + (t.cargoWeight || 0), 0),
    }))
    .sort((a, b) => b.tripCount - a.tripCount)
    .slice(0, 5)

const driverPerformance = [...drivers]
    .sort((a, b) => b.tripsCompleted - a.tripsCompleted)
    .slice(0, 6)

const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null
    return (
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-hover)', borderRadius: 8, padding: '10px 14px', fontSize: 12 }}>
            <div style={{ color: 'var(--text-secondary)', marginBottom: 4 }}>{label}</div>
            {payload.map(p => (
                <div key={p.name} style={{ color: p.stroke || p.fill, fontWeight: 700 }}>
                    {typeof p.value === 'number' && p.name === 'utilization' ? `${p.value}%` : p.value} {p.name !== 'utilization' ? p.name : ''}
                </div>
            ))}
        </div>
    )
}

export default function Reports() {
    const completedTrips = trips.filter(t => t.status === 'completed')
    const totalKm = completedTrips.reduce((s, t) => s + (t.distanceKm || 0), 0)
    const totalFuelUsed = completedTrips.reduce((s, t) => s + (t.fuelUsed || 0), 0)

    return (
        <div>
            <div className="page-header">
                <div>
                    <h1>Reports</h1>
                    <p>Fleet analytics, utilization metrics, and performance intelligence</p>
                </div>
            </div>

            {/* Summary KPIs */}
            <div className="stat-grid" style={{ marginBottom: 24 }}>
                {[
                    { label: 'Fleet Utilization', value: '82%', sub: 'This month', cls: 'green' },
                    { label: 'Total km Driven', value: `${totalKm.toLocaleString()} km`, sub: 'Completed trips', cls: 'blue' },
                    { label: 'Total Fuel Used', value: `${totalFuelUsed.toFixed(1)}L`, sub: 'Completed trips', cls: 'amber' },
                    { label: 'Avg Trip Distance', value: completedTrips.length ? `${(totalKm / completedTrips.length).toFixed(0)} km` : '—', sub: 'Per trip', cls: 'purple' },
                ].map(s => (
                    <div key={s.label} className="stat-card">
                        <div className={`stat-icon ${s.cls}`}><BarChart3 size={20} /></div>
                        <div className="stat-info">
                            <div className="stat-value" style={{ fontSize: 18 }}>{s.value}</div>
                            <div className="stat-label">{s.label}</div>
                            <div className="stat-trend neutral" style={{ fontSize: 11 }}>{s.sub}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Charts row */}
            <div className="chart-grid" style={{ marginBottom: 24 }}>
                {/* Fleet utilization area chart */}
                <div className="chart-card">
                    <div className="chart-card-title">Fleet Utilization Trend</div>
                    <div className="chart-card-subtitle">% of fleet actively deployed per month</div>
                    <ResponsiveContainer width="100%" height={220}>
                        <AreaChart data={utilizationData}>
                            <defs>
                                <linearGradient id="utilGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(59,130,246,0.08)" />
                            <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                            <YAxis domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `${v}%`} />
                            <Tooltip content={<CustomTooltip />} />
                            <Area type="monotone" dataKey="utilization" stroke="#3b82f6" strokeWidth={2} fill="url(#utilGrad)" name="utilization" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                {/* Expense breakdown pie */}
                <div className="chart-card">
                    <div className="chart-card-title">Expense Breakdown (This Month)</div>
                    <div className="chart-card-subtitle">Cost distribution by category</div>
                    <ResponsiveContainer width="100%" height={220}>
                        <PieChart>
                            <Pie data={expenseCategoryData} cx="50%" cy="50%" innerRadius={52} outerRadius={84} paddingAngle={4} dataKey="value">
                                {expenseCategoryData.map((e, i) => <Cell key={i} fill={COLORS[i]} />)}
                            </Pie>
                            <Legend formatter={(v) => <span style={{ color: 'var(--text-secondary)', fontSize: 12 }}>{v}</span>} />
                            <Tooltip content={<CustomTooltip />} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Top vehicles + driver performance */}
            <div className="chart-grid">
                {/* Top vehicles */}
                <div className="table-container">
                    <div className="table-header">
                        <span className="table-title">Top Vehicles by Trips</span>
                    </div>
                    <table>
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Vehicle</th>
                                <th>Type</th>
                                <th>Trips</th>
                                <th>Total Cargo</th>
                            </tr>
                        </thead>
                        <tbody>
                            {topVehicles.map((v, i) => (
                                <tr key={v.id}>
                                    <td>
                                        <span style={{ width: 24, height: 24, borderRadius: 6, background: i === 0 ? 'rgba(251,191,36,0.2)' : 'rgba(59,130,246,0.1)', color: i === 0 ? '#fbbf24' : 'var(--accent-blue-light)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 12 }}>
                                            {i + 1}
                                        </span>
                                    </td>
                                    <td>
                                        <div style={{ fontWeight: 600 }}>{v.regNo}</div>
                                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{v.make} {v.model}</div>
                                    </td>
                                    <td style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{v.type}</td>
                                    <td style={{ fontWeight: 700 }}>{v.tripCount}</td>
                                    <td style={{ fontSize: 12 }}>{v.totalCargo.toLocaleString()} kg</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Driver performance */}
                <div className="table-container">
                    <div className="table-header">
                        <span className="table-title">Driver Performance</span>
                    </div>
                    <table>
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Driver</th>
                                <th>Trips</th>
                                <th>Rating</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {driverPerformance.map((d, i) => (
                                <tr key={d.id}>
                                    <td>
                                        <span style={{ width: 24, height: 24, borderRadius: 6, background: i === 0 ? 'rgba(251,191,36,0.2)' : 'rgba(59,130,246,0.1)', color: i === 0 ? '#fbbf24' : 'var(--accent-blue-light)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 12 }}>
                                            {i + 1}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="flex items-center gap-2">
                                            <div style={{ width: 28, height: 28, borderRadius: 7, background: 'rgba(59,130,246,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-blue-light)', fontWeight: 700, fontSize: 12 }}>
                                                {d.name.charAt(0)}
                                            </div>
                                            <span style={{ fontWeight: 600, fontSize: 12 }}>{d.name}</span>
                                        </div>
                                    </td>
                                    <td style={{ fontWeight: 700 }}>{d.tripsCompleted}</td>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                            <span style={{ color: '#fbbf24' }}>★</span>
                                            <span style={{ fontWeight: 600, fontSize: 13 }}>{d.rating.toFixed(1)}</span>
                                        </div>
                                    </td>
                                    <td><span className={`badge ${d.status}`}>{d.status === 'on_trip' ? 'On Trip' : d.status === 'available' ? 'Available' : 'Off Duty'}</span></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
