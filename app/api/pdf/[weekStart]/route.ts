import { NextRequest } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { renderToBuffer } from '@react-pdf/renderer'
import { createElement } from 'react'
import { PdfReport } from '@/lib/PdfReport'
import { type Gran, type WeekBlocks } from '@/lib/categories'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ weekStart: string }> },
) {
  const session = await auth()
  if (!session?.user?.id) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { weekStart } = await params

  const [week, user] = await Promise.all([
    prisma.week.findUnique({
      where: { userId_weekStart: { userId: session.user.id, weekStart: new Date(weekStart) } },
    }),
    prisma.user.findUnique({ where: { id: session.user.id }, select: { tonePref: true } }),
  ])

  if (!week) return Response.json({ error: 'Week not found' }, { status: 404 })

  const tone = (user?.tonePref ?? 'lewis') as 'lewis' | 'neutral' | 'utility'

  const el = createElement(PdfReport, {
    weekStart: new Date(weekStart),
    gran: week.gran as Gran,
    blocks: week.blocks as WeekBlocks,
    tone,
  })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pdf = await renderToBuffer(el as any)

  return new Response(pdf as unknown as BodyInit, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="time-audit-${weekStart}.pdf"`,
    },
  })
}
