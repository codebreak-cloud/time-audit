'use client'

import Link from 'next/link'
import { signOut } from 'next-auth/react'

interface TopBarProps {
  weekLabel: string
  onPrint: () => void
  pdfLoading?: boolean
  onShiftWeek: (delta: number) => void
  onShareWeek: () => void
  userId?: string
  isAdmin?: boolean
  flushSave?: () => Promise<void>
}

export default function TopBar({ weekLabel, onPrint, pdfLoading, onShiftWeek, onShareWeek, userId, isAdmin, flushSave }: TopBarProps) {
  return (
    <header className="no-print" style={{
      background: 'var(--aa-off-white)',
      borderBottom: '2px solid var(--aa-purple-ink)',
      padding: '14px 24px',
      display: 'flex', alignItems: 'center', gap: 20,
      position: 'sticky', top: 0, zIndex: 5,
    }}>
      <img src="/amplifier-logo.png" alt="Amplifier" style={{ height: 40, width: 'auto' }} />

      <div style={{ height: 24, width: 2, background: 'var(--aa-purple-ink)', opacity: 0.5 }} />

      <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.05 }}>
        <span style={{
          fontFamily: 'var(--font-mono)', fontSize: 10,
          letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--aa-purple)',
        }}>The Time Audit</span>
        <span style={{
          fontFamily: 'var(--font-heading)', fontWeight: 700,
          fontSize: 16, letterSpacing: '-0.005em',
          textTransform: 'uppercase', color: 'var(--aa-purple-ink)',
        }}>Where the f*ck is your week going?</span>
      </div>

      <div style={{ flex: 1 }} />

      <div style={{ display: 'flex', alignItems: 'center', gap: 0, border: '2px solid var(--aa-purple-ink)' }}>
        <button className="ta-btn ta-btn--ghost ta-btn--sm"
          onClick={() => onShiftWeek(-1)}
          style={{ border: 0, borderRight: '1px solid var(--aa-purple-ink)' }}>
          ‹
        </button>
        <div style={{
          padding: '0 14px',
          fontFamily: 'var(--font-mono)', fontSize: 12,
          fontWeight: 500, letterSpacing: '0.04em',
          color: 'var(--aa-purple-ink)', textTransform: 'uppercase',
        }}>{weekLabel}</div>
        <button className="ta-btn ta-btn--ghost ta-btn--sm"
          onClick={() => onShiftWeek(1)}
          style={{ border: 0, borderLeft: '1px solid var(--aa-purple-ink)' }}>
          ›
        </button>
      </div>

      <button className="ta-btn ta-btn--ghost ta-btn--sm" onClick={onShareWeek}>
        Share ›
      </button>
      <button className="ta-btn ta-btn--blue" onClick={onPrint} disabled={pdfLoading}>
        {pdfLoading ? 'Generating...' : 'Save PDF ››'}
      </button>

      {isAdmin && (
        <Link href="/admin" className="ta-btn ta-btn--ghost ta-btn--sm" style={{ textDecoration: 'none' }}>
          Admin
        </Link>
      )}

      {userId ? (
        <button
          className="ta-btn ta-btn--ghost ta-btn--sm"
          onClick={async () => { await flushSave?.(); localStorage.removeItem('aa-time-audit-v1'); signOut({ callbackUrl: '/sign-in' }) }}
        >
          Sign out
        </button>
      ) : (
        <Link href="/sign-in" className="ta-btn ta-btn--ghost ta-btn--sm" style={{ textDecoration: 'none' }}>
          Sign in ›
        </Link>
      )}
    </header>
  )
}
