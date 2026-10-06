import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

// POST /api/public/[username]/view — compteur de vues (fire & forget côté client)
export async function POST(req: Request, ctx: { params: Promise<{ username: string }> }) {
  try {
    const { username } = await ctx.params
    const clean = username.replace(/^@/, '').toLowerCase()

    const user = await db.user.findUnique({ where: { username: clean } })
    if (!user) return NextResponse.json({ ok: false }, { status: 404 })

    const resume = await db.resume.findFirst({
      where: { userId: user.id, isPublic: true },
      orderBy: { updatedAt: 'desc' },
    })
    if (!resume) return NextResponse.json({ ok: false }, { status: 404 })

    const referrer = req.headers.get('referer')?.slice(0, 300) ?? null

    await db.$transaction([
      db.resume.update({ where: { id: resume.id }, data: { views: { increment: 1 } } }),
      db.viewLog.create({ data: { resumeId: resume.id, referrer } }),
    ])

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}
