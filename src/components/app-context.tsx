'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { toast as sonnerToast } from 'sonner'
import { getDict, normalizeLocale, type Dict, type Locale } from '@/lib/i18n'
import { ACTIVE_SECTOR_SLUGS } from '@/lib/sectors'
import type { MeResponse } from '@/lib/types'

// ─── Vues de l'application (routeur client dans la page unique) ─────────────
export type View =
  | { name: 'landing'; scrollTo?: string }
  | { name: 'auth'; mode: 'login' | 'register' }
  | { name: 'dashboard' }
  | { name: 'editor'; id: string }
  | { name: 'pricing' }
  | { name: 'public'; username: string }

interface AppContextValue {
  user: MeResponse | null
  userLoaded: boolean
  refreshUser: () => Promise<MeResponse | null>
  setUser: (u: MeResponse | null) => void
  locale: Locale
  setLocale: (l: Locale) => void
  dict: Dict
  view: View
  navigate: (v: View) => void
}

const AppContext = createContext<AppContextValue | null>(null)

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp doit être utilisé dans AppProvider')
  return ctx
}

// ─── Helpers de parsing d'URL ────────────────────────────────────────────────
function parseHash(hash: string): View | null {
  const h = hash.replace(/^#\/?/, '')
  if (!h) return null
  const [head, arg] = h.split('/')
  switch (head) {
    case 'dashboard':
      return { name: 'dashboard' }
    case 'editeur':
    case 'editor':
      return arg ? { name: 'editor', id: arg } : { name: 'dashboard' }
    case 'prix':
    case 'pricing':
      return { name: 'pricing' }
    case 'connexion':
      return { name: 'auth', mode: 'login' }
    case 'inscription':
      return { name: 'auth', mode: 'register' }
    case 'u':
      return arg ? { name: 'public', username: arg } : null
    default:
      return null
  }
}

function viewToHash(v: View): string {
  switch (v.name) {
    case 'landing':
      return ''
    case 'auth':
      return v.mode === 'login' ? '#/connexion' : '#/inscription'
    case 'dashboard':
      return '#/dashboard'
    case 'editor':
      return `#/editeur/${v.id}`
    case 'pricing':
      return '#/prix'
    case 'public':
      return `#/u/${v.username}`
  }
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<MeResponse | null>(null)
  const [userLoaded, setUserLoaded] = useState(false)
  const [locale, setLocaleState] = useState<Locale>('fr')
  const [view, setView] = useState<View>({ name: 'landing' })

  // ── Initialisation : qui suis-je + où suis-je (dans le flux async pour
  // éviter les cascades de rendu et les mismatches d'hydratation) ──
  useEffect(() => {
    const saved =
      typeof window !== 'undefined'
        ? window.localStorage.getItem('cv_locale') ?? window.localStorage.getItem('hse_locale')
        : null

    // Branche sectorielle : une arrivée depuis une landing métier
    // (ex : /hse → « Créer mon CV ») transmet ?sector=hse. On mémorise
    // la branche pour pré-remplir la sélection au moment de créer un CV.
    const sectorParam = new URLSearchParams(window.location.search).get('sector')
    if (sectorParam && ACTIVE_SECTOR_SLUGS.includes(sectorParam.toLowerCase())) {
      window.localStorage.setItem('cv_sector', sectorParam.toLowerCase())
    }

    // Lien viral /@pseudo : l'URL navigateur reste /@farid (rewrite proxy côté
    // serveur). On la lit donc via pathname ET via ?pub= (rewrite interne).
    const pathPub = window.location.pathname.match(/^\/@([a-z0-9-]{3,20})\/?$/i)
    const params = new URLSearchParams(window.location.search)
    const pub = params.get('pub') ?? (pathPub ? pathPub[1] : null)
    const hashView = parseHash(window.location.hash)

    fetch('/api/auth/me')
      .then((r) => r.json())
      .then((d) => {
        if (d.user) {
          setUser(d.user)
          if (!saved) setLocaleState(normalizeLocale(d.user.locale))
          else setLocaleState(normalizeLocale(saved))
        } else if (saved) {
          setLocaleState(normalizeLocale(saved))
        }
      })
      .catch(() => {})
      .finally(() => {
        if (pub) {
          setView({ name: 'public', username: pub })
          // On garde /@pseudo dans la barre d'adresse (URL virale)
          if (params.get('pub')) window.history.replaceState({}, '', '/')
        } else if (hashView) {
          setView(hashView)
        }
        setUserLoaded(true)
      })
  }, [])

  // ── Bouton précédent / suivant du navigateur ──
  useEffect(() => {
    const onHash = () => {
      const pathPub = window.location.pathname.match(/^\/@([a-z0-9-]{3,20})\/?$/i)
      const params = new URLSearchParams(window.location.search)
      const pub = params.get('pub') ?? (pathPub ? pathPub[1] : null)
      if (pub) {
        setView({ name: 'public', username: pub })
        return
      }
      const v = parseHash(window.location.hash)
      setView(v ?? { name: 'landing' })
    }
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  const navigate = useCallback((v: View) => {
    setView(v)
    const hash = viewToHash(v)
    // Si on quitte /@pseudo, repartir de la racine
    const onVanity = /^\/@[a-z0-9-]{3,20}\/?$/i.test(window.location.pathname)
    const basePath = onVanity ? '/' : window.location.pathname
    if (window.location.hash !== hash) {
      if (hash) {
        window.location.hash = hash
        if (onVanity) window.history.replaceState({}, '', `/${hash}`)
      } else {
        window.history.pushState({}, '', basePath)
      }
    }
    window.scrollTo({ top: 0 })
  }, [])

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l)
    window.localStorage.setItem('cv_locale', l)
  }, [])

  const refreshUser = useCallback(async (): Promise<MeResponse | null> => {
    try {
      const r = await fetch('/api/auth/me')
      const d = await r.json()
      setUser(d.user ?? null)
      return d.user ?? null
    } catch {
      return null
    }
  }, [])

  const value = useMemo<AppContextValue>(
    () => ({ user, userLoaded, refreshUser, setUser, locale, setLocale, dict: getDict(locale), view, navigate }),
    [user, userLoaded, refreshUser, locale, setLocale, view, navigate]
  )

  // Toasts en contexte (helpers réutilisables)
  const toastApi = useMemo(
    () => ({
      success: (msg: string) => sonnerToast.success(msg),
      error: (msg: string) => sonnerToast.error(msg),
    }),
    []
  )
  void toastApi

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}
