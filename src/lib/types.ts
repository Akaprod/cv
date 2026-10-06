// ─── Types du CV (stockés en JSON dans Resume.data) ─────────────────────────

export interface PersonalInfo {
  fullName: string
  jobTitle: string
  email: string
  phone: string
  location: string
  website: string
  linkedin: string
}

export interface Experience {
  id: string
  position: string
  company: string
  startDate: string
  endDate: string
  description: string
}

export interface Education {
  id: string
  degree: string
  school: string
  startDate: string
  endDate: string
}

export interface LanguageSkill {
  id: string
  name: string
  level: string // A1 | A2 | B1 | B2 | C1 | C2 | native
}

export interface ResumeData {
  personal: PersonalInfo
  summary: string
  experiences: Experience[]
  education: Education[]
  skills: string[]
  languages: LanguageSkill[]
}

export const EMPTY_RESUME: ResumeData = {
  personal: {
    fullName: '',
    jobTitle: '',
    email: '',
    phone: '',
    location: '',
    website: '',
    linkedin: '',
  },
  summary: '',
  experiences: [],
  education: [],
  skills: [],
  languages: [],
}

export function uid(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36)
}

export function parseResumeData(raw: string | null | undefined): ResumeData {
  if (!raw) return structuredClone(EMPTY_RESUME)
  try {
    const parsed = JSON.parse(raw) as Partial<ResumeData>
    return {
      personal: { ...structuredClone(EMPTY_RESUME.personal), ...(parsed.personal ?? {}) },
      summary: parsed.summary ?? '',
      experiences: parsed.experiences ?? [],
      education: parsed.education ?? [],
      skills: parsed.skills ?? [],
      languages: parsed.languages ?? [],
    }
  } catch {
    return structuredClone(EMPTY_RESUME)
  }
}

// ─── Types API ───────────────────────────────────────────────────────────────

export interface MeResponse {
  id: string
  email: string
  username: string
  plan: 'FREE' | 'PRO'
  locale: string
  aiUsed: number
  aiMonth: string | null
}

export interface ResumeListItem {
  id: string
  title: string
  template: string
  accent: string
  isPublic: boolean
  views: number
  locale: string
  updatedAt: string
  ownerUsername: string
}

export const AI_FREE_MONTHLY_LIMIT = 10

export const FREE_MAX_RESUMES = 2

export const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2', 'native'] as const
