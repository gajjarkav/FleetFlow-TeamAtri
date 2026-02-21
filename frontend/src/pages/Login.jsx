import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Truck, Mail, Lock, Eye, EyeOff, ArrowRight, Shield } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import '../auth.css'

export default function Login() {
    const { login } = useAuth()
    const navigate = useNavigate()

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPw, setShowPw] = useState(false)
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!email || !password) { setError('Please fill in all fields.'); return }
        setLoading(true)
        setError('')
        const result = await login(email, password)
        setLoading(false)
        if (!result.success) { setError(result.error); return }
        if (result.role === 'admin') navigate('/dashboard')
        else navigate('/driver')
    }

    return (
        <div className="auth-root">
            {/* Logo */}
            <div className="auth-logo-section">
                <div className="auth-logo-icon">
                    <Truck size={30} color="white" />
                </div>
                <div className="auth-logo-wordmark">
                    <span className="fleet">FLEET</span><span className="flow">FLOW</span>
                </div>
                <div className="auth-logo-tagline">Enterprise Logistics</div>
            </div>

            {/* Card */}
            <div className="auth-card">
                <form onSubmit={handleSubmit}>
                    <div className="auth-card-body">
                        <h1 className="auth-card-title">Secure Access</h1>
                        <p className="auth-card-subtitle">Enter your credentials to continue</p>

                        {error && (
                            <div style={{ fontSize: 12.5, color: '#f87171', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, padding: '10px 13px', marginBottom: 18, display: 'flex', alignItems: 'center', gap: 8 }}>
                                ⚠ {error}
                            </div>
                        )}

                        {/* Email */}
                        <label className="auth-field-label">Corporate Email</label>
                        <div className="auth-field-wrap">
                            <span className="auth-field-icon"><Mail size={15} /></span>
                            <input
                                id="login-email"
                                className={`auth-input${error ? ' input-error' : ''}`}
                                type="email"
                                placeholder="employee@fleetflow.com"
                                value={email}
                                onChange={e => { setEmail(e.target.value); setError('') }}
                                autoComplete="email"
                            />
                        </div>

                        {/* Password */}
                        <label className="auth-field-label">Password</label>
                        <div className="auth-field-wrap">
                            <span className="auth-field-icon"><Lock size={15} /></span>
                            <input
                                id="login-password"
                                className={`auth-input has-eye${error ? ' input-error' : ''}`}
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
                        <div style={{ textAlign: 'right', marginTop: -10, marginBottom: 20 }}>
                            <a href="#" style={{ fontSize: 12, color: '#3b82f6', textDecoration: 'none', fontWeight: 600 }}
                                onClick={e => e.preventDefault()}>
                                Forgot password?
                            </a>
                        </div>

                        {/* Submit */}
                        <button id="login-submit-btn" type="submit" className="auth-btn-primary" disabled={loading}>
                            {loading
                                ? <><span style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} /> Authenticating…</>
                                : <><ArrowRight size={17} /> Sign In</>
                            }
                        </button>

                        {/* Admin portal link */}
                        <div className="auth-portal-label">Admin Access</div>
                        <Link to="/admin-login" style={{ textDecoration: 'none' }}>
                            <button id="admin-portal-btn" type="button" className="auth-btn-dark">
                                <Shield size={16} style={{ color: '#94a3b8' }} />
                                Admin / Manager Portal Access
                            </button>
                        </Link>
                    </div>

                    {/* Card Footer */}
                    <div className="auth-card-footer">
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            <span className="auth-status-dot" />
                            <span className="auth-status-text">System Operational</span>
                        </div>
                        <span className="auth-enc-badge">ENC_v2.4.0</span>
                    </div>
                </form>
            </div>

            {/* Page Footer */}
            <div className="auth-page-footer">
                <a href="#">Security Policy</a>
                <span className="dot">•</span>
                <a href="#">Terms of Use</a>
                <span className="dot">•</span>
                <a href="#">Help Center</a>
            </div>
        </div>
    )
}
