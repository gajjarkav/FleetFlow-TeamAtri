import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { ArrowRight, Shield, Eye, EyeOff } from 'lucide-react'
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
        <div className="auth-root">
            <div className="auth-logo-section">
                <div className="auth-logo-icon">
                    <Shield size={30} color="white" />
                </div>
                <div className="auth-logo-wordmark">
                    <span className="fleet">FLEET</span><span className="flow">FLOW</span>
                </div>
                <div className="auth-logo-tagline">Manager Portal</div>
            </div>

            <div className="auth-card">
                <form onSubmit={handleSubmit}>
                    <div className="auth-card-body">
                        <h1 className="auth-card-title">Admin Login</h1>
                        <p className="auth-card-subtitle">Sign in to access the manager dashboard</p>

                        {error && (
                            <div style={{ fontSize: 12.5, color: '#f87171', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, padding: '10px 13px', marginBottom: 18, display: 'flex', alignItems: 'center', gap: 8 }}>
                                ⚠ {error}
                            </div>
                        )}

                        <label className="auth-field-label">Email</label>
                        <div className="auth-field-wrap">
                            <span className="auth-field-icon"><Shield size={15} /></span>
                            <input
                                id="admin-email"
                                className={`auth-input${error ? ' input-error' : ''}`}
                                type="email"
                                placeholder="admin@fleetflow.com"
                                value={email}
                                onChange={e => { setEmail(e.target.value); setError('') }}
                                autoComplete="email"
                            />
                        </div>

                        <label className="auth-field-label">Password</label>
                        <div className="auth-field-wrap">
                            <span className="auth-field-icon"><Shield size={15} /></span>
                            <input
                                id="admin-password"
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

                        <button id="admin-login-btn" type="submit" className="auth-btn-primary" disabled={loading}>
                            {loading
                                ? <><span style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} /> Verifying…</>
                                : <>Access Dashboard <ArrowRight size={17} /></>
                            }
                        </button>

                        <div style={{ textAlign: 'center', marginTop: 18 }}>
                            <span style={{ fontSize: 13, color: '#64748B' }}>Not a manager? </span>
                            <Link to="/login" style={{ fontSize: 13, color: '#2563EB', textDecoration: 'none', fontWeight: 600 }}>Staff Login</Link>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    )
}
