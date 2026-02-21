import React, { useState } from 'react'
import { CheckCircle, MapPin, Truck, Package, Clock, Navigation } from 'lucide-react'
import { trips, vehicles, getVehicleById, drivers } from '../../data/mockData'
import { useAuth } from '../../context/AuthContext'

const TRIP_STEPS = [
    { key: 'assigned', label: 'Assigned' },
    { key: 'enroute', label: 'En Route to Pickup' },
    { key: 'loaded', label: 'Cargo Loaded' },
    { key: 'transit', label: 'In Transit' },
    { key: 'delivered', label: 'Delivered' },
]

export default function ActiveTrip() {
    const { user } = useAuth()
    const driver = drivers.find(d => d.id === user?.driverId) || drivers[0]

    // Find an in-progress trip for this driver
    const activeTrip = trips.find(t => t.driverId === driver.id && t.status === 'in_progress')
        || trips.find(t => t.status === 'in_progress') // Fallback to any in-progress

    const [currentStep, setCurrentStep] = useState(2) // 0-indexed: loaded
    const [completed, setCompleted] = useState(false)

    const handleAdvance = () => {
        if (currentStep < TRIP_STEPS.length - 1) {
            setCurrentStep(s => s + 1)
        } else {
            setCompleted(true)
        }
    }

    if (!activeTrip) {
        return (
            <div>
                <div className="driver-page-header">
                    <h1>Active Trip</h1>
                    <p>Your current trip status and controls</p>
                </div>
                <div className="driver-empty">
                    <Navigation size={56} className="driver-empty-icon" style={{ margin: '0 auto 16px', display: 'block', opacity: 0.3 }} />
                    <h3>No active trip</h3>
                    <p>Accept a trip invitation to get started. Your active trip will appear here.</p>
                </div>
            </div>
        )
    }

    const vehicle = getVehicleById(activeTrip.vehicleId)

    if (completed) {
        return (
            <div>
                <div className="driver-page-header">
                    <h1>Active Trip</h1>
                </div>
                <div style={{ textAlign: 'center', padding: '60px 24px' }}>
                    <div style={{ width: 80, height: 80, background: 'rgba(16,185,129,0.15)', borderRadius: 99, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', boxShadow: '0 0 32px rgba(16,185,129,0.3)' }}>
                        <CheckCircle size={40} color="#34d399" />
                    </div>
                    <div style={{ fontSize: 24, fontWeight: 800, color: '#f1f5f9', marginBottom: 8 }}>Trip Completed!</div>
                    <div style={{ fontSize: 14, color: '#64748b' }}>{activeTrip.from} → {activeTrip.to} · {activeTrip.distanceKm} km</div>
                    <div style={{ fontSize: 13, color: '#34d399', marginTop: 16, fontWeight: 600 }}>Awaiting dispatch confirmation. Great work!</div>
                </div>
            </div>
        )
    }

    return (
        <div>
            <div className="driver-page-header">
                <h1>Active Trip</h1>
                <p>Trip {activeTrip.id} · Real-time status and controls</p>
            </div>

            {/* Trip Tracker */}
            <div className="trip-tracker-card">
                <div className="trip-tracker-header">
                    <div>
                        <div style={{ fontSize: 11, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 4 }}>Trip ID · {activeTrip.id}</div>
                        <div style={{ fontSize: 20, fontWeight: 800, color: '#f1f5f9' }}>{activeTrip.from} → {activeTrip.to}</div>
                        <div style={{ fontSize: 13, color: '#64748b', marginTop: 3 }}>{activeTrip.distanceKm} km · {activeTrip.cargoWeight} kg cargo</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 7, background: 'rgba(59,130,246,0.12)', border: '1px solid rgba(59,130,246,0.25)', borderRadius: 100, padding: '8px 16px' }}>
                        <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#3b82f6', display: 'inline-block', animation: 'pulse 2s infinite' }} />
                        <span style={{ fontSize: 12, fontWeight: 700, color: '#60a5fa' }}>In Progress</span>
                    </div>
                </div>

                <div className="trip-tracker-body">
                    {/* Progress Steps */}
                    <div className="trip-progress-steps">
                        {TRIP_STEPS.map((step, i) => (
                            <div key={step.key} className={`trip-step ${i < currentStep ? 'done' : i === currentStep ? 'active' : 'pending'}`}>
                                <div className="trip-step-circle">
                                    {i < currentStep ? <CheckCircle size={16} /> : i + 1}
                                </div>
                                <div className="trip-step-label">{step.label}</div>
                            </div>
                        ))}
                    </div>

                    {/* Current Status Info */}
                    <div style={{ background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.12)', borderRadius: 12, padding: '16px 20px', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 12 }}>
                        <Navigation size={20} color="#3b82f6" />
                        <div>
                            <div style={{ fontSize: 14, fontWeight: 700, color: '#f1f5f9' }}>Current: {TRIP_STEPS[currentStep]?.label}</div>
                            <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>
                                Step {currentStep + 1} of {TRIP_STEPS.length} · Est. {activeTrip.distanceKm - currentStep * Math.floor(activeTrip.distanceKm / 5)} km remaining
                            </div>
                        </div>
                    </div>

                    {/* Action */}
                    <button
                        className="driver-action-btn primary"
                        onClick={handleAdvance}
                        style={{ width: '100%', justifyContent: 'center', padding: 14 }}
                    >
                        {currentStep === TRIP_STEPS.length - 1 ? <><CheckCircle size={16} /> Mark as Delivered</> : <><Navigation size={16} /> Advance to: {TRIP_STEPS[currentStep + 1]?.label}</>}
                    </button>
                </div>
            </div>

            {/* Trip Details Grid */}
            <div className="driver-info-grid">
                <div className="driver-info-card">
                    <div className="driver-info-card-title"><Truck size={14} /> Vehicle Details</div>
                    {vehicle ? (
                        <>
                            <div className="driver-info-row"><span className="driver-info-row-label">Reg. No.</span><span className="driver-info-row-value">{vehicle.regNo}</span></div>
                            <div className="driver-info-row"><span className="driver-info-row-label">Make / Model</span><span className="driver-info-row-value">{vehicle.make} {vehicle.model}</span></div>
                            <div className="driver-info-row"><span className="driver-info-row-label">Type</span><span className="driver-info-row-value">{vehicle.type}</span></div>
                            <div className="driver-info-row"><span className="driver-info-row-label">Fuel</span><span className="driver-info-row-value">{vehicle.fuelType}</span></div>
                            <div className="driver-info-row"><span className="driver-info-row-label">Capacity</span><span className="driver-info-row-value">{vehicle.capacity} kg</span></div>
                        </>
                    ) : (
                        <div style={{ fontSize: 13, color: '#475569' }}>Vehicle info not available</div>
                    )}
                </div>

                <div className="driver-info-card">
                    <div className="driver-info-card-title"><Package size={14} /> Cargo & Route</div>
                    <div className="driver-info-row"><span className="driver-info-row-label">Origin</span><span className="driver-info-row-value">{activeTrip.from}</span></div>
                    <div className="driver-info-row"><span className="driver-info-row-label">Destination</span><span className="driver-info-row-value">{activeTrip.to}</span></div>
                    <div className="driver-info-row"><span className="driver-info-row-label">Cargo Type</span><span className="driver-info-row-value">{activeTrip.cargoType}</span></div>
                    <div className="driver-info-row"><span className="driver-info-row-label">Cargo Weight</span><span className="driver-info-row-value">{activeTrip.cargoWeight} kg</span></div>
                    <div className="driver-info-row"><span className="driver-info-row-label">Distance</span><span className="driver-info-row-value">{activeTrip.distanceKm} km</span></div>
                </div>
            </div>
        </div>
    )
}
