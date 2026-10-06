import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyPassword, createSession } from '@/lib/auth'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const email = String(body.email ?? '').trim().toLowerCase()
    const password = String(body.password ?? '')

    const user = await db.user.findUnique({ where: { email } })
    if (!user || !verifyPassword(password, user.passwordHash)) {
      return NextResponse.json({ error: 'creds' }, { status: 401 })
    }

    await createSession(user.id)
    return NextResponse.json({
      id: user.id,
      email: user.email,
      username: user.username,
      plan: user.plan,
      locale: user.locale,
      aiUsed: user.aiUsed,
      aiMonth: user.aiMonth,
    })
  } catch {
    return NextResponse.json({ error: 'generic' }, { status: 500 })
  }
}
