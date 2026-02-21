import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Truck, AtSign, Shield, Eye, EyeOff, LogIn } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import '../auth.css'

export default function Login() {
    const { loginStaff } = useAuth()
    const navigate = useNavigate()

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPw, setShowPw] = useState(false)
    const [error, setError] = useState('')

    const handleSubmit = (e) => {
        e.preventDefault()
        setError('')
        const ok = loginStaff(email, password)
        if (ok) {
            navigate('/dashboard')
        } else {
            setError('Invalid credentials. Please try again.')
        }
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

                        {error && <div className="auth-error-msg" style={{ marginBottom: 14 }}>{error}</div>}

                        {/* Email */}
                        <label className="auth-field-label">Corporate Email</label>
                        <div className="auth-field-wrap">
                            <span className="auth-field-icon">
                                <AtSign size={15} />
                            </span>
                            <input
                                id="staff-email"
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
                            <span className="auth-field-icon">
                                <Shield size={15} />
                            </span>
                            <input
                                id="staff-password"
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

                        {/* Primary CTA */}
                        <button id="staff-login-btn" type="submit" className="auth-btn-primary">
                            Staff Log In <LogIn size={17} />
                        </button>

                        {/* Portal Access */}
                        <div className="auth-portal-label">Portal Access</div>
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
