import {
  Document, Page, Text, View, StyleSheet, Font,
} from '@react-pdf/renderer'
import {
  CATEGORIES, LEVERAGE_META, fmtH, pct, weekLabel, computeStats,
  type Gran, type WeekBlocks, type Leverage,
} from './categories'
import { buildInsights, type Tone } from './insights'

const PURPLE     = '#584f9c'
const PURPLE_INK = '#1f1b49'
const PURPLE_TINT= '#e7e9f3'
const PURPLE_LINE= '#c9cde0'
const BLUE       = '#4bbcfa'
const BONE       = '#eceae3'
const OFF_WHITE  = '#f6f5f1'
const RED        = '#d4352b'
const GREY_500   = '#6b6b6b'
const GREY_700   = '#3b3b3b'

const LEV_COLORS: Record<Leverage, string> = {
  high:  PURPLE,
  core:  BLUE,
  drain: RED,
  self:  GREY_500,
}

const s = StyleSheet.create({
  page:        { backgroundColor: '#ffffff', padding: '14mm', fontFamily: 'Helvetica' },
  mono:        { fontFamily: 'Courier', fontSize: 8, letterSpacing: 1.5, color: PURPLE, textTransform: 'uppercase' },
  h1:          { fontFamily: 'Helvetica-Bold', fontSize: 28, color: PURPLE_INK, textTransform: 'uppercase', letterSpacing: -0.5, lineHeight: 1 },
  h2:          { fontFamily: 'Helvetica-Bold', fontSize: 16, color: PURPLE_INK, textTransform: 'uppercase', letterSpacing: -0.3 },
  h3:          { fontFamily: 'Helvetica-Bold', fontSize: 11, color: PURPLE_INK, textTransform: 'uppercase' },
  body:        { fontFamily: 'Helvetica', fontSize: 9.5, color: GREY_700, lineHeight: 1.5 },
  small:       { fontFamily: 'Helvetica', fontSize: 8, color: GREY_500 },
  divider:     { borderBottomWidth: 2, borderBottomColor: PURPLE_INK, marginBottom: 12 },
  hairline:    { borderBottomWidth: 1, borderBottomColor: PURPLE_LINE, marginVertical: 6 },
  card:        { border: '2px solid ' + PURPLE_INK, padding: 12, marginBottom: 12, backgroundColor: '#fff' },
  insightCard: { border: '2px solid ' + PURPLE_INK, padding: 16, marginBottom: 12, backgroundColor: PURPLE },
  row:         { flexDirection: 'row', alignItems: 'center' },
  spacer:      { flex: 1 },
})

// ---- KPI tile ----
function KpiTile({ label, value, sub, accent }: { label: string; value: string; sub: string; accent?: boolean }) {
  return (
    <View style={{ flex: 1, border: '2px solid ' + PURPLE_INK, padding: 10, marginRight: 8, backgroundColor: accent ? PURPLE : '#fff' }}>
      <Text style={[s.mono, { color: accent ? BLUE : PURPLE, marginBottom: 3 }]}>{label}</Text>
      <Text style={{ fontFamily: 'Helvetica-Bold', fontSize: 22, color: accent ? '#fff' : PURPLE_INK, textTransform: 'uppercase', lineHeight: 1 }}>{value}</Text>
      <Text style={[s.small, { color: accent ? 'rgba(255,255,255,0.8)' : GREY_500, marginTop: 3 }]}>{sub}</Text>
    </View>
  )
}

// ---- Bar (for leverage + leaderboard) ----
function Bar({ fill, color, height = 6 }: { fill: number; color: string; height?: number }) {
  return (
    <View style={{ width: '100%', height, backgroundColor: PURPLE_TINT, border: '1px solid ' + PURPLE_LINE, position: 'relative', marginTop: 4 }}>
      <View style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: `${fill}%`, backgroundColor: color }} />
    </View>
  )
}

// ---- Main report document ----
interface ReportProps {
  weekStart: Date
  gran: Gran
  blocks: WeekBlocks
  tone: Tone
}

export function PdfReport({ weekStart, gran, blocks, tone }: ReportProps) {
  const stats = computeStats(blocks, gran)
  const lbl = weekLabel(weekStart)
  const insights = buildInsights(stats, tone)

  const ranked = CATEGORIES
    .map(c => ({ ...c, value: stats.byCat[c.id] || 0 }))
    .filter(r => r.value > 0)
    .sort((a, b) => b.value - a.value)

  const leverageOrder: Leverage[] = ['high', 'core', 'drain', 'self']
  const levTotal = leverageOrder.reduce((s, k) => s + stats.byLev[k], 0)

  const drainH = stats.byLev.drain / 60
  const highH  = stats.byLev.high  / 60

  return (
    <Document title={`Time Audit — ${lbl}`} author="Adherence Amplifier">
      <Page size="A4" style={s.page}>

        {/* ── Header ── */}
        <View style={s.divider}>
          <Text style={[s.mono, { marginBottom: 4 }]}>Adherence Amplifier · Time Audit</Text>
          <Text style={s.h1}>{lbl}</Text>
          <View style={[s.row, { marginTop: 6, marginBottom: 10 }]}>
            <Text style={s.small}>{fmtH(stats.totalLogged)} logged · {gran}-min granularity · of {fmtH(stats.totalMin)} available</Text>
          </View>
        </View>

        {/* ── KPI row ── */}
        <View style={[s.row, { marginBottom: 16 }]}>
          <KpiTile label="Total logged"    value={fmtH(stats.totalLogged)} sub={`of ${fmtH(stats.totalMin)}`} />
          <KpiTile label="High-leverage"   value={fmtH(stats.byLev.high)}  sub={`${pct(stats.byLev.high, stats.totalLogged)}% of logged`} accent />
          <KpiTile label="Drain"           value={fmtH(stats.byLev.drain)} sub={drainH > highH ? 'more than high-leverage' : 'minimise / systemise'} />
          <View style={{ flex: 1, border: '2px solid ' + PURPLE_INK, padding: 10, backgroundColor: '#fff' }}>
            <Text style={[s.mono, { marginBottom: 3 }]}>Off the clock</Text>
            <Text style={{ fontFamily: 'Helvetica-Bold', fontSize: 22, color: PURPLE_INK, textTransform: 'uppercase', lineHeight: 1 }}>{fmtH(stats.byLev.self)}</Text>
            <Text style={[s.small, { marginTop: 3 }]}>training + family + you</Text>
          </View>
        </View>

        {/* ── Insights card ── */}
        <View style={s.insightCard}>
          <Text style={[s.mono, { color: BLUE, marginBottom: 10 }]}>
            {tone === 'lewis' ? 'What Lewis would say' : tone === 'neutral' ? 'What the week says' : 'Summary'}
          </Text>
          {insights.map((l, i) => (
            <View key={i} style={[s.row, { marginBottom: 8, alignItems: 'flex-start' }]}>
              <Text style={{
                fontFamily: 'Helvetica-Bold', fontSize: 14, width: 18,
                color: l.kind === 'warn' ? BLUE : l.kind === 'good' ? '#9ce28b' : '#fff',
              }}>
                {l.kind === 'warn' ? '→' : l.kind === 'good' ? '✓' : l.kind === 'headline' ? '▶' : '·'}
              </Text>
              <Text style={{
                fontFamily: l.kind === 'headline' ? 'Helvetica-Bold' : 'Helvetica',
                fontSize: l.kind === 'headline' ? 11 : 9.5,
                color: '#fff', flex: 1, lineHeight: 1.45,
              }}>{l.text}</Text>
            </View>
          ))}
        </View>

        {/* ── Leverage split ── */}
        <View style={[s.card, { marginTop: 4 }]}>
          <View style={[s.row, { marginBottom: 8 }]}>
            <Text style={s.h3}>Leverage split</Text>
            <View style={s.spacer} />
            <Text style={s.small}>{fmtH(levTotal)} total</Text>
          </View>

          {/* Stacked bar */}
          <View style={{ flexDirection: 'row', height: 14, border: '2px solid ' + PURPLE_INK, overflow: 'hidden', marginBottom: 10 }}>
            {leverageOrder.map(k => {
              const v = stats.byLev[k]
              if (!v || !levTotal) return null
              return <View key={k} style={{ width: `${(v / levTotal) * 100}%`, backgroundColor: LEV_COLORS[k] }} />
            })}
          </View>

          <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
            {leverageOrder.map(k => (
              <View key={k} style={{ width: '50%', flexDirection: 'row', alignItems: 'flex-start', marginBottom: 6 }}>
                <View style={{ width: 8, height: 8, backgroundColor: LEV_COLORS[k], border: '1px solid ' + PURPLE_INK, marginTop: 2, marginRight: 6 }} />
                <View>
                  <Text style={{ fontFamily: 'Helvetica-Bold', fontSize: 9, textTransform: 'uppercase', color: PURPLE_INK }}>{LEVERAGE_META[k].label}</Text>
                  <Text style={s.small}>{fmtH(stats.byLev[k])} · {pct(stats.byLev[k], levTotal)}%</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* ── Leaderboard ── */}
        <View style={s.card}>
          <View style={[s.row, { marginBottom: 10 }]}>
            <Text style={s.h3}>The leaderboard</Text>
            <View style={s.spacer} />
            <Text style={s.small}>{fmtH(stats.totalLogged)} logged</Text>
          </View>

          {ranked.length === 0 && <Text style={s.body}>Nothing logged.</Text>}

          {ranked.map((r, i) => (
            <View key={r.id}>
              <View style={[s.row, { paddingVertical: 5 }]}>
                <Text style={[s.small, { width: 20, color: GREY_500 }]}>{String(i + 1).padStart(2, '0')}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontFamily: 'Helvetica-Bold', fontSize: 9, textTransform: 'uppercase', color: PURPLE_INK, marginBottom: 3 }}>{r.label}</Text>
                  <Bar fill={(r.value / (ranked[0]?.value || 1)) * 100} color={r.color} />
                </View>
                <Text style={[s.small, { width: 60, textAlign: 'right', fontFamily: 'Helvetica-Bold', color: PURPLE_INK }]}>
                  {fmtH(r.value)}
                  {'  '}{pct(r.value, stats.totalLogged)}%
                </Text>
              </View>
              {i < ranked.length - 1 && <View style={s.hairline} />}
            </View>
          ))}
        </View>

        {/* ── Footer ── */}
        <View style={[s.row, { marginTop: 8 }]}>
          <Text style={[s.small, { color: PURPLE_LINE }]}>ADHERENCE AMPLIFIER · TIME AUDIT · adherenceamplifier.com</Text>
          <View style={s.spacer} />
          <Text style={s.small}>Generated {new Date().toLocaleDateString('en-GB')}</Text>
        </View>

      </Page>
    </Document>
  )
}
