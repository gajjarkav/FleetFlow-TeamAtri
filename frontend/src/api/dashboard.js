import { apiFetch } from './client'

/**
 * GET /dashboard/kpis  (manager only)
 * Returns aggregate KPI metrics for the dashboard.
 */
export const getDashboardKpisApi = () => apiFetch('/dashboard/kpis')
