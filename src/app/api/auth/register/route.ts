import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { hashPassword, createSession, validateUsername } from '@/lib/auth'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const email = String(body.email ?? '').trim().toLowerCase()
    const password = String(body.password ?? '')
    const username = String(body.username ?? '').trim().toLowerCase()
    const locale = String(body.locale ?? 'fr').slice(0, 2)

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'invalid' }, { status: 400 })
    }
    if (password.length < 6) {
      return NextResponse.json({ error: 'invalid' }, { status: 400 })
    }
    const uname = validateUsername(username)
    if (uname !== 'ok') {
      return NextResponse.json({ error: uname === 'reserved' ? 'usernameTaken' : 'invalidUsername' }, { status: 400 })
    }

    const existingEmail = await db.user.findUnique({ where: { email } })
    if (existingEmail) {
      return NextResponse.json({ error: 'emailTaken' }, { status: 409 })
    }
    const existingUsername = await db.user.findUnique({ where: { username } })
    if (existingUsername) {
      return NextResponse.json({ error: 'usernameTaken' }, { status: 409 })
    }

    const user = await db.user.create({
      data: {
        email,
        passwordHash: hashPassword(password),
        username,
        locale: ['fr', 'en', 'es', 'de', 'it'].includes(locale) ? locale : 'fr',
      },
    })

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
