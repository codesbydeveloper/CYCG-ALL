/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useMemo, useState } from 'react'
import {
  getSessionUser,
  login as loginService,
  logout as logoutService,
  signUp as signUpService,
} from '../services/authService'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => getSessionUser())

  async function login(credentials) {
    const sessionUser = loginService(credentials)
    setUser(sessionUser)
    return sessionUser
  }

  async function signUp(payload) {
    signUpService(payload)
    const sessionUser = loginService({
      email: payload.email,
      password: payload.password,
    })
    setUser(sessionUser)
    return sessionUser
  }

  function logout() {
    logoutService()
    setUser(null)
  }

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      login,
      signUp,
      logout,
    }),
    [user],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
