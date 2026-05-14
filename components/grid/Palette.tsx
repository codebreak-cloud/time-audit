'use client'

import { CATEGORIES } from '@/lib/categories'

interface PaletteProps {
  activeCat: string
  onPick: (id: string) => void
  eraser: boolean
  onEraser: () => void
  onClearAll: () => void
}

export default function Palette({ activeCat, onPick, eraser, onEraser, onClearAll }: PaletteProps) {
  return (
    <aside className="ta-palette no-print" style={{
      width: 260, flex: '0 0 260px',
      background: 'var(--aa-bone)',
      borderRight: '2px solid var(--aa-purple-ink)',
      padding: '20px 18px',
      display: 'flex', flexDirection: 'column', gap: 14,
      alignSelf: 'stretch',
    }}>
      <div>
        <div style={{
          fontFamily: 'var(--font-mono)', fontWeight: 600,
          fontSize: 11, letterSpacing: '0.18em', color: 'var(--aa-purple)',
          marginBottom: 8, textTransform: 'uppercase',
        }}>The brush</div>
        <div style={{
          fontFamily: 'var(--font-heading)', fontWeight: 700,
          fontSize: 18, textTransform: 'uppercase',
          letterSpacing: '-0.01em', lineHeight: 1.1,
          color: 'var(--aa-purple-ink)',
        }}>Pick a category.<br />Drag across the grid.</div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {CATEGORIES.map((c, idx) => {
          const active = !eraser && activeCat === c.id
          return (
            <button key={c.id}
              onClick={() => onPick(c.id)}
              aria-label={`Select category ${c.label}`}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '8px 10px',
                background: active ? '#fff' : 'transparent',
                border: active ? '2px solid var(--aa-purple-ink)' : '2px solid transparent',
                borderRadius: 0, cursor: 'pointer', textAlign: 'left',
                transition: 'background 120ms',
              }}>
              <span style={{
                width: 22, height: 22, flex: '0 0 22px',
                background: c.color,
                border: '1.5px solid var(--aa-purple-ink)',
              }} />
              <span style={{
                fontFamily: 'var(--font-heading)', fontWeight: 700,
                fontSize: 12, letterSpacing: '0.06em',
                textTransform: 'uppercase', color: 'var(--aa-purple-ink)',
                lineHeight: 1.1,
              }}>{c.short}</span>
              {active && (
                <span style={{
                  marginLeft: 'auto',
                  fontFamily: 'var(--font-mono)', fontSize: 10,
                  letterSpacing: '0.14em', color: 'var(--aa-purple)',
                }}>▌</span>
              )}
            </button>
          )
        })}
      </div>

      <hr style={{ border: 0, borderTop: '1px solid var(--aa-purple-line)', margin: '6px 0' }} />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <button
          onClick={onEraser}
          style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '8px 10px',
            background: eraser ? '#fff' : 'transparent',
            border: eraser ? '2px solid var(--aa-purple-ink)' : '2px solid transparent',
            borderRadius: 0, cursor: 'pointer',
          }}>
          <span style={{
            width: 22, height: 22, flex: '0 0 22px',
            background: 'repeating-linear-gradient(45deg, #fff 0 4px, var(--aa-purple-line) 4px 8px)',
            border: '1.5px solid var(--aa-purple-ink)',
          }} />
          <span style={{
            fontFamily: 'var(--font-heading)', fontWeight: 700,
            fontSize: 12, letterSpacing: '0.06em', textTransform: 'uppercase',
          }}>Eraser</span>
        </button>

        <button
          onClick={onClearAll}
          style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '8px 10px', background: 'transparent',
            border: '2px solid transparent', borderRadius: 0,
            cursor: 'pointer', color: 'var(--aa-red)',
          }}>
          <span style={{
            width: 22, height: 22, flex: '0 0 22px',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            border: '1.5px solid var(--aa-red)', color: 'var(--aa-red)',
            fontWeight: 700, fontSize: 14,
          }}>×</span>
          <span style={{
            fontFamily: 'var(--font-heading)', fontWeight: 700,
            fontSize: 12, letterSpacing: '0.06em', textTransform: 'uppercase',
          }}>Wipe the week</span>
        </button>
      </div>

      <hr style={{ border: 0, borderTop: '1px solid var(--aa-purple-line)', margin: '6px 0' }} />

      <div style={{
        fontFamily: 'var(--font-body)', fontSize: 12.5, lineHeight: 1.55,
        color: 'var(--aa-grey-700)',
      }}>
        <div style={{
          fontFamily: 'var(--font-mono)', fontSize: 10,
          letterSpacing: '0.18em', textTransform: 'uppercase',
          color: 'var(--aa-purple)', marginBottom: 6,
        }}>How to use</div>
        Click + drag to paint blocks. Drag <em>over</em> filled blocks to overwrite. Eraser clears.
        Don&apos;t lie to yourself — log the week you <em>actually</em> had.
      </div>
    </aside>
  )
}
