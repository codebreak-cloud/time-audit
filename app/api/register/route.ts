import { NextRequest } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  const { email, password } = await req.json()

  if (!email || !password) {
    return Response.json({ error: 'Email and password are required.' }, { status: 400 })
  }

  const normalised = (email as string).toLowerCase().trim()

  const existing = await prisma.user.findUnique({ where: { email: normalised } })
  if (existing) {
    return Response.json({ error: 'An account with that email already exists.' }, { status: 409 })
  }

  const passwordHash = await bcrypt.hash(password as string, 12)
  await prisma.user.create({ data: { email: normalised, passwordHash } })

  return Response.json({ ok: true }, { status: 201 })
}
