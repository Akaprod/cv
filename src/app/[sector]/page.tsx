import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ShieldCheck, ChevronRight, FileDown, Sparkles, Link2, Languages, BarChart3 } from 'lucide-react'
import { ACTIVE_SECTORS, getSector, sectorDemoResume } from '@/lib/sectors'
import { ScaledResume } from '@/components/resume-preview'
import { BRAND, DOMAIN } from '@/lib/brand'

// ─── Landing sectorielle /hse (branchée sur le pack de contenu) ─────────────
// Page rendue côté serveur (HTML complet pour le SEO / l'ADS). Le contenu
// provient à 100 % du pack sectoriel (src/lib/sectors.ts) : créer une
// nouvelle branche = nouveau pack, zéro code.

export function generateStaticParams() {
  return ACTIVE_SECTORS.map((s) => ({ sector: s.slug }))
}

type Params = { params: Promise<{ sector: string }>; searchParams: Promise<{ lang?: string }> }

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { sector: slug } = await params
  const sector = getSector(slug)
  if (!sector || !sector.active) return {}
  const pack = sector.packs.fr
  return {
    title: `${pack.metaTitle} | ${BRAND}`,
    description: pack.metaDescription,
    alternates: {
      canonical: `/${sector.slug}`,
      languages: {
        fr: `/${sector.slug}`,
        en: `/${sector.slug}?lang=en`,
      },
    },
    openGraph: {
      title: `${pack.metaTitle} | ${BRAND}`,
      description: pack.metaDescription,
      siteName: BRAND,
      type: 'website',
    },
  }
}

export default async function SectorPage({ params, searchParams }: Params) {
  const { sector: slug } = await params
  const { lang } = await searchParams
  const sector = getSector(slug)
  if (!sector || !sector.active) notFound()

  const locale = lang === 'en' ? 'en' : 'fr'
  const pack = sector.packs[locale]
  const demo = sectorDemoResume(sector, locale)
  const accent = sector.accent
  const ctaHref = `/?sector=${sector.slug}#/inscription`

  // Données structurées FAQ (SEO)
  const faqLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: pack.faqs.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  }

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />

      {/* ═══ EN-TÊTE ═══ */}
      <header className="sticky top-0 z-50 w-full border-b bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg text-white" style={{ background: accent }}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4.5 w-4.5">
                <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
                <path d="M14 2v4a2 2 0 0 0 2 2h4" />
              </svg>
            </span>
            <span className="font-bold tracking-tight text-slate-900">{BRAND}</span>
          </Link>
          <div className="flex items-center gap-2">
            <Link
              href={`/${sector.slug}`}
              className={`rounded-full px-2.5 py-1 text-xs font-semibold ${locale === 'fr' ? 'text-white' : 'text-slate-600'}`}
              style={locale === 'fr' ? { background: accent } : {}}
            >
              FR
            </Link>
            <Link
              href={`/${sector.slug}?lang=en`}
              className={`rounded-full px-2.5 py-1 text-xs font-semibold ${locale === 'en' ? 'text-white' : 'text-slate-600'}`}
              style={locale === 'en' ? { background: accent } : {}}
            >
              EN
            </Link>
            <Link href={ctaHref} className="ml-1 rounded-lg px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90" style={{ background: accent }}>
              {pack.heroCta}
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* ═══ HERO ═══ */}
        <section className="relative overflow-hidden">
          <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden>
            <div className="absolute -top-32 left-1/2 h-125 w-250 -translate-x-1/2 rounded-full opacity-15 blur-3xl" style={{ background: accent }} />
          </div>
          <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 pt-14 pb-20 lg:grid-cols-2 lg:pt-20">
            <div className="flex flex-col items-start gap-5">
              <span className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[13px] font-medium" style={{ borderColor: `${accent}33`, background: `${accent}0d`, color: accent }}>
                <ShieldCheck className="h-3.5 w-3.5" />
                {pack.heroBadge}
              </span>
              <h1 className="text-4xl leading-[1.08] font-extrabold tracking-tight text-slate-900 sm:text-5xl lg:text-[3.3rem]">
                {pack.heroTitle}{' '}
                <span className="bg-clip-text text-transparent" style={{ backgroundImage: `linear-gradient(to right, ${accent}, ${accent}99)` }}>
                  {pack.heroTitleHighlight}
                </span>
              </h1>
              <p className="max-w-xl text-lg leading-relaxed text-slate-600">{pack.heroSubtitle}</p>
              <div className="flex flex-wrap items-center gap-3">
                <Link href={ctaHref} className="inline-flex h-12 items-center gap-1.5 rounded-xl px-6 text-base font-semibold text-white shadow-lg transition hover:opacity-90" style={{ background: accent, boxShadow: `0 10px 25px ${accent}33` }}>
                  {pack.heroCta}
                  <ChevronRight className="h-4 w-4" />
                </Link>
                <a href="#competences" className="inline-flex h-12 items-center rounded-xl border border-slate-300 px-6 text-base font-medium text-slate-700 transition hover:bg-slate-50">
                  {pack.skillsIntro}
                </a>
              </div>
              <p className="text-sm text-slate-500">Sans carte bancaire · Lien personnel @pseudo · FR · EN · ES · DE · IT</p>
            </div>

            {/* Visuel : CV de démonstration du secteur */}
            <div className="relative mx-auto hidden w-full max-w-105 lg:block" aria-hidden>
              <div className="rounded-2xl border border-slate-200 bg-white p-2.5 shadow-2xl shadow-slate-900/10">
                <ScaledResume template="classique" accent={accent} data={demo} locale={locale} scale={0.48} />
              </div>
              <div className="absolute -left-10 top-16 flex items-center gap-2.5 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-xl">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg" style={{ background: `${accent}1a` }}>
                  <BarChart3 className="h-4.5 w-4.5" style={{ color: accent }} />
                </span>
                <div>
                  <div className="text-lg leading-none font-bold text-slate-900">-67 %</div>
                  <div className="text-xs text-slate-500">{locale === 'fr' ? 'TF accident' : 'Injury rate'}</div>
                </div>
              </div>
              <div className="absolute -right-6 bottom-14 flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-900 px-4 py-2.5 text-sm font-medium text-white shadow-xl">
                <Link2 className="h-4 w-4 text-sky-300" />
                {DOMAIN}/@karim
              </div>
            </div>
          </div>
        </section>

        {/* ═══ COMPÉTENCES PRÉ-REMPLIES ═══ */}
        <section id="competences" className="scroll-mt-20 border-y bg-slate-50/70 py-16">
          <div className="mx-auto max-w-6xl px-4">
            <h2 className="text-center text-3xl font-bold tracking-tight text-slate-900">{pack.skillsIntro}</h2>
            <p className="mx-auto mt-3 mb-10 max-w-2xl text-center text-slate-600">
              {locale === 'fr'
                ? 'Cliquez, c’est ajouté à votre CV. Un dictionnaire complet du métier, prêt à l’emploi.'
                : 'Click to add them to your CV. A complete job dictionary, ready to use.'}
            </p>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {pack.skills.map((cat) => (
                <div key={cat.category} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <h3 className="mb-3 flex items-center gap-2 font-bold text-slate-900">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ background: accent }} />
                    {cat.category}
                  </h3>
                  <ul className="flex flex-wrap gap-1.5">
                    {cat.items.map((it) => (
                      <li key={it} className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-700">{it}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ AVANTAGES ═══ */}
        <section className="py-16">
          <div className="mx-auto max-w-6xl px-4">
            <h2 className="text-center text-3xl font-bold tracking-tight text-slate-900">{pack.benefitsIntro}</h2>
            <div className="mt-10 grid gap-5 sm:grid-cols-2">
              {pack.benefits.map((b, i) => (
                <div key={i} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                  <span className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl" style={{ background: `${accent}1a`, color: accent }}>
                    {i === 0 ? <ShieldCheck className="h-5.5 w-5.5" /> : i === 1 ? <BarChart3 className="h-5.5 w-5.5" /> : i === 2 ? <FileDown className="h-5.5 w-5.5" /> : <Sparkles className="h-5.5 w-5.5" />}
                  </span>
                  <h3 className="mb-1.5 font-bold text-slate-900">{b.title}</h3>
                  <p className="text-[15px] leading-relaxed text-slate-600">{b.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ ACCROCHES PRÊTES À ADAPTER ═══ */}
        <section className="border-y bg-slate-50/70 py-16">
          <div className="mx-auto max-w-4xl px-4">
            <h2 className="text-center text-3xl font-bold tracking-tight text-slate-900">{pack.accrochesIntro}</h2>
            <div className="mt-10 flex flex-col gap-4">
              {pack.accroches.slice(0, 4).map((a, i) => (
                <figure key={i} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <span className="mb-3 inline-block rounded-full px-3 py-1 text-xs font-bold tracking-wide text-white uppercase" style={{ background: accent }}>
                    {a.level}
                  </span>
                  <blockquote className="text-[15px] leading-relaxed text-slate-700">« {a.text} »</blockquote>
                </figure>
              ))}
            </div>
            <p className="mt-8 text-center text-sm text-slate-500">
              {locale === 'fr'
                ? 'Dans l’éditeur, l’IA rédige une accroche personnalisée avec le vocabulaire du métier — en un clic.'
                : 'In the editor, the AI writes a personalized summary using the sector’s vocabulary — one click.'}
            </p>
          </div>
        </section>

        {/* ═══ FAQ ═══ */}
        <section className="py-16">
          <div className="mx-auto max-w-2xl px-4">
            <h2 className="mb-8 text-center text-3xl font-bold tracking-tight text-slate-900">
              {locale === 'fr' ? 'Questions fréquentes' : 'Frequently asked questions'}
            </h2>
            <div className="flex flex-col gap-3">
              {pack.faqs.map((f, i) => (
                <details key={i} className="group rounded-xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
                  <summary className="cursor-pointer list-none text-left font-semibold text-slate-900">
                    <span className="flex items-center justify-between gap-4">
                      {f.q}
                      <ChevronRight className="h-4 w-4 shrink-0 text-slate-400 transition group-open:rotate-90" />
                    </span>
                  </summary>
                  <p className="mt-3 text-[15px] leading-relaxed text-slate-600">{f.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ CTA FINAL ═══ */}
        <section className="pb-16">
          <div className="mx-auto max-w-4xl px-4">
            <div className="relative overflow-hidden rounded-3xl px-8 py-14 text-center shadow-2xl" style={{ background: `linear-gradient(to bottom right, ${accent}, #0f172a)` }}>
              <Languages className="mx-auto mb-4 h-10 w-10 text-white/70" aria-hidden />
              <h2 className="text-3xl font-bold text-white">{pack.heroCta}</h2>
              <p className="mx-auto mt-3 max-w-xl text-white/80">{pack.heroBadge}</p>
              <Link href={ctaHref} className="mt-7 inline-flex h-12 items-center rounded-xl bg-white px-8 text-base font-semibold transition hover:bg-white/90" style={{ color: accent }}>
                {locale === 'fr' ? 'Commencer gratuitement' : 'Start for free'}
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* ═══ PIED DE PAGE ═══ */}
      <footer className="mt-auto border-t bg-white py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 text-sm text-slate-500 sm:flex-row">
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-md text-[10px] font-bold text-white" style={{ background: accent }}>CV</span>
            <span className="font-semibold text-slate-700">{BRAND}</span>
          </div>
          <Link href="/" className="inline-flex items-center gap-1 hover:text-slate-700">
            {locale === 'fr' ? 'Créer un CV pour un autre métier' : 'Create a CV for another profession'}
            <ChevronRight className="h-3.5 w-3.5" />
          </Link>
          <p>© {new Date().getFullYear()} {BRAND}</p>
        </div>
      </footer>
    </div>
  )
}
