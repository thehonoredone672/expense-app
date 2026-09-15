import { useCallback, useEffect, useState, type ReactNode } from 'react'
import type { AuthUser } from '../types'
import { api, setAuthToken } from '../lib/api'
import { AuthContext, type AuthStatus } from './auth-context'

const TOKEN_KEY = 'centsible.auth.token.v1'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>('loading')
  const [user, setUser] = useState<AuthUser | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const stored = localStorage.getItem(TOKEN_KEY)
    if (!stored) {
      setStatus('unauthenticated')
      return
    }
    setAuthToken(stored)
    api
      .me()
      .then(({ user }) => {
        setUser(user)
        setStatus('authenticated')
      })
      .catch(() => {
        localStorage.removeItem(TOKEN_KEY)
        setAuthToken(null)
        setStatus('unauthenticated')
      })
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    setError(null)
    try {
      const { token, user } = await api.login(email, password)
      localStorage.setItem(TOKEN_KEY, token)
      setAuthToken(token)
      setUser(user)
      setStatus('authenticated')
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not log in')
      return false
    }
  }, [])

  const signup = useCallback(async (email: string, password: string) => {
    setError(null)
    try {
      const { token, user } = await api.signup(email, password)
      localStorage.setItem(TOKEN_KEY, token)
      setAuthToken(token)
      setUser(user)
      setStatus('authenticated')
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not create account')
      return false
    }
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY)
    setAuthToken(null)
    setUser(null)
    setStatus('unauthenticated')
  }, [])

  const clearError = useCallback(() => setError(null), [])

  return (
    <AuthContext.Provider value={{ status, user, error, login, signup, logout, clearError }}>
      {children}
    </AuthContext.Provider>
  )
}
