import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { AtSign, Shield, Eye, EyeOff, ArrowRight, Grid2X2 } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import '../auth.css'

export default function AdminLogin() {
    const { loginAdmin } = useAuth()
    const navigate = useNavigate()

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPw, setShowPw] = useState(false)
    const [error, setError] = useState('')

    const handleSubmit = (e) => {
        e.preventDefault()
        setError('')
        const ok = loginAdmin(email, password)
        if (ok) {
            navigate('/dashboard')
        } else {
            setError('Invalid admin credentials.')
        }
    }

    return (
        <div className="admin-auth-root">
            {/* Navbar */}
            <nav className="admin-navbar">
                <div className="admin-nav-logo">
                    <div className="admin-nav-logo-icon">
                        <Grid2X2 size={18} color="#93c5fd" />
                    </div>
                    <span className="admin-nav-logo-text">FLEETFLOW</span>
                </div>

                <div className="admin-nav-links">
                    <a href="#" className="admin-nav-link">Vehicle Management</a>
                    <a href="#" className="admin-nav-link">Driver Logs</a>
                    <a href="#" className="admin-nav-link">Analytics</a>
                    <button className="admin-nav-support">Support</button>
                </div>
            </nav>

            {/* Main content */}
            <div className="admin-auth-content">
                <div className="admin-portal-badge">
                    <Shield size={13} />
                    Admin Portal
                </div>

                <h1 className="admin-page-title">Manager Dashboard</h1>
                <p className="admin-page-subtitle">Enterprise Fleet Management &amp; Logistics Authorization</p>

                {/* Card */}
                <div className="admin-card">
                    <form onSubmit={handleSubmit}>
                        {error && (
                            <div style={{ fontSize: 12, color: '#f87171', marginBottom: 16, padding: '10px 14px', background: 'rgba(239,68,68,0.08)', borderRadius: 8, border: '1px solid rgba(239,68,68,0.2)' }}>
                                {error}
                            </div>
                        )}

                        {/* Email */}
                        <div className="admin-field-row">
                            <AtSign size={14} style={{ color: '#64748b' }} />
                            Administrative Email
                        </div>
                        <div className="admin-input-wrap">
                            <input
                                id="admin-email"
                                className="admin-input"
                                type="email"
                                placeholder="admin@fleetflow.com"
                                value={email}
                                onChange={e => { setEmail(e.target.value); setError('') }}
                                autoComplete="email"
                                style={{ paddingLeft: 16, paddingRight: 16 }}
                            />
                        </div>

                        {/* Password */}
                        <div className="admin-field-row">
                            <Shield size={14} style={{ color: '#64748b' }} />
                            Secure Password
                        </div>
                        <div className="admin-input-wrap">
                            <input
                                id="admin-password"
                                className="admin-input"
                                type={showPw ? 'text' : 'password'}
                                placeholder="••••••••"
                                value={password}
                                onChange={e => { setPassword(e.target.value); setError('') }}
                                autoComplete="current-password"
                            />
                            <button type="button" className="auth-field-eye" onClick={() => setShowPw(p => !p)} tabIndex={-1}>
                                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>

                        <button id="admin-login-btn" type="submit" className="admin-btn">
                            Access Manager Dashboard <ArrowRight size={17} />
                        </button>
                    </form>
                </div>

                {/* Back to staff link */}
                <p className="admin-back-link">
                    Not a manager?
                    <Link to="/login">Go to Standard Staff Login</Link>
                </p>
            </div>

            {/* Footer */}
            <footer className="admin-page-footer">
                <div className="admin-footer-left">
                    <span>© 2024 FleetFlow Enterprise. All rights reserved.</span>
                    <span>|</span>
                    <a href="#">Privacy Policy</a>
                    <a href="#">Terms of Service</a>
                </div>
                <div className="admin-footer-right">
                    <span className="auth-status-dot" />
                    System Status: Operational
                </div>
            </footer>
        </div>
    )
}
