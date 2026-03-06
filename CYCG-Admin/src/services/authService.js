const SESSION_KEY = 'cycg_session_user'
const STATIC_ADMIN_ID = 'admin'
const STATIC_ADMIN_PASSWORD = 'Admin@123'

export function getSessionUser() {
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function signUp({ name, email, password }) {
  void name
  void email
  void password
  throw new Error('Signup is disabled. Please login with the provided admin ID.')
}

export function login({ email, password }) {
  const normalizedId = email.trim().toLowerCase()
  if (
    normalizedId !== STATIC_ADMIN_ID.toLowerCase() ||
    password !== STATIC_ADMIN_PASSWORD
  ) {
    throw new Error('Invalid login ID or password.')
  }

  const sessionUser = {
    id: 1,
    name: 'Admin',
    email: `${STATIC_ADMIN_ID}@cycg.local`,
  }
  localStorage.setItem(SESSION_KEY, JSON.stringify(sessionUser))
  return sessionUser
}

export function logout() {
  localStorage.removeItem(SESSION_KEY)
}
