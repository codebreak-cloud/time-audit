import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { startOfWeek, weekKey } from '@/lib/categories'

export default async function Home() {
  const session = await auth()
  if (!session?.user) redirect('/sign-in')
  const key = weekKey(startOfWeek(new Date()))
  redirect(`/week/${key}`)
}
