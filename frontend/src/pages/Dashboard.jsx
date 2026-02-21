import React, { useState, useEffect } from 'react'
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend
} from 'recharts'
import {
    Truck, Users, Route, AlertTriangle, TrendingUp,
    CheckCircle, Wrench, DollarSign, Activity
} from 'lucide-react'
import { getDashboardKpisApi } from '../api/dashboard'
import { weeklyTrips } from '../data/mockData'

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#6b7280']

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload?.length) {
        return (
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-hover)', borderRadius: '8px', padding: '10px 14px', fontSize: '12px' }}>
                <div style={{ color: 'var(--text-secondary)', marginBottom: 4 }}>{label}</div>
                {payload.map(p => (
                    <div key={p.name} style={{ color: p.fill || p.color, fontWeight: 700 }}>{p.value} {p.name}</div>
                ))}
            </div>
        )
    }
    return null
}

const fmt = (n) => (n === undefined || n === null ? '—' : Number(n).toLocaleString('en-IN'))

export default function Dashboard() {
    const [kpis, setKpis] = useState(null)
    const [loading, setLoading] = useState(true)
    const [fetchError, setFetchError] = useState('')

    useEffect(() => {
        getDashboardKpisApi()
            .then(setKpis)
            .catch(e => setFetchError(e.message))
            .finally(() => setLoading(false))
    }, [])

    if (loading) return <div style={{ color: 'var(--text-secondary)', padding: 32 }}>Loading dashboard…</div>
    if (fetchError) return <div className="alert-banner danger"><AlertTriangle size={17} /><div><strong>Failed to load KPIs:</strong> {fetchError}</div></div>

    const fleet = kpis?.fleet || {}
    const driversKpi = kpis?.drivers || {}
    const tripsKpi = kpis?.trips || {}
    const financial = kpis?.financial || {}
    const maintenance = kpis?.maintenance_insights || {}

    const fleetStatus = [
        { name: 'Available', value: fleet.available || 0 },
        { name: 'Active', value: fleet.active || 0 },
        { name: 'Maintenance', value: fleet.in_maintenance || 0 },
    ]

    const activityFeed = [
        { dot: 'green', text: <><strong>{tripsKpi.in_progress || 0}</strong> trip(s) currently in progress</>, time: 'live' },
        { dot: 'blue', text: <><strong>{maintenance.pending || 0}</strong> maintenance request(s) pending</>, time: 'live' },
        { dot: 'amber', text: <><strong>{driversKpi.unavailable || 0}</strong> driver(s) off duty</>, time: 'live' },
        { dot: 'green', text: <><strong>{tripsKpi.completed || 0}</strong> total trip(s) completed</>, time: 'all time' },
        { dot: 'cyan', text: <>Fleet utilization at <strong>{fleet.utilization_percent ?? 0}%</strong></>, time: 'today' },
    ]

    return (
        <div>
            {/* Maintenance alert */}
            {maintenance.pending > 0 && (
                <div className="alert-banner warning">
                    <Wrench size={17} style={{ flexShrink: 0, marginTop: 1 }} />
                    <div>
                        <strong>{maintenance.pending} maintenance request(s) pending approval</strong>
                        {maintenance.most_common_type && <> · Most common issue: <em>{maintenance.most_common_type}</em></>}
                    </div>
                </div>
            )}

            {/* KPI Cards */}
            <div className="stat-grid">
                <div className="stat-card">
                    <div className="stat-icon blue"><Truck size={24} /></div>
                    <div className="stat-info">
                        <div className="stat-value">{fmt(fleet.total)}</div>
                        <div className="stat-label">Total Vehicles</div>
                        <div className="stat-trend up">
                            <TrendingUp size={11} /> {fleet.available ?? 0} available
                        </div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon green"><Route size={24} /></div>
                    <div className="stat-info">
                        <div className="stat-value">{fmt(tripsKpi.in_progress)}</div>
                        <div className="stat-label">Active Trips</div>
                        <div className="stat-trend neutral">
                            <Activity size={11} /> {tripsKpi.total ?? 0} total
                        </div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon purple"><Users size={24} /></div>
                    <div className="stat-info">
                        <div className="stat-value">{fmt(driversKpi.total)}</div>
                        <div className="stat-label">Registered Drivers</div>
                        <div className="stat-trend up">
                            <CheckCircle size={11} /> {driversKpi.available ?? 0} available
                        </div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon amber"><Wrench size={24} /></div>
                    <div className="stat-info">
                        <div className="stat-value">{fmt(fleet.in_maintenance)}</div>
                        <div className="stat-label">In Maintenance</div>
                        <div className="stat-trend down">
                            <AlertTriangle size={11} /> {maintenance.pending ?? 0} pending requests
                        </div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon cyan"><DollarSign size={24} /></div>
                    <div className="stat-info">
                        <div className="stat-value">₹{fmt(financial.maintenance_cost)}</div>
                        <div className="stat-label">Maintenance Cost</div>
                        <div className="stat-trend down">
                            <TrendingUp size={11} style={{ transform: 'scaleY(-1)' }} /> Net profit ₹{fmt(financial.profit)}
                        </div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon green"><CheckCircle size={24} /></div>
                    <div className="stat-info">
                        <div className="stat-value">{fmt(tripsKpi.completed)}</div>
                        <div className="stat-label">Completed Trips</div>
                        <div className="stat-trend up">
                            <TrendingUp size={11} /> {fleet.utilization_percent ?? 0}% fleet utilization
                        </div>
                    </div>
                </div>
            </div>

            {/* Charts */}
            <div className="chart-grid">
                <div className="chart-card">
                    <div className="chart-card-title">Weekly Trip Volume</div>
                    <div className="chart-card-subtitle">Number of trips dispatched per day this week</div>
                    <ResponsiveContainer width="100%" height={220}>
                        <BarChart data={weeklyTrips} barSize={28}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(59,130,246,0.08)" />
                            <XAxis dataKey="day" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                            <Tooltip content={<CustomTooltip />} />
                            <Bar dataKey="trips" fill="#3b82f6" radius={[5, 5, 0, 0]} name="trips" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                <div className="chart-card">
                    <div className="chart-card-title">Fleet Status Distribution</div>
                    <div className="chart-card-subtitle">Current vehicle availability breakdown</div>
                    <ResponsiveContainer width="100%" height={220}>
                        <PieChart>
                            <Pie data={fleetStatus} cx="50%" cy="50%" innerRadius={56} outerRadius={86} paddingAngle={4} dataKey="value">
                                {fleetStatus.map((entry, i) => <Cell key={i} fill={COLORS[i]} />)}
                            </Pie>
                            <Legend formatter={(v) => <span style={{ color: 'var(--text-secondary)', fontSize: 12 }}>{v}</span>} />
                            <Tooltip content={<CustomTooltip />} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Revenue summary */}
            <div className="card" style={{ marginBottom: 24 }}>
                <div className="card-title"><DollarSign size={14} /> Revenue Summary</div>
                <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap', padding: '8px 0' }}>
                    <div><div style={{ color: 'var(--text-secondary)', fontSize: 12 }}>Total Revenue</div><div style={{ fontSize: 22, fontWeight: 700, color: '#34d399' }}>₹{fmt(tripsKpi.revenue)}</div></div>
                    <div><div style={{ color: 'var(--text-secondary)', fontSize: 12 }}>Avg per Trip</div><div style={{ fontSize: 22, fontWeight: 700, color: '#60a5fa' }}>₹{fmt(tripsKpi.avg_revenue_per_trip)}</div></div>
                    <div><div style={{ color: 'var(--text-secondary)', fontSize: 12 }}>Avg Distance</div><div style={{ fontSize: 22, fontWeight: 700, color: '#fbbf24' }}>{fmt(tripsKpi.avg_distance_km)} km</div></div>
                    <div><div style={{ color: 'var(--text-secondary)', fontSize: 12 }}>Net Profit</div><div style={{ fontSize: 22, fontWeight: 700, color: (financial.profit ?? 0) >= 0 ? '#34d399' : '#f87171' }}>₹{fmt(financial.profit)}</div></div>
                </div>
            </div>

            {/* Activity feed */}
            <div className="card">
                <div className="card-title"><Activity size={14} /> Live Metrics</div>
                <div className="activity-list">
                    {activityFeed.map((a, i) => (
                        <div key={i} className="activity-item">
                            <div className={`activity-dot ${a.dot}`} />
                            <div className="activity-text">{a.text}</div>
                            <div className="activity-time">{a.time}</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
