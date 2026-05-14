'use client'

import { GRAN_OPTIONS, type Gran } from '@/lib/categories'

export default function GranToggle({ value, onChange }: { value: Gran; onChange: (g: Gran) => void }) {
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center',
      border: '2px solid var(--aa-purple-ink)',
      background: 'var(--aa-off-white)',
    }}>
      <span style={{
        padding: '6px 12px',
        fontFamily: 'var(--font-mono)', fontSize: 10,
        letterSpacing: '0.18em', textTransform: 'uppercase',
        color: 'var(--aa-purple)',
        borderRight: '1px solid var(--aa-purple-ink)',
      }}>Granularity</span>
      {GRAN_OPTIONS.map((g, i) => {
        const active = value === g
        return (
          <button key={g}
            onClick={() => onChange(g)}
            style={{
              padding: '6px 14px',
              fontFamily: 'var(--font-heading)', fontWeight: 700,
              fontSize: 12, letterSpacing: '0.06em', textTransform: 'uppercase',
              background: active ? 'var(--aa-purple-ink)' : 'transparent',
              color: active ? '#fff' : 'var(--aa-purple-ink)',
              border: 0,
              borderRight: i < GRAN_OPTIONS.length - 1 ? '1px solid var(--aa-purple-ink)' : 'none',
              cursor: 'pointer',
              transition: 'background 120ms',
            }}>
            {g} min
          </button>
        )
      })}
    </div>
  )
}
