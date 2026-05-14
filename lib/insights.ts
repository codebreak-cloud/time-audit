import { CATEGORIES, fmtH, type Stats } from './categories'

export type Tone = 'lewis' | 'neutral' | 'utility'

export interface Insight {
  kind: 'headline' | 'warn' | 'good' | 'note'
  text: string
}

export function buildInsights(stats: Stats, tone: Tone): Insight[] {
  const { byCat, byLev, totalLogged } = stats
  const lines: Insight[] = []

  if (totalLogged === 0) {
    if (tone === 'utility') return [{ kind: 'note', text: 'No data yet.' }]
    return [{
      kind: 'note',
      text: tone === 'lewis'
        ? "You haven't logged anything yet. Get the week down on paper before you start telling yourself stories."
        : 'Nothing logged yet. Map your week before drawing conclusions.',
    }]
  }

  const top = CATEGORIES.map(c => ({ ...c, v: byCat[c.id] || 0 }))
    .filter(c => c.v > 0).sort((a, b) => b.v - a.v)
  const biggest = top[0]

  const adminH = (byCat.admin || 0) / 60
  const leadsH = (byCat.leads || 0) / 60
  const callsH = (byCat.calls || 0) / 60
  const progH = (byCat.program || 0) / 60
  const contentH = (byCat.content || 0) / 60
  const checkH = (byCat.checkins || 0) / 60
  const cpdH = (byCat.cpd || 0) / 60
  const trainH = (byCat.training || 0) / 60
  const selfH = (byCat.self || 0) / 60
  const highH = byLev.high / 60
  const drainH = byLev.drain / 60

  const L = (lewis: string, neutral: string, utility: string) =>
    tone === 'utility' ? utility : tone === 'neutral' ? neutral : lewis

  lines.push({
    kind: 'headline',
    text: L(
      `Biggest sink: ${biggest.label.toUpperCase()} — ${fmtH(biggest.v)}. That's where your week actually went.`,
      `Top category: ${biggest.label} at ${fmtH(biggest.v)}.`,
      `Top: ${biggest.label} ${fmtH(biggest.v)}.`,
    ),
  })

  if (adminH >= 8) {
    lines.push({ kind: 'warn', text: L(
      `${adminH.toFixed(1)}h on admin. That's a full working day spent doing nothing that grows the business. Systemise it or hire it out.`,
      `${adminH.toFixed(1)}h on admin this week. Consider systemising or delegating.`,
      `Admin: ${adminH.toFixed(1)}h.`,
    )})
  } else if (adminH >= 5) {
    lines.push({ kind: 'warn', text: L(
      `${adminH.toFixed(1)}h on admin. Not catastrophic, but it's a tax you keep paying. SOP it.`,
      `${adminH.toFixed(1)}h on admin. Look for repeatable bits to automate.`,
      `Admin: ${adminH.toFixed(1)}h.`,
    )})
  }

  if (leadsH > callsH && leadsH >= 3) {
    lines.push({ kind: 'warn', text: L(
      `${leadsH.toFixed(1)}h chasing leads, ${callsH.toFixed(1)}h on actual calls. You're shouting at the front door while the people inside are walking out the back.`,
      `Lead gen (${leadsH.toFixed(1)}h) exceeded calls (${callsH.toFixed(1)}h). Pay attention to retention before acquisition.`,
      `Leads ${leadsH.toFixed(1)}h > Calls ${callsH.toFixed(1)}h.`,
    )})
  }

  if (progH === 0 && totalLogged > 60 * 5) {
    lines.push({ kind: 'warn', text: L(
      `Zero hours writing programmes. What are your clients actually following — vibes?`,
      `No time logged for programme writing this week.`,
      `Programme: 0h.`,
    )})
  } else if (progH > 0 && progH < 2 && totalLogged > 60 * 20) {
    lines.push({ kind: 'note', text: L(
      `Only ${progH.toFixed(1)}h on programming. The thing they're paying you for is getting the smallest slice of the pie.`,
      `Programming time was light (${progH.toFixed(1)}h) relative to total hours.`,
      `Programme: ${progH.toFixed(1)}h.`,
    )})
  }

  if (highH >= 20) {
    lines.push({ kind: 'good', text: L(
      `${highH.toFixed(1)}h on high-leverage work. That's a practice being built. Keep going.`,
      `${highH.toFixed(1)}h on high-leverage work — solid foundation.`,
      `High-leverage: ${highH.toFixed(1)}h.`,
    )})
  } else if (highH >= 10) {
    lines.push({ kind: 'good', text: L(
      `${highH.toFixed(1)}h on high-leverage work. Decent. Push it to 20+ and the business starts compounding.`,
      `${highH.toFixed(1)}h on high-leverage work. Room to grow.`,
      `High-leverage: ${highH.toFixed(1)}h.`,
    )})
  } else if (highH < 5 && totalLogged > 60 * 15) {
    lines.push({ kind: 'warn', text: L(
      `Under ${Math.ceil(highH)}h on high-leverage work all week. You're not running a coaching practice — you're running a really polite admin job.`,
      `Less than 5h on high-leverage work. Identify what's compounding.`,
      `High-leverage: ${highH.toFixed(1)}h.`,
    )})
  }

  if (byLev.drain > byLev.high && byLev.drain > 60 * 6) {
    lines.push({ kind: 'warn', text: L(
      `More time on drain than on high-leverage work. Read that back to yourself. That's the trap.`,
      `Drain hours exceeded high-leverage hours this week.`,
      `Drain > High-leverage.`,
    )})
  }

  if (checkH >= 12) {
    lines.push({ kind: 'note', text: L(
      `${checkH.toFixed(1)}h on check-ins. Are they getting better, or are you just typing more? Templates exist for a reason.`,
      `${checkH.toFixed(1)}h on client check-ins. Audit whether structure could speed these up.`,
      `Check-ins: ${checkH.toFixed(1)}h.`,
    )})
  }

  if (cpdH === 0 && totalLogged > 60 * 20) {
    lines.push({ kind: 'note', text: L(
      `No CPD this week. The coaches eating your lunch in 2026 are reading this weekend.`,
      `No CPD logged. Carve a slot if you can.`,
      `CPD: 0h.`,
    )})
  }

  if (trainH < 2 && totalLogged > 60 * 30) {
    lines.push({ kind: 'note', text: L(
      `${trainH.toFixed(1)}h training yourself. Bit on the nose, isn't it — you're selling fitness.`,
      `Limited training time logged (${trainH.toFixed(1)}h).`,
      `Own training: ${trainH.toFixed(1)}h.`,
    )})
  }

  if (selfH < 4 && totalLogged > 60 * 40) {
    lines.push({ kind: 'warn', text: L(
      `Under 4h for family / personal across the whole week. That's not hustle, that's how coaches burn out and quit.`,
      `Limited personal time (${selfH.toFixed(1)}h). Sustainability matters.`,
      `Family/personal: ${selfH.toFixed(1)}h.`,
    )})
  }

  if (contentH >= 10) {
    lines.push({ kind: 'note', text: L(
      `${contentH.toFixed(1)}h on content. If it's converting and your clients are staying, fine. If not, you're a content creator with a coaching hobby.`,
      `${contentH.toFixed(1)}h on content — check the return.`,
      `Content: ${contentH.toFixed(1)}h.`,
    )})
  }

  if (lines.length === 1) {
    lines.push({ kind: 'note', text: L(
      `Nothing else screams off the page. Look at the donut, decide what's getting cut next week.`,
      `Nothing else stands out — review the donut and plan adjustments.`,
      `Review chart.`,
    )})
  }

  return lines
}
