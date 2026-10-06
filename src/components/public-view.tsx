'use client'

import { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { useApp } from '@/components/app-context'
import ResumePreview from '@/components/resume-preview'
import { BRAND } from '@/lib/i18n'
import type { ResumeData } from '@/lib/types'
import { FileText, FileDown, Copy, Share2, Eye, Globe2, Loader2, EyeOff, SearchX } from 'lucide-react'

interface PublicPayload {
  status: 'ok' | 'notFound'
  username?: string
  plan?: string
  resume?: {
    title: string
    template: string
    accent: string
    views: number
    locale: string
    data: ResumeData
  }
}

export default function PublicView({ username }: { username: string }) {
  const { dict, navigate } = useApp()
  const [payload, setPayload] = useState<PublicPayload | null>(null)
  const [scale, setScale] = useState(0.6)
  const wrapRef = useRef<HTMLDivElement>(null)

  // Chargement du CV public
  useEffect(() => {
    fetch(`/api/public/${encodeURIComponent(username)}`)
      .then(async (r) => {
        const d = await r.json()
        setPayload(d)
        if (d.status === 'ok') {
          document.title = `${d.resume?.data?.personal?.fullName || '@' + d.username} — ${BRAND}`
        } else {
          document.title = dict.notFound + ' — ' + BRAND
        }
      })
      .catch(() => setPayload({ status: 'notFound' }))
  }, [username, dict.notFound])

  // Compteur de vues : 1 fois par session pour ce pseudo
  useEffect(() => {
    if (!payload || payload.status !== 'ok') return
    const key = `hse_viewed_${username}_${new Date().toISOString().slice(0, 13)}` // 1×/h max
    if (sessionStorage.getItem(key)) return
    sessionStorage.setItem(key, '1')
    fetch(`/api/public/${encodeURIComponent(username)}/view`, { method: 'POST' }).catch(() => {})
  }, [payload, username])

  // Échelle responsive
  useEffect(() => {
    const el = wrapRef.current
    if (!el) return
    const ro = new ResizeObserver(() => {
      const w = el.clientWidth - 24
      setScale(Math.min(1, Math.max(0.3, w / 794)))
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [payload?.status])

  const shareUrl = typeof window !== 'undefined' ? `${window.location.origin}/@${username}` : ''

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      import('sonner').then(({ toast }) => toast.success(dict.tCopied))
    } catch {
      const ta = document.createElement('textarea')
      ta.value = shareUrl
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      ta.remove()
      import('sonner').then(({ toast }) => toast.success(dict.tCopied))
    }
  }

  const share = async () => {
    if (navigator.share) {
      await navigator.share({ title: dict.share, url: shareUrl }).catch(() => {})
    } else {
      void copyLink()
    }
  }

  // ── États vides ──
  if (payload && payload.status !== 'ok') {
    return (
      <main className="flex flex-1 items-center justify-center bg-slate-50 px-4 py-16">
        <div className="flex max-w-md flex-col items-center gap-4 text-center">
          {payload.status === 'notFound' ? (
            <SearchX className="h-14 w-14 text-slate-300" />
          ) : (
            <EyeOff className="h-14 w-14 text-slate-300" />
          )}
          <h1 className="text-2xl font-bold text-slate-900">{payload.status === 'notFound' ? dict.notFound : dict.privateCv}</h1>
          <p className="text-slate-600">{payload.status === 'notFound' ? dict.notFoundD : dict.privateD}</p>
          <Button onClick={() => navigate({ name: 'landing' })} className="mt-2 bg-emerald-700 hover:bg-emerald-800">
            {BRAND}
          </Button>
        </div>
      </main>
    )
  }

  if (!payload) {
    return (
      <main className="flex flex-1 items-center justify-center bg-slate-50">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-700" />
      </main>
    )
  }

  const r = payload.resume!

  return (
    <main className="flex-1 bg-slate-100">
      {/* Barre d'actions */}
      <div className="sticky top-16 z-40 border-b bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-2 px-4 py-2.5">
          <span className="flex items-center gap-2 text-sm font-semibold text-slate-800">
            <Globe2 className="h-4 w-4 text-emerald-700" />
            /@{payload.username}
          </span>
          <span className="flex items-center gap-1 text-xs text-slate-500">
            <Eye className="h-3.5 w-3.5" />
            {r.views} {dict.views}
          </span>
          <span className="ml-auto flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={copyLink} className="h-9 border-slate-300">
              <Copy className="h-4 w-4" />
              <span className="hidden sm:inline">{dict.copy}</span>
            </Button>
            <Button size="sm" variant="outline" onClick={share} className="h-9 border-slate-300">
              <Share2 className="h-4 w-4" />
              <span className="hidden sm:inline">{dict.share}</span>
            </Button>
            <Button size="sm" onClick={() => window.print()} className="h-9 bg-emerald-700 hover:bg-emerald-800">
              <FileDown className="h-4 w-4" />
              <span className="hidden sm:inline">{dict.download}</span>
            </Button>
          </span>
        </div>
      </div>

      {/* Le CV */}
      <div className="mx-auto max-w-5xl px-4 py-8">
        <div ref={wrapRef} className="flex justify-center">
          <div
            className="overflow-hidden rounded-lg shadow-2xl ring-1 ring-slate-300"
            style={{ width: 794 * scale, height: 1123 * scale }}
          >
            <ResumePreview template={r.template} accent={r.accent} data={r.data} locale={r.locale} scale={scale} />
          </div>
        </div>

        {/* Badge gratuit / branding */}
        {payload.plan !== 'PRO' && (
          <div className="mt-6 flex justify-center">
            <button
              onClick={() => navigate({ name: 'landing' })}
              className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-600 shadow-sm transition hover:shadow-md"
            >
              <span className="flex h-5 w-5 items-center justify-center rounded bg-emerald-700 text-[10px] font-bold text-white">
                <FileText className="h-3 w-3" />
              </span>
              {dict.badge} <span className="font-semibold text-slate-800">{BRAND}</span>
              <span className="text-emerald-700">— {dict.ctaStart}</span>
            </button>
          </div>
        )}
      </div>

      {/* Impression : CV seul, pleine taille */}
      <div className="print-area hidden" aria-hidden>
        <ResumePreview template={r.template} accent={r.accent} data={r.data} locale={r.locale} scale={1} />
      </div>
    </main>
  )
}
