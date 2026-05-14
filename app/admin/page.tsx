import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import AdminClient from './AdminClient'

export default async function AdminPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/sign-in')

  const me = await prisma.user.findUnique({ where: { id: session.user.id }, select: { isAdmin: true } })
  if (!me?.isAdmin) redirect('/')

  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'asc' },
    include: {
      weeks: { orderBy: { updatedAt: 'desc' }, take: 1, select: { updatedAt: true } },
    },
  })

  const serialised = users.map(u => ({
    id: u.id,
    email: u.email,
    isAdmin: u.isAdmin,
    createdAt: u.createdAt.toISOString(),
    lastActive: u.weeks[0]?.updatedAt.toISOString() ?? null,
  }))

  return (
    <div style={{ minHeight: '100vh', background: 'var(--aa-off-white)' }}>
      <header style={{
        background: 'var(--aa-purple)',
        borderBottom: '2px solid var(--aa-purple-ink)',
        padding: '20px 32px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--aa-blue)', marginBottom: 4 }}>
            Adherence Amplifier
          </div>
          <h1 style={{ margin: 0, fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 28, letterSpacing: '-0.02em', textTransform: 'uppercase', color: '#fff', lineHeight: 1 }}>
            Admin
          </h1>
        </div>
        <a href="/" style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'rgba(255,255,255,0.7)', textDecoration: 'none', letterSpacing: '0.06em' }}>
          ← Back to app
        </a>
      </header>

      <main style={{ padding: '32px', maxWidth: 1200, margin: '0 auto' }}>
        <div style={{
          border: '2px solid var(--aa-purple-ink)',
          background: 'var(--aa-white)',
        }}>
          <div style={{
            padding: '16px 20px',
            borderBottom: '2px solid var(--aa-purple-ink)',
            fontFamily: 'var(--font-mono)', fontSize: 11,
            letterSpacing: '0.18em', textTransform: 'uppercase',
            color: 'var(--aa-purple)',
          }}>
            Users — {serialised.length} total
          </div>
          <AdminClient users={serialised} />
        </div>
      </main>
    </div>
  )
}
