'use client'

import { useEffect, useRef } from 'react'
import {
  DAYS, CAT_BY_ID, ROW_PX, rowsForGran, rowToMinutes, minutesToShortLabel, contrastOn,
  type Gran, type WeekBlocks,
} from '@/lib/categories'

function fmtH(min: number) {
  const h = min / 60
  if (h === 0) return null
  if (h < 1) return `${min}m`
  return Number.isInteger(h) ? `${h}h` : `${h.toFixed(1)}h`
}

function DayTotal({ week, dayKey, gran }: { week: WeekBlocks; dayKey: string; gran: Gran }) {
  const arr = week[dayKey as keyof WeekBlocks] || []
  const min = arr.filter(Boolean).length * gran
  const label = fmtH(min)
  if (!label) return (
    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--aa-grey-300)', letterSpacing: '0.06em' }}>—</span>
  )
  return (
    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 500, color: 'var(--aa-purple)', letterSpacing: 0 }}>{label}</span>
  )
}

interface GridProps {
  week: WeekBlocks
  gran: Gran
  activeCat: string
  eraser: boolean
  onPaint: (dayKey: string, rowIdx: number, value: string | null) => void
  readOnly?: boolean
}

export default function Grid({ week, gran, activeCat, eraser, onPaint, readOnly = false }: GridProps) {
  const rows = rowsForGran(gran)
  const rowPx = ROW_PX[gran]
  const stepsPerHour = 60 / gran
  const dayColMin = 96

  const drag = useRef({ active: false, mode: null as null | { kind: 'erase' } | { kind: 'paint'; value: string }, lastKey: null as null | string })

  const beginPaint = (dayKey: string, rowIdx: number, e: React.PointerEvent) => {
    if (readOnly) return
    e.preventDefault()
    const current = week[dayKey as keyof WeekBlocks][rowIdx]
    let mode: typeof drag.current.mode
    if (eraser) mode = { kind: 'erase' }
    else if (current === activeCat) mode = { kind: 'erase' }
    else mode = { kind: 'paint', value: activeCat }
    drag.current = { active: true, mode, lastKey: null }
    applyTo(dayKey, rowIdx, mode)
  }

  const applyTo = (dayKey: string, rowIdx: number, mode: typeof drag.current.mode) => {
    if (!mode) return
    const key = `${dayKey}:${rowIdx}`
    if (drag.current.lastKey === key) return
    drag.current.lastKey = key
    onPaint(dayKey, rowIdx, mode.kind === 'erase' ? null : mode.value)
  }

  useEffect(() => {
    const end = () => { drag.current.active = false; drag.current.lastKey = null }
    window.addEventListener('pointerup', end)
    window.addEventListener('pointercancel', end)
    return () => {
      window.removeEventListener('pointerup', end)
      window.removeEventListener('pointercancel', end)
    }
  }, [])

  const isHourBoundary = (i: number) => i % stepsPerHour === 0
  const isHalfHourBoundary = (i: number) => gran < 30 && (i * gran) % 30 === 0

  return (
    <div className="ta-grid-wrap ta-noselect" style={{
      background: 'var(--aa-white)',
      border: '2px solid var(--aa-purple-ink)',
      flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0,
    }}>
      {/* Day header */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: `64px repeat(7, minmax(${dayColMin}px, 1fr))`,
        borderBottom: '2px solid var(--aa-purple-ink)',
        background: 'var(--aa-off-white)',
      }}>
        <div style={{
          padding: '10px 8px',
          fontFamily: 'var(--font-mono)', fontSize: 10,
          letterSpacing: '0.18em', textTransform: 'uppercase',
          color: 'var(--aa-grey-500)',
          borderRight: '1px solid var(--aa-purple-line)',
        }}>TIME</div>
        {DAYS.map((d, i) => (
          <div key={d.key} style={{
            padding: '10px 12px',
            borderRight: i < 6 ? '1px solid var(--aa-purple-line)' : 'none',
            fontFamily: 'var(--font-heading)', fontWeight: 700,
            fontSize: 14, letterSpacing: '0.06em', color: 'var(--aa-purple-ink)',
            display: 'flex', alignItems: 'baseline', gap: 6,
          }}>
            <span style={{ textTransform: 'uppercase' }}>{d.short}</span>
            <DayTotal week={week} dayKey={d.key} gran={gran} />
          </div>
        ))}
      </div>

      {/* Body */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: `64px repeat(7, minmax(${dayColMin}px, 1fr))`,
        position: 'relative',
      }}>
        {/* Time column */}
        <div style={{ borderRight: '1px solid var(--aa-purple-line)', background: 'var(--aa-off-white)' }}>
          {Array.from({ length: rows }).map((_, i) => {
            const min = rowToMinutes(i, gran)
            const showLabel = isHourBoundary(i)
            return (
              <div key={i} style={{
                height: rowPx,
                borderTop: isHourBoundary(i) && i !== 0 ? '1px solid var(--aa-purple-line)' : 'none',
                position: 'relative',
              }}>
                {showLabel && (
                  <div style={{
                    position: 'absolute', top: -1, right: 6,
                    transform: i === 0 ? 'translateY(0)' : 'translateY(-50%)',
                    fontFamily: 'var(--font-mono)', fontSize: 10,
                    fontWeight: 500, letterSpacing: '0.04em',
                    color: 'var(--aa-grey-500)',
                    background: 'var(--aa-off-white)',
                    padding: '0 2px', pointerEvents: 'none',
                  }}>{minutesToShortLabel(min)}</div>
                )}
              </div>
            )
          })}
        </div>

        {/* Day columns */}
        {DAYS.map((d, di) => (
          <div key={d.key} style={{
            borderRight: di < 6 ? '1px solid var(--aa-purple-line)' : 'none',
            position: 'relative',
          }}>
            {Array.from({ length: rows }).map((_, i) => {
              const v = week[d.key as keyof WeekBlocks][i]
              const cat = v ? CAT_BY_ID[v] : null
              const above = i > 0 ? week[d.key as keyof WeekBlocks][i - 1] : null
              const isRunStart = v && v !== above
              const min = rowToMinutes(i, gran)
              const dayLabel = d.long
              const catLabel = cat ? cat.label : 'Empty'
              const hourStr = minutesToShortLabel(min)

              return (
                <div key={i}
                  data-day={d.key}
                  data-row={i}
                  role={readOnly ? undefined : 'button'}
                  aria-label={`${dayLabel} ${hourStr}, ${catLabel}`}
                  onPointerDown={(e) => beginPaint(d.key, i, e)}
                  onPointerEnter={() => {
                    if (!drag.current.active) return
                    applyTo(d.key, i, drag.current.mode)
                  }}
                  style={{
                    height: rowPx,
                    background: cat ? cat.color : 'transparent',
                    borderTop: isHourBoundary(i) && i !== 0
                      ? '1px solid var(--aa-purple-line)'
                      : isHalfHourBoundary(i)
                        ? '1px dashed rgba(201,205,224,0.6)'
                        : 'none',
                    cursor: readOnly ? 'default' : 'crosshair',
                    position: 'relative',
                    touchAction: 'none',
                  }}
                >
                  {isRunStart && rowPx >= 18 && cat && (
                    <span style={{
                      position: 'absolute', top: 1, left: 4,
                      fontFamily: 'var(--font-heading)', fontWeight: 700,
                      fontSize: 9, letterSpacing: '0.06em',
                      textTransform: 'uppercase',
                      color: contrastOn(cat.color),
                      pointerEvents: 'none',
                      whiteSpace: 'nowrap', overflow: 'hidden',
                      textOverflow: 'ellipsis', maxWidth: 'calc(100% - 6px)',
                      lineHeight: 1.05,
                    }}>{cat.short}</span>
                  )}
                </div>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}
