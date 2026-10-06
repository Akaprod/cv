'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useApp } from '@/components/app-context'
import type { MeResponse } from '@/lib/types'
import { FileText, Loader2 } from 'lucide-react'

export default function AuthView({ mode }: { mode: 'login' | 'register' }) {
  const { dict, locale, setUser, navigate } = useApp()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isRegister = mode === 'register'

  const errorLabel = (code: string): string => {
    if (code === 'emailTaken') return dict.errEmailTaken
    if (code === 'usernameTaken') return dict.errUsernameTaken
    if (code === 'creds') return dict.errCreds
    return dict.errGeneric
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setBusy(true)
    try {
      const res = await fetch(isRegister ? '/api/auth/register' : '/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(isRegister ? { email, password, username, locale } : { email, password }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(errorLabel(data.error ?? ''))
        return
      }
      setUser(data as MeResponse)
      navigate({ name: 'dashboard' })
    } catch {
      setError(dict.errGeneric)
    } finally {
      setBusy(false)
    }
  }

  const usernameOk = /^[a-z0-9-]{3,20}$/.test(username)

  return (
    <main className="flex flex-1 items-center justify-center bg-slate-50 px-4 py-14">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <span className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-700 text-white shadow-lg shadow-emerald-700/20">
            <FileText className="h-6 w-6" />
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">{isRegister ? dict.regT : dict.loginT}</h1>
          <p className="mt-1.5 text-slate-600">{isRegister ? dict.regS : dict.loginS}</p>
        </div>

        <form onSubmit={submit} className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">
          <div className="flex flex-col gap-2">
            <Label htmlFor="email">{dict.email}</Label>
            <Input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="vous@exemple.com"
              className="h-11"
            />
          </div>

          {isRegister && (
            <div className="flex flex-col gap-2">
              <Label htmlFor="username">{dict.username}</Label>
              <div className="flex items-center">
                <span className="flex h-11 items-center rounded-l-md border border-r-0 border-input bg-muted px-3 text-base font-semibold text-slate-600">
                  @
                </span>
                <Input
                  id="username"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                  placeholder="votrepseudo"
                  className="h-11 rounded-l-none"
                  aria-describedby="username-hint"
                />
              </div>
              <p id="username-hint" className="text-xs leading-relaxed text-slate-500">
                {username.length >= 3 && !usernameOk ? '3-20 · a-z 0-9 -' : dict.usernameHint}
              </p>
            </div>
          )}

          <div className="flex flex-col gap-2">
            <Label htmlFor="password">{dict.password}</Label>
            <Input
              id="password"
              type="password"
              required
              minLength={6}
              autoComplete={isRegister ? 'new-password' : 'current-password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="h-11"
            />
          </div>

          {error && (
            <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700">
              {error}
            </div>
          )}

          <Button type="submit" disabled={busy} className="mt-1 h-11 rounded-xl bg-emerald-700 font-semibold hover:bg-emerald-800">
            {busy && <Loader2 className="h-4 w-4 animate-spin" />}
            {isRegister ? dict.regBtn : dict.loginBtn}
          </Button>

          <p className="text-center text-sm text-slate-600">
            {isRegister ? dict.haveAccount : dict.noAccount}{' '}
            <button
              type="button"
              onClick={() => navigate({ name: 'auth', mode: isRegister ? 'login' : 'register' })}
              className="font-semibold text-emerald-700 underline-offset-4 hover:underline"
            >
              {isRegister ? dict.loginBtn : dict.regBtn}
            </button>
          </p>
        </form>
      </div>
    </main>
  )
}
