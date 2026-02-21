import React, { createContext, useContext, useState } from 'react'
import { maintenance as initialMaintenance } from '../data/mockData'

const MaintenanceContext = createContext(null)

export function MaintenanceProvider({ children }) {
    const [records, setRecords] = useState(initialMaintenance)

    const addRecord = (record) => {
        const newRecord = {
            id: `M${String(Date.now()).slice(-4)}`,
            status: 'scheduled',
            completedDate: null,
            technician: 'N/A',
            ...record,
        }
        setRecords(prev => [newRecord, ...prev])
        return newRecord
    }

    const updateRecord = (id, changes) => {
        setRecords(prev => prev.map(r => r.id === id ? { ...r, ...changes } : r))
    }

    const updateStatus = (id, status) => {
        setRecords(prev =>
            prev.map(r => r.id === id
                ? { ...r, status, completedDate: status === 'completed' ? new Date().toISOString().slice(0, 10) : r.completedDate }
                : r
            )
        )
    }

    return (
        <MaintenanceContext.Provider value={{ records, addRecord, updateRecord, updateStatus }}>
            {children}
        </MaintenanceContext.Provider>
    )
}

export function useMaintenance() {
    const ctx = useContext(MaintenanceContext)
    if (!ctx) throw new Error('useMaintenance must be used within MaintenanceProvider')
    return ctx
}
