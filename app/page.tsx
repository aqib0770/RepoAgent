import { ChatApp } from '@/app/components/chat-app'
import { NameGate } from '@/app/components/name-gate'
import { getSession } from '@/app/lib/session'

export const dynamic = 'force-dynamic'

export default async function Home() {
  const session = await getSession()

  if (!session) {
    return <NameGate />
  }

  return <ChatApp displayName={session.displayName} />
}
