import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import AuditPage from '@/components/AuditPage'
import { type Gran, type WeekBlocks } from '@/lib/categories'

interface Props {
  params: Promise<{ weekStart: string }>
}

export default async function WeekPage({ params }: Props) {
  const { weekStart } = await params
  const session = await auth()
  if (!session?.user) redirect('/sign-in')

  let initialBlocks: WeekBlocks | undefined
  let initialGran: Gran = 30
  let tonePref: 'lewis' | 'neutral' | 'utility' = 'lewis'

  let isAdmin = false

  if (session?.user?.id) {
    const [week, user] = await Promise.all([
      prisma.week.findUnique({
        where: { userId_weekStart: { userId: session.user.id, weekStart: new Date(weekStart) } },
      }),
      prisma.user.findUnique({ where: { id: session.user.id }, select: { defaultGran: true, tonePref: true, isAdmin: true } }),
    ])
    if (week) {
      initialBlocks = week.blocks as WeekBlocks
      initialGran = week.gran as Gran
    }
    if (user) {
      initialGran = (user.defaultGran as Gran) || 30
      tonePref = (user.tonePref as typeof tonePref) || 'lewis'
      isAdmin = user.isAdmin
    }
  }

  return (
    <AuditPage
      initialWeekStart={weekStart}
      initialBlocks={initialBlocks}
      initialGran={initialGran}
      userId={session?.user?.id}
      tonePref={tonePref}
      isAdmin={isAdmin}
    />
  )
}
