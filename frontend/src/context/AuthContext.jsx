import React, { createContext, useContext, useState } from 'react'

const AuthContext = createContext(null)

// Mock user database — swap for real API call
const MOCK_USERS = [
    { id: 'U001', email: 'admin@fleetflow.com', password: 'admin123', role: 'admin', name: 'Karan Mehta', avatar: 'KM' },
    { id: 'U002', email: 'manager@fleetflow.com', password: 'fleet123', role: 'admin', name: 'Priya Sharma', avatar: 'PS' },
    { id: 'U003', email: 'driver@fleetflow.com', password: 'driver123', role: 'staff', name: 'Rajesh Patel', avatar: 'RP', driverId: 'D001' },
    { id: 'U004', email: 'staff@fleetflow.com', password: 'staff123', role: 'staff', name: 'Amit Shah', avatar: 'AS', driverId: 'D002' },
]

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null)

    const login = (email, password) => {
        const found = MOCK_USERS.find(
            u => u.email.toLowerCase() === email.toLowerCase() && u.password === password
        )
        if (!found) return { success: false, error: 'Invalid email or password.' }
        const { password: _pw, ...safeUser } = found
        setUser(safeUser)
        return { success: true, role: safeUser.role }
    }

    // Admin-only login (from admin portal page)
    const loginAsAdmin = (email, password) => {
        if (!email || !password) return { success: false, error: 'All fields required.' }
        const found = MOCK_USERS.find(
            u => u.email.toLowerCase() === email.toLowerCase() && u.password === password && u.role === 'admin'
        )
        if (!found) return { success: false, error: 'Invalid admin credentials.' }
        const { password: _pw, ...safeUser } = found
        setUser(safeUser)
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
