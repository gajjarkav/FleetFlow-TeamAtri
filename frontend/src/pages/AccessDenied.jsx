import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ShieldOff, Home, LogOut } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import '../driver.css'


export default function AccessDenied() {
    const { user, logout } = useAuth()
    const navigate = useNavigate()

    const handleGoBack = () => {
        if (user?.role === 'admin') navigate('/dashboard')
        else if (user?.role === 'staff') navigate('/driver')
        else navigate('/login')
    }

    const handleLogout = () => {
        logout()
        navigate('/login')
    }

    return (
        <div className="access-denied-root">
            <div style={{ marginBottom: 20, opacity: 0.25 }}>
                <ShieldOff size={64} color="#3b82f6" />
            </div>
            <div className="access-denied-code">403</div>
            <h1 className="access-denied-title">Access Restricted</h1>
            <p className="access-denied-msg">
                You don't have permission to view this page.
                This area is restricted based on your role and access level.
            </p>

            {user && (
                <div className="access-denied-role-pill">
                    <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#3b82f6', display: 'inline-block' }} />
                    Logged in as: <strong>{user.name}</strong>&nbsp;·&nbsp;
                    {user.role === 'admin' ? 'Fleet Admin' : 'Staff / Driver'}
                </div>
            )}

            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
                <button className="driver-action-btn primary" onClick={handleGoBack}>
                    <Home size={16} /> Go to My Dashboard
                </button>
                <button className="driver-action-btn danger" onClick={handleLogout}>
                    <LogOut size={16} /> Sign Out
                </button>
            </div>
        </div>
    )
}
