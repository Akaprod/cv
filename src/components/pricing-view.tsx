'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useApp } from '@/components/app-context'
import { PricingCards } from '@/components/landing'
import { Info, Crown, Loader2, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'

export default function PricingView() {
  const { dict, user, setUser } = useApp()
  const [busy, setBusy] = useState(false)

  const upgrade = async () => {
    setBusy(true)
    try {
      const r = await fetch('/api/billing/upgrade', { method: 'POST' })
      const d = await r.json()
      if (r.ok && d.plan === 'PRO' && user) {
        setUser({ ...user, plan: 'PRO' })
        toast.success(dict.upgraded)
      } else if (r.status === 401) {
        toast.error(dict.errCreds)
      }
    } catch {
      toast.error(dict.tErr)
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="flex-1 bg-slate-50">
      <div className="mx-auto max-w-4xl px-4 py-14">
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">{dict.pricingPageT}</h1>
          <p className="mx-auto mt-3 max-w-xl text-slate-600">{dict.pricingPageS}</p>
        </div>

        <PricingCards compact onGoPro={user?.plan === 'PRO' ? undefined : upgrade} />

        {/* Note mode démo / Stripe à venir */}
        <div className="mx-auto mt-8 flex max-w-2xl items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-5">
          <Info className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
          <div>
            <div className="font-bold text-slate-900">{dict.demo}</div>
            <p className="text-sm leading-relaxed text-slate-700">{dict.demoD}</p>
          </div>
        </div>

        {user?.plan === 'PRO' ? (
          <div className="mx-auto mt-8 flex max-w-2xl items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
            <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
            <p className="font-medium text-emerald-900">
              {dict.planPro} — {dict.current} ✓
            </p>
          </div>
        ) : (
          user && (
            <div className="mt-8 flex justify-center">
              <Button onClick={upgrade} disabled={busy} size="lg" className="h-12 rounded-xl bg-emerald-700 px-8 text-base font-semibold shadow-lg shadow-emerald-700/20 hover:bg-emerald-800">
                {busy ? <Loader2 className="h-4.5 w-4.5 animate-spin" /> : <Crown className="h-4.5 w-4.5" />}
                {dict.choosePro} — {dict.ctaGoPro}
              </Button>
            </div>
          )
        )}
      </div>
    </main>
  )
}
