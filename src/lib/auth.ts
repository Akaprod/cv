import { cookies } from 'next/headers'
import { randomBytes, scryptSync, timingSafeEqual } from 'crypto'
import { db } from './db'

const SESSION_COOKIE = 'hse_session'
const SESSION_DAYS = 30

// ─── Mots de passe (scrypt natif, aucune dépendance) ────────────────────────
export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex')
  const hash = scryptSync(password, salt, 64).toString('hex')
  return `${salt}:${hash}`
}

export function verifyPassword(password: string, stored: string): boolean {
  try {
    const [salt, hash] = stored.split(':')
    const candidate = scryptSync(password, salt, 64)
    const original = Buffer.from(hash, 'hex')
    return candidate.length === original.length && timingSafeEqual(candidate, original)
  } catch {
    return false
  }
}

// ─── Sessions (token aléatoire en base + cookie httpOnly) ───────────────────
export async function createSession(userId: string): Promise<void> {
  const token = randomBytes(32).toString('hex')
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 3600 * 1000)
  await db.session.create({ data: { token, userId, expiresAt } })
  const store = await cookies()
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production', // auto-activé derrière HTTPS en production
    path: '/',
    maxAge: SESSION_DAYS * 24 * 3600,
  })
}

export async function getSessionUser() {
  const store = await cookies()
  const token = store.get(SESSION_COOKIE)?.value
  if (!token) return null
  const session = await db.session.findUnique({
    where: { token },
    include: { user: true },
  })
  if (!session) return null
  if (session.expiresAt < new Date()) {
    await db.session.delete({ where: { id: session.id } }).catch(() => {})
    return null
  }
  return session.user
}

export async function clearSession(): Promise<void> {
  const store = await cookies()
  const token = store.get(SESSION_COOKIE)?.value
  if (token) {
    await db.session.deleteMany({ where: { token } }).catch(() => {})
  }
  store.delete(SESSION_COOKIE)
}

// ─── Pseudo : validation + mots réservés ────────────────────────────────────
const RESERVED = [
  'admin', 'api', 'app', 'www', 'mail', 'support', 'help', 'root',
  'novacv', 'hseacademy', 'cv', 'dashboard', 'login', 'register', 'pricing',
  'templates', 'about', 'contact', 'legal', 'privacy', 'terms', 'u', 'hse',
]

export function validateUsername(username: string): 'ok' | 'invalid' | 'reserved' {
  if (!/^[a-z0-9-]{3,20}$/.test(username)) return 'invalid'
  if (RESERVED.includes(username)) return 'reserved'
  return 'ok'
}

// ─── Quota IA ───────────────────────────────────────────────────────────────
function currentMonth(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

export function aiQuotaState(user: { plan: string; aiUsed: number; aiMonth: string | null }): {
  allowed: boolean
  used: number
  limit: number | null // null = illimité
} {
  if (user.plan === 'PRO') return { allowed: true, used: user.aiUsed, limit: null }
  const used = user.aiMonth === currentMonth() ? user.aiUsed : 0
  return { allowed: used < 10, used, limit: 10 }
}

export async function consumeAiCredit(userId: string, user: { aiUsed: number; aiMonth: string | null }): Promise<void> {
  const month = currentMonth()
  const used = user.aiMonth === month ? user.aiUsed + 1 : 1
  await db.user.update({ where: { id: userId }, data: { aiUsed: used, aiMonth: month } })
}
