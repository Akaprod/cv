// ─── Architecture sectorielle — "façade généraliste + branches métiers" ─────
//
// Principe directeur : UN seul moteur (éditeur, templates, IA, @pseudo),
// et des BRANCHES = 100 % données. Une branche = un slug + un pack de
// contenu par langue. Créer /medical ou /btp demain = ajouter un objet
// pack ci-dessous, SANS toucher au code (aucun fork).
//
// Règles de gouvernance d'une branche (checklist avant passage en active) :
//   ✓ dictionnaire de compétences ≥ 40 items en catégories
//   ✓ ≥ 9 accroches pré-rédigées (3 niveaux)
//   ✓ ≥ 10 verbes d'action sectoriels
//   ✓ contexte de prompt IA dédié (vocabulaire normatif du métier)
//   ✓ copy de landing complète + 6 FAQ
//   ✓ 2 templates mis en avant

import type { ResumeData } from './types'

export interface SectorBenefit {
  title: string
  text: string
}

export interface SectorSkillCategory {
  category: string
  items: string[]
}

export interface SectorFaq {
  q: string
  a: string
}

export interface SectorPack {
  name: string // nom affiché de la branche (ex : « QHSE & Industrie »)
  metaTitle: string // <title> SEO de la landing
  metaDescription: string
  heroBadge: string
  heroTitle: string
  heroTitleHighlight: string
  heroSubtitle: string
  heroCta: string
  benefitsIntro: string
  benefits: SectorBenefit[]
  skillsIntro: string
  skills: SectorSkillCategory[]
  accrochesIntro: string
  accroches: { level: string; text: string }[]
  faqs: SectorFaq[]
  aiContext: string // injecté dans le system prompt de l'IA
  demoJobTitle: string
  demoSummary: string
}

export interface SectorDef {
  slug: string
  active: boolean
  icon: 'shield' | 'code'
  accent: string // couleur d'accent de la branche (hex)
  packs: { fr: SectorPack; en: SectorPack }
}

// ═════════════════════════════════ BRANCHE PILOTE 1 : /hse ═══════════════════

const hseFr: SectorPack = {
  name: 'QHSE & Industrie',
  metaTitle: 'Créer un CV QHSE et industriel qui convainc les recruteurs',
  metaDescription:
    'Générateur de CV spécialisé QHSE, sécurité et industrie : compétences normatives pré-remplies (ISO 9001, 45001, DUERP, HAZOP), accroches adaptées aux recruteurs du secteur et lien personnel @pseudo.',
  heroBadge: 'Spécialisé QHSE, sécurité & industrie',
  heroTitle: 'Un CV qui parle le langage des recruteurs',
  heroTitleHighlight: 'QHSE & industriels',
  heroSubtitle:
    'Compétences normatives pré-remplies, accroches adaptées aux standards du métier et lien personnel @pseudo. Conçu pour les profils QHSE, sécurité et industrie — pas pour tout le monde.',
  heroCta: 'Créer mon CV QHSE',
  benefitsIntro: 'Pourquoi un CV QHSE n’est pas « juste un CV »',
  benefits: [
    {
      title: 'Vocabulaire normatif intégré',
      text: 'ISO 9001, 14001, 45001, DUERP, HAZOP, consignation… Les référentiels et outils du métier sont pré-remplis : vous cochez, vous n’inventez pas.',
    },
    {
      title: 'Résultats chiffrés attendus',
      text: 'Taux de fréquence, taux de gravité, zéro accident, % de conformité : l’IA formule vos réalisations avec les indicateurs que regardent les recruteurs.',
    },
    {
      title: 'Structure sobre et conforme',
      text: 'Mise en page claire et rigoureuse, place dédiée aux habilitations et certifications (SST, CACES, habilitations électriques) — comme l’exige le secteur.',
    },
    {
      title: 'Accroches selon votre niveau',
      text: 'Débutant, confirmé ou manager : des modèles d’accroche rédigés selon les standards du métier, à adapter en un clic.',
    },
  ],
  skillsIntro: 'Des compétences pré-remplies, pas des cases vides',
  skills: [
    {
      category: 'Normes & référentiels',
      items: ['ISO 9001', 'ISO 14001', 'ISO 45001', 'ISO 50001', 'MASE', 'Seveso', 'ICPE', 'ATEX'],
    },
    {
      category: 'Analyse & maîtrise des risques',
      items: ['DUERP', 'HAZOP', 'AMDEC', 'Arbre des causes', 'Plan de prévention', 'Permis de travail', 'Consignation (LOTO)', 'JSA'],
    },
    {
      category: 'Sécurité terrain',
      items: ['Causeries sécurité', 'Visites terrain', 'Observations comportementales', "Plans d'évacuation", "Exercices d'urgence", 'Formations sécurité'],
    },
    {
      category: 'Habilitations & certifications',
      items: ['SST', 'CACES', 'Habilitation électrique (B0V/BR)', 'AIPR', 'ÉPI', 'Travail en hauteur'],
    },
    {
      category: 'Conformité & pilotage',
      items: ['Veille réglementaire', 'Audits internes', 'Taux de fréquence / gravité', "Déclaration AT/MP", 'Reporting HSE', 'Actions correctives (CAPA)'],
    },
    {
      category: 'Environnement & qualité',
      items: ['Gestion des déchets', 'Prévention des pollutions', 'Amélioration continue', 'PDCA', 'Méthode 5S', 'Cartographie des processus'],
    },
  ],
  accrochesIntro: 'Des accroches rédigées selon les standards du métier',
  accroches: [
    {
      level: 'Débutant',
      text: 'Titulaire d’une formation QHSE et certifié SST, je rejoins une équipe pour contribuer à la prévention des risques et au maintien d’un haut niveau de sécurité. Rigoureux et méthodique, je m’appuie sur une connaissance solide des exigences ISO 9001/14001/45001.',
    },
    {
      level: 'Débutant',
      text: 'Jeune diplômé en QHSE, je souhaite mettre en pratique mes compétences en analyse de risques (DUERP, plan de prévention) au sein d’un site exigeant sur la sécurité et la conformité réglementaire.',
    },
    {
      level: 'Confirmé',
      text: 'Responsable HSE avec 7 ans d’expérience en environnement industriel, j’ai réduit le taux de fréquence des accidents de 12 à 4 en déployant une démarche structurée : DUERP, causeries, analyses d’accidents et formation des équipes.',
    },
    {
      level: 'Confirmé',
      text: 'Spécialiste QHSE maîtrisant les référentiels ISO 9001, 14001 et 45001, j’accompagne les sites dans la préparation et le suivi des audits internes et de certification, avec une approche terrain de l’amélioration continue.',
    },
    {
      level: 'Manager',
      text: 'Manager HSE avec 12 ans d’expérience multi-sites, je pilote des systèmes de management intégrés QSE certifiés et j’anime des équipes de prévention réparties sur 4 sites, avec un objectif constant : zéro accident grave.',
    },
    {
      level: 'Manager',
      text: 'Responsable QHSE orienté performance, j’allie vision stratégique (certifications, reporting direction) et déploiement opérationnel : 30 % de réduction de l’accidentologie et obtention de la certification ISO 45001 en 9 mois.',
    },
  ],
  faqs: [
    {
      q: 'Quelles compétences mettre sur un CV QHSE ?',
      a: 'Les recruteurs attendent d’abord les référentiels que vous maîtrisez (ISO 9001, 14001, 45001, MASE), les outils d’analyse de risques (DUERP, HAZOP, AMDEC, arbre des causes) et vos habilitations (SST, CACES, habilitations électriques). Ajoutez toujours des résultats chiffrés : réduction du taux de fréquence, nombre d’audits réalisés, taux de conformité.',
    },
    {
      q: 'Faut-il une section dédiée aux certifications ?',
      a: 'Oui, c’est une attente forte du secteur. Listez vos habilitations et certifications avec leurs dates de validité (SST, CACES, AIPR, habilitations électriques). Notre éditeur prévoit une place claire pour elles, dans un format que les recruteurs industriels repèrent immédiatement.',
    },
    {
      q: 'Quel style de mise en page pour un CV QHSE ?',
      a: 'La sobriété gagne toujours : structure très claire, typographie lisible, une seule couleur d’accent sobre. Les CV créatifs déroutent les recruteurs industriels. Nos modèles « Classique » et « Minimal » sont particulièrement adaptés aux profils QHSE.',
    },
    {
      q: 'Comment présenter mes résultats de sécurité ?',
      a: 'Avec les indicateurs du métier : taux de fréquence (TF) et de gravité (TG) avant/après, nombre de jours sans accident, % de plans de prévention audités conformes, nombre de causeries animées. L’assistant IA du site formule automatiquement vos réussites avec ces indicateurs.',
    },
    {
      q: 'Puis-je créer un CV pour un poste à l’étranger en Europe ?',
      a: 'Oui. Le site est multilingue (français, anglais, espagnol, allemand, italien) et votre CV peut être rédigé dans la langue de l’offre. Les normes ISO et le vocabulaire HSE étant internationaux, vos compétences restent parfaitement lisibles par les recruteurs européens.',
    },
    {
      q: 'Le plan gratuit suffit-il ?',
      a: 'Oui pour démarrer : 2 CV en ligne, 3 modèles, 10 générations IA par mois et votre lien personnel @pseudo. Sans carte bancaire. Le plan Pro (3,99 €/mois) débloque les CV illimités, tous les modèles et l’IA sans limite.',
    },
  ],
  aiContext:
    'Contexte sectoriel : le candidat travaille dans la QHSE / la sécurité et l’industrie. Utilise le vocabulaire normatif du secteur (ISO 9001/14001/45001, DUERP, HAZOP, audits, consignation, causeries sécurité, habilitations). Privilégie les formulations orientées résultats chiffrés (taux de fréquence/gravité, conformité, zéro accident, réductions mesurables). Ton rigoureux, factuel, professionnel. Évite le jargon marketing et les superlatifs.',
  demoJobTitle: 'Responsable QHSE',
  demoSummary:
    'Responsable QHSE avec 8 ans d’expérience en site industriel. Certification ISO 45001 pilotée en 9 mois, taux de fréquence réduit de 12 à 4. Spécialiste DUERP, audits internes et conduite du changement.',
}

const hseEn: SectorPack = {
  name: 'HSE & Industry',
  metaTitle: 'Build an HSE & industrial CV that recruiters trust',
  metaDescription:
    'CV builder specialized in HSE, safety and industry: pre-filled normative skills (ISO 9001, 45001, risk assessment, HAZOP), sector-standard summaries and a personal @username link.',
  heroBadge: 'Specialized in HSE, safety & industry',
  heroTitle: 'A CV that speaks the language of',
  heroTitleHighlight: 'HSE & industrial recruiters',
  heroSubtitle:
    'Pre-filled normative skills, sector-standard professional summaries and a personal @username link. Built for HSE, safety and industrial profiles — not for everyone.',
  heroCta: 'Create my HSE CV',
  benefitsIntro: 'Why an HSE CV is not “just a CV”',
  benefits: [
    {
      title: 'Normative vocabulary built in',
      text: 'ISO 9001, 14001, 45001, risk assessment, HAZOP, lockout-tagout… The standards and tools of the trade are pre-filled: you tick, you don’t guess.',
    },
    {
      title: 'The metrics recruiters expect',
      text: 'TRIR, severity rate, zero lost-time injuries, % audit compliance: the AI phrases your achievements with the indicators recruiters actually look for.',
    },
    {
      title: 'Clean, compliant layout',
      text: 'Clear and rigorous structure with dedicated space for certifications (First Aid, forklift, electrical authorizations) — exactly what the sector expects.',
    },
    {
      title: 'Summaries for every level',
      text: 'Entry-level, experienced or manager: summary templates written to sector standards, ready to adapt in one click.',
    },
  ],
  skillsIntro: 'Pre-filled skills, not blank fields',
  skills: [
    {
      category: 'Standards & frameworks',
      items: ['ISO 9001', 'ISO 14001', 'ISO 45001', 'ISO 50001', 'MASE', 'Seveso', 'ICPE', 'ATEX'],
    },
    {
      category: 'Risk assessment & control',
      items: ['Risk assessment', 'HAZOP', 'FMEA', 'Root cause analysis', 'Permit to work', 'Lockout-tagout (LOTO)', 'JSA'],
    },
    {
      category: 'Field safety',
      items: ['Safety briefings', 'Site inspections', 'Behavioral observations', 'Evacuation drills', 'Emergency exercises', 'Safety training'],
    },
    {
      category: 'Certifications',
      items: ['First Aid / CPR', 'Forklift (CACES)', 'Electrical authorization', 'PPE', 'Work at height'],
    },
    {
      category: 'Compliance & reporting',
      items: ['Regulatory watch', 'Internal audits', 'TRIR / severity rate', 'Incident reporting', 'HSE reporting', 'CAPA'],
    },
    {
      category: 'Environment & quality',
      items: ['Waste management', 'Pollution prevention', 'Continuous improvement', 'PDCA', '5S method', 'Process mapping'],
    },
  ],
  accrochesIntro: 'Summaries written to industry standards',
  accroches: [
    {
      level: 'Entry-level',
      text: 'QHSE graduate and certified First Aid provider, joining a team to support risk prevention and maintain a high safety standard. Rigorous and methodical, with solid knowledge of ISO 9001/14001/45001 requirements.',
    },
    {
      level: 'Experienced',
      text: 'HSE officer with 7 years in industrial environments, reduced the accident frequency rate from 12 to 4 through a structured approach: risk assessments, safety briefings, incident investigations and team training.',
    },
    {
      level: 'Manager',
      text: 'HSE manager with 12 years of multi-site experience, leading integrated QSE management systems and prevention teams across 4 sites — with one constant objective: zero serious incidents.',
    },
  ],
  faqs: [
    {
      q: 'Which skills should an HSE CV include?',
      a: 'Start with the standards you master (ISO 9001, 14001, 45001), risk assessment tools (HAZOP, FMEA, root cause analysis) and your certifications (First Aid, forklift, electrical authorizations). Always add quantified results: TRIR reduction, audits completed, compliance rate.',
    },
    {
      q: 'Should certifications have their own section?',
      a: 'Yes — it is a strong expectation in this sector. List certifications with validity dates. The editor gives them a clear, immediately visible place on the page.',
    },
    {
      q: 'What layout works best for an HSE CV?',
      a: 'Simplicity always wins: a very clear structure, readable typography and one restrained accent color. Our “Classic” and “Minimal” templates are the best fit for HSE profiles.',
    },
    {
      q: 'Can I create a CV for a job in another European country?',
      a: 'Yes. The site is multilingual (English, French, Spanish, German, Italian) and your CV can be written in the language of the job posting. ISO standards are international, so your skills stay fully readable across Europe.',
    },
    {
      q: 'Is the free plan enough?',
      a: 'Yes to get started: 2 online CVs, 3 templates, 10 AI generations per month and your personal @username link. No credit card required. Pro ($4/month) unlocks unlimited CVs, all templates and unlimited AI.',
    },
  ],
  aiContext:
    'Sector context: the candidate works in HSE / safety and industry. Use the sector’s normative vocabulary (ISO 9001/14001/45001, risk assessment, HAZOP, audits, lockout-tagout, safety briefings, certifications). Favor results-oriented phrasing with quantified indicators (TRIR, severity rate, compliance, zero LTI, measurable reductions). Rigorous, factual, professional tone. Avoid marketing jargon and superlatives.',
  demoJobTitle: 'HSE Manager',
  demoSummary:
    'HSE manager with 8 years of experience in industrial sites. Led ISO 45001 certification in 9 months, reduced TRIR from 12 to 4. Specialist in risk assessment, internal audits and change management.',
}

// ═════════════════════════════ Registre des branches ═════════════════════════

export const SECTORS: SectorDef[] = [
  {
    slug: 'hse',
    active: true,
    icon: 'shield',
    accent: '#1e3a5f',
    packs: { fr: hseFr, en: hseEn },
  },
  // Branche pilote 2 (/tech) : pack de contenu en préparation — passer
  // active: true dès que le pack est complet (checklist en tête de fichier).
  {
    slug: 'tech',
    active: false,
    icon: 'code',
    accent: '#6d28d9',
    packs: { fr: hseFr, en: hseEn }, // placeholder — remplacer par le pack tech
  },
]

export const ACTIVE_SECTORS = SECTORS.filter((s) => s.active)
export const ACTIVE_SECTOR_SLUGS = ACTIVE_SECTORS.map((s) => s.slug)

export function getSector(slug: string | null | undefined): SectorDef | null {
  if (!slug) return null
  return SECTORS.find((s) => s.slug === slug.toLowerCase()) ?? null
}

// Pack dans la langue demandée, avec repli EN → FR puis FR par défaut.
export function getPack(slug: string, locale?: string | null): { sector: SectorDef; pack: SectorPack } | null {
  const sector = getSector(slug)
  if (!sector) return null
  const l = (locale ?? 'fr').slice(0, 2)
  const pack = sector.packs[l as 'fr' | 'en'] ?? sector.packs.fr
  return { sector, pack }
}

export function sectorSkillsFlat(pack: SectorPack): string[] {
  return pack.skills.flatMap((c) => c.items)
}

// ─── CV de démonstration sectoriel (landings) ───────────────────────────────
export function sectorDemoResume(sector: SectorDef, locale: 'fr' | 'en'): ResumeData {
  const pack = sector.packs[locale]
  const items = sectorSkillsFlat(pack)
  return {
    personal: {
      fullName: locale === 'fr' ? 'Karim Benali' : 'Karim Benali',
      jobTitle: pack.demoJobTitle,
      email: 'karim.benali@email.com',
      phone: '+33 6 98 76 54 32',
      location: locale === 'fr' ? 'Lyon, France' : 'Lyon, France',
      website: '',
      linkedin: 'linkedin.com/in/karimbenali',
    },
    summary: pack.demoSummary,
    experiences: [
      {
        id: 's1',
        position: pack.demoJobTitle,
        company: locale === 'fr' ? 'Industria Group, Lyon' : 'Industria Group, Lyon',
        startDate: '2021',
        endDate: locale === 'fr' ? 'Aujourd’hui' : 'Present',
        description:
          locale === 'fr'
            ? 'Pilotage du système de management QSE (ISO 9001/14001/45001) : certification obtenue en 9 mois. Taux de fréquence réduit de 12 à 4. 40+ audits internes et 120 causeries sécurité animées par an.'
            : 'Led the QSE management system (ISO 9001/14001/45001): certified in 9 months. TRIR reduced from 12 to 4. 40+ internal audits and 120 safety briefings per year.',
      },
      {
        id: 's2',
        position: locale === 'fr' ? 'Technicien HSE' : 'HSE Officer',
        company: locale === 'fr' ? 'Métalex Industrie, Saint-Étienne' : 'Metalex Industry, Saint-Étienne',
        startDate: '2018',
        endDate: '2021',
        description:
          locale === 'fr'
            ? 'DUERP mis à jour annuellement, plan de prévention et permis de travail pour 300+ interventions externes. Zéro accident grave sur 3 ans.'
            : 'Annual risk assessment updates, permit-to-work system for 300+ contractor interventions. Zero serious incidents over 3 years.',
      },
    ],
    education: [
      {
        id: 'se1',
        degree: locale === 'fr' ? 'Master QHSE — Management de la sécurité' : 'MSc Occupational Health, Safety & Environment',
        school: locale === 'fr' ? 'Université Claude Bernard Lyon 1' : 'Claude Bernard Lyon 1 University',
        startDate: '2016',
        endDate: '2018',
      },
    ],
    skills: items.slice(0, 12),
    languages: [
      { id: 'sl1', name: locale === 'fr' ? 'Français' : 'French', level: 'native' },
      { id: 'sl2', name: locale === 'fr' ? 'Anglais' : 'English', level: 'C1' },
    ],
  }
}
