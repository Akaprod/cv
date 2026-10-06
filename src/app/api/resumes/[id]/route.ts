import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSessionUser } from '@/lib/auth'
import { parseResumeData } from '@/lib/types'

type Ctx = { params: Promise<{ id: string }> }

async function ownResume(userId: string, id: string) {
  return db.resume.findFirst({ where: { id, userId } })
}

// GET /api/resumes/[id]
export async function GET(_req: Request, ctx: Ctx) {
  const user = await getSessionUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  const { id } = await ctx.params
  const resume = await ownResume(user.id, id)
  if (!resume) return NextResponse.json({ error: 'notFound' }, { status: 404 })
  return NextResponse.json({ resume: { ...resume, data: parseResumeData(resume.data) } })
}

// PATCH /api/resumes/[id] — mise à jour (titre, design, données, visibilité)
export async function PATCH(req: Request, ctx: Ctx) {
  const user = await getSessionUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  const { id } = await ctx.params
  const resume = await ownResume(user.id, id)
  if (!resume) return NextResponse.json({ error: 'notFound' }, { status: 404 })

  const body = await req.json().catch(() => ({}))
  const data: Record<string, string | boolean> = {}
  if (typeof body.title === 'string') data.title = body.title.slice(0, 80) || 'Mon CV'
  if (typeof body.template === 'string') data.template = body.template.slice(0, 20)
  if (typeof body.accent === 'string') data.accent = body.accent.slice(0, 9)
  if (typeof body.isPublic === 'boolean') data.isPublic = body.isPublic
  if (typeof body.locale === 'string' && ['fr', 'en', 'es', 'de', 'it'].includes(body.locale)) data.locale = body.locale
  if (body.data !== undefined) {
    const parsed = parseResumeData(typeof body.data === 'string' ? body.data : JSON.stringify(body.data))
    data.data = JSON.stringify(parsed)
  }

  const updated = await db.resume.update({ where: { id: resume.id }, data })
  return NextResponse.json({
    ok: true,
    updatedAt: updated.updatedAt.toISOString(),
    views: updated.views,
    isPublic: updated.isPublic,
  })
}

// DELETE /api/resumes/[id]
export async function DELETE(_req: Request, ctx: Ctx) {
  const user = await getSessionUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  const { id } = await ctx.params
  const resume = await ownResume(user.id, id)
  if (!resume) return NextResponse.json({ error: 'notFound' }, { status: 404 })
  await db.resume.delete({ where: { id: resume.id } })
  return NextResponse.json({ ok: true })
}
