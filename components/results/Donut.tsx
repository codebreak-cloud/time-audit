import { fmtH } from '@/lib/categories'

interface DonutSegment {
  id: string
  color: string
  value: number
}

interface DonutProps {
  data: DonutSegment[]
  size?: number
  stroke?: number
}

export default function Donut({ data, size = 220, stroke = 38 }: DonutProps) {
  const total = data.reduce((s, d) => s + d.value, 0)
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const cx = size / 2
  const cy = size / 2

  if (total === 0) {
    return (
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--aa-purple-line)" strokeWidth={stroke} />
        <text x={cx} y={cy - 4} textAnchor="middle"
          style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 22, fill: 'var(--aa-purple-ink)', textTransform: 'uppercase' }}>
          0H
        </text>
        <text x={cx} y={cy + 16} textAnchor="middle"
          style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.16em', fill: 'var(--aa-grey-500)', textTransform: 'uppercase' }}>
          NOTHING LOGGED
        </text>
      </svg>
    )
  }

  let offset = 0
  const segs = data
    .filter(d => d.value > 0)
    .map(d => {
      const len = (d.value / total) * c
      const seg = { ...d, dasharray: `${len} ${c - len}`, dashoffset: -offset }
      offset += len
      return seg
    })

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ display: 'block' }}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--aa-purple-tint)" strokeWidth={stroke} />
      {segs.map((s, i) => (
        <circle key={i} cx={cx} cy={cy} r={r}
          fill="none" stroke={s.color} strokeWidth={stroke}
          strokeDasharray={s.dasharray}
          strokeDashoffset={s.dashoffset}
          transform={`rotate(-90 ${cx} ${cy})`}
        />
      ))}
      <text x={cx} y={cy - 2} textAnchor="middle"
        style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 30, fill: 'var(--aa-purple-ink)', textTransform: 'uppercase', letterSpacing: '-0.01em' }}>
        {fmtH(total).toUpperCase()}
      </text>
      <text x={cx} y={cy + 18} textAnchor="middle"
        style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.16em', fill: 'var(--aa-grey-500)', textTransform: 'uppercase' }}>
        LOGGED THIS WEEK
      </text>
    </svg>
  )
}
