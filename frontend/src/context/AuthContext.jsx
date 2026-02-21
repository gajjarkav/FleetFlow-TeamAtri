import React, { createContext, useContext, useState } from 'react'

const AuthContext = createContext(null)

const makeUser = (email, role) => ({
    id: `U_${Date.now()}`,
    email,
    role,
    name: email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
    avatar: email.slice(0, 2).toUpperCase(),
    driverId: 'D001',
})

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null)

    /** Staff login — any credentials accepted, role = 'staff' */
    const login = (email, password) => {
        if (!email || !password) return { success: false, error: 'Please fill in all fields.' }
        setUser(makeUser(email, 'staff'))
        return { success: true, role: 'staff' }
    }

    /** Admin login — any credentials accepted, role = 'admin' */
    const loginAsAdmin = (email, password) => {
        if (!email || !password) return { success: false, error: 'All fields required.' }
        setUser(makeUser(email, 'admin'))
        return { success: true, role: 'admin' }
    }

    const logout = () => setUser(null)

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
