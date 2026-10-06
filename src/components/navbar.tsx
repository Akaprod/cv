'use client'

import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { useApp } from '@/components/app-context'
import { LOCALES, LOCALE_FLAGS, LOCALE_LABELS, BRAND, type Locale } from '@/lib/i18n'
import { FileText, Globe, LayoutDashboard, LogOut, Menu } from 'lucide-react'
import { useState } from 'react'

export default function Navbar({ onLogout }: { onLogout?: () => void }) {
  const { user, dict, locale, setLocale, navigate, view } = useApp()
  const [open, setOpen] = useState(false)

  const goSection = (id: string) => {
    setOpen(false)
    if (view.name === 'landing') {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
    } else {
      navigate({ name: 'landing', scrollTo: id })
    }
  }

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    onLogout?.()
    navigate({ name: 'landing' })
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4">
        {/* Logo */}
        <button onClick={() => navigate({ name: 'landing' })} className="flex items-center gap-2.5 outline-none" aria-label={BRAND}>
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-700 text-white shadow-sm">
            <FileText className="h-5 w-5" />
          </span>
          <span className="text-[17px] font-bold tracking-tight text-slate-900">{BRAND}</span>
        </button>

        {/* Liens desktop */}
        <nav className="hidden items-center gap-1 md:flex" aria-label="Navigation principale">
          <button onClick={() => goSection('features')} className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900">
            {dict.features}
          </button>
          <button onClick={() => goSection('modeles')} className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900">
            {dict.templates}
          </button>
          <button onClick={() => goSection('tarifs')} className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900">
            {dict.pricing}
          </button>
        </nav>

        <div className="flex items-center gap-2">
          {/* Sélecteur de langue */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-1.5 px-2.5" aria-label={dict.language}>
                <Globe className="h-4 w-4 text-slate-500" />
                <span className="text-sm font-medium uppercase">{locale}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-40">
              {LOCALES.map((l: Locale) => (
                <DropdownMenuItem
                  key={l}
                  onClick={() => setLocale(l)}
                  className={l === locale ? 'bg-emerald-50 font-medium text-emerald-800' : ''}
                >
                  <span>{LOCALE_FLAGS[l]}</span>
                  <span>{LOCALE_LABELS[l]}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {user ? (
            <>
              <Button size="sm" onClick={() => navigate({ name: 'dashboard' })} className="hidden gap-1.5 bg-emerald-700 hover:bg-emerald-800 sm:inline-flex">
                <LayoutDashboard className="h-4 w-4" />
                {dict.dashboard}
              </Button>
              <Button variant="ghost" size="icon" onClick={logout} aria-label={dict.logout} className="hidden sm:inline-flex">
                <LogOut className="h-4 w-4 text-slate-500" />
              </Button>
            </>
          ) : (
            <div className="hidden items-center gap-2 sm:flex">
              <Button variant="ghost" size="sm" onClick={() => navigate({ name: 'auth', mode: 'login' })}>
                {dict.login}
              </Button>
              <Button size="sm" onClick={() => navigate({ name: 'auth', mode: 'register' })} className="bg-emerald-700 hover:bg-emerald-800">
                {dict.register}
              </Button>
            </div>
          )}

          {/* Menu mobile */}
          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setOpen(!open)} aria-label="Menu">
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Menu mobile déroulant */}
      {open && (
        <div className="border-t bg-white px-4 py-3 md:hidden">
          <div className="flex flex-col gap-1">
            <button onClick={() => goSection('features')} className="rounded-lg px-3 py-2.5 text-left text-sm font-medium text-slate-700 hover:bg-slate-100">
              {dict.features}
            </button>
            <button onClick={() => goSection('modeles')} className="rounded-lg px-3 py-2.5 text-left text-sm font-medium text-slate-700 hover:bg-slate-100">
              {dict.templates}
            </button>
            <button onClick={() => goSection('tarifs')} className="rounded-lg px-3 py-2.5 text-left text-sm font-medium text-slate-700 hover:bg-slate-100">
              {dict.pricing}
            </button>
            <div className="my-2 h-px bg-slate-200" />
            {user ? (
              <>
                <button onClick={() => { setOpen(false); navigate({ name: 'dashboard' }) }} className="rounded-lg px-3 py-2.5 text-left text-sm font-semibold text-emerald-800 hover:bg-emerald-50">
                  {dict.dashboard}
                </button>
                <button onClick={logout} className="rounded-lg px-3 py-2.5 text-left text-sm font-medium text-slate-700 hover:bg-slate-100">
                  {dict.logout}
                </button>
              </>
            ) : (
              <>
                <button onClick={() => { setOpen(false); navigate({ name: 'auth', mode: 'login' }) }} className="rounded-lg px-3 py-2.5 text-left text-sm font-medium text-slate-700 hover:bg-slate-100">
                  {dict.login}
                </button>
                <button onClick={() => { setOpen(false); navigate({ name: 'auth', mode: 'register' }) }} className="rounded-lg bg-emerald-700 px-3 py-2.5 text-left text-sm font-semibold text-white">
                  {dict.register}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
