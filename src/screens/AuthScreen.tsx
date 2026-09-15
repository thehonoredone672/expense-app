import { useState, type FormEvent } from 'react'
import { LogIn, UserPlus } from 'lucide-react'
import { useAuth } from '../context/auth-context'

export function AuthScreen() {
  const { login, signup, error, clearError } = useAuth()
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const canSubmit = email.trim().length > 0 && password.length >= (mode === 'signup' ? 8 : 1)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!canSubmit || submitting) return
    setSubmitting(true)
    const ok = mode === 'login' ? await login(email.trim(), password) : await signup(email.trim(), password)
    setSubmitting(false)
    if (!ok) return
  }

  function switchMode() {
    setMode((m) => (m === 'login' ? 'signup' : 'login'))
    clearError()
  }

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-[var(--bg)] bg-dither px-6 text-[var(--text)]">
      <div className="w-full max-w-xs">
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <span
            className="flex h-14 w-14 items-center justify-center rounded-[18px] border-2 border-[var(--border-hard)] text-2xl font-bold"
            style={{ backgroundColor: 'var(--accent-2)', color: 'var(--accent-2-text)', boxShadow: '4px 4px 0 var(--border-hard)' }}
          >
            E
          </span>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Expensify</h1>
            <p className="text-[13px] text-[var(--text-muted)]">
              {mode === 'login' ? 'Log in to your account' : 'Create your account'}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="card-flat rounded-[22px] px-5 py-6">
          <label className="block">
            <span className="mb-1 block text-[12px] font-semibold uppercase tracking-wide text-[var(--text-muted)]">
              Email
            </span>
            <input
              type="email"
              inputMode="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoFocus
              className="w-full border-b-2 border-[var(--border)] bg-transparent py-2 text-[15px] outline-none placeholder:text-[var(--text-muted)]"
            />
          </label>

          <label className="mt-4 block">
            <span className="mb-1 block text-[12px] font-semibold uppercase tracking-wide text-[var(--text-muted)]">
              Password
            </span>
            <input
              type="password"
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={mode === 'signup' ? 'At least 8 characters' : 'Your password'}
              className="w-full border-b-2 border-[var(--border)] bg-transparent py-2 text-[15px] outline-none placeholder:text-[var(--text-muted)]"
            />
          </label>

          {error && (
            <p
              className="mt-4 rounded-lg border-2 px-3 py-2 text-[13px] font-medium animate-fade-in"
              style={{ borderColor: 'var(--danger)', color: 'var(--danger)' }}
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={!canSubmit || submitting}
            className="press mt-5 flex w-full items-center justify-center gap-2 rounded-lg border-2 border-[var(--border-hard)] py-3 text-[15px] font-semibold disabled:opacity-40"
            style={{
              backgroundColor: canSubmit ? 'var(--accent-2)' : 'var(--surface-2)',
              color: canSubmit ? 'var(--accent-2-text)' : 'var(--text-muted)',
              boxShadow: canSubmit ? '3px 3px 0 var(--border-hard)' : undefined,
            }}
          >
            {mode === 'login' ? <LogIn size={17} /> : <UserPlus size={17} />}
            {submitting ? 'Please wait…' : mode === 'login' ? 'Log in' : 'Create account'}
          </button>
        </form>

        <button
          type="button"
          onClick={switchMode}
          className="mt-5 w-full text-center text-[13.5px] font-medium text-[var(--text-muted)] transition-opacity active:opacity-60"
        >
          {mode === 'login' ? (
            <>
              Don't have an account? <span style={{ color: 'var(--accent)' }}>Sign up</span>
            </>
          ) : (
            <>
              Already have an account? <span style={{ color: 'var(--accent)' }}>Log in</span>
            </>
          )}
        </button>
      </div>
    </div>
  )
}
