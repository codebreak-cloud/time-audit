import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Grid from '@/components/grid/Grid'
import Results from '@/components/results/Results'
import { computeStats, weekLabel, type Gran, type WeekBlocks } from '@/lib/categories'

interface Props {
  params: Promise<{ token: string }>
}

export default async function SharePage({ params }: Props) {
  const { token } = await params

  const link = await prisma.shareLink.findUnique({
    where: { token },
    include: { user: { select: { email: true } } },
  })

  if (!link) notFound()
  if (link.expiresAt && link.expiresAt < new Date()) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--aa-off-white)' }}>
        <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 28, textTransform: 'uppercase', color: 'var(--aa-purple-ink)' }}>
          This link has expired.
        </div>
      </div>
    )
  }

  // Record first view
  if (!link.viewedAt) {
    await prisma.shareLink.update({ where: { token }, data: { viewedAt: new Date() } })
  }

  const week = await prisma.week.findUnique({
    where: { userId_weekStart: { userId: link.userId, weekStart: link.weekStart } },
  })

  if (!week) notFound()

  const blocks = week.blocks as WeekBlocks
  const gran = week.gran as Gran
  const stats = computeStats(blocks, gran)
  const lbl = weekLabel(new Date(link.weekStart))

  return (
    <div style={{ minHeight: '100vh', background: 'var(--aa-off-white)' }}>
      {/* Read-only banner */}
      <div style={{
        background: 'var(--aa-purple-ink)', color: '#fff',
        padding: '12px 24px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.1em',
      }}>
        <span>READ-ONLY SHARE · {lbl}</span>
        <span style={{ color: 'var(--aa-blue)' }}>ADHERENCE AMPLIFIER TIME AUDIT</span>
      </div>

      <main style={{ padding: '32px 24px 80px', maxWidth: 1440, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 32 }}>
        <div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--aa-purple)', marginBottom: 8 }}>
            Time Audit
          </div>
          <h1 style={{
            margin: 0,
            fontFamily: 'var(--font-heading)', fontWeight: 700,
            fontSize: 'clamp(32px, 4vw, 52px)',
            lineHeight: 0.98, letterSpacing: '-0.02em',
            textTransform: 'uppercase', color: 'var(--aa-purple-ink)',
          }}>Week of {lbl}</h1>
        </div>

        {/* Read-only grid */}
        <div style={{ display: 'flex', border: '2px solid var(--aa-purple-ink)', overflowX: 'auto' }}>
          <Grid
            week={blocks}
            gran={gran}
            activeCat=""
            eraser={false}
            onPaint={() => {}}
            readOnly
          />
        </div>

        {/* Results */}
        <Results stats={stats} tone="lewis" />
      </main>
    </div>
  )
}
