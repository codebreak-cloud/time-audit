'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function SignInPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const fd = new FormData(e.currentTarget)
    const result = await signIn('credentials', {
      email: fd.get('email'),
      password: fd.get('password'),
      redirect: false,
    })
    setLoading(false)
    if (result?.error) {
      setError('Invalid email or password.')
    } else {
      window.location.href = '/'
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
            Where the f*ck is your week going?
          </p>
        </div>

        <div style={{ padding: '32px' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--aa-purple)', marginBottom: 20 }}>
            Sign in
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
              placeholder="Password"
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
              {loading ? 'Signing in...' : 'Sign in ›'}
            </button>
          </form>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--aa-grey-500)', marginTop: 20, lineHeight: 1.5, textAlign: 'center' }}>
            No account?{' '}
            <Link href="/sign-up" style={{ color: 'var(--aa-purple)', fontWeight: 700, textDecoration: 'none' }}>
              Create one ›
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
