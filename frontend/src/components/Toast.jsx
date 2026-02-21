import React, { useEffect } from 'react'
import { CheckCircle, AlertCircle, AlertTriangle, Info, X } from 'lucide-react'

const icons = {
    success: CheckCircle,
    error: AlertCircle,
    warning: AlertTriangle,
    info: Info,
}

export default function Toast({ toasts, onRemove }) {
    return (
        <div className="toast-container">
            {toasts.map(t => {
                const Icon = icons[t.type] || Info
                return (
                    <div key={t.id} className={`toast ${t.type}`}>
                        <Icon size={18} className={`toast-icon ${t.type}`} />
                        <div className="toast-content">
                            <div className="toast-title">{t.title}</div>
                            {t.msg && <div className="toast-msg">{t.msg}</div>}
                        </div>
                        <button onClick={() => onRemove(t.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '0 0 0 8px' }}>
                            <X size={14} />
                        </button>
                    </div>
                )
            })}
        </div>
    )
}

export function useToast() {
    const [toasts, setToasts] = React.useState([])

    const addToast = (toast) => {
        const id = Date.now()
        setToasts(prev => [...prev, { ...toast, id }])
        setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4500)
    }

    const removeToast = (id) => setToasts(prev => prev.filter(t => t.id !== id))

    return { toasts, addToast, removeToast }
}
