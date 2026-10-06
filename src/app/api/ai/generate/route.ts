import { NextResponse } from 'next/server'
import ZAI from 'z-ai-web-dev-sdk'
import { getSessionUser, aiQuotaState, consumeAiCredit } from '@/lib/auth'
import { db } from '@/lib/db'
import { getPack } from '@/lib/sectors'

type Lang = 'fr' | 'en' | 'es' | 'de' | 'it'

const LANG_NAMES: Record<Lang, string> = {
  fr: 'français',
  en: 'English',
  es: 'español',
  de: 'Deutsch',
  it: 'italiano',
}

const INSTRUCTIONS: Record<Lang, Record<string, string>> = {
  fr: {
    summary: 'Tu es un rédacteur professionnel de CV. Rédige une accroche de CV percutante de 2 à 3 phrases (45-70 mots) pour ce candidat. Ton professionnel, concret, sans exagération, sans emoji, sans guillemets. Réponds UNIQUEMENT avec le texte de l\'accroche.',
    improve: 'Tu es un expert en rédaction de CV. Améliore cette accroche de CV : plus percutante, plus concrète, orientée résultats. 2 à 3 phrases maximum, sans emoji, sans guillemets. Réponds UNIQUEMENT avec le texte amélioré.',
    bullets: 'Tu es un expert en CV. Rédige une description d\'expérience professionnelle de 2 à 3 phrases (ou 3 puces courtes séparées par des sauts de ligne) avec verbes d\'action et résultats chiffrés plausibles si possible. Sans emoji, sans guillemets. Réponds UNIQUEMENT avec le texte.',
  },
  en: {
    summary: 'You are a professional CV writer. Write a punchy CV summary of 2-3 sentences (45-70 words) for this candidate. Professional tone, concrete, no exaggeration, no emoji, no quotes. Reply ONLY with the summary text.',
    improve: 'You are a CV writing expert. Improve this CV summary: punchier, more concrete, results-oriented. Max 2-3 sentences, no emoji, no quotes. Reply ONLY with the improved text.',
    bullets: 'You are a CV expert. Write a work experience description of 2-3 sentences (or 3 short bullet lines separated by line breaks) with action verbs and plausible quantified results when possible. No emoji, no quotes. Reply ONLY with the text.',
  },
  es: {
    summary: 'Eres un redactor profesional de CV. Redacta una presentación de CV impactante de 2-3 frases (45-70 palabras) para este candidato. Tono profesional, concreto, sin exageración, sin emojis, sin comillas. Responde ÚNICAMENTE con el texto.',
    improve: 'Eres experto en redacción de CV. Mejora esta presentación: más impactante, más concreta, orientada a resultados. Máximo 2-3 frases, sin emojis, sin comillas. Responde ÚNICAMENTE con el texto mejorado.',
    bullets: 'Eres experto en CV. Redacta una descripción de experiencia profesional de 2-3 frases (o 3 viñetas cortas separadas por saltos de línea) con verbos de acción y resultados cuantificados plausibles si es posible. Sin emojis, sin comillas. Responde ÚNICAMENTE con el texto.',
  },
  de: {
    summary: 'Du bist ein professioneller Lebenslauf-Autor. Schreibe ein überzeugendes Berufsprofil von 2-3 Sätzen (45-70 Wörter) für diesen Kandidaten. Professioneller Ton, konkret, ohne Übertreibung, ohne Emojis, ohne Anführungszeichen. Antworte NUR mit dem Profiltext.',
    improve: 'Du bist ein Experte für Lebensläufe. Verbessere dieses Berufsprofil: überzeugender, konkreter, ergebnisorientiert. Maximal 2-3 Sätze, ohne Emojis, ohne Anführungszeichen. Antworte NUR mit dem verbesserten Text.',
    bullets: 'Du bist ein Lebenslauf-Experte. Schreibe eine Beschreibung der Berufserfahrung von 2-3 Sätzen (oder 3 kurze Stichpunkte mit Zeilenumbrüchen) mit Aktionsverben und plausiblen quantifizierten Ergebnissen, wenn möglich. Ohne Emojis, ohne Anführungszeichen. Antworte NUR mit dem Text.',
  },
  it: {
    summary: 'Sei un redattore professionale di CV. Scrivi una presentazione di CV d\'impatto di 2-3 frasi (45-70 parole) per questo candidato. Tono professionale, concreto, senza esagerazioni, senza emoji, senza virgolette. Rispondi SOLO con il testo.',
    improve: 'Sei un esperto di scrittura CV. Migliora questa presentazione: più d\'impatto, più concreta, orientata ai risultati. Massimo 2-3 frasi, senza emoji, senza virgolette. Rispondi SOLO con il testo migliorato.',
    bullets: 'Sei un esperto di CV. Scrivi una descrizione dell\'esperienza professionale di 2-3 frasi (o 3 punti brevi separati da a capo) con verbi d\'azione e risultati quantificati plausibili se possibile. Senza emoji, senza virgolette. Rispondi SOLO con il testo.',
  },
}

interface AiRequestBody {
  action?: 'summary' | 'improve' | 'bullets'
  locale?: Lang
  sector?: string // branche sectorielle (ex : 'hse') — module le prompt avec le contexte métier
  // contexte candidat
  fullName?: string
  jobTitle?: string
  skills?: string[]
  // pour improve / bullets
  text?: string
  position?: string
  company?: string
}

function buildUserPrompt(body: AiRequestBody): string {
  const parts: string[] = []
  if (body.jobTitle) parts.push(`Métier / Job title: ${body.jobTitle}`)
  if (body.fullName) parts.push(`Nom / Name: ${body.fullName}`)
  if (body.skills?.length) parts.push(`Compétences / Skills: ${body.skills.join(', ')}`)
  if (body.position) parts.push(`Poste / Position: ${body.position}`)
  if (body.company) parts.push(`Entreprise / Company: ${body.company}`)
  if (body.text) parts.push(`Texte actuel / Current text: """${body.text.slice(0, 1500)}"""`)
  return parts.join('\n') || '(candidat sans détails — invente un profil générique plausible)'
}

export async function POST(req: Request) {
  const user = await getSessionUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const quota = aiQuotaState(user)
  if (!quota.allowed) {
    return NextResponse.json({ error: 'quota' }, { status: 429 })
  }

  let body: AiRequestBody
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'invalid' }, { status: 400 })
  }

  const action = ['summary', 'improve', 'bullets'].includes(body.action ?? '') ? body.action! : 'summary'
  const lang: Lang = (['fr', 'en', 'es', 'de', 'it'].includes(body.locale ?? '') ? body.locale : 'fr') as Lang
  let system = INSTRUCTIONS[lang][action]

  // Contexte sectoriel : si le CV est rattaché à une branche (ex : /hse),
  // le prompt est enrichi avec le vocabulaire normatif du métier —
  // suggestions de qualité supérieure, différenciateur vs généralistes.
  if (body.sector) {
    const packEntry = getPack(body.sector, lang)
    if (packEntry) system = `${packEntry.pack.aiContext}\n\n${system}`
  }

  try {
    const zai = await ZAI.create()
    const completion = await zai.chat.completions.create({
      messages: [
        { role: 'assistant', content: system },
        { role: 'user', content: buildUserPrompt(body) },
      ],
      thinking: { type: 'disabled' },
    })

    const raw = completion.choices[0]?.message?.content ?? ''
    const text = raw.replace(/^["«»\s]+|["«»\s]+$/g, '').trim()
    if (!text) {
      return NextResponse.json({ error: 'aiEmpty' }, { status: 502 })
    }

    await consumeAiCredit(user.id, user)
    const fresh = await db.user.findUnique({ where: { id: user.id }, select: { aiUsed: true, aiMonth: true } })

    return NextResponse.json({ text, aiUsed: fresh?.aiUsed ?? user.aiUsed + 1 })
  } catch {
    return NextResponse.json({ error: 'aiFailed' }, { status: 502 })
  }
}
