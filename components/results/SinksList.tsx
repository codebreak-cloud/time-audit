import { CATEGORIES, fmtH, pct, type Stats } from '@/lib/categories'

export default function SinksList({ byCat, totalLogged }: { byCat: Stats['byCat']; totalLogged: number }) {
  const ranked = CATEGORIES
    .map(c => ({ ...c, value: byCat[c.id] || 0 }))
    .filter(r => r.value > 0)
    .sort((a, b) => b.value - a.value)

  if (ranked.length === 0) {
    return (
      <div style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--aa-grey-500)', fontStyle: 'italic' }}>
        Nothing logged yet. Pick a category and start painting your week.
      </div>
    )
  }

  const max = ranked[0].value

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      {ranked.map((r, i) => (
        <div key={r.id} style={{
          display: 'grid', gridTemplateColumns: '22px 1fr auto',
          alignItems: 'center', gap: 12,
          padding: '10px 0',
          borderBottom: i < ranked.length - 1 ? '1px solid var(--aa-purple-line)' : 'none',
        }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--aa-grey-500)', fontWeight: 500 }}>
            {String(i + 1).padStart(2, '0')}
          </span>
          <div>
            <div style={{
              fontFamily: 'var(--font-heading)', fontWeight: 700,
              fontSize: 13, letterSpacing: '0.04em',
              textTransform: 'uppercase', color: 'var(--aa-purple-ink)', marginBottom: 6,
            }}>{r.label}</div>
            <div style={{ height: 6, background: 'var(--aa-purple-tint)', border: '1px solid var(--aa-purple-line)', position: 'relative' }}>
              <div style={{ position: 'absolute', inset: 0, width: `${(r.value / max) * 100}%`, background: r.color }} />
            </div>
          </div>
          <div style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 600, color: 'var(--aa-purple-ink)', whiteSpace: 'nowrap' }}>
            {fmtH(r.value)}
            <span style={{ color: 'var(--aa-grey-500)', fontWeight: 400 }}> · {pct(r.value, totalLogged)}%</span>
          </div>
        </div>
      ))}
    </div>
  )
}
