import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSessionUser } from '@/lib/auth'
import { FREE_MAX_RESUMES, parseResumeData } from '@/lib/types'
import { getSector } from '@/lib/sectors'

// GET /api/resumes — liste des CV de l'utilisateur + stats de vues
export async function GET() {
  const user = await getSessionUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const [resumes, recentLogs] = await Promise.all([
    db.resume.findMany({ where: { userId: user.id }, orderBy: { updatedAt: 'desc' } }),
    db.viewLog.findMany({
      where: { resume: { userId: user.id }, createdAt: { gte: new Date(Date.now() - 7 * 24 * 3600 * 1000) } },
      select: { resumeId: true, createdAt: true },
    }),
  ])

  return NextResponse.json({
    resumes: resumes.map((r) => ({
      id: r.id,
      title: r.title,
      template: r.template,
      accent: r.accent,
      sector: r.sector,
      isPublic: r.isPublic,
      views: r.views,
      locale: r.locale,
      updatedAt: r.updatedAt.toISOString(),
      ownerUsername: user.username,
      data: parseResumeData(r.data),
    })),
    recentViews: recentLogs.map((l) => ({ resumeId: l.resumeId, at: l.createdAt.toISOString() })),
  })
}

// POST /api/resumes — création d'un CV
export async function POST(req: Request) {
  const user = await getSessionUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  if (user.plan !== 'PRO') {
    const count = await db.resume.count({ where: { userId: user.id } })
    if (count >= FREE_MAX_RESUMES) {
      return NextResponse.json({ error: 'freeLimit' }, { status: 403 })
    }
  }

  const body = await req.json().catch(() => ({}))
  // Branche sectorielle : acceptée uniquement si active dans le registre.
  const sectorDef = getSector(typeof body.sector === 'string' ? body.sector : null)
  const resume = await db.resume.create({
    data: {
      userId: user.id,
      title: String(body.title ?? 'Mon CV').slice(0, 80) || 'Mon CV',
      template: String(body.template ?? 'moderne').slice(0, 20),
      accent: String(body.accent ?? '#047857').slice(0, 9),
      sector: sectorDef?.active ? sectorDef.slug : null,
      locale: ['fr', 'en', 'es', 'de', 'it'].includes(String(body.locale)) ? String(body.locale) : user.locale,
      data: JSON.stringify(parseResumeData(null)),
    },
  })

  return NextResponse.json({ id: resume.id })
}
