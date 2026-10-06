'use client'

import { BRAND, DOMAIN } from './brand'
import { fr } from './locales/fr'
import { en } from './locales/en'
import { es } from './locales/es'
import { de } from './locales/de'
import { it } from './locales/it'

export const LOCALES = ['fr', 'en', 'es', 'de', 'it'] as const
export type Locale = (typeof LOCALES)[number]

export const LOCALE_LABELS: Record<Locale, string> = {
  fr: 'Français',
  en: 'English',
  es: 'Español',
  de: 'Deutsch',
  it: 'Italiano',
}

export const LOCALE_FLAGS: Record<Locale, string> = {
  fr: '🇫🇷',
  en: '🇬🇧',
  es: '🇪🇸',
  de: '🇩🇪',
  it: '🇮🇹',
}

export type Dict = typeof fr

// Rebranding centralisé : les anciennes chaînes « HSE Academy CV » et
// « hseacademy.online » présentes dans les fichiers de traduction sont
// remplacées à la volée par la marque neutre (src/lib/brand.ts).
// Changer le nom du produit = modifier brand.ts uniquement.
function rebrand<T>(value: T): T {
  if (typeof value === 'string') {
    return value
      .replace(/HSE Academy CV/g, BRAND)
      .replace(/hseacademy\.online/g, DOMAIN) as unknown as T
  }
  if (Array.isArray(value)) return value.map(rebrand) as unknown as T
  if (value && typeof value === 'object') {
    const out: Record<string, unknown> = {}
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) out[k] = rebrand(v)
    return out as T
  }
  return value
}

const DICTS: Record<Locale, Dict> = {
  fr: rebrand(fr),
  en: rebrand(en),
  es: rebrand(es),
  de: rebrand(de),
  it: rebrand(it),
}

export function getDict(locale: string | null | undefined): Dict {
  const l = (locale ?? 'fr').toLowerCase().slice(0, 2) as Locale
  return DICTS[l] ?? fr
}

export function normalizeLocale(locale: string | null | undefined): Locale {
  const l = (locale ?? 'fr').toLowerCase().slice(0, 2) as Locale
  return LOCALES.includes(l) ? l : 'fr'
}

export { BRAND, DOMAIN }
export const PRO_PRICE_MONTH = '3,99 €'
export const PRO_PRICE_YEAR = '39,99 €'
