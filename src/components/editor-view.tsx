'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useApp } from '@/components/app-context'
import ResumePreview from '@/components/resume-preview'
import { TEMPLATES, ACCENTS, isAccentAllowed, isTemplateAllowed } from '@/lib/templates'
import { EMPTY_RESUME, uid, LEVELS, AI_FREE_MONTHLY_LIMIT, type ResumeData } from '@/lib/types'
import { LOCALES, LOCALE_FLAGS, type Locale } from '@/lib/i18n'
import { getPack, sectorSkillsFlat } from '@/lib/sectors'
import {
  ArrowLeft, Loader2, Plus, Trash2, Sparkles, Check, CloudUpload, X, Lock, FileDown, User, Briefcase, GraduationCap, Wrench, Languages, Palette,
} from 'lucide-react'

interface ResumePayload {
  id: string
  title: string
  template: string
  accent: string
  sector: string | null
  isPublic: boolean
  views: number
  locale: string
  data: ResumeData
}

export default function EditorView({ id }: { id: string }) {
  const { dict, navigate, user, setUser, locale: uiLocale } = useApp()

  const [loaded, setLoaded] = useState(false)
  const [title, setTitle] = useState('Mon CV')
  const [template, setTemplate] = useState('moderne')
  const [accent, setAccent] = useState('#047857')
  const [cvLocale, setCvLocale] = useState(uiLocale)
  const [sector, setSector] = useState<string | null>(null)
  const [data, setData] = useState<ResumeData>(structuredClone(EMPTY_RESUME))

  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved'>('idle')
  const [aiBusy, setAiBusy] = useState<string | null>(null)
  const [skillInput, setSkillInput] = useState('')
  const [printScale, setPrintScale] = useState(0.5)

  const isPro = user?.plan === 'PRO'
  const firstLoad = useRef(true)
  const previewWrap = useRef<HTMLDivElement>(null)
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // ── Chargement ──
  useEffect(() => {
    fetch(`/api/resumes/${id}`)
      .then(async (r) => {
        if (!r.ok) throw new Error()
        const d = await r.json()
        const res: ResumePayload = d.resume
        setTitle(res.title)
        setTemplate(res.template)
        setAccent(res.accent)
        setCvLocale(res.locale as Locale)
        setSector(res.sector ?? null)
        setData(res.data)
        setLoaded(true)
      })
      .catch(() => navigate({ name: 'dashboard' }))
  }, [id, navigate])

  // ── Échelle de l'aperçu (responsive) ──
  useEffect(() => {
    const el = previewWrap.current
    if (!el) return
    const ro = new ResizeObserver(() => {
      const w = el.clientWidth - 32
      setPrintScale(Math.min(0.72, Math.max(0.3, w / 794)))
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [loaded])

  // ── Sauvegarde automatique (debounce 900 ms) ──
  const patch = useCallback(
    (payload: Record<string, unknown>) => {
      if (firstLoad.current) return
      setSaveState('saving')
      if (saveTimer.current) clearTimeout(saveTimer.current)
      saveTimer.current = setTimeout(() => {
        fetch(`/api/resumes/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
          .then((r) => {
            if (r.ok) setSaveState('saved')
            else setSaveState('idle')
          })
          .catch(() => setSaveState('idle'))
      }, 900)
    },
    [id]
  )

  useEffect(() => {
    if (!loaded) return
    if (firstLoad.current) {
      firstLoad.current = false
      return
    }
    patch({ title, template, accent, locale: cvLocale, data })
  }, [loaded, title, template, accent, cvLocale, data, patch])

  // ── Helpers de mutation ──
  const setPersonal = (key: keyof ResumeData['personal'], value: string) =>
    setData((d) => ({ ...d, personal: { ...d.personal, [key]: value } }))

  const addExp = () =>
    setData((d) => ({
      ...d,
      experiences: [...d.experiences, { id: uid(), position: '', company: '', startDate: '', endDate: '', description: '' }],
    }))

  const addEdu = () =>
    setData((d) => ({
      ...d,
      education: [...d.education, { id: uid(), degree: '', school: '', startDate: '', endDate: '' }],
    }))

  const addLang = () =>
    setData((d) => ({
      ...d,
      languages: [...d.languages, { id: uid(), name: '', level: 'B2' }],
    }))

  const addSkill = () => {
    const s = skillInput.trim()
    if (!s) return
    setData((d) => (d.skills.includes(s) ? d : { ...d, skills: [...d.skills, s] }))
    setSkillInput('')
  }

  // ── IA ──
  const callAi = async (
    key: string,
    action: 'summary' | 'improve' | 'bullets',
    extra: Record<string, unknown>,
    apply: (text: string) => void
  ) => {
    setAiBusy(key)
    try {
      const r = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          locale: cvLocale,
          sector: sector ?? undefined,
          fullName: data.personal.fullName,
          jobTitle: data.personal.jobTitle,
          skills: data.skills,
          ...extra,
        }),
      })
      if (r.status === 429) {
        import('sonner').then(({ toast }) => toast.error(dict.quotaT, { description: dict.quotaD }))
        return
      }
      if (r.status === 401) {
        navigate({ name: 'auth', mode: 'login' })
        return
      }
      const d = await r.json()
      if (!r.ok || !d.text) throw new Error()
      apply(d.text)
      if (user) {
        setUser({ ...user, aiUsed: d.aiUsed ?? user.aiUsed })
      }
      import('sonner').then(({ toast }) => toast.success(dict.saved))
    } catch {
      import('sonner').then(({ toast }) => toast.error(dict.tErr))
    } finally {
      setAiBusy(null)
    }
  }

  const printCv = () => window.print()

  if (!loaded) {
    return (
      <main className="flex flex-1 items-center justify-center bg-slate-50">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-700" />
      </main>
    )
  }

  const aiCreditsLeft = isPro ? null : Math.max(0, AI_FREE_MONTHLY_LIMIT - (user?.aiUsed ?? 0))

  // ── Champs réutilisables ──
  const field = (label: string, value: string, onChange: (v: string) => void, placeholder?: string) => (
    <div key={label} className="flex flex-col gap-1.5">
      <Label className="text-[13px]">{label}</Label>
      <Input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="h-9.5 bg-white" />
    </div>
  )

  return (
    <main className="flex-1 bg-slate-100">
      {/* Barre d'outils */}
      <div className="sticky top-16 z-40 border-b bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-2.5 px-4 py-2.5">
          <Button variant="ghost" size="sm" onClick={() => navigate({ name: 'dashboard' })} className="gap-1.5">
            <ArrowLeft className="h-4 w-4" />
            {dict.backDash}
          </Button>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={dict.titlePh}
            className="h-9 w-44 flex-none bg-white font-semibold sm:w-64"
            aria-label={dict.resumeTitle}
          />
          {sector && (
            <span className="rounded-full bg-slate-900 px-2.5 py-1 text-xs font-medium text-white" title={dict.sectorLabel}>
              {getPack(sector, uiLocale)?.pack.name ?? sector}
            </span>
          )}
          <span className="flex items-center gap-1.5 text-xs text-slate-500" aria-live="polite">
            {saveState === 'saving' ? (
              <><CloudUpload className="h-3.5 w-3.5 animate-pulse" /> …</>
            ) : saveState === 'saved' ? (
              <><Check className="h-3.5 w-3.5 text-emerald-600" /> {dict.saved}</>
            ) : null}
          </span>
          <span className="ml-auto flex items-center gap-2">
            {aiCreditsLeft !== null && (
              <span className="hidden items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600 sm:flex">
                <Sparkles className="h-3 w-3 text-emerald-700" />
                {aiCreditsLeft}/{AI_FREE_MONTHLY_LIMIT}
              </span>
            )}
            <Select value={cvLocale} onValueChange={(v) => setCvLocale(v as Locale)}>
              <SelectTrigger className="h-9 w-27.5" aria-label={dict.language}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LOCALES.map((l) => (
                  <SelectItem key={l} value={l}>
                    {LOCALE_FLAGS[l]} {l.toUpperCase()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button size="sm" onClick={printCv} variant="outline" className="h-9 border-slate-300">
              <FileDown className="h-4 w-4" />
              {dict.download}
            </Button>
          </span>
        </div>
      </div>

      <div className="mx-auto grid max-w-7xl gap-5 px-4 py-5 lg:grid-cols-2">
        {/* ═══ Colonne formulaire ═══ */}
        <div className="min-w-0">
          <Tabs defaultValue="form" className="lg:hidden">
            <TabsList className="mb-4 grid w-full grid-cols-2">
              <TabsTrigger value="form">{dict.tabForm}</TabsTrigger>
              <TabsTrigger value="prev">{dict.tabPreview}</TabsTrigger>
            </TabsList>
            <TabsContent value="form">{formSection()}</TabsContent>
            <TabsContent value="prev">{previewPane()}</TabsContent>
          </Tabs>
          <div className="hidden lg:block">{formSection()}</div>
        </div>

        {/* ═══ Colonne aperçu (desktop) ═══ */}
        <div className="hidden lg:block">
          <div className="sticky top-31">{previewPane()}</div>
        </div>
      </div>

      {/* Zone d'impression (PDF) — invisible à l'écran, seule visible à l'impression */}
      <div className="print-area hidden" aria-hidden>
        <ResumePreview template={template} accent={accent} data={data} locale={cvLocale} scale={1} />
      </div>
    </main>
  )

  // ─── Aperçu ───
  function previewPane() {
    return (
      <div className="flex flex-col gap-4">
        {/* Design : template + couleurs */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <div className="mb-2.5 flex items-center gap-2 text-sm font-semibold text-slate-800">
            <Palette className="h-4 w-4 text-emerald-700" />
            {dict.secDesign}
          </div>
          <div className="grid grid-cols-5 gap-1.5">
            {TEMPLATES.map((t) => {
              const allowed = isTemplateAllowed(t.id, user?.plan ?? 'FREE')
              return (
                <button
                  key={t.id}
                  disabled={!allowed}
                  onClick={() => setTemplate(t.id)}
                  title={dict[t.nameKey as keyof typeof dict] as string}
                  className={`rounded-lg border px-1 py-1.5 text-[11px] font-medium transition ${template === t.id ? 'border-emerald-600 bg-emerald-50 text-emerald-800' : 'border-slate-200 text-slate-600 hover:border-slate-400'} ${!allowed ? 'cursor-not-allowed opacity-40' : ''}`}
                >
                  {!allowed && <Lock className="mx-auto h-3 w-3" />}
                  {dict[t.nameKey as keyof typeof dict] as string}
                </button>
              )
            })}
          </div>
          <div className="mt-3 flex gap-2">
            {ACCENTS.map((a) => {
              const allowed = isAccentAllowed(a.hex, user?.plan ?? 'FREE')
              return (
                <button
                  key={a.hex}
                  disabled={!allowed}
                  onClick={() => setAccent(a.hex)}
                  aria-label={dict[a.nameKey as keyof typeof dict] as string}
                  title={allowed ? (dict[a.nameKey as keyof typeof dict] as string) : `${dict.locked} — ${dict[a.nameKey as keyof typeof dict] as string}`}
                  className={`h-8 w-8 rounded-full border-2 transition ${accent.toLowerCase() === a.hex.toLowerCase() ? 'scale-110 border-slate-900' : 'border-white shadow'} ${!allowed ? 'cursor-not-allowed opacity-35' : ''}`}
                  style={{ background: a.hex }}
                >
                  {!allowed && <Lock className="mx-auto h-3 w-3 text-white" />}
                </button>
              )
            })}
          </div>
        </div>

        {/* Le CV */}
        <div ref={previewWrap} className="flex justify-center rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <div className="overflow-hidden rounded-md shadow-xl ring-1 ring-slate-200" style={{ width: 794 * printScale, height: 1123 * printScale }}>
            <ResumePreview template={template} accent={accent} data={data} locale={cvLocale} scale={printScale} />
          </div>
        </div>
        <p className="text-center text-xs text-slate-400 lg:hidden">≈ A4 · 21 × 29,7 cm</p>
      </div>
    )
  }

  // ─── Formulaire complet ───
  function formSection() {
    return (
      <div className="flex flex-col gap-5">
        {/* Infos perso */}
        <section className="rounded-2xl border border-slate-200 bg-slate-50/60 p-5">
          <h2 className="mb-4 flex items-center gap-2 font-bold text-slate-900">
            <User className="h-4.5 w-4.5 text-emerald-700" />
            {dict.secPersonal}
          </h2>
          <div className="grid gap-3.5 sm:grid-cols-2">
            {field(dict.fullName, data.personal.fullName, (v) => setPersonal('fullName', v))}
            {field(dict.jobTitle, data.personal.jobTitle, (v) => setPersonal('jobTitle', v))}
            {field(dict.email, data.personal.email, (v) => setPersonal('email', v), dict.emailPh)}
            {field('Téléphone', data.personal.phone, (v) => setPersonal('phone', v), dict.phonePh)}
            {field('Localisation', data.personal.location, (v) => setPersonal('location', v), dict.locationPh)}
            {field('Site web', data.personal.website, (v) => setPersonal('website', v), dict.websitePh)}
            <div className="sm:col-span-2">{field('LinkedIn', data.personal.linkedin, (v) => setPersonal('linkedin', v), dict.linkedinPh)}</div>
          </div>
        </section>

        {/* Accroche + IA */}
        <section className="rounded-2xl border border-slate-200 bg-slate-50/60 p-5">
          <h2 className="mb-4 flex items-center gap-2 font-bold text-slate-900">
            <Sparkles className="h-4.5 w-4.5 text-emerald-700" />
            {dict.secSummary}
          </h2>
          <Textarea
            value={data.summary}
            onChange={(e) => setData((d) => ({ ...d, summary: e.target.value }))}
            placeholder={dict.sumPh}
            rows={4}
            className="bg-white"
          />
          <div className="mt-3 flex flex-wrap gap-2">
            <Button
              size="sm"
              disabled={aiBusy !== null}
              onClick={() => callAi('summary', 'summary', {}, (t) => setData((d) => ({ ...d, summary: t })))}
              className="bg-emerald-700 text-white hover:bg-emerald-800"
            >
              {aiBusy === 'summary' ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
              {dict.aiGen}
            </Button>
            {data.summary.trim() && (
              <Button
                size="sm"
                variant="outline"
                disabled={aiBusy !== null}
                onClick={() => callAi('improve', 'improve', { text: data.summary }, (t) => setData((d) => ({ ...d, summary: t })))}
                className="border-emerald-200 text-emerald-800 hover:bg-emerald-50"
              >
                {aiBusy === 'improve' ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
                {dict.aiImprove}
              </Button>
            )}
          </div>
        </section>

        {/* Expériences */}
        <section className="rounded-2xl border border-slate-200 bg-slate-50/60 p-5">
          <h2 className="mb-4 flex items-center gap-2 font-bold text-slate-900">
            <Briefcase className="h-4.5 w-4.5 text-emerald-700" />
            {dict.secExp}
          </h2>
          <div className="flex flex-col gap-4">
            {data.experiences.map((exp, idx) => (
              <div key={exp.id} className="relative rounded-xl border border-slate-200 bg-white p-4">
                <button
                  onClick={() => setData((d) => ({ ...d, experiences: d.experiences.filter((x) => x.id !== exp.id) }))}
                  className="absolute top-3 right-3 rounded-md p-1 text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                  aria-label={dict.delete}
                >
                  <X className="h-4 w-4" />
                </button>
                <div className="grid gap-3 sm:grid-cols-2">
                  {field(dict.position, exp.position, (v) => setData((d) => ({ ...d, experiences: d.experiences.map((x, i) => (i === idx ? { ...x, position: v } : x)) })))}
                  {field(dict.company, exp.company, (v) => setData((d) => ({ ...d, experiences: d.experiences.map((x, i) => (i === idx ? { ...x, company: v } : x)) })))}
                  {field(dict.start, exp.startDate, (v) => setData((d) => ({ ...d, experiences: d.experiences.map((x, i) => (i === idx ? { ...x, startDate: v } : x)) })), '2022')}
                  {field(dict.end, exp.endDate, (v) => setData((d) => ({ ...d, experiences: d.experiences.map((x, i) => (i === idx ? { ...x, endDate: v } : x)) })), dict.present)}
                </div>
                <div className="mt-3 flex flex-col gap-1.5">
                  <Label className="text-[13px]">{dict.expDesc}</Label>
                  <Textarea
                    value={exp.description}
                    onChange={(e) => setData((d) => ({ ...d, experiences: d.experiences.map((x, i) => (i === idx ? { ...x, description: e.target.value } : x)) }))}
                    rows={3}
                    placeholder={dict.expDesc}
                    className="bg-white"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={aiBusy !== null}
                    onClick={() =>
                      callAi(
                        `bullets-${exp.id}`,
                        'bullets',
                        { position: exp.position, company: exp.company, text: exp.description },
                        (t) => setData((d) => ({ ...d, experiences: d.experiences.map((x, i) => (i === idx ? { ...x, description: t } : x)) }))
                      )
                    }
                    className="mt-1 w-fit border-emerald-200 text-emerald-800 hover:bg-emerald-50"
                  >
                    {aiBusy === `bullets-${exp.id}` ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
                    {dict.aiBullet}
                  </Button>
                </div>
              </div>
            ))}
          </div>
          <Button variant="outline" onClick={addExp} className="mt-4 w-full border-dashed border-slate-300 text-slate-600">
            <Plus className="h-4 w-4" />
            {dict.addExp}
          </Button>
        </section>

        {/* Formations */}
        <section className="rounded-2xl border border-slate-200 bg-slate-50/60 p-5">
          <h2 className="mb-4 flex items-center gap-2 font-bold text-slate-900">
            <GraduationCap className="h-4.5 w-4.5 text-emerald-700" />
            {dict.secEdu}
          </h2>
          <div className="flex flex-col gap-4">
            {data.education.map((ed, idx) => (
              <div key={ed.id} className="relative rounded-xl border border-slate-200 bg-white p-4">
                <button
                  onClick={() => setData((d) => ({ ...d, education: d.education.filter((x) => x.id !== ed.id) }))}
                  className="absolute top-3 right-3 rounded-md p-1 text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                  aria-label={dict.delete}
                >
                  <X className="h-4 w-4" />
                </button>
                <div className="grid gap-3 sm:grid-cols-2">
                  {field(dict.degree, ed.degree, (v) => setData((d) => ({ ...d, education: d.education.map((x, i) => (i === idx ? { ...x, degree: v } : x)) })))}
                  {field(dict.school, ed.school, (v) => setData((d) => ({ ...d, education: d.education.map((x, i) => (i === idx ? { ...x, school: v } : x)) })))}
                  {field(dict.start, ed.startDate, (v) => setData((d) => ({ ...d, education: d.education.map((x, i) => (i === idx ? { ...x, startDate: v } : x)) })), '2017')}
                  {field(dict.end, ed.endDate, (v) => setData((d) => ({ ...d, education: d.education.map((x, i) => (i === idx ? { ...x, endDate: v } : x)) })), '2019')}
                </div>
              </div>
            ))}
          </div>
          <Button variant="outline" onClick={addEdu} className="mt-4 w-full border-dashed border-slate-300 text-slate-600">
            <Plus className="h-4 w-4" />
            {dict.addEdu}
          </Button>
        </section>

        {/* Compétences */}
        <section className="rounded-2xl border border-slate-200 bg-slate-50/60 p-5">
          <h2 className="mb-4 flex items-center gap-2 font-bold text-slate-900">
            <Wrench className="h-4.5 w-4.5 text-emerald-700" />
            {dict.secSkills}
          </h2>
          <div className="mb-3 flex gap-2">
            <Input
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
              placeholder={dict.skillPh}
              className="h-9.5 bg-white"
            />
            <Button onClick={addSkill} className="h-9.5 shrink-0 bg-emerald-700 hover:bg-emerald-800">
              <Plus className="h-4 w-4" />
              {dict.addSkill}
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {data.skills.map((s, i) => (
              <span key={i} className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-white py-1 pr-2 pl-3 text-sm text-slate-700">
                {s}
                <button onClick={() => setData((d) => ({ ...d, skills: d.skills.filter((_, j) => j !== i) }))} className="rounded-full p-0.5 text-slate-400 hover:bg-red-50 hover:text-red-600" aria-label={dict.delete}>
                  <X className="h-3.5 w-3.5" />
                </button>
              </span>
            ))}
            {data.skills.length === 0 && <p className="text-sm text-slate-400">—</p>}
          </div>
          {sector && (() => {
            const packEntry = getPack(sector, uiLocale)
            if (!packEntry) return null
            const suggestions = sectorSkillsFlat(packEntry.pack).filter((s) => !data.skills.includes(s)).slice(0, 12)
            if (suggestions.length === 0) return null
            return (
              <div className="mt-3">
                <p className="mb-1.5 text-xs font-medium text-slate-500">
                  {dict.skillSuggest} — {packEntry.pack.name}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {suggestions.map((s) => (
                    <button
                      key={s}
                      onClick={() => setData((d) => (d.skills.includes(s) ? d : { ...d, skills: [...d.skills, s] }))}
                      className="rounded-full border border-dashed border-slate-300 bg-white px-2.5 py-1 text-xs text-slate-600 transition hover:border-emerald-500 hover:text-emerald-700"
                    >
                      + {s}
                    </button>
                  ))}
                </div>
              </div>
            )
          })()}
        </section>

        {/* Langues */}
        <section className="rounded-2xl border border-slate-200 bg-slate-50/60 p-5">
          <h2 className="mb-4 flex items-center gap-2 font-bold text-slate-900">
            <Languages className="h-4.5 w-4.5 text-emerald-700" />
            {dict.secLang}
          </h2>
          <div className="flex flex-col gap-3">
            {data.languages.map((lg, idx) => (
              <div key={lg.id} className="flex items-end gap-2">
                <div className="flex-1">
                  {field(dict.language, lg.name, (v) => setData((d) => ({ ...d, languages: d.languages.map((x, i) => (i === idx ? { ...x, name: v } : x)) })), dict.langPh)}
                </div>
                <Select
                  value={lg.level}
                  onValueChange={(v) => setData((d) => ({ ...d, languages: d.languages.map((x, i) => (i === idx ? { ...x, level: v } : x)) }))}
                >
                  <SelectTrigger className="h-9.5 w-40 bg-white">
                    <SelectValue placeholder={dict.level} />
                  </SelectTrigger>
                  <SelectContent>
                    {LEVELS.map((l) => (
                      <SelectItem key={l} value={l}>
                        {l === 'native' ? dict.lvlNative : l}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9.5 w-9.5 shrink-0 text-slate-400 hover:bg-red-50 hover:text-red-600"
                  onClick={() => setData((d) => ({ ...d, languages: d.languages.filter((x) => x.id !== lg.id) }))}
                  aria-label={dict.delete}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
          <Button variant="outline" onClick={addLang} className="mt-4 w-full border-dashed border-slate-300 text-slate-600">
            <Plus className="h-4 w-4" />
            {dict.addLang}
          </Button>
        </section>
      </div>
    )
  }
}
