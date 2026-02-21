import { apiFetch } from './client'

/**
 * Vehicle shape from backend (VehicleOut):
 * { id, name, category, plate_number, region, capacity_kg, odometer, status }
 *
 * Status values: available | on_trip | in_shop | retired
 */

/** GET /vehicle/  →  VehicleOut[] */
export const listVehiclesApi = () => apiFetch('/vehicle/')

/** GET /vehicle/:id  →  VehicleOut */
export const getVehicleApi = (id) => apiFetch(`/vehicle/${id}`)

/** POST /vehicle/  →  VehicleOut */
export const createVehicleApi = (data) =>
  apiFetch('/vehicle/', {
    method: 'POST',
    body: JSON.stringify(data),
  })

/**
 * PUT /vehicle/:id  →  VehicleOut
 * data: Partial<VehicleUpdate> — name, category, region, capacity_kg, odometer, status
 */
export const updateVehicleApi = (id, data) =>
  apiFetch(`/vehicle/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })

/** DELETE /vehicle/:id */
export const deleteVehicleApi = (id) =>
  apiFetch(`/vehicle/${id}`, { method: 'DELETE' })
