import { NextRequest } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { customAlphabet } from 'nanoid'

const nanoid = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz', 24)

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json() as { weekStart: string; expiryDays?: number }
  const expiresAt = body.expiryDays
    ? new Date(Date.now() + body.expiryDays * 24 * 60 * 60 * 1000)
    : null

  const token = nanoid()

  await prisma.shareLink.create({
    data: {
      token,
      userId: session.user.id,
      weekStart: new Date(body.weekStart),
      expiresAt,
    },
  })

  const baseUrl = process.env.NEXTAUTH_URL || `https://${req.headers.get('host')}`
  const url = `${baseUrl}/share/${token}`

  return Response.json({ url, token })
}
