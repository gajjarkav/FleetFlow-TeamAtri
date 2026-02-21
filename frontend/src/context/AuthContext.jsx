import React, { createContext, useContext, useState } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null) // { role: 'staff' | 'admin', email }

    const loginStaff = (email, password) => {
        // Mock auth — accept any non-empty credentials
        if (email && password) {
            setUser({ role: 'staff', email })
            return true
        }
        return false
    }

    const loginAdmin = (email, password) => {
        if (email && password) {
            setUser({ role: 'admin', email })
            return true
        }
        return false
    }

    const logout = () => setUser(null)

    return (
        <AuthContext.Provider value={{ user, loginStaff, loginAdmin, logout }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    return useContext(AuthContext)
}
