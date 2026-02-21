import { useLocation, useNavigate } from 'react-router-dom'
import { Bell, Settings, Search, LogOut } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const pageMeta = {
    '/dashboard': { title: 'Dashboard', subtitle: 'Fleet Operations Overview' },
    '/vehicles': { title: 'Vehicles', subtitle: 'Fleet Vehicle Management' },
    '/drivers': { title: 'Drivers', subtitle: 'Driver Registry & Compliance' },
    '/trips': { title: 'Trips', subtitle: 'Dispatch & Trip Management' },
    '/maintenance': { title: 'Maintenance', subtitle: 'Service & Repair Tracking' },
    '/expenses': { title: 'Expenses', subtitle: 'Cost & Financial Tracking' },
    '/reports': { title: 'Reports', subtitle: 'Analytics & Fleet Intelligence' },
}

export default function Header() {
    const { pathname } = useLocation()
    const { user, logout } = useAuth()
    const navigate = useNavigate()
    const meta = pageMeta[pathname] || { title: 'FleetFlow', subtitle: '' }

    const handleLogout = () => {
        logout()
        navigate('/login')
    }

    const initials = user?.email
        ? user.email.substring(0, 2).toUpperCase()
        : 'FM'
    const roleBadge = user?.role === 'admin' ? 'ADM' : 'FM'

    return (
        <header className="header">
            <div className="header-left">
                <div>
                    <div className="header-title">{meta.title}</div>
                    {meta.subtitle && <div className="header-subtitle">{meta.subtitle}</div>}
                </div>
            </div>

            <div className="header-right">
                <button className="header-btn" title="Search">
                    <Search size={17} />
                </button>
                <button className="header-btn" title="Notifications">
                    <Bell size={17} />
                    <span className="header-badge">3</span>
                </button>
                <button className="header-btn" title="Settings">
                    <Settings size={17} />
                </button>
                <div className="header-avatar" title={user?.email || 'Fleet Manager'}>{roleBadge}</div>
                <button
                    className="header-btn"
                    title="Sign Out"
                    onClick={handleLogout}
                    style={{ color: 'var(--danger)', borderColor: 'rgba(239,68,68,0.2)' }}
                >
                    <LogOut size={17} />
                </button>
            </div>
        </header>
    )
}
