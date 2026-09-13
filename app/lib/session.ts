import { randomBytes } from 'crypto'
import { cookies } from 'next/headers'
import { prisma } from './db'

const SESSION_COOKIE = 'repoagent_session'

const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365

const sessionSelect = { id: true, displayName: true, createdAt: true } as const

export type Session = {
  id: string
  displayName: string
  createdAt: Date
}

export async function getSession(): Promise<Session | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get(SESSION_COOKIE)?.value
  if (!token) return null

  return prisma.session.findUnique({
    where: { id: token },
    select: sessionSelect,
  })
}

export async function createSession(displayName: string): Promise<Session> {
  const token = randomBytes(24).toString('base64url')
  const session = await prisma.session.create({
    data: { id: token, displayName },
    select: sessionSelect,
  })

  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: ONE_YEAR_SECONDS,
  })

  return session
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies()
  const token = cookieStore.get(SESSION_COOKIE)?.value
  if (token) {
    await prisma.session.deleteMany({ where: { id: token } })
  }
  cookieStore.delete(SESSION_COOKIE)
}
