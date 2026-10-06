'use client'

import { Button } from '@/components/ui/button'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Badge } from '@/components/ui/badge'
import { useApp } from '@/components/app-context'
import { ScaledResume, DEMO_RESUME } from '@/components/resume-preview'
import { TEMPLATES, ACCENTS } from '@/lib/templates'
import { PRO_PRICE_MONTH, PRO_PRICE_YEAR, BRAND, DOMAIN } from '@/lib/i18n'
import { ACTIVE_SECTORS } from '@/lib/sectors'
import { useEffect, useState } from 'react'
import {
  Sparkles, Link2, Globe2, BarChart3, FileDown, LayoutTemplate,
  Check, Eye, ChevronRight, Lock, ShieldCheck,
} from 'lucide-react'

export default function Landing() {
  const { dict, navigate, user, view, locale } = useApp()
  const [accentIdx, setAccentIdx] = useState(0)
  const accent = ACCENTS[accentIdx].hex

  // Scroll vers une section si demandé par la navigation
  useEffect(() => {
    if (view.name === 'landing' && view.scrollTo) {
      const t = setTimeout(() => {
        document.getElementById(view.scrollTo!)?.scrollIntoView({ behavior: 'smooth' })
      }, 120)
      return () => clearTimeout(t)
    }
  }, [view])

  const start = () => navigate(user ? { name: 'dashboard' } : { name: 'auth', mode: 'register' })

  return (
    <main className="flex-1">
      {/* ═══ HERO ═══ */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden>
          <div className="absolute -top-32 left-1/2 h-125 w-250 -translate-x-1/2 rounded-full bg-emerald-100/60 blur-3xl" />
          <div className="absolute top-40 -right-24 h-80 w-80 rounded-full bg-teal-100/50 blur-3xl" />
        </div>

        <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 pt-14 pb-20 lg:grid-cols-2 lg:pt-20">
          <div className="flex flex-col items-start gap-5">
            <Badge variant="outline" className="gap-1.5 rounded-full border-emerald-200 bg-emerald-50 px-3 py-1.5 text-[13px] font-medium text-emerald-800">
              <Sparkles className="h-3.5 w-3.5" />
              {dict.heroBadge}
            </Badge>
            <h1 className="text-4xl leading-[1.08] font-extrabold tracking-tight text-slate-900 sm:text-5xl lg:text-[3.4rem]">
              {dict.heroTitle1}{' '}
              <span className="bg-gradient-to-r from-emerald-700 to-teal-600 bg-clip-text text-transparent">{dict.heroTitleHighlight}</span>
            </h1>
            <p className="max-w-xl text-lg leading-relaxed text-slate-600">{dict.heroSubtitle}</p>
            <div className="flex flex-wrap items-center gap-3">
              <Button size="lg" onClick={start} className="h-12 rounded-xl bg-emerald-700 px-6 text-base font-semibold shadow-lg shadow-emerald-700/20 hover:bg-emerald-800">
                {dict.heroCta}
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button size="lg" variant="outline" onClick={() => document.getElementById('modeles')?.scrollIntoView({ behavior: 'smooth' })} className="h-12 rounded-xl border-slate-300 px-6 text-base">
                {dict.heroCta2}
              </Button>
            </div>
            <p className="text-sm text-slate-500">{dict.heroNoCard}</p>
          </div>

          {/* Visuel produit : CV de démo + cartes flottantes */}
          <div className="relative mx-auto hidden w-full max-w-105 lg:block" aria-hidden>
            <div className="rounded-2xl border border-slate-200 bg-white p-2.5 shadow-2xl shadow-slate-900/10">
              <ScaledResume template="moderne" accent={accent} data={DEMO_RESUME} locale="fr" scale={0.48} />
            </div>
            <div className="absolute -left-10 top-16 flex items-center gap-2.5 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-xl">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-100">
                <Eye className="h-4.5 w-4.5 text-emerald-700" />
              </span>
              <div>
                <div className="text-lg leading-none font-bold text-slate-900">128</div>
                <div className="text-xs text-slate-500">{dict.views}</div>
              </div>
            </div>
            <div className="absolute -right-6 bottom-14 flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-900 px-4 py-2.5 text-sm font-medium text-white shadow-xl">
              <Link2 className="h-4 w-4 text-emerald-400" />
              {DOMAIN}/@alex
            </div>
          </div>
        </div>
      </section>

      {/* ═══ COMMENT ÇA MARCHE ═══ */}
      <section className="border-y bg-slate-50/70 py-16">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="mb-10 text-center text-3xl font-bold tracking-tight text-slate-900">{dict.howTitle}</h2>
          <div className="grid gap-6 md:grid-cols-3">
            {[
              { t: dict.how1T, d: dict.how1D },
              { t: dict.how2T, d: dict.how2D },
              { t: dict.how3T, d: dict.how3D },
            ].map((s, i) => (
              <div key={i} className="relative rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <span className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-700 text-lg font-bold text-white">
                  {i + 1}
                </span>
                <h3 className="mb-2 text-lg font-bold text-slate-900">{s.t.replace(/^1\. |^2\. |^3\. /, '')}</h3>
                <p className="text-[15px] leading-relaxed text-slate-600">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ GALERIE TEMPLATES ═══ */}
      <section id="modeles" className="scroll-mt-20 py-16">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-slate-900">{dict.tplTitle}</h2>
              <p className="mt-2 max-w-xl text-slate-600">{dict.tplSubtitle}</p>
            </div>
            {/* Sélecteur de couleur interactif */}
            <div className="flex items-center gap-2" role="group" aria-label={dict.accent}>
              {ACCENTS.map((a, i) => (
                <button
                  key={a.hex}
                  onClick={() => setAccentIdx(i)}
                  aria-label={a.hex}
                  className={`h-8 w-8 rounded-full border-2 transition ${i === accentIdx ? 'scale-110 border-slate-900 shadow-md' : 'border-white shadow'}`}
                  style={{ background: a.hex }}
                />
              ))}
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {TEMPLATES.map((tpl) => (
              <div key={tpl.id} className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-xl">
                <div className="relative overflow-hidden border-b border-slate-100 bg-slate-50 p-4">
                  <div className="mx-auto w-fit transition group-hover:scale-[1.03]" style={{ transitionDuration: '300ms' }}>
                    <ScaledResume template={tpl.id} accent={accent} data={DEMO_RESUME} locale="fr" scale={0.3} />
                  </div>
                  {!tpl.free && (
                    <span className="absolute top-3 right-3 flex items-center gap-1 rounded-full bg-slate-900 px-2.5 py-1 text-xs font-semibold text-white">
                      <Lock className="h-3 w-3" /> {dict.locked}
                    </span>
                  )}
                </div>
                <div className="flex items-start justify-between gap-2 p-4">
                  <div>
                    <h3 className="font-bold text-slate-900">{dict[tpl.nameKey as keyof typeof dict] as string}</h3>
                    <p className="mt-0.5 text-sm text-slate-500">{dict[tpl.descKey as keyof typeof dict] as string}</p>
                  </div>
                  <Button size="sm" variant="outline" onClick={start} className="shrink-0 border-emerald-200 text-emerald-800 hover:bg-emerald-50">
                    {dict.edit}
                  </Button>
                </div>
              </div>
            ))}

            {/* Carte CTA dans la galerie */}
            <div className="flex flex-col items-start justify-center gap-4 rounded-2xl border-2 border-dashed border-emerald-200 bg-emerald-50/50 p-8">
              <LayoutTemplate className="h-8 w-8 text-emerald-700" />
              <h3 className="text-xl font-bold text-slate-900">{dict.newCv}</h3>
              <p className="text-sm text-slate-600">{dict.tplSubtitle}</p>
              <Button onClick={start} className="mt-1 bg-emerald-700 hover:bg-emerald-800">
                {dict.ctaStart}
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ FONCTIONNALITÉS ═══ */}
      <section id="features" className="scroll-mt-20 border-y bg-slate-50/70 py-16">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-center text-3xl font-bold tracking-tight text-slate-900">{dict.featTitle}</h2>
          <p className="mx-auto mt-3 mb-10 max-w-2xl text-center text-slate-600">{dict.featSubtitle}</p>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { icon: LayoutTemplate, t: dict.feat1T, d: dict.feat1D },
              { icon: Sparkles, t: dict.feat2T, d: dict.feat2D },
              { icon: Link2, t: dict.feat3T, d: dict.feat3D },
              { icon: Globe2, t: dict.feat4T, d: dict.feat4D },
              { icon: BarChart3, t: dict.feat5T, d: dict.feat5D },
              { icon: FileDown, t: dict.feat6T, d: dict.feat6D },
            ].map((f, i) => (
              <div key={i} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                <span className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100">
                  <f.icon className="h-5.5 w-5.5 text-emerald-700" />
                </span>
                <h3 className="mb-1.5 font-bold text-slate-900">{f.t}</h3>
                <p className="text-[15px] leading-relaxed text-slate-600">{f.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ BRANCHES SECTORIELLES ═══ */}
      <section id="metiers" className="scroll-mt-20 border-y bg-slate-50/70 py-16">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-center text-3xl font-bold tracking-tight text-slate-900">{dict.branchTitle}</h2>
          <p className="mx-auto mt-3 mb-10 max-w-2xl text-center text-slate-600">{dict.branchSubtitle}</p>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {ACTIVE_SECTORS.map((s) => {
              const pack = s.packs[locale === 'fr' ? 'fr' : 'en'] ?? s.packs.fr
              const previewSkills = pack.skills.flatMap((c) => c.items).slice(0, 6)
              return (
                <a
                  key={s.slug}
                  href={`/${s.slug}`}
                  className="group flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl text-white" style={{ background: s.accent }}>
                      <ShieldCheck className="h-5 w-5" />
                    </span>
                    <h3 className="font-bold text-slate-900">{pack.name}</h3>
                  </div>
                  <p className="mt-3 flex-1 text-sm leading-relaxed text-slate-600">{pack.heroBadge}</p>
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {previewSkills.map((sk) => (
                      <span key={sk} className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-600">{sk}</span>
                    ))}
                  </div>
                  <span className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-emerald-700 group-hover:gap-2 transition-all">
                    {dict.branchCta} <ChevronRight className="h-4 w-4" />
                  </span>
                </a>
              )
            })}
            {/* Branches en préparation : affichées comme « Bientôt » */}
            <div className="flex flex-col items-start rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50 p-6">
              <div className="flex items-center gap-2.5">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-200 text-slate-500">
                  <LayoutTemplate className="h-5 w-5" />
                </span>
                <h3 className="font-bold text-slate-400">IT &amp; Digital</h3>
                <span className="rounded-full bg-slate-200 px-2 py-0.5 text-[10px] font-bold tracking-wide text-slate-500 uppercase">{dict.branchSoon}</span>
              </div>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-slate-400">
                ATS, GitHub, méthodologies agiles — la branche tech arrive.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ TARIFS ═══ */}
      <section id="tarifs" className="scroll-mt-20 py-16">
        <PricingCards compact={false} />
        <p className="mx-auto mt-6 max-w-2xl px-4 text-center text-sm text-slate-500">{dict.vsNote}</p>
      </section>

      {/* ═══ FAQ ═══ */}
      <section className="border-t bg-slate-50/70 py-16">
        <div className="mx-auto max-w-2xl px-4">
          <h2 className="mb-8 text-center text-3xl font-bold tracking-tight text-slate-900">{dict.faqTitle}</h2>
          <Accordion type="single" collapsible className="rounded-2xl border border-slate-200 bg-white px-6 shadow-sm">
            {[1, 2, 3].map((n) => (
              <AccordionItem key={n} value={`q${n}`}>
                <AccordionTrigger className="text-left font-semibold">
                  {dict[`faq${n}Q` as keyof typeof dict] as string}
                </AccordionTrigger>
                <AccordionContent className="text-slate-600">
                  {dict[`faq${n}A` as keyof typeof dict] as string}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* ═══ CTA FINAL ═══ */}
      <section className="py-16">
        <div className="mx-auto max-w-4xl px-4">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-700 to-teal-800 px-8 py-14 text-center shadow-2xl shadow-emerald-900/20">
            <ShieldCheck className="mx-auto mb-4 h-10 w-10 text-emerald-200" aria-hidden />
            <h2 className="text-3xl font-bold text-white">{dict.heroTitleHighlight}</h2>
            <p className="mx-auto mt-3 max-w-xl text-emerald-100">{dict.footerTag}</p>
            <Button size="lg" onClick={start} className="mt-7 h-12 rounded-xl bg-white px-8 text-base font-semibold text-emerald-800 hover:bg-emerald-50">
              {dict.ctaStart}
            </Button>
          </div>
        </div>
      </section>
    </main>
  )
}

// ─── Cartes de prix (réutilisées : landing + page tarifs) ───────────────────
export function PricingCards({ compact, onGoPro }: { compact?: boolean; onGoPro?: () => void }) {
  const { dict, navigate, user } = useApp()
  const isPro = user?.plan === 'PRO'

  const start = () => navigate(user ? { name: 'pricing' } : { name: 'auth', mode: 'register' })

  const goPro = () => {
    if (onGoPro) return onGoPro()
    navigate({ name: 'pricing' })
  }

  return (
    <div className={`mx-auto grid max-w-3xl gap-6 px-4 ${compact ? 'sm:grid-cols-2' : 'md:grid-cols-2'}`}>
      {/* Gratuit */}
      <div className="flex flex-col rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">
        <h3 className="text-lg font-bold text-slate-900">{dict.freeName}</h3>
        <div className="mt-2 flex items-baseline gap-1">
          <span className="text-4xl font-extrabold text-slate-900">0 €</span>
          <span className="text-slate-500">{dict.perMonth}</span>
        </div>
        <ul className="mt-6 flex flex-1 flex-col gap-3 text-[15px] text-slate-700">
          {[dict.freeF1, dict.freeF2, dict.freeF3, dict.freeF4].map((f, i) => (
            <li key={i} className="flex items-start gap-2.5">
              <Check className="mt-0.5 h-4.5 w-4.5 shrink-0 text-emerald-600" />
              {f}
            </li>
          ))}
        </ul>
        <Button variant="outline" onClick={start} disabled={isPro} className="mt-7 h-11 rounded-xl border-slate-300">
          {isPro ? dict.current : dict.ctaStart}
        </Button>
      </div>

      {/* Pro */}
      <div className="relative flex flex-col rounded-2xl border-2 border-emerald-600 bg-slate-900 p-7 text-white shadow-xl">
        <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-emerald-600 px-4 py-1 text-xs font-bold tracking-wide whitespace-nowrap text-white uppercase">
          {dict.popular}
        </span>
        <h3 className="text-lg font-bold">{dict.proName}</h3>
        <div className="mt-2 flex items-baseline gap-1">
          <span className="text-4xl font-extrabold">{PRO_PRICE_MONTH}</span>
          <span className="text-slate-400">{dict.perMonth}</span>
        </div>
        <p className="mt-1 text-sm text-slate-400">ou {PRO_PRICE_YEAR}{dict.perYear}</p>
        <ul className="mt-6 flex flex-1 flex-col gap-3 text-[15px] text-slate-200">
          {[dict.proF1, dict.proF2, dict.proF3, dict.proF4, dict.proF5].map((f, i) => (
            <li key={i} className="flex items-start gap-2.5">
              <Check className="mt-0.5 h-4.5 w-4.5 shrink-0 text-emerald-400" />
              {f}
            </li>
          ))}
        </ul>
        {isPro ? (
          <Button disabled className="mt-7 h-11 rounded-xl bg-emerald-600/30 text-emerald-200">
            {dict.current} ✓
          </Button>
        ) : (
          <Button onClick={goPro} className="mt-7 h-11 rounded-xl bg-emerald-600 font-semibold hover:bg-emerald-500">
            {user ? dict.choosePro : dict.ctaGoPro}
          </Button>
        )}
      </div>
    </div>
  )
}

// ─── Pied de page ────────────────────────────────────────────────────────────
export function Footer() {
  const { dict } = useApp()
  return (
    <footer className="mt-auto border-t bg-white py-8">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 text-sm text-slate-500 sm:flex-row">
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-emerald-700 text-[10px] font-bold text-white">CV</span>
          <span className="font-semibold text-slate-700">{BRAND}</span>
        </div>
        <div className="flex items-center gap-3">
          <p>{dict.footerTag}</p>
          {ACTIVE_SECTORS.map((s) => (
            <a key={s.slug} href={`/${s.slug}`} className="text-emerald-700 hover:underline">
              CV {s.packs.fr.name}
            </a>
          ))}
        </div>
        <p>© {new Date().getFullYear()} {BRAND}. {dict.footerRights}</p>
      </div>
    </footer>
  )
}
