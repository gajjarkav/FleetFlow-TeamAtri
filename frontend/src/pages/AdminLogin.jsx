import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { ArrowRight, AtSign, Shield, Eye, EyeOff, Grid2X2 } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import '../auth.css'

export default function AdminLogin() {
    const { loginAsAdmin } = useAuth()
    const navigate = useNavigate()

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPw, setShowPw] = useState(false)
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError('')
        const result = await loginAsAdmin(email, password)
        setLoading(false)
        if (!result.success) { setError(result.error); return }
        navigate('/dashboard')
    }

    return (
        <div className="admin-auth-root">
            

            <div className="admin-auth-content">
                <div className="admin-portal-badge">
                    <Shield size={13} /> Admin Portal
                </div>
                <h1 className="admin-page-title">Manager Dashboard</h1>
                <p className="admin-page-subtitle">Enterprise Fleet Management &amp; Logistics Authorization</p>

                <div className="admin-card">
                    <form onSubmit={handleSubmit}>
                        {error && (
                            <div style={{ fontSize: 12.5, color: '#f87171', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, padding: '10px 13px', marginBottom: 18 }}>
                                ⚠ {error}
                            </div>
                        )}

                        <div className="admin-field-row">
                            <AtSign size={14} style={{ color: '#64748b' }} /> Administrative Email
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

                        <div className="admin-field-row">
                            <Shield size={14} style={{ color: '#64748b' }} /> Secure Password
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

                        {/* Forgot password */}
                        <div style={{ textAlign: 'right', marginTop: -12, marginBottom: 20 }}>
                            <a href="#" style={{ fontSize: 12, color: '#3b82f6', textDecoration: 'none', fontWeight: 600 }}
                                onClick={e => e.preventDefault()}>
                                Forgot password?
                            </a>
                        </div>

                        <button id="admin-login-btn" type="submit" className="admin-btn" disabled={loading}>
                            {loading
                                ? <><span style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} /> Verifying…</>
                                : <>Access Manager Dashboard <ArrowRight size={17} /></>
                            }
                        </button>
                    </form>
                </div>

                <p className="admin-back-link">
                    Not a manager? <Link to="/login">Go to Standard Staff Login</Link>
                </p>
            </div>

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
