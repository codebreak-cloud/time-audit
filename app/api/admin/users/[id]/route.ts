import { NextRequest } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

async function requireAdmin() {
  const session = await auth()
  if (!session?.user?.id) return null
  const user = await prisma.user.findUnique({ where: { id: session.user.id }, select: { isAdmin: true } })
  return user?.isAdmin ? session : null
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!await requireAdmin()) return Response.json({ error: 'Forbidden' }, { status: 403 })
  const { id } = await params
  await prisma.user.delete({ where: { id } })
  return Response.json({ ok: true })
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!await requireAdmin()) return Response.json({ error: 'Forbidden' }, { status: 403 })
  const { id } = await params
  const body = await req.json()

  if ('isAdmin' in body) {
    await prisma.user.update({ where: { id }, data: { isAdmin: body.isAdmin } })
  }

  if (body.password) {
    if (body.password.length < 8) return Response.json({ error: 'Password too short' }, { status: 400 })
    const passwordHash = await bcrypt.hash(body.password, 12)
    await prisma.user.update({ where: { id }, data: { passwordHash } })
  }

  return Response.json({ ok: true })
}
