import { API_BASE_URL } from '../constants/api'

export async function request(path, options = {}) {
  const method = (options.method || 'GET').toUpperCase()
  const requestOptions =
    method === 'GET' ? { ...options, cache: 'no-store' } : options
  const response = await fetch(`${API_BASE_URL}${path}`, requestOptions)

  const contentType = response.headers.get('content-type') ?? ''
  let payload = null

  if (contentType.includes('application/json')) {
    payload = await response.json()
  } else {
    const text = await response.text()
    payload = text ? { message: text } : null
  }

  if (!response.ok) {
    const message =
      payload?.message ?? payload?.error ?? `Request failed: ${response.status}`
    throw new Error(message)
  }

  return payload
}
