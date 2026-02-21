import { apiFetch } from './client'

/**
 * Trip shape from backend (TripOut):
 * { id, vehicle_id, dispatcher_id, total_km, start_time, end_time, payment_amount, status }
 *
 * Status values: assigned | in_progress | completed | cancelled
 */

/** GET /trips/  →  TripOut[]  (manager only) */
export const listTripsApi = () => apiFetch('/trips/')

/** GET /trips/me  →  TripOut[]  (dispatcher — own trips) */
export const myTripsApi = () => apiFetch('/trips/me')

/** POST /trips/  →  TripOut  (manager only) */
export const createTripApi = (data) =>
  apiFetch('/trips/', {
    method: 'POST',
    body: JSON.stringify(data),
  })

/** PATCH /trips/:id/start  →  TripOut */
export const startTripApi = (id) =>
  apiFetch(`/trips/${id}/start`, { method: 'PATCH' })

/** PATCH /trips/:id/complete  →  TripOut */
export const completeTripApi = (id, end_odometer) =>
  apiFetch(`/trips/${id}/complete`, {
    method: 'PATCH',
    body: JSON.stringify({ end_odometer }),
  })
