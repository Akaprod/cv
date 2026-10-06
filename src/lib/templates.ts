// ─── Templates & couleurs (5 templates × 5 couleurs) ────────────────────────

export interface TemplateDef {
  id: string
  nameKey: string
  descKey: string
  free: boolean
}

export const TEMPLATES: TemplateDef[] = [
  { id: 'moderne', nameKey: 'tplModerne', descKey: 'tplModerneDesc', free: true },
  { id: 'classique', nameKey: 'tplClassique', descKey: 'tplClassiqueDesc', free: true },
  { id: 'minimal', nameKey: 'tplMinimal', descKey: 'tplMinimalDesc', free: true },
  { id: 'compact', nameKey: 'tplCompact', descKey: 'tplCompactDesc', free: false },
  { id: 'elegant', nameKey: 'tplElegant', descKey: 'tplElegantDesc', free: false },
]

export interface AccentDef {
  hex: string
  nameKey: string
  free: boolean
}

export const ACCENTS: AccentDef[] = [
  { hex: '#047857', nameKey: 'colorEmerald', free: true },
  { hex: '#1e3a5f', nameKey: 'colorNavy', free: true },
  { hex: '#9f1239', nameKey: 'colorBordeaux', free: true },
  { hex: '#6d28d9', nameKey: 'colorViolet', free: false },
  { hex: '#b45309', nameKey: 'colorAmber', free: false },
]

export function isTemplateAllowed(templateId: string, plan: string): boolean {
  if (plan === 'PRO') return true
  const tpl = TEMPLATES.find((t) => t.id === templateId)
  return tpl ? tpl.free : true
}

export function isAccentAllowed(hex: string, plan: string): boolean {
  if (plan === 'PRO') return true
  const acc = ACCENTS.find((a) => a.hex.toLowerCase() === hex.toLowerCase())
  return acc ? acc.free : false
}

export function getTemplate(id: string): TemplateDef {
  return TEMPLATES.find((t) => t.id === id) ?? TEMPLATES[0]
}
