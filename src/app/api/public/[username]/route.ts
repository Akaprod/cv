import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { parseResumeData } from '@/lib/types'

// GET /api/public/[username] — CV public affiché sur /@username
export async function GET(_req: Request, ctx: { params: Promise<{ username: string }> }) {
  const { username } = await ctx.params
  const clean = username.replace(/^@/, '').toLowerCase()

  const user = await db.user.findUnique({ where: { username: clean } })
  if (!user) return NextResponse.json({ status: 'notFound' }, { status: 404 })

  const resume = await db.resume.findFirst({
    where: { userId: user.id, isPublic: true },
    orderBy: { updatedAt: 'desc' },
  })
  if (!resume) return NextResponse.json({ status: 'notFound' }, { status: 404 })

  return NextResponse.json({
    status: 'ok',
    username: user.username,
    plan: user.plan,
    resume: {
      title: resume.title,
      template: resume.template,
      accent: resume.accent,
      views: resume.views,
      locale: resume.locale,
      data: parseResumeData(resume.data),
    },
  })
}
