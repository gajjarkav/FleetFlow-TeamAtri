import React, { createContext, useContext, useState, useEffect } from 'react'
import { loginApi } from '../api/auth'
import { setToken, clearToken, getToken, TOKEN_KEY } from '../api/client'

const AuthContext = createContext(null)
const USER_KEY = 'ff_user'

/** Map backend role → frontend role */
const mapRole = (backendRole) =>
    backendRole === 'manager' ? 'admin' : 'staff'

/** Restore persisted user on page reload */
const loadPersistedUser = () => {
    try {
        const raw = localStorage.getItem(USER_KEY)
        return raw ? JSON.parse(raw) : null
    } catch {
        return null
    }
}

export function AuthProvider({ children }) {
    const [user, setUser] = useState(loadPersistedUser)

    /** Persist / clear user alongside token */
    const persistUser = (u) => {
        if (u) {
            localStorage.setItem(USER_KEY, JSON.stringify(u))
        } else {
            localStorage.removeItem(USER_KEY)
        }
        setUser(u)
    }

    /**
     * Dispatcher (Staff) login → POST /auth/login
     * Backend returns { token, role: 'dispatcher' }
     */
    const login = async (email, password) => {
        if (!email || !password) return { success: false, error: 'Please fill in all fields.' }
        try {
            const data = await loginApi(email, password)
            if (data.role !== 'dispatcher') {
                return { success: false, error: 'Use the Admin panel for manager accounts.' }
            }
            setToken(data.token)
            const u = {
                email,
                role: 'staff',
                backendRole: data.role,
                name: email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
                avatar: email.slice(0, 2).toUpperCase(),
            }
            persistUser(u)
            return { success: true, role: 'staff' }
        } catch (err) {
            return { success: false, error: err.message || 'Login failed.' }
        }
    }

    /**
     * Manager (Admin) login → POST /auth/login
     * Backend returns { token, role: 'manager' }
     */
    const loginAsAdmin = async (email, password) => {
        if (!email || !password) return { success: false, error: 'All fields required.' }
        try {
            const data = await loginApi(email, password)
            if (data.role !== 'manager') {
                return { success: false, error: 'This account does not have manager access.' }
            }
            setToken(data.token)
            const u = {
                email,
                role: 'admin',
                backendRole: data.role,
                name: email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
                avatar: email.slice(0, 2).toUpperCase(),
            }
            persistUser(u)
            return { success: true, role: 'admin' }
        } catch (err) {
            return { success: false, error: err.message || 'Login failed.' }
        }
    }

    const logout = () => {
        clearToken()
        persistUser(null)
    }

    const isAdmin = user?.role === 'admin'
    const isStaff = user?.role === 'staff'

    return (
        <AuthContext.Provider value={{ user, login, loginAsAdmin, logout, isAdmin, isStaff }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    return useContext(AuthContext)
}
