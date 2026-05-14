'use client'

import { useState, useMemo, useCallback, useEffect, useRef } from 'react'
import {
  CATEGORIES, computeStats, emptyWeek, regridWeek, demoWeek,
  startOfWeek, addDays, weekKey, weekLabel, fmtH,
  type Gran, type WeekBlocks,
} from '@/lib/categories'
import { type Tone } from '@/lib/insights'
import Grid from './grid/Grid'
import Palette from './grid/Palette'
import Results from './results/Results'
import GranToggle from './ui/GranToggle'
import TopBar from './ui/TopBar'

interface StoredWeek {
  gran: Gran
  week: WeekBlocks
}

const STORAGE_KEY = 'aa-time-audit-v1'

interface AuditPageProps {
  initialWeekStart?: string       // ISO date string YYYY-MM-DD
  initialBlocks?: WeekBlocks      // from DB if logged in
  initialGran?: Gran
  userId?: string
  tonePref?: Tone
}

export default function AuditPage({
  initialWeekStart,
  initialBlocks,
  initialGran = 30,
  userId,
  tonePref = 'lewis',
}: AuditPageProps) {
  const [tone] = useState<Tone>(tonePref)
  const [gran, setGranState] = useState<Gran>(initialGran)
  const [activeCat, setActiveCat] = useState('program')
  const [eraser, setEraser] = useState(false)
  const [shareUrl, setShareUrl] = useState<string | null>(null)
  const [sharing, setSharing] = useState(false)

  const [weekStart, setWeekStart] = useState(() => {
    if (initialWeekStart) return new Date(initialWeekStart + 'T00:00:00')
    return startOfWeek(new Date())
  })

  // Start with server-provided data (or empty). Merge localStorage in useEffect
  // after mount to avoid SSR/client hydration mismatch.
  const [weeks, setWeeks] = useState<Record<string, StoredWeek>>(() => {
    if (initialBlocks && initialWeekStart) {
      return { [initialWeekStart]: { gran: initialGran, week: initialBlocks } }
    }
    const seedKey = weekKey(startOfWeek(new Date()))
    return { [seedKey]: { gran: 30, week: demoWeek(30) } }
  })

  // Hydrate from localStorage once on the client after first render
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (!raw) return
      const saved = JSON.parse(raw) as Record<string, StoredWeek>
      // If the server gave us DB data for this week, that takes priority.
      // Otherwise merge in everything from localStorage.
      setWeeks(prev => {
        const merged = { ...saved, ...prev }
        return merged
      })
    } catch {}
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const curKey = weekKey(weekStart)
  const stored = weeks[curKey]

  const currentWeek = useMemo<WeekBlocks>(() => {
    if (!stored) return emptyWeek(gran)
    if (stored.gran === gran) return stored.week
    return regridWeek(stored.week, stored.gran, gran)
  }, [stored, gran])

  // Persist to localStorage
  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(weeks)) } catch {}
  }, [weeks])

  // Debounced DB save
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const saveToDb = useCallback((key: string, gran: Gran, week: WeekBlocks) => {
    if (!userId) return
    if (saveTimer.current) clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(async () => {
      await fetch(`/api/week/${key}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gran, blocks: week }),
      })
    }, 500)
  }, [userId])

  const setGran = (g: Gran) => {
    setGranState(g)
    // Regrid and persist immediately when gran changes
    if (stored && stored.gran !== g) {
      const regrided = regridWeek(stored.week, stored.gran, g)
      setWeeks(prev => ({ ...prev, [curKey]: { gran: g, week: regrided } }))
    }
  }

  const setWeek = useCallback((updater: (prev: WeekBlocks) => WeekBlocks) => {
    setWeeks(prev => {
      const cur = prev[curKey] && prev[curKey].gran === gran
        ? prev[curKey].week
        : (prev[curKey] ? regridWeek(prev[curKey].week, prev[curKey].gran, gran) : emptyWeek(gran))
      const next = updater(cur)
      saveToDb(curKey, gran, next)
      return { ...prev, [curKey]: { gran, week: next } }
    })
  }, [curKey, gran, saveToDb])

  const onPaint = useCallback((dayKey: string, rowIdx: number, value: string | null) => {
    setWeek(week => {
      if (week[dayKey as keyof WeekBlocks][rowIdx] === value) return week
      const nextArr = [...week[dayKey as keyof WeekBlocks]]
      nextArr[rowIdx] = value
      return { ...week, [dayKey]: nextArr }
    })
  }, [setWeek])

  const onClearAll = () => {
    if (!confirm('Wipe the whole week? Your logged blocks will be gone.')) return
    const empty = emptyWeek(gran)
    setWeeks(prev => ({ ...prev, [curKey]: { gran, week: empty } }))
    saveToDb(curKey, gran, empty)
  }

  const onShiftWeek = (delta: number) => {
    const next = addDays(weekStart, delta * 7)
    setWeekStart(next)
    const nextKey = weekKey(next)
    setWeeks(prev => {
      if (prev[nextKey]) return prev
      return { ...prev, [nextKey]: { gran, week: emptyWeek(gran) } }
    })
  }

  const [pdfLoading, setPdfLoading] = useState(false)

  const onPrint = async () => {
    setPdfLoading(true)
    try {
      // Generate PDF client-side from current in-memory data — no server needed
      const { pdf } = await import('@react-pdf/renderer')
      const { PdfReport } = await import('@/lib/PdfReport')
      const { createElement } = await import('react')
      const blob = await pdf(
        createElement(PdfReport, {
          weekStart,
          gran,
          blocks: currentWeek,
          tone,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        }) as any
      ).toBlob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `time-audit-${curKey}.pdf`
      a.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error('PDF error:', err)
      alert('PDF generation failed.')
    } finally {
      setPdfLoading(false)
    }
  }

  const onShareWeek = async () => {
    if (!userId) { alert('Sign in to create share links.'); return }
    setSharing(true)
    try {
      const res = await fetch('/api/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ weekStart: curKey }),
      })
      const data = await res.json()
      if (data.url) {
        setShareUrl(data.url)
        await navigator.clipboard.writeText(data.url).catch(() => {})
      }
    } finally {
      setSharing(false)
    }
  }

  const stats = useMemo(() => computeStats(currentWeek, gran), [currentWeek, gran])
  const lbl = weekLabel(weekStart)

  const drainH = stats.byLev.drain / 60
  const highH = stats.byLev.high / 60

  const kpis = [
    { eyebrow: 'TOTAL LOGGED', value: fmtH(stats.totalLogged), sub: `of ${fmtH(stats.totalMin)} this week`, tone: 'plain' as const },
    { eyebrow: 'HIGH-LEVERAGE', value: fmtH(stats.byLev.high), sub: `${Math.round((stats.byLev.high / (stats.totalLogged || 1)) * 100)}% of logged time`, tone: 'good' as const },
    { eyebrow: 'DRAIN', value: fmtH(stats.byLev.drain), sub: drainH > highH ? 'more than high-leverage' : 'minimise / systemise', tone: (drainH > highH ? 'bad' : 'plain') as 'bad' | 'plain' },
    { eyebrow: 'OFF THE CLOCK', value: fmtH(stats.byLev.self), sub: 'training + family + you', tone: 'plain' as const },
  ]

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <TopBar weekLabel={lbl} onPrint={onPrint} pdfLoading={pdfLoading} onShiftWeek={onShiftWeek} onShareWeek={onShareWeek} userId={userId} />

      {shareUrl && (
        <div style={{
          background: 'var(--aa-blue)', color: 'var(--aa-purple-ink)',
          padding: '12px 24px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          fontFamily: 'var(--font-body)', fontSize: 14, gap: 16,
        }}>
          <span>Share link copied: <strong>{shareUrl}</strong></span>
          <button onClick={() => setShareUrl(null)} style={{
            border: '1px solid var(--aa-purple-ink)', background: 'transparent',
            padding: '4px 10px', cursor: 'pointer', fontWeight: 700, fontSize: 12,
          }}>✕</button>
        </div>
      )}

      <main style={{
        padding: '32px 24px 80px',
        display: 'flex', flexDirection: 'column', gap: 32,
        maxWidth: 1440, width: '100%', margin: '0 auto', flex: 1,
      }}>
        {/* Print header — only visible when printing */}
        <div className="print-only" style={{ paddingBottom: 20, borderBottom: '2px solid var(--aa-purple-ink)', marginBottom: 20 }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--aa-purple)', marginBottom: 6 }}>
            Time Audit · Adherence Amplifier
          </div>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 36, letterSpacing: '-0.02em', textTransform: 'uppercase', color: 'var(--aa-purple-ink)', margin: '0 0 6px', lineHeight: 1 }}>
            Week of {lbl}
          </h1>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--aa-grey-700)' }}>
            {fmtH(stats.totalLogged)} logged · {gran}-min granularity · Top 5: {
              CATEGORIES.map(c => ({ ...c, value: stats.byCat[c.id] || 0 }))
                .filter(r => r.value > 0).sort((a, b) => b.value - a.value).slice(0, 5)
                .map(t => t.short).join(' · ')
            }
          </div>
        </div>

        {/* Step 1 + KPIs */}
        <div>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 24, flexWrap: 'wrap', marginBottom: 16 }}>
            <div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--aa-purple)', marginBottom: 8 }}>
                Step 1
              </div>
              <h2 style={{
                margin: 0,
                fontFamily: 'var(--font-heading)', fontWeight: 700,
                fontSize: 'clamp(28px, 3.6vw, 44px)',
                lineHeight: 0.98, letterSpacing: '-0.02em',
                textTransform: 'uppercase', color: 'var(--aa-purple-ink)',
                maxWidth: 820,
              }}>Log every block. Mon → Sun.</h2>
              <p style={{ margin: '10px 0 0', fontFamily: 'var(--font-body)', fontSize: 15.5, fontWeight: 500, color: 'var(--aa-grey-700)', maxWidth: 720, lineHeight: 1.45 }}>
                Click + drag across the grid. Be honest — this only works if you log the week you actually had, not the one you wish you&apos;d had.
              </p>
            </div>
            <GranToggle value={gran} onChange={setGran} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14, marginTop: 18 }}>
            {kpis.map((k, i) => (
              <div key={i} style={{
                border: '2px solid var(--aa-purple-ink)',
                background: k.tone === 'good' ? 'var(--aa-purple)' : k.tone === 'bad' ? 'var(--aa-red)' : 'var(--aa-white)',
                color: k.tone !== 'plain' ? '#fff' : 'var(--aa-purple-ink)',
                padding: '16px 18px',
              }}>
                <div style={{
                  fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: 6,
                  color: k.tone === 'plain' ? 'var(--aa-purple)' : k.tone === 'good' ? 'var(--aa-blue)' : 'rgba(255,255,255,0.85)',
                }}>{k.eyebrow}</div>
                <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 34, lineHeight: 1, letterSpacing: '-0.02em', textTransform: 'uppercase' }}>
                  {k.value}
                </div>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: 12.5, marginTop: 6, color: k.tone === 'plain' ? 'var(--aa-grey-500)' : 'rgba(255,255,255,0.85)' }}>
                  {k.sub}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Painter row */}
        <div style={{
          display: 'flex', alignItems: 'stretch', gap: 0,
          border: '2px solid var(--aa-purple-ink)',
          background: 'var(--aa-off-white)',
          overflowX: 'auto',
        }}>
          <Palette
            activeCat={activeCat}
            onPick={(id) => { setActiveCat(id); setEraser(false) }}
            eraser={eraser}
            onEraser={() => setEraser(e => !e)}
            onClearAll={onClearAll}
          />
          <Grid
            week={currentWeek}
            gran={gran}
            activeCat={activeCat}
            eraser={eraser}
            onPaint={onPaint}
          />
        </div>

        {/* Results */}
        <div style={{ borderTop: '2px solid var(--aa-purple-ink)', paddingTop: 24, marginTop: 8 }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--aa-purple)', marginBottom: 8 }}>
            The audit
          </div>
          <h2 style={{
            margin: '0 0 32px',
            fontFamily: 'var(--font-heading)', fontWeight: 700,
            fontSize: 'clamp(28px, 3.6vw, 44px)',
            lineHeight: 0.98, letterSpacing: '-0.02em',
            textTransform: 'uppercase', color: 'var(--aa-purple-ink)',
          }}>So where did it actually go?</h2>
        </div>

        <Results stats={stats} tone={tone} />

        <footer className="no-print" style={{
          marginTop: 32, paddingTop: 24,
          borderTop: '1px solid var(--aa-purple-line)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          gap: 16, flexWrap: 'wrap',
          fontFamily: 'var(--font-mono)', fontSize: 11,
          letterSpacing: '0.06em', color: 'var(--aa-grey-500)',
        }}>
          <div>ADHERENCE AMPLIFIER · TIME AUDIT · MAKE COACHING GREAT AGAIN.</div>
          <div>Your data lives in this browser. Hit &quot;Save PDF&quot; to export.</div>
        </footer>
      </main>
    </div>
  )
}
