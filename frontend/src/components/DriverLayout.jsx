import React, { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { Truck, LayoutDashboard, Bell, MapPin, Wrench, User, LogOut, Menu, X } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import '../driver.css'

const navItems = [
    { to: '/driver', label: 'Dashboard', icon: LayoutDashboard, end: true },
    { to: '/driver/invitations', label: 'Invitations', icon: Bell, badge: 2 },
    { to: '/driver/active-trip', label: 'Active Trip', icon: MapPin },
    { to: '/driver/maintenance', label: 'Maintenance', icon: Wrench },
    { to: '/driver/profile', label: 'Profile', icon: User },
]

export default function DriverLayout() {
    const { user, logout } = useAuth()
    const navigate = useNavigate()
    const [mobileNavOpen, setMobileNavOpen] = useState(false)

    const handleLogout = () => {
        logout()
        navigate('/login')
    }

    return (
        <div className="driver-root">
            {/* Top Navigation */}
            <nav className="driver-topnav">
                {/* Brand */}
                <NavLink to="/driver" className="driver-nav-brand">
                    <div className="driver-nav-brand-icon">
                        <Truck size={18} color="white" />
                    </div>
                    <span className="driver-nav-brand-text">FLEET<span>FLOW</span></span>
                </NavLink>

                {/* Mobile hamburger */}
                <button className="driver-mobile-menu-btn" onClick={() => setMobileNavOpen(p => !p)}>
                    {mobileNavOpen ? <X size={20} /> : <Menu size={20} />}
                </button>

                {/* Nav Links */}
                <div className={`driver-nav-links${mobileNavOpen ? ' open' : ''}`}>
                    {navItems.map(item => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            end={item.end}
                            className={({ isActive }) => `driver-nav-link${isActive ? ' active' : ''}`}
                            onClick={() => setMobileNavOpen(false)}
                        >
                            <item.icon size={15} />
                            <span className="driver-nav-link-text">{item.label}</span>
                            {item.badge > 0 && <span className="nav-badge">{item.badge}</span>}
                        </NavLink>
                    ))}
                </div>

                {/* Right side */}
                <div className="driver-nav-right">
                    <div className="driver-status-pill">
                        <span className="driver-status-dot" />
                        On Duty
                    </div>
                    <div className="driver-avatar" title={user?.name}>
                        {user?.avatar || 'DR'}
                    </div>
                    <button className="driver-logout-btn" onClick={handleLogout}>
                        <LogOut size={14} />
                        <span className="driver-logout-text">Sign Out</span>
                    </button>
                </div>
            </nav>

            {/* Page Content */}
            <div className="driver-page">
                <Outlet />
            </div>
        </div>
    )
}
