'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function SignUpPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    const fd = new FormData(e.currentTarget)
    const email = fd.get('email') as string
    const password = fd.get('password') as string
    const confirm = fd.get('confirm') as string

    if (password !== confirm) {
      setError('Passwords do not match.')
      return
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }

    setLoading(true)
    const res = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    const data = await res.json()
    if (!res.ok) {
      setLoading(false)
      setError(data.error ?? 'Registration failed.')
      return
    }

    const result = await signIn('credentials', { email, password, redirect: false })
    setLoading(false)
    if (result?.error) {
      setError('Account created but sign-in failed. Try signing in.')
    } else {
      router.push('/')
      router.refresh()
    }
  }

  return (
    <div style={{
      minHeight: '100vh', background: 'var(--aa-off-white)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 24,
    }}>
      <div style={{
        width: '100%', maxWidth: 420,
        border: '2px solid var(--aa-purple-ink)',
        background: 'var(--aa-white)',
      }}>
        <div style={{ background: 'var(--aa-purple)', padding: '28px 32px', borderBottom: '2px solid var(--aa-purple-ink)' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--aa-blue)', marginBottom: 8 }}>
            Adherence Amplifier
          </div>
          <h1 style={{
            margin: 0,
            fontFamily: 'var(--font-heading)', fontWeight: 700,
            fontSize: 36, letterSpacing: '-0.02em',
            textTransform: 'uppercase', color: '#fff', lineHeight: 1,
          }}>The Time<br />Audit</h1>
          <p style={{ margin: '12px 0 0', fontFamily: 'var(--font-body)', fontSize: 15, color: 'rgba(255,255,255,0.85)', lineHeight: 1.5 }}>
            Log the week you actually had, not the one you wish you&apos;d had.
          </p>
        </div>

        <div style={{ padding: '32px' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--aa-purple)', marginBottom: 20 }}>
            Create account
          </div>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <input
              name="email"
              type="email"
              required
              placeholder="Email"
              style={{
                width: '100%', padding: '12px 14px',
                border: '2px solid var(--aa-purple-ink)',
                background: 'var(--aa-off-white)',
                fontFamily: 'var(--font-body)', fontSize: 15,
                color: 'var(--aa-purple-ink)',
                borderRadius: 0, outline: 'none',
                boxSizing: 'border-box',
              }}
            />
            <input
              name="password"
              type="password"
              required
              placeholder="Password (min 8 characters)"
              style={{
                width: '100%', padding: '12px 14px',
                border: '2px solid var(--aa-purple-ink)',
                background: 'var(--aa-off-white)',
                fontFamily: 'var(--font-body)', fontSize: 15,
                color: 'var(--aa-purple-ink)',
                borderRadius: 0, outline: 'none',
                boxSizing: 'border-box',
              }}
            />
            <input
              name="confirm"
              type="password"
              required
              placeholder="Confirm password"
              style={{
                width: '100%', padding: '12px 14px',
                border: '2px solid var(--aa-purple-ink)',
                background: 'var(--aa-off-white)',
                fontFamily: 'var(--font-body)', fontSize: 15,
                color: 'var(--aa-purple-ink)',
                borderRadius: 0, outline: 'none',
                boxSizing: 'border-box',
              }}
            />
            {error && (
              <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--aa-red)', fontWeight: 600 }}>
                {error}
              </div>
            )}
            <button type="submit" className="ta-btn ta-btn--blue" style={{ width: '100%', justifyContent: 'center', marginTop: 4 }} disabled={loading}>
              {loading ? 'Creating account...' : 'Create account ›'}
            </button>
          </form>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--aa-grey-500)', marginTop: 20, lineHeight: 1.5, textAlign: 'center' }}>
            Already have an account?{' '}
            <Link href="/sign-in" style={{ color: 'var(--aa-purple)', fontWeight: 700, textDecoration: 'none' }}>
              Sign in ›
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
