import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSessionUser } from '@/lib/auth'

// POST /api/billing/upgrade — passage Pro
//
// ⚠️ MODE DÉMO : Stripe n'est pas encore connecté. Quand Farid ajoutera ses
// clés Stripe (STRIPE_SECRET_KEY), il suffira de créer une Checkout Session
// ici et de mettre à jour `plan: 'PRO'` dans le webhook `checkout.session.completed`.
// En attendant, la mise à niveau est instantanée et gratuite (pour la démo).
export async function POST() {
  const user = await getSessionUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  if (user.plan === 'PRO') {
    return NextResponse.json({ ok: true, plan: 'PRO', already: true })
  }

  await db.user.update({ where: { id: user.id }, data: { plan: 'PRO' } })
  return NextResponse.json({ ok: true, plan: 'PRO' })
}
