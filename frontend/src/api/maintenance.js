import { apiFetch } from './client'

/**
 * Maintenance shape from backend (MaintenanceOut):
 * { id, dispatcher_id, vehicle_id, maintenance_type, description,
 *   date, estimated_cost, workshop, status }
 *
 * Status values: pending | approved | rejected | completed
 */

/** GET /maintenance/  →  MaintenanceOut[]  (manager only) */
export const listMaintenanceApi = () => apiFetch('/maintenance/')

/** GET /maintenance/me  →  MaintenanceOut[]  (dispatcher — own requests) */
export const myMaintenanceApi = () => apiFetch('/maintenance/me')

/** POST /maintenance/  →  MaintenanceOut  (dispatcher only) */
export const createMaintenanceApi = (data) =>
  apiFetch('/maintenance/', {
    method: 'POST',
    body: JSON.stringify(data),
  })

/** PATCH /maintenance/:id/status  →  MaintenanceOut  (manager only) */
export const updateMaintenanceStatusApi = (id, status) =>
  apiFetch(`/maintenance/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  })
