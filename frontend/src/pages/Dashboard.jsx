import React, { useState } from 'react'
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend
} from 'recharts'
import {
    Truck, Users, Route, AlertTriangle, TrendingUp,
    CheckCircle, Wrench, DollarSign, Activity
} from 'lucide-react'
import { vehicles, drivers, trips, weeklyTrips, getDaysUntilExpiry } from '../data/mockData'

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#6b7280']

const fleetStatus = [
    { name: 'Available', value: vehicles.filter(v => v.status === 'available').length },
    { name: 'In Use', value: vehicles.filter(v => v.status === 'in_use').length },
    { name: 'Maintenance', value: vehicles.filter(v => v.status === 'maintenance').length },
]

const activeTrips = trips.filter(t => t.status === 'in_progress').length
const expiredLicenses = drivers.filter(d => getDaysUntilExpiry(d.licenseExpiry) <= 0)
const expiringLicenses = drivers.filter(d => { const d2 = getDaysUntilExpiry(d.licenseExpiry); return d2 > 0 && d2 <= 90 })
const maintenanceVehicles = vehicles.filter(v => v.status === 'maintenance')

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

const activityFeed = [
    { dot: 'green', text: <><strong>Trip T001</strong> dispatched – Ahmedabad → Surat</>, time: '10 min ago' },
    { dot: 'blue', text: <><strong>V003</strong> sent for Engine Overhaul maintenance</>, time: '2 hrs ago' },
    { dot: 'amber', text: <>Driver <strong>Suresh Kumar</strong>'s license expires in 62 days</>, time: '4 hrs ago' },
    { dot: 'green', text: <><strong>Trip T003</strong> completed successfully</>, time: 'Yesterday' },
    { dot: 'red', text: <><strong>Trip T008</strong> cancelled – client request</>, time: '2 days ago' },
    { dot: 'blue', text: <>New vehicle <strong>V008</strong> added to fleet</>, time: '3 days ago' },
]

export default function Dashboard() {
    return (
        <div>
            {/* Alerts */}
            {expiredLicenses.length > 0 && (
                <div className="alert-banner danger">
                    <AlertTriangle size={17} style={{ flexShrink: 0, marginTop: 1 }} />
                    <div>
                        <strong>License Expired:</strong> {expiredLicenses.map(d => d.name).join(', ')} — these drivers cannot be assigned to trips.
                    </div>
                </div>
            )}
            {expiringLicenses.length > 0 && (
                <div className="alert-banner warning">
                    <AlertTriangle size={17} style={{ flexShrink: 0, marginTop: 1 }} />
                    <div>
                        <strong>Licenses Expiring Soon:</strong> {expiringLicenses.map(d => `${d.name} (${getDaysUntilExpiry(d.licenseExpiry)} days)`).join(' · ')}
                    </div>
                </div>
            )}
            {maintenanceVehicles.length > 0 && (
                <div className="alert-banner info">
                    <Wrench size={17} style={{ flexShrink: 0, marginTop: 1 }} />
                    <div>
                        <strong>Under Maintenance:</strong> {maintenanceVehicles.map(v => v.regNo).join(', ')} — unavailable for dispatch.
                    </div>
                </div>
            )}

            {/* KPI Cards */}
            <div className="stat-grid">
                <div className="stat-card">
                    <div className="stat-icon blue"><Truck size={24} /></div>
                    <div className="stat-info">
                        <div className="stat-value">{vehicles.length}</div>
                        <div className="stat-label">Total Vehicles</div>
                        <div className="stat-trend up">
                            <TrendingUp size={11} /> {vehicles.filter(v => v.status === 'available').length} available
                        </div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon green"><Route size={24} /></div>
                    <div className="stat-info">
                        <div className="stat-value">{activeTrips}</div>
                        <div className="stat-label">Active Trips</div>
                        <div className="stat-trend neutral">
                            <Activity size={11} /> {trips.filter(t => t.status === 'scheduled').length} scheduled
                        </div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon purple"><Users size={24} /></div>
                    <div className="stat-info">
                        <div className="stat-value">{drivers.length}</div>
                        <div className="stat-label">Registered Drivers</div>
                        <div className="stat-trend up">
                            <CheckCircle size={11} /> {drivers.filter(d => d.status === 'available').length} available
                        </div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon amber"><Wrench size={24} /></div>
                    <div className="stat-info">
                        <div className="stat-value">{maintenanceVehicles.length}</div>
                        <div className="stat-label">In Maintenance</div>
                        <div className="stat-trend down">
                            <AlertTriangle size={11} /> {expiredLicenses.length + expiringLicenses.length} compliance alerts
                        </div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon cyan"><DollarSign size={24} /></div>
                    <div className="stat-info">
                        <div className="stat-value">₹52,359</div>
                        <div className="stat-label">Expenses This Month</div>
                        <div className="stat-trend down">
                            <TrendingUp size={11} style={{ transform: 'scaleY(-1)' }} /> 18% vs last month
                        </div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon green"><CheckCircle size={24} /></div>
                    <div className="stat-info">
                        <div className="stat-value">{trips.filter(t => t.status === 'completed').length}</div>
                        <div className="stat-label">Completed Trips</div>
                        <div className="stat-trend up">
                            <TrendingUp size={11} /> 82% fleet utilization
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

            {/* Activity feed */}
            <div className="card">
                <div className="card-title"><Activity size={14} /> Recent Activity</div>
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
