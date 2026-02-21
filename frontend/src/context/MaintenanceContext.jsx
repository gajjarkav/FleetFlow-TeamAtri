import React, { createContext, useContext, useState } from 'react'
import { maintenance as initialMaintenance, vehicles as vehicleList } from '../data/mockData'

const MaintenanceContext = createContext(null)

// Seed vehicle statuses from mockData
const initialVehicleStatuses = Object.fromEntries(vehicleList.map(v => [v.id, v.status]))

export function MaintenanceProvider({ children }) {
    const [records, setRecords] = useState(initialMaintenance)
    const [vehicleStatuses, setVehicleStatuses] = useState(initialVehicleStatuses)

    // ── Vehicle status ───────────────────────────────────
    const setVehicleStatus = (vehicleId, status) => {
        setVehicleStatuses(prev => ({ ...prev, [vehicleId]: status }))
    }

    const getVehicleStatus = (vehicleId) => vehicleStatuses[vehicleId] || 'available'

    // ── Records ──────────────────────────────────────────

    /** Driver submits a new maintenance request → vehicle goes 'maintenance' */
    const addRecord = (record) => {
        const newRecord = {
            id: `M${String(Date.now()).slice(-4)}`,
            status: 'scheduled',
            completedDate: null,
            technician: 'N/A',
            reportedByDriver: true,
            reimbursementStatus: 'pending',
            billUrl: null,
            billFileName: null,
            ...record,
        }
        setRecords(prev => [newRecord, ...prev])
        // Lock vehicle for maintenance
        if (record.vehicleId) setVehicleStatus(record.vehicleId, 'maintenance')
        return newRecord
    }

    /** Driver uploads workshop bill for a record */
    const attachBill = (recordId, file) => {
        const url = URL.createObjectURL(file)
        setRecords(prev => prev.map(r =>
            r.id === recordId
                ? { ...r, billUrl: url, billFileName: file.name }
                : r
        ))
    }

    /** Driver marks job done → vehicle goes back to available */
    const markDone = (recordId, vehicleId) => {
        setRecords(prev => prev.map(r =>
            r.id === recordId
                ? { ...r, status: 'completed', completedDate: new Date().toISOString().slice(0, 10) }
                : r
        ))
        if (vehicleId) setVehicleStatus(vehicleId, 'available')
    }

    /** Admin changes status (legacy / manual override) */
    const updateStatus = (id, status) => {
        setRecords(prev =>
            prev.map(r => r.id === id
                ? { ...r, status, completedDate: status === 'completed' ? new Date().toISOString().slice(0, 10) : r.completedDate }
                : r
            )
        )
    }

    /** Admin approves reimbursement */
    const approveReimbursement = (recordId) => {
        setRecords(prev => prev.map(r =>
            r.id === recordId ? { ...r, reimbursementStatus: 'approved' } : r
        ))
    }

    /** Admin rejects reimbursement */
    const rejectReimbursement = (recordId) => {
        setRecords(prev => prev.map(r =>
            r.id === recordId ? { ...r, reimbursementStatus: 'rejected' } : r
        ))
    }

    return (
        <MaintenanceContext.Provider value={{
            records,
            vehicleStatuses,
            getVehicleStatus,
            setVehicleStatus,
            addRecord,
            attachBill,
            markDone,
            updateStatus,
            approveReimbursement,
            rejectReimbursement,
        }}>
            {children}
        </MaintenanceContext.Provider>
    )
}

export function useMaintenance() {
    const ctx = useContext(MaintenanceContext)
    if (!ctx) throw new Error('useMaintenance must be used within MaintenanceProvider')
    return ctx
}
