import { NavLink, useLocation } from 'react-router-dom'
import {
    LayoutDashboard, Truck, Users, Route, Wrench,
    Receipt, BarChart3, ChevronLeft, ChevronRight, Zap
} from 'lucide-react'

const navItems = [
    {
        label: 'Overview', items: [
            { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
        ]
    },
    {
        label: 'Operations', items: [
            { to: '/vehicles', icon: Truck, label: 'Vehicles' },
            { to: '/drivers', icon: Users, label: 'Drivers' },
            { to: '/trips', icon: Route, label: 'Trips' },
        ]
    },
    {
        label: 'Management', items: [
            { to: '/maintenance', icon: Wrench, label: 'Maintenance' },
            { to: '/expenses', icon: Receipt, label: 'Expenses' },
            { to: '/reports', icon: BarChart3, label: 'Reports' },
        ]
    },
]

export default function Sidebar({ collapsed, onToggle }) {
    return (
        <aside className={`sidebar${collapsed ? ' collapsed' : ''}`}>
            {/* Logo */}
            <div className="sidebar-logo">
                <div className="sidebar-logo-icon">
                    <Zap size={18} color="white" />
                </div>
                {!collapsed && <span className="sidebar-logo-text">FleetFlow</span>}
            </div>

            {/* Toggle button */}
            <button className="sidebar-toggle" onClick={onToggle} title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}>
                {collapsed ? <ChevronRight size={13} /> : <ChevronLeft size={13} />}
            </button>

            {/* Navigation */}
            <nav className="sidebar-nav">
                {navItems.map(section => (
                    <div key={section.label}>
                        {!collapsed && <div className="sidebar-section-label">{section.label}</div>}
                        {section.items.map(item => (
                            <NavLink
                                key={item.to}
                                to={item.to}
                                className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
                                title={collapsed ? item.label : undefined}
                            >
                                <span className="sidebar-link-icon">
                                    <item.icon size={18} />
                                </span>
                                {!collapsed && <span className="sidebar-link-text">{item.label}</span>}
                            </NavLink>
                        ))}
                    </div>
                ))}
            </nav>

            {/* Footer */}
            {!collapsed && (
                <div className="sidebar-footer">
                    <div style={{ fontSize: '10px', color: 'var(--text-muted)', textAlign: 'center' }}>
                        FleetFlow v1.0 · Team Atri
                    </div>
                </div>
            )}
        </aside>
    )
}
