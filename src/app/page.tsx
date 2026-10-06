'use client'

import { AppProvider, useApp } from '@/components/app-context'
import Navbar from '@/components/navbar'
import Landing, { Footer } from '@/components/landing'
import AuthView from '@/components/auth-view'
import DashboardView from '@/components/dashboard-view'
import EditorView from '@/components/editor-view'
import PublicView from '@/components/public-view'
import PricingView from '@/components/pricing-view'
import { BRAND } from '@/lib/brand'
import { Toaster } from '@/components/ui/sonner'
import { Loader2 } from 'lucide-react'

function Shell() {
  const { view, user, userLoaded } = useApp()

  if (!userLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-700" />
      </div>
    )
  }

  // Page publique /@username : en-tête allégé, sans navigation marketing
  if (view.name === 'public') {
    return (
      <div className="flex min-h-screen flex-col bg-slate-100">
        <header className="sticky top-0 z-50 w-full border-b bg-white/90 backdrop-blur-md">
          <div className="mx-auto flex h-14 max-w-5xl items-center px-4">
            <button onClick={() => window.history.replaceState({}, '', '/')} className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-700 text-white">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4.5 w-4.5">
                  <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
                  <path d="M14 2v4a2 2 0 0 0 2 2h4" />
                </svg>
              </span>
              <span className="font-bold tracking-tight text-slate-900">{BRAND}</span>
            </button>
          </div>
        </header>
        <PublicView username={view.username} />
        <Footer />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Navbar />
      {view.name === 'landing' && <Landing />}
      {view.name === 'auth' && <AuthView mode={view.mode} />}
      {view.name === 'dashboard' && user && <DashboardView />}
      {view.name === 'editor' && user && <EditorView id={view.id} />}
      {view.name === 'pricing' && <PricingView />}
      {(view.name === 'dashboard' || view.name === 'editor') && !user && <AuthView mode="login" />}
      <Footer />
    </div>
  )
}

export default function Home() {
  return (
    <AppProvider>
      <Shell />
      <Toaster position="bottom-right" richColors />
    </AppProvider>
  )
}
