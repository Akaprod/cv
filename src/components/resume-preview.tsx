'use client'

import type { ResumeData } from '@/lib/types'

// ─── Libellés des sections, dans la langue du CV ────────────────────────────
type Lang = 'fr' | 'en' | 'es' | 'de' | 'it'

const L: Record<Lang, Record<string, string>> = {
  fr: { summary: 'Profil', experience: 'Expérience', education: 'Formation', skills: 'Compétences', languages: 'Langues', contact: 'Contact', native: 'Langue maternelle' },
  en: { summary: 'Profile', experience: 'Experience', education: 'Education', skills: 'Skills', languages: 'Languages', contact: 'Contact', native: 'Native language' },
  es: { summary: 'Perfil', experience: 'Experiencia', education: 'Formación', skills: 'Habilidades', languages: 'Idiomas', contact: 'Contacto', native: 'Lengua materna' },
  de: { summary: 'Profil', experience: 'Erfahrung', education: 'Ausbildung', skills: 'Fähigkeiten', languages: 'Sprachen', contact: 'Kontakt', native: 'Muttersprache' },
  it: { summary: 'Profilo', experience: 'Esperienza', education: 'Formazione', skills: 'Competenze', languages: 'Lingue', contact: 'Contatti', native: 'Lingua madre' },
}

export const DEMO_RESUME: ResumeData = {
  personal: {
    fullName: 'Alex Martin',
    jobTitle: 'Développeur Full-Stack',
    email: 'alex.martin@email.com',
    phone: '+33 6 12 34 56 78',
    location: 'Paris, France',
    website: 'alexmartin.dev',
    linkedin: 'linkedin.com/in/alexmartin',
  },
  summary:
    'Développeur full-stack avec 6 ans d’expérience dans la conception d’applications web performantes. Spécialisé en React et Node.js, j’ai livré des produits utilisés par plus de 200 000 utilisateurs. Passionné par les interfaces propres et le code maintenable.',
  experiences: [
    {
      id: 'd1',
      position: 'Développeur Full-Stack Senior',
      company: 'TechFlow, Paris',
      startDate: '2022',
      endDate: 'Aujourd’hui',
      description:
        'Conception d’une plateforme SaaS utilisée par 200 000+ utilisateurs. Réduction du temps de chargement de 40 %. Encadrement de 3 développeurs juniors.',
    },
    {
      id: 'd2',
      position: 'Développeur Front-End',
      company: 'WebAgency, Lyon',
      startDate: '2019',
      endDate: '2022',
      description:
        'Intégration de 25+ sites clients avec React et TypeScript. Mise en place d’un design system réutilisable, adoption par toute l’équipe.',
    },
  ],
  education: [
    { id: 'e1', degree: 'Master Informatique', school: 'Université Paris-Saclay', startDate: '2017', endDate: '2019' },
  ],
  skills: ['React', 'Next.js', 'TypeScript', 'Node.js', 'PostgreSQL', 'Docker', 'UI/UX'],
  languages: [
    { id: 'l1', name: 'Français', level: 'native' },
    { id: 'l2', name: 'Anglais', level: 'C1' },
  ],
}

// ─── Utilitaires ─────────────────────────────────────────────────────────────
function period(start: string, end: string): string {
  const s = start.trim()
  const e = end.trim()
  if (s && e) return `${s} – ${e}`
  return s || e || ''
}

function hexToRgb(hex: string): string {
  const m = hex.replace('#', '')
  try {
    const n = parseInt(m.length === 3 ? m.split('').map((c) => c + c).join('') : m, 16)
    return `${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}`
  } catch {
    return '4, 120, 87'
  }
}

// Contexte de rendu partagé par les briques de mise en page
interface Ctx {
  d: ResumeData
  t: Record<string, string>
  rgb: string
  accent: string
}

function SectionTitle(ctx: Ctx, children: React.ReactNode, light = false) {
  return (
    <div
      className="font-bold uppercase tracking-[0.14em]"
      style={{ fontSize: 12.5, color: light ? '#fff' : ctx.accent, borderBottom: light ? '1px solid rgba(255,255,255,.35)' : `1px solid ${ctx.accent}`, paddingBottom: 4, marginBottom: 10 }}
    >
      {children}
    </div>
  )
}

function MiniLabel(ctx: Ctx, text: string) {
  return (
    <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.18em', color: ctx.accent, marginBottom: 8 }}>{text}</div>
  )
}

function ExpBlock(ctx: Ctx) {
  return (
    <div className="flex flex-col" style={{ gap: 14 }}>
      {ctx.d.experiences.map((exp) => (
        <div key={exp.id}>
          <div className="flex items-baseline justify-between gap-3">
            <div style={{ fontSize: 14.5, fontWeight: 700, color: '#111827' }}>{exp.position}</div>
            <div style={{ fontSize: 12, color: '#6b7280', whiteSpace: 'nowrap' }}>{period(exp.startDate, exp.endDate)}</div>
          </div>
          <div style={{ fontSize: 13, fontWeight: 600, color: ctx.accent, marginTop: 1 }}>{exp.company}</div>
          {exp.description.trim() && (
            <div style={{ fontSize: 12.5, color: '#374151', marginTop: 4, lineHeight: 1.5, whiteSpace: 'pre-line' }}>{exp.description}</div>
          )}
        </div>
      ))}
    </div>
  )
}

function EduBlock(ctx: Ctx) {
  return (
    <div className="flex flex-col" style={{ gap: 10 }}>
      {ctx.d.education.map((ed) => (
        <div key={ed.id}>
          <div className="flex items-baseline justify-between gap-3">
            <div style={{ fontSize: 13.5, fontWeight: 700, color: '#111827' }}>{ed.degree}</div>
            <div style={{ fontSize: 12, color: '#6b7280', whiteSpace: 'nowrap' }}>{period(ed.startDate, ed.endDate)}</div>
          </div>
          <div style={{ fontSize: 12.5, color: ctx.accent, fontWeight: 600 }}>{ed.school}</div>
        </div>
      ))}
    </div>
  )
}

function SkillsBlock(ctx: Ctx, light = false) {
  return (
    <div className="flex flex-wrap" style={{ gap: 6 }}>
      {ctx.d.skills.map((s, i) => (
        <span
          key={i}
          style={{
            fontSize: 11.5,
            padding: '3px 9px',
            borderRadius: 999,
            background: light ? 'rgba(255,255,255,.16)' : `rgba(${ctx.rgb},.08)`,
            color: light ? '#fff' : '#1f2937',
            border: light ? '1px solid rgba(255,255,255,.25)' : `1px solid rgba(${ctx.rgb},.25)`,
          }}
        >
          {s}
        </span>
      ))}
    </div>
  )
}

function LangBlock(ctx: Ctx, light = false) {
  return (
    <div className="flex flex-col" style={{ gap: 5 }}>
      {ctx.d.languages.map((l) => (
        <div key={l.id} className="flex items-baseline justify-between" style={{ fontSize: 12.5 }}>
          <span style={{ fontWeight: 600, color: light ? '#fff' : '#111827' }}>{l.name}</span>
          <span style={{ color: light ? 'rgba(255,255,255,.85)' : '#6b7280' }}>{l.level === 'native' ? ctx.t.native : l.level}</span>
        </div>
      ))}
    </div>
  )
}

function NameHeader(ctx: Ctx, center = false, light = false) {
  return (
    <div className={center ? 'text-center' : ''}>
      <div style={{ fontSize: 34, fontWeight: 800, letterSpacing: '-0.01em', color: light ? '#fff' : '#111827', lineHeight: 1.1 }}>
        {ctx.d.personal.fullName || 'Votre Nom'}
      </div>
      <div style={{ fontSize: 15, fontWeight: 500, color: light ? 'rgba(255,255,255,.9)' : ctx.accent, marginTop: 3 }}>
        {ctx.d.personal.jobTitle}
      </div>
    </div>
  )
}

function ContactItems(ctx: Ctx) {
  return [ctx.d.personal.email, ctx.d.personal.phone, ctx.d.personal.location, ctx.d.personal.website, ctx.d.personal.linkedin].filter(
    (x) => x.trim()
  )
}

// ─── Composant principal ─────────────────────────────────────────────────────
export interface ResumePreviewProps {
  template: string
  accent: string
  data: ResumeData
  locale?: string
  scale?: number // 1 = pleine taille A4 (794 × 1123 px)
  className?: string
  id?: string
}

export default function ResumePreview({ template, accent, data, locale = 'fr', scale = 1, className = '', id }: ResumePreviewProps) {
  const lang = (['fr', 'en', 'es', 'de', 'it'].includes(locale) ? locale : 'fr') as Lang
  const ctx: Ctx = { d: data, t: L[lang], rgb: hexToRgb(accent), accent }
  const contact = ContactItems(ctx)

  let body: React.ReactNode

  if (template === 'classique') {
    body = (
      <div style={{ padding: '44px 52px', fontFamily: 'Georgia, "Times New Roman", serif', height: '100%', display: 'flex', flexDirection: 'column', gap: 18 }}>
        {NameHeader(ctx, true)}
        <div style={{ height: 2, background: accent, width: 120, margin: '4px auto 0' }} />
        {data.summary.trim() && (
          <div>
            {SectionTitle(ctx, ctx.t.summary)}
            <div style={{ fontSize: 13, color: '#374151', lineHeight: 1.55, whiteSpace: 'pre-line' }}>{data.summary}</div>
          </div>
        )}
        {data.experiences.length > 0 && (
          <div>
            {SectionTitle(ctx, ctx.t.experience)}
            {ExpBlock(ctx)}
          </div>
        )}
        {data.education.length > 0 && (
          <div>
            {SectionTitle(ctx, ctx.t.education)}
            {EduBlock(ctx)}
          </div>
        )}
        <div className="grid grid-cols-2" style={{ gap: 18 }}>
          {data.skills.length > 0 && (
            <div>
              {SectionTitle(ctx, ctx.t.skills)}
              <div style={{ fontSize: 12.5, color: '#374151', lineHeight: 1.7 }}>{data.skills.join(' · ')}</div>
            </div>
          )}
          {data.languages.length > 0 && (
            <div>
              {SectionTitle(ctx, ctx.t.languages)}
              {LangBlock(ctx)}
            </div>
          )}
        </div>
      </div>
    )
  } else if (template === 'minimal') {
    body = (
      <div style={{ padding: '56px 64px', height: '100%', display: 'flex', flexDirection: 'column', gap: 22 }}>
        {NameHeader(ctx)}
        {contact.length > 0 && (
          <div style={{ fontSize: 12, color: '#6b7280', display: 'flex', flexWrap: 'wrap', gap: '4px 14px' }}>
            {contact.map((c, i) => (
              <span key={i}>{c}</span>
            ))}
          </div>
        )}
        {data.summary.trim() && (
          <div>
            {MiniLabel(ctx, ctx.t.summary)}
            <div style={{ fontSize: 13, color: '#374151', lineHeight: 1.6, whiteSpace: 'pre-line' }}>{data.summary}</div>
          </div>
        )}
        {data.experiences.length > 0 && (
          <div>
            {MiniLabel(ctx, ctx.t.experience)}
            {ExpBlock(ctx)}
          </div>
        )}
        {data.education.length > 0 && (
          <div>
            {MiniLabel(ctx, ctx.t.education)}
            {EduBlock(ctx)}
          </div>
        )}
        {data.skills.length > 0 && <div>{MiniLabel(ctx, ctx.t.skills)}{SkillsBlock(ctx)}</div>}
        {data.languages.length > 0 && <div>{MiniLabel(ctx, ctx.t.languages)}{LangBlock(ctx)}</div>}
      </div>
    )
  } else if (template === 'compact') {
    body = (
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '26px 40px 18px', borderBottom: `3px solid ${accent}` }}>
          {NameHeader(ctx, true)}
          {contact.length > 0 && (
            <div style={{ fontSize: 11.5, color: '#6b7280', display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '3px 12px', marginTop: 8 }}>
              {contact.map((c, i) => (
                <span key={i}>{c}</span>
              ))}
            </div>
          )}
        </div>
        <div className="flex flex-1" style={{ minHeight: 0 }}>
          <div style={{ width: '62%', padding: '18px 20px 24px 40px', display: 'flex', flexDirection: 'column', gap: 14 }}>
            {data.summary.trim() && (
              <div>
                {SectionTitle(ctx, ctx.t.summary)}
                <div style={{ fontSize: 12.5, color: '#374151', lineHeight: 1.5, whiteSpace: 'pre-line' }}>{data.summary}</div>
              </div>
            )}
            {data.experiences.length > 0 && (
              <div>
                {SectionTitle(ctx, ctx.t.experience)}
                {ExpBlock(ctx)}
              </div>
            )}
          </div>
          <div style={{ width: '38%', padding: '18px 40px 24px 20px', background: `rgba(${ctx.rgb},.05)`, display: 'flex', flexDirection: 'column', gap: 14 }}>
            {data.education.length > 0 && (
              <div>
                {SectionTitle(ctx, ctx.t.education)}
                {EduBlock(ctx)}
              </div>
            )}
            {data.skills.length > 0 && (
              <div>
                {SectionTitle(ctx, ctx.t.skills)}
                {SkillsBlock(ctx)}
              </div>
            )}
            {data.languages.length > 0 && (
              <div>
                {SectionTitle(ctx, ctx.t.languages)}
                {LangBlock(ctx)}
              </div>
            )}
          </div>
        </div>
      </div>
    )
  } else if (template === 'elegant') {
    body = (
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <div style={{ background: `linear-gradient(135deg, ${accent}, rgba(${ctx.rgb},.82))`, padding: '42px 52px 34px', color: '#fff' }}>
          {NameHeader(ctx, false, true)}
          {contact.length > 0 && (
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,.92)', display: 'flex', flexWrap: 'wrap', gap: '4px 16px', marginTop: 12 }}>
              {contact.map((c, i) => (
                <span key={i}>{c}</span>
              ))}
            </div>
          )}
        </div>
        <div className="flex flex-1" style={{ minHeight: 0 }}>
          <div style={{ width: '64%', padding: '24px 20px 28px 52px', display: 'flex', flexDirection: 'column', gap: 18 }}>
            {data.summary.trim() && (
              <div>
                {SectionTitle(ctx, ctx.t.summary)}
                <div style={{ fontSize: 13, color: '#374151', lineHeight: 1.55, whiteSpace: 'pre-line' }}>{data.summary}</div>
              </div>
            )}
            {data.experiences.length > 0 && (
              <div>
                {SectionTitle(ctx, ctx.t.experience)}
                {ExpBlock(ctx)}
              </div>
            )}
            {data.education.length > 0 && (
              <div>
                {SectionTitle(ctx, ctx.t.education)}
                {EduBlock(ctx)}
              </div>
            )}
          </div>
          <div style={{ width: '36%', padding: '24px 52px 28px 20px', borderLeft: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column', gap: 18 }}>
            {data.skills.length > 0 && (
              <div>
                {SectionTitle(ctx, ctx.t.skills)}
                {SkillsBlock(ctx)}
              </div>
            )}
            {data.languages.length > 0 && (
              <div>
                {SectionTitle(ctx, ctx.t.languages)}
                {LangBlock(ctx)}
              </div>
            )}
          </div>
        </div>
      </div>
    )
  } else {
    // moderne (par défaut) : sidebar colorée
    body = (
      <div className="flex" style={{ height: '100%' }}>
        <div style={{ width: '30%', background: accent, color: '#fff', padding: '36px 22px', display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div>
            <div style={{ fontSize: 24, fontWeight: 800, lineHeight: 1.15 }}>{data.personal.fullName || 'Votre Nom'}</div>
            <div style={{ fontSize: 12.5, fontWeight: 500, color: 'rgba(255,255,255,.88)', marginTop: 4 }}>{data.personal.jobTitle}</div>
          </div>
          {contact.length > 0 && (
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.14em', color: 'rgba(255,255,255,.75)', marginBottom: 7 }}>{ctx.t.contact}</div>
              <div className="flex flex-col" style={{ gap: 4, fontSize: 11.5, color: 'rgba(255,255,255,.95)', wordBreak: 'break-word' }}>
                {contact.map((c, i) => (
                  <span key={i}>{c}</span>
                ))}
              </div>
            </div>
          )}
          {data.skills.length > 0 && (
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.14em', color: 'rgba(255,255,255,.75)', marginBottom: 7 }}>{ctx.t.skills}</div>
              <div className="flex flex-col" style={{ gap: 4, fontSize: 12 }}>
                {data.skills.map((s, i) => (
                  <span key={i} style={{ background: 'rgba(255,255,255,.14)', borderRadius: 6, padding: '4px 8px' }}>{s}</span>
                ))}
              </div>
            </div>
          )}
          {data.languages.length > 0 && (
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.14em', color: 'rgba(255,255,255,.75)', marginBottom: 7 }}>{ctx.t.languages}</div>
              <div className="flex flex-col" style={{ gap: 4 }}>
                {data.languages.map((l) => (
                  <div key={l.id} style={{ fontSize: 11.5 }}>
                    <span style={{ fontWeight: 600 }}>{l.name}</span>
                    <span style={{ color: 'rgba(255,255,255,.8)' }}> — {l.level === 'native' ? ctx.t.native : l.level}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        <div style={{ width: '70%', padding: '34px 36px', display: 'flex', flexDirection: 'column', gap: 18 }}>
          {data.summary.trim() && (
            <div>
              {SectionTitle(ctx, ctx.t.summary)}
              <div style={{ fontSize: 12.5, color: '#374151', lineHeight: 1.55, whiteSpace: 'pre-line' }}>{data.summary}</div>
            </div>
          )}
          {data.experiences.length > 0 && (
            <div>
              {SectionTitle(ctx, ctx.t.experience)}
              {ExpBlock(ctx)}
            </div>
          )}
          {data.education.length > 0 && (
            <div>
              {SectionTitle(ctx, ctx.t.education)}
              {EduBlock(ctx)}
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div
      id={id}
      className={`resume-page ${className}`}
      style={{
        width: 794,
        height: 1123,
        background: '#fff',
        transform: scale !== 1 ? `scale(${scale})` : undefined,
        transformOrigin: 'top left',
        overflow: 'hidden',
      }}
    >
      {body}
    </div>
  )
}

// Conteneur qui gère la taille réduite autour d'un CV scalé
// (le transform scale ne réduit pas la boîte layout : on fixe la taille ici)
export function ScaledResume({ scale = 1, className = '', ...rest }: ResumePreviewProps) {
  return (
    <div style={{ width: 794 * scale, height: 1123 * scale, overflow: 'hidden', flexShrink: 0 }} className={className}>
      <ResumePreview {...rest} scale={scale} />
    </div>
  )
}
