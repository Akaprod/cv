'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import { useApp } from '@/components/app-context'
import { ScaledResume } from '@/components/resume-preview'
import { TEMPLATES, ACCENTS } from '@/lib/templates'
import { FREE_MAX_RESUMES, AI_FREE_MONTHLY_LIMIT, type ResumeData } from '@/lib/types'
import { ACTIVE_SECTORS, getPack } from '@/lib/sectors'
import {
  Plus, Eye, Pencil, Trash2, Copy, ExternalLink, Sparkles, Lock, Crown, BarChart3, Globe2,
} from 'lucide-react'

interface ResumeRow {
  id: string
  title: string
  template: string
  accent: string
  sector: string | null
  isPublic: boolean
  views: number
  locale: string
  updatedAt: string
  ownerUsername: string
  data: ResumeData
}

interface ListResponse {
  resumes: ResumeRow[]
  recentViews: { resumeId: string; at: string }[]
}

export default function DashboardView() {
  const { dict, navigate, user, setUser, locale } = useApp()
  const [list, setList] = useState<ResumeRow[] | null>(null)
  const [recent, setRecent] = useState<{ resumeId: string; at: string }[]>([])
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [showLimit, setShowLimit] = useState(false)
  const [creating, setCreating] = useState(false)
  const [openNew, setOpenNew] = useState(false)

  // Nouveau CV : choix du design + branche sectorielle
  const [newTitle, setNewTitle] = useState('')
  const [newTpl, setNewTpl] = useState('moderne')
  const [newAccent, setNewAccent] = useState(ACCENTS[0].hex)
  const [newSector, setNewSector] = useState('')

  const isPro = user?.plan === 'PRO'
  const aiLeft = isPro ? null : Math.max(0, AI_FREE_MONTHLY_LIMIT - (user?.aiUsed ?? 0))

  const load = useCallback(async () => {
    try {
      const r = await fetch('/api/resumes')
      if (r.status === 401) {
        navigate({ name: 'auth', mode: 'login' })
        return
      }
      const d: ListResponse = await r.json()
      setList(d.resumes)
      setRecent(d.recentViews ?? [])
    } catch {
      setList([])
    }
  }, [navigate])

  useEffect(() => {
    void load()
  }, [load])

  // Le CV "en ligne" = le plus récemment modifié parmi les publics
  const liveId = useMemo(() => {
    if (!list) return null
    const pub = list.filter((r) => r.isPublic)
    if (pub.length === 0) return null
    return pub[0].id // liste triée par updatedAt desc
  }, [list])

  const totalViews = (list ?? []).reduce((acc, r) => acc + r.views, 0)

  // Vues des 7 derniers jours, par jour
  const weekBars = useMemo(() => {
    const days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date()
      d.setHours(0, 0, 0, 0)
      d.setDate(d.getDate() - (6 - i))
      return d
    })
    return days.map((d) => {
      const next = new Date(d.getTime() + 24 * 3600 * 1000)
      const count = recent.filter((l) => {
        const t = new Date(l.at)
        return t >= d && t < next
      }).length
      return { label: d.toLocaleDateString(locale, { weekday: 'narrow' }), count }
    })
  }, [recent, locale])
  const weekMax = Math.max(1, ...weekBars.map((b) => b.count))

  const createResume = async () => {
    setCreating(true)
    try {
      const r = await fetch('/api/resumes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newTitle || 'Mon CV', template: newTpl, accent: newAccent, locale, sector: newSector || null }),
      })
      const d = await r.json()
      if (r.status === 403) {
        setShowLimit(true)
        setCreating(false)
        return
      }
      if (!r.ok) throw new Error()
      setCreating(false)
      navigate({ name: 'editor', id: d.id })
    } catch {
      setCreating(false)
    }
  }

  const togglePublic = async (row: ResumeRow, value: boolean) => {
    await fetch(`/api/resumes/${row.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isPublic: value }),
    })
    void load()
  }

  const copyLink = async (row: ResumeRow) => {
    const url = `${window.location.origin}/@${row.ownerUsername}`
    try {
      await navigator.clipboard.writeText(url)
    } catch {
      const ta = document.createElement('textarea')
      ta.value = url
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      ta.remove()
    }
  }

  const doDelete = async () => {
    if (!deleteId) return
    await fetch(`/api/resumes/${deleteId}`, { method: 'DELETE' })
    setDeleteId(null)
    void load()
  }

  const upgrade = async () => {
    const r = await fetch('/api/billing/upgrade', { method: 'POST' })
    if (r.ok) {
      const d = await r.json()
      if (d.plan === 'PRO' && user) setUser({ ...user, plan: 'PRO' })
      navigate({ name: 'pricing' })
    }
  }

  if (!user) return null

  return (
    <main className="flex-1 bg-slate-50">
      <div className="mx-auto max-w-6xl px-4 py-10">
        {/* En-tête */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              {dict.hello}, <span className="text-emerald-700">@{user.username}</span> 👋
            </h1>
            <p className="mt-1 text-slate-600">
              {dict.myCvs} · {list?.length ?? '…'}
              {!isPro && ` / ${FREE_MAX_RESUMES}`}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={isPro ? 'default' : 'secondary'} className={isPro ? 'bg-emerald-600 px-3 py-1.5 text-[13px]' : 'bg-slate-200 px-3 py-1.5 text-[13px] text-slate-700'}>
              {isPro ? <><Crown className="mr-1 h-3.5 w-3.5" />{dict.planPro}</> : dict.planFree}
            </Badge>
            <Button
              onClick={() => {
                if (!list) return
                if (isPro || list.length < FREE_MAX_RESUMES) {
                  setNewTitle('')
                  setNewTpl('moderne')
                  setNewAccent(ACCENTS[0].hex)
                  // Pré-sélection de la branche sectorielle si arrivée
                  // depuis une landing métier (/hse → ?sector=hse)
                  setNewSector(window.localStorage.getItem('cv_sector') ?? '')
                  setOpenNew(true)
                } else {
                  setShowLimit(true)
                }
              }}
              className="h-11 rounded-xl bg-emerald-700 px-5 font-semibold hover:bg-emerald-800"
            >
              <Plus className="h-4.5 w-4.5" />
              {dict.newCv}
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
              <BarChart3 className="h-4 w-4 text-emerald-700" />
              {dict.totalViews}
            </div>
            <div className="mt-1.5 text-3xl font-extrabold text-slate-900">{totalViews}</div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
              <Globe2 className="h-4 w-4 text-emerald-700" />
              {dict.myCvs}
            </div>
            <div className="mt-1.5 text-3xl font-extrabold text-slate-900">{list?.length ?? '…'}</div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
              <Sparkles className="h-4 w-4 text-emerald-700" />
              {dict.aiCredits}
            </div>
            <div className="mt-1.5 text-3xl font-extrabold text-slate-900">
              {aiLeft === null ? '∞' : `${aiLeft}/${AI_FREE_MONTHLY_LIMIT}`}
            </div>
          </div>
        </div>

        {/* Graphique 7 jours */}
        <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-5">
          <div className="text-sm font-medium text-slate-500">{dict.viewsWeek}</div>
          <div className="mt-4 flex h-24 items-end gap-2" aria-hidden>
            {weekBars.map((b, i) => (
              <div key={i} className="flex flex-1 flex-col items-center gap-1.5">
                <div
                  className="w-full max-w-10 rounded-t-md bg-emerald-600/85 transition-all"
                  style={{ height: `${Math.max(4, (b.count / weekMax) * 76)}px` }}
                  title={`${b.count}`}
                />
                <span className="text-xs text-slate-400">{b.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Encart upgrade (FREE) */}
        {!isPro && (
          <div className="mt-4 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-emerald-200 bg-gradient-to-r from-emerald-50 to-teal-50 p-5">
            <div className="flex items-start gap-3">
              <Crown className="mt-0.5 h-6 w-6 shrink-0 text-emerald-700" />
              <div>
                <div className="font-bold text-slate-900">{dict.upgradeCta}</div>
                <div className="text-sm text-slate-600">{dict.upgradeTxt}</div>
              </div>
            </div>
            <Button onClick={upgrade} className="bg-emerald-700 font-semibold hover:bg-emerald-800">
              {dict.ctaGoPro}
            </Button>
          </div>
        )}

        {/* Liste des CV */}
        <h2 className="mt-10 mb-4 text-lg font-bold text-slate-900">{dict.myCvs}</h2>
        {list === null ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-72 animate-pulse rounded-2xl bg-slate-200/60" />
            ))}
          </div>
        ) : list.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-2xl border-2 border-dashed border-slate-300 bg-white px-6 py-16 text-center">
            <Plus className="h-10 w-10 text-slate-300" />
            <h3 className="text-xl font-bold text-slate-900">{dict.noCvs}</h3>
            <p className="max-w-sm text-slate-600">{dict.noCvsD}</p>
            <Button
              onClick={() => setOpenNew(true)}
              className="mt-2 h-11 rounded-xl bg-emerald-700 px-6 font-semibold hover:bg-emerald-800"
            >
              {dict.createCv}
            </Button>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {list.map((row) => (
              <div key={row.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-lg">
                {/* Miniature cliquable */}
                <button
                  className="relative block w-full cursor-pointer border-b border-slate-100 bg-slate-50 p-3 text-left"
                  onClick={() => navigate({ name: 'editor', id: row.id })}
                  aria-label={`${dict.edit} : ${row.title}`}
                >
                  <div className="mx-auto w-fit">
                    <ScaledResume template={row.template} accent={row.accent} data={row.data} locale={row.locale} scale={0.24} />
                  </div>
                  {row.id === liveId && (
                    <span className="absolute top-2.5 left-2.5 flex items-center gap-1 rounded-full bg-emerald-600 px-2 py-0.5 text-[10px] font-bold tracking-wider text-white uppercase">
                      Live
                    </span>
                  )}
                </button>

                <div className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h3 className="truncate font-bold text-slate-900">{row.title}</h3>
                      <p className="mt-0.5 flex items-center gap-1 text-xs text-slate-500">
                        <Eye className="h-3.5 w-3.5" />
                        {row.views} {dict.views}
                        {' · '}
                        {new Date(row.updatedAt).toLocaleDateString(locale)}
                      </p>
                      {row.sector && (
                        <span className="mt-1 inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                          {getPack(row.sector, locale)?.pack.name ?? row.sector}
                        </span>
                      )}
                    </div>
                    <div className="flex shrink-0 items-center gap-1.5">
                      <Switch
                        checked={row.isPublic}
                        onCheckedChange={(v) => void togglePublic(row, v)}
                        aria-label={row.isPublic ? dict.makePriv : dict.makePub}
                      />
                      <span className="text-xs font-medium text-slate-500">{row.isPublic ? dict.pub : dict.priv}</span>
                    </div>
                  </div>

                  <div className="mt-3.5 flex flex-wrap items-center gap-1.5">
                    <Button size="sm" onClick={() => navigate({ name: 'editor', id: row.id })} className="h-8 flex-1 bg-emerald-700 hover:bg-emerald-800">
                      <Pencil className="h-3.5 w-3.5" />
                      {dict.edit}
                    </Button>
                    <Button size="sm" variant="outline" className="h-8 border-slate-300" onClick={() => void copyLink(row)} aria-label={dict.copy}>
                      <Copy className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 border-slate-300"
                      onClick={() => navigate({ name: 'public', username: row.ownerUsername })}
                      aria-label={dict.viewOnline}
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </Button>
                    <Button size="sm" variant="outline" className="h-8 border-red-200 text-red-600 hover:bg-red-50" onClick={() => setDeleteId(row.id)} aria-label={dict.del}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Dialog : nouveau CV */}
      <Dialog open={openNew} onOpenChange={setOpenNew}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{dict.newCv}</DialogTitle>
            <DialogDescription>{dict.tplSubtitle}</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-slate-700" htmlFor="new-title">{dict.resumeTitle}</label>
              <input
                id="new-title"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder={dict.titlePh}
                className="h-10 rounded-md border border-input bg-transparent px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-emerald-600"
              />
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-sm font-medium text-slate-700">{dict.sectorLabel}</span>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setNewSector('')}
                  className={`rounded-lg border px-3 py-2 text-xs font-medium transition ${newSector === '' ? 'border-emerald-600 bg-emerald-50 text-emerald-800' : 'border-slate-200 text-slate-600 hover:border-slate-400'}`}
                >
                  {dict.sectorGeneral}
                </button>
                {ACTIVE_SECTORS.map((s) => {
                  const name = getPack(s.slug, locale)?.pack.name ?? s.slug
                  return (
                    <button
                      key={s.slug}
                      onClick={() => setNewSector(s.slug)}
                      className={`rounded-lg border px-3 py-2 text-xs font-medium transition ${newSector === s.slug ? 'border-emerald-600 bg-emerald-50 text-emerald-800' : 'border-slate-200 text-slate-600 hover:border-slate-400'}`}
                    >
                      {name}
                    </button>
                  )
                })}
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-sm font-medium text-slate-700">{dict.template}</span>
              <div className="grid grid-cols-5 gap-2">
                {TEMPLATES.map((t) => {
                  const allowed = isPro || t.free
                  return (
                    <button
                      key={t.id}
                      disabled={!allowed}
                      onClick={() => setNewTpl(t.id)}
                      className={`rounded-lg border px-1 py-2 text-xs font-medium transition ${newTpl === t.id ? 'border-emerald-600 bg-emerald-50 text-emerald-800' : 'border-slate-200 text-slate-600 hover:border-slate-400'} ${!allowed ? 'cursor-not-allowed opacity-40' : ''}`}
                    >
                      {!allowed && <Lock className="mx-auto mb-0.5 h-3 w-3" />}
                      {dict[t.nameKey as keyof typeof dict] as string}
                    </button>
                  )
                })}
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-sm font-medium text-slate-700">{dict.accent}</span>
              <div className="flex gap-2">
                {ACCENTS.map((a) => {
                  const allowed = isPro || a.free
                  return (
                    <button
                      key={a.hex}
                      disabled={!allowed}
                      onClick={() => setNewAccent(a.hex)}
                      aria-label={a.hex}
                      className={`h-9 w-9 rounded-full border-2 transition ${newAccent === a.hex ? 'scale-110 border-slate-900' : 'border-white shadow'} ${!allowed ? 'cursor-not-allowed opacity-35' : ''}`}
                      style={{ background: a.hex }}
                    />
                  )
                })}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenNew(false)}>{dict.cancel}</Button>
            <Button onClick={createResume} disabled={creating} className="bg-emerald-700 hover:bg-emerald-800">
              {dict.newCv}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog : limite gratuit */}
      <Dialog open={showLimit} onOpenChange={setShowLimit}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-emerald-700" />
              {dict.freeLimit}
            </DialogTitle>
            <DialogDescription>{dict.freeLimitD}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowLimit(false)}>{dict.close}</Button>
            <Button onClick={upgrade} className="bg-emerald-700 hover:bg-emerald-800">
              <Crown className="h-4 w-4" />
              {dict.ctaGoPro}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmation suppression */}
      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{dict.del}</AlertDialogTitle>
            <AlertDialogDescription>{dict.delQ}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{dict.cancel}</AlertDialogCancel>
            <AlertDialogAction onClick={doDelete} className="bg-red-600 hover:bg-red-700">
              {dict.delete}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  )
}
