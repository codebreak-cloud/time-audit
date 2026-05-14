import { NextRequest } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ weekStart: string }> },
) {
  const session = await auth()
  if (!session?.user?.id) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { weekStart } = await params
  const week = await prisma.week.findUnique({
    where: { userId_weekStart: { userId: session.user.id, weekStart: new Date(weekStart) } },
  })
  if (!week) return Response.json(null)
  return Response.json({ gran: week.gran, blocks: week.blocks })
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ weekStart: string }> },
) {
  const session = await auth()
  if (!session?.user?.id) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { weekStart } = await params
  const body = await req.json() as { gran: number; blocks: unknown }

  await prisma.week.upsert({
    where: { userId_weekStart: { userId: session.user.id, weekStart: new Date(weekStart) } },
    create: {
      userId: session.user.id,
      weekStart: new Date(weekStart),
      gran: body.gran,
      blocks: body.blocks as object,
    },
    update: {
      gran: body.gran,
      blocks: body.blocks as object,
    },
  })

  return Response.json({ ok: true })
}
