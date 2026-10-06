import { NextResponse } from 'next/server'
import { getSessionUser } from '@/lib/auth'

export async function GET() {
  const user = await getSessionUser()
  if (!user) return NextResponse.json({ user: null }, { status: 200 })
  return NextResponse.json({
    user: {
      id: user.id,
      email: user.email,
      username: user.username,
      plan: user.plan,
      locale: user.locale,
      aiUsed: user.aiUsed,
      aiMonth: user.aiMonth,
    },
  })
}
