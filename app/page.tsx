import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { startOfWeek, weekKey } from '@/lib/categories'

export default async function Home() {
  // Redirect to current week — authenticated or not
  const session = await auth()
  const key = weekKey(startOfWeek(new Date()))
  redirect(`/week/${key}`)
}
