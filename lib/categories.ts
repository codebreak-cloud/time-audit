export const DAY_START_HOUR = 5
export const DAY_END_HOUR = 24
export const HOURS_PER_DAY = DAY_END_HOUR - DAY_START_HOUR // 19

export const GRAN_OPTIONS = [15, 30, 60] as const
export type Gran = 15 | 30 | 60

export const ROW_PX: Record<Gran, number> = { 15: 11, 30: 20, 60: 38 }

export const DAYS = [
  { key: 'mon', short: 'MON', long: 'Monday' },
  { key: 'tue', short: 'TUE', long: 'Tuesday' },
  { key: 'wed', short: 'WED', long: 'Wednesday' },
  { key: 'thu', short: 'THU', long: 'Thursday' },
  { key: 'fri', short: 'FRI', long: 'Friday' },
  { key: 'sat', short: 'SAT', long: 'Saturday' },
  { key: 'sun', short: 'SUN', long: 'Sunday' },
] as const

export type DayKey = typeof DAYS[number]['key']

export type Leverage = 'high' | 'core' | 'drain' | 'self'

export interface Category {
  id: string
  short: string
  label: string
  color: string
  leverage: Leverage
  hint: string
}

export const CATEGORIES: Category[] = [
  { id: 'checkins', short: 'CHECK-INS',   label: 'Client check-ins / messaging',              color: '#584f9c', leverage: 'core',  hint: 'DMs, voice notes, weekly check-ins.' },
  { id: 'program',  short: 'PROGRAMMING', label: 'Programme writing',                          color: '#4bbcfa', leverage: 'high',  hint: 'Training plans, nutrition, periodisation.' },
  { id: 'calls',    short: '1:1 CALLS',   label: '1:1 calls (sales / onboarding / coaching)',  color: '#3d3778', leverage: 'high',  hint: 'Sales calls, onboardings, coaching calls.' },
  { id: 'content',  short: 'CONTENT',     label: 'Content creation',                           color: '#c7a24a', leverage: 'high',  hint: 'Video, posts, scripts, podcasts.' },
  { id: 'admin',    short: 'ADMIN',       label: 'Admin (invoicing, scheduling, email)',        color: '#d4352b', leverage: 'drain', hint: 'Inbox, Stripe, calendar tetris.' },
  { id: 'leads',    short: 'LEAD GEN',    label: 'Lead gen / DMs / outreach',                  color: '#e87a5d', leverage: 'drain', hint: 'Cold DMs, follow-ups, ad checks.' },
  { id: 'cpd',      short: 'CPD',         label: 'Education / CPD / reading',                  color: '#7ea08a', leverage: 'high',  hint: 'Books, courses, peer mentoring.' },
  { id: 'team',     short: 'TEAM',        label: 'Team management',                            color: '#3a8b9c', leverage: 'high',  hint: 'Calls with assistants, SOPs, hiring.' },
  { id: 'training', short: 'TRAINING',    label: 'Own training',                               color: '#1f1b49', leverage: 'self',  hint: 'You training. You eating. You sleeping right.' },
  { id: 'self',     short: 'FAMILY',      label: 'Family / personal',                          color: '#6b6b6b', leverage: 'self',  hint: 'Partner, kids, mates, you-time.' },
]

export const CAT_BY_ID = Object.fromEntries(CATEGORIES.map(c => [c.id, c]))

export const LEVERAGE_META: Record<Leverage, { label: string; blurb: string; color: string }> = {
  high:  { label: 'HIGH-LEVERAGE', blurb: 'Builds the practice.',   color: 'var(--aa-purple)' },
  core:  { label: 'CORE COACHING', blurb: 'The actual job.',         color: 'var(--aa-blue)' },
  drain: { label: 'DRAIN',         blurb: 'Minimise. Systemise.',    color: 'var(--aa-red)' },
  self:  { label: 'OFF THE CLOCK', blurb: 'You. Not the business.',  color: 'var(--aa-grey-500)' },
}

// ----- helpers -----

export function minutesToShortLabel(min: number) {
  const h = Math.floor(min / 60)
  return `${((h + 11) % 12 + 1)}${h < 12 ? 'a' : 'p'}`
}

export function rowsForGran(gran: Gran) {
  return Math.floor((HOURS_PER_DAY * 60) / gran)
}

export function rowToMinutes(rowIdx: number, gran: Gran) {
  return DAY_START_HOUR * 60 + rowIdx * gran
}

export type WeekBlocks = Record<DayKey, (string | null)[]>

export function emptyWeek(gran: Gran): WeekBlocks {
  const rows = rowsForGran(gran)
  return Object.fromEntries(DAYS.map(d => [d.key, Array(rows).fill(null)])) as WeekBlocks
}

export function regridWeek(week: WeekBlocks, oldGran: Gran, newGran: Gran): WeekBlocks {
  const out = emptyWeek(newGran)
  for (const day of DAYS) {
    const oldArr = week[day.key] || []
    for (let i = 0; i < oldArr.length; i++) {
      if (!oldArr[i]) continue
      const startMin = i * oldGran
      const endMin = startMin + oldGran
      const newStart = Math.floor(startMin / newGran)
      const newEnd = Math.ceil(endMin / newGran)
      for (let j = newStart; j < newEnd && j < out[day.key].length; j++) {
        if (!out[day.key][j]) out[day.key][j] = oldArr[i]
      }
    }
  }
  return out
}

export function demoWeek(gran: Gran): WeekBlocks {
  const w = emptyWeek(gran)
  const stepsPerHour = 60 / gran
  const set = (day: DayKey, fromHour: number, toHour: number, catId: string) => {
    const startRow = Math.max(0, Math.round((fromHour - DAY_START_HOUR) * stepsPerHour))
    const endRow = Math.min(w[day].length, Math.round((toHour - DAY_START_HOUR) * stepsPerHour))
    for (let r = startRow; r < endRow; r++) w[day][r] = catId
  }
  set('mon', 6, 7, 'training'); set('mon', 8, 9.5, 'checkins'); set('mon', 9.5, 10, 'admin')
  set('mon', 10, 12, 'program'); set('mon', 13, 15, 'calls'); set('mon', 15, 16, 'admin')
  set('mon', 16, 17.5, 'content'); set('mon', 18, 20, 'self')
  set('tue', 6, 7, 'training'); set('tue', 8, 9, 'checkins'); set('tue', 9, 11, 'content')
  set('tue', 11, 12, 'admin'); set('tue', 13, 16, 'calls'); set('tue', 16, 17.5, 'checkins')
  set('tue', 17.5, 18.5, 'leads'); set('tue', 19, 21, 'self')
  set('wed', 6, 7, 'training'); set('wed', 7.5, 9, 'checkins'); set('wed', 9, 10, 'admin')
  set('wed', 10, 12, 'cpd'); set('wed', 13, 14.5, 'calls'); set('wed', 14.5, 16, 'program')
  set('wed', 16, 17.5, 'admin'); set('wed', 17.5, 19, 'content'); set('wed', 19.5, 22, 'self')
  set('thu', 6, 7, 'training'); set('thu', 8, 10, 'checkins'); set('thu', 10, 11.5, 'admin')
  set('thu', 13, 16, 'calls'); set('thu', 16, 17, 'leads'); set('thu', 17, 18, 'admin')
  set('thu', 18.5, 20, 'self')
  set('fri', 6, 7, 'training'); set('fri', 8, 10, 'checkins'); set('fri', 10, 11, 'team')
  set('fri', 11, 12.5, 'program'); set('fri', 13, 15, 'calls'); set('fri', 15, 16.5, 'admin')
  set('fri', 17, 19, 'self')
  set('sat', 8, 9.5, 'training'); set('sat', 10, 11, 'checkins'); set('sat', 11, 13, 'content')
  set('sat', 14, 22, 'self')
  set('sun', 9, 10, 'training'); set('sun', 10, 11, 'checkins'); set('sun', 11, 12.5, 'cpd')
  set('sun', 13, 14, 'admin'); set('sun', 15, 22, 'self')
  return w
}

export interface Stats {
  byCat: Record<string, number>
  byLev: Record<Leverage, number>
  totalLogged: number
  totalMin: number
}

export function computeStats(week: WeekBlocks, gran: Gran): Stats {
  const byCat: Record<string, number> = {}
  CATEGORIES.forEach(c => (byCat[c.id] = 0))
  let totalLogged = 0
  for (const d of DAYS) {
    const arr = week[d.key] || []
    for (const v of arr) if (v) { byCat[v] = (byCat[v] || 0) + gran; totalLogged += gran }
  }
  const byLev = { high: 0, core: 0, drain: 0, self: 0 } as Record<Leverage, number>
  for (const c of CATEGORIES) byLev[c.leverage] += byCat[c.id] || 0
  const totalMin = DAYS.length * HOURS_PER_DAY * 60
  return { byCat, byLev, totalLogged, totalMin }
}

export function fmtH(min: number) {
  const h = min / 60
  if (h === 0) return '0h'
  if (h < 1) return `${min}m`
  return Number.isInteger(h) ? `${h}h` : `${h.toFixed(1)}h`
}

export function pct(part: number, whole: number) {
  if (!whole) return 0
  return Math.round((part / whole) * 100)
}

export function contrastOn(hex: string) {
  const h = hex.replace('#', '')
  const r = parseInt(h.slice(0, 2), 16)
  const g = parseInt(h.slice(2, 4), 16)
  const b = parseInt(h.slice(4, 6), 16)
  const L = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  return L > 0.62 ? 'var(--aa-purple-ink)' : '#fff'
}

// ----- date helpers -----

export function startOfWeek(d: Date) {
  const x = new Date(d)
  x.setHours(0, 0, 0, 0)
  const dow = (x.getDay() + 6) % 7
  x.setDate(x.getDate() - dow)
  return x
}

export function addDays(d: Date, n: number) {
  const x = new Date(d)
  x.setDate(x.getDate() + n)
  return x
}

export function weekKey(d: Date) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function weekLabel(weekStart: Date) {
  const end = addDays(weekStart, 6)
  const mo = (d: Date) => d.toLocaleString('en-GB', { month: 'short' }).toUpperCase()
  const sameMonth = weekStart.getMonth() === end.getMonth()
  if (sameMonth) return `${weekStart.getDate()} – ${end.getDate()} ${mo(end)} ${end.getFullYear()}`
  return `${weekStart.getDate()} ${mo(weekStart)} – ${end.getDate()} ${mo(end)} ${end.getFullYear()}`
}
