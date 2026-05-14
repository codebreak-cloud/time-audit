import { CATEGORIES, fmtH, type Stats } from '@/lib/categories'
import { buildInsights, type Tone } from '@/lib/insights'
import Donut from './Donut'
import LeverageBar from './LeverageBar'
import SinksList from './SinksList'

interface ResultsProps {
  stats: Stats
  tone: Tone
}

export default function Results({ stats, tone }: ResultsProps) {
  const donutData = CATEGORIES.map(c => ({ id: c.id, color: c.color, value: stats.byCat[c.id] || 0 }))
  const insights = buildInsights(stats, tone)

  const insightTitle = tone === 'lewis' ? 'WHAT LEWIS WOULD SAY' : tone === 'neutral' ? 'WHAT THE WEEK SAYS' : 'SUMMARY'

  return (
    <section style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 32 }}>
      {/* Donut + Insights */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(260px, 320px) 1fr',
        gap: 32, alignItems: 'start',
      }}>
        <div style={{
          background: 'var(--aa-bone)',
          border: '2px solid var(--aa-purple-ink)',
          padding: 24,
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
        }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--aa-purple)' }}>
            The week in one circle
          </div>
          <Donut data={donutData} size={240} stroke={42} />
        </div>

        <div style={{
          background: 'var(--aa-purple)',
          color: '#fff',
          padding: '24px 28px',
          border: '2px solid var(--aa-purple-ink)',
          boxShadow: '6px 6px 0 var(--aa-purple-ink)',
        }}>
          <div style={{
            fontFamily: 'var(--font-mono)', fontSize: 10,
            letterSpacing: '0.18em', textTransform: 'uppercase',
            color: 'var(--aa-blue)', marginBottom: 14,
          }}>{insightTitle}</div>

          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 14 }}>
            {insights.map((l, i) => (
              <li key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <span style={{
                  flex: '0 0 28px',
                  fontFamily: 'var(--font-heading)', fontWeight: 700,
                  fontSize: 18, letterSpacing: '-0.01em',
                  color: l.kind === 'warn' ? 'var(--aa-blue)' :
                         l.kind === 'good' ? '#9ce28b' :
                         l.kind === 'headline' ? '#fff' : 'rgba(255,255,255,0.7)',
                  lineHeight: 1.05, paddingTop: 2,
                }}>
                  {l.kind === 'warn' ? '→' : l.kind === 'good' ? '✓' : l.kind === 'headline' ? '▶' : '·'}
                </span>
                <span style={{
                  fontFamily: 'var(--font-body)',
                  fontWeight: l.kind === 'headline' ? 700 : 500,
                  fontSize: l.kind === 'headline' ? 18 : 15.5,
                  lineHeight: 1.45,
                  color: l.kind === 'headline' ? '#fff' : 'rgba(255,255,255,0.94)',
                }}>{l.text}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Leverage bar */}
      <div style={{ background: 'var(--aa-white)', border: '2px solid var(--aa-purple-ink)', padding: 24 }}>
        <LeverageBar byLev={stats.byLev} />
      </div>

      {/* Leaderboard */}
      <div style={{ background: 'var(--aa-white)', border: '2px solid var(--aa-purple-ink)', padding: 24 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 14 }}>
          <div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--aa-purple)', marginBottom: 4 }}>
              Where it went
            </div>
            <h3 style={{
              margin: 0,
              fontFamily: 'var(--font-heading)', fontWeight: 700,
              fontSize: 22, letterSpacing: '-0.01em',
              textTransform: 'uppercase', color: 'var(--aa-purple-ink)',
            }}>The leaderboard</h3>
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--aa-grey-500)' }}>
            {fmtH(stats.totalLogged)} logged · of {fmtH(stats.totalMin)} available
          </div>
        </div>
        <SinksList byCat={stats.byCat} totalLogged={stats.totalLogged} />
      </div>
    </section>
  )
}
