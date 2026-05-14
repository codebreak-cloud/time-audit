import { LEVERAGE_META, fmtH, pct, type Leverage, type Stats } from '@/lib/categories'

const COLORS: Record<Leverage, string> = {
  high:  'var(--aa-purple)',
  core:  'var(--aa-blue)',
  drain: 'var(--aa-red)',
  self:  'var(--aa-grey-500)',
}

const ORDER: Leverage[] = ['high', 'core', 'drain', 'self']

export default function LeverageBar({ byLev }: { byLev: Stats['byLev'] }) {
  const total = ORDER.reduce((s, k) => s + byLev[k], 0)

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 8 }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--aa-purple)' }}>
          Leverage Split
        </div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.12em', color: 'var(--aa-grey-500)' }}>
          {fmtH(total)} total
        </div>
      </div>

      <div style={{
        display: 'flex', height: 28, width: '100%',
        border: '2px solid var(--aa-purple-ink)',
        background: 'var(--aa-purple-tint)',
        overflow: 'hidden',
      }}>
        {total === 0 && (
          <div style={{
            width: '100%', textAlign: 'center', alignSelf: 'center',
            fontFamily: 'var(--font-mono)', fontSize: 10,
            letterSpacing: '0.18em', color: 'var(--aa-grey-500)', textTransform: 'uppercase',
          }}>Empty</div>
        )}
        {ORDER.map(k => {
          const v = byLev[k]
          if (!v) return null
          return (
            <div key={k}
              title={`${LEVERAGE_META[k].label} — ${fmtH(v)}`}
              style={{ width: `${(v / total) * 100}%`, background: COLORS[k] }}
            />
          )
        })}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 12 }}>
        {ORDER.map(k => {
          const v = byLev[k]
          return (
            <div key={k} style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
              <span style={{
                width: 10, height: 10, flex: '0 0 10px', marginTop: 5,
                background: COLORS[k], border: '1.5px solid var(--aa-purple-ink)',
              }} />
              <div>
                <div style={{
                  fontFamily: 'var(--font-heading)', fontWeight: 700,
                  fontSize: 12, letterSpacing: '0.06em',
                  textTransform: 'uppercase', color: 'var(--aa-purple-ink)', lineHeight: 1.1,
                }}>{LEVERAGE_META[k].label}</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--aa-grey-700)', marginTop: 2 }}>
                  {fmtH(v)} · {pct(v, total)}%
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
