/**
 * Central API client.
 * All requests are sent to /api which Vite proxies to http://localhost:8000
 */
const BASE = '/api'

export const TOKEN_KEY = 'ff_token'

export const getToken = () => localStorage.getItem(TOKEN_KEY)
export const setToken = (t) => localStorage.setItem(TOKEN_KEY, t)
export const clearToken = () => localStorage.removeItem(TOKEN_KEY)

/**
 * Thin fetch wrapper.
 * - Attaches Authorization: Bearer <token> if a token exists
 * - Throws with the backend detail message on non-2xx
 */
export async function apiFetch(path, options = {}) {
  const token = getToken()
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { token } : {}),          // backend reads Header(name="token")
    ...(options.headers || {}),
  }

  const res = await fetch(`${BASE}${path}`, { ...options, headers })

  if (res.status === 204) return null

  const data = await res.json().catch(() => ({ detail: res.statusText }))

  if (!res.ok) {
    const msg = typeof data.detail === 'string'
      ? data.detail
      : Array.isArray(data.detail)
        ? data.detail.map(e => e.msg || JSON.stringify(e)).join(', ')
        : JSON.stringify(data.detail) || `HTTP ${res.status}`
    throw new Error(msg)
  }

  return data
}
