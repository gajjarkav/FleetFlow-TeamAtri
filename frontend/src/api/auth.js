import { apiFetch } from './client'

/** POST /auth/login  →  { token, role } */
export const loginApi = (email, password) =>
  apiFetch('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })

/** GET /auth/me  →  UserOut (current logged-in user) */
export const getMeApi = () => apiFetch('/auth/me')

/** GET /auth/dispatchers  →  UserOut[] (manager only) */
export const listDispatchersApi = () => apiFetch('/auth/dispatchers')

/** POST /auth/dispatchers  →  UserOut (manager only) */
export const createDispatcherApi = (data) =>
  apiFetch('/auth/dispatchers', {
    method: 'POST',
    body: JSON.stringify(data),
  })

/** DELETE /auth/dispatchers/:id */
export const deleteDispatcherApi = (id) =>
  apiFetch(`/auth/dispatchers/${id}`, { method: 'DELETE' })

/** PATCH /auth/me/status  →  UserOut (dispatcher only) */
export const updateMyStatusApi = (duty_status) =>
  apiFetch('/auth/me/status', {
    method: 'PATCH',
    body: JSON.stringify({ duty_status }),
  })
