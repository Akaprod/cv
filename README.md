# HightCV — Plateforme SaaS de CV en ligne

> ⚠️ **Projet 100 % autonome**, sans aucun lien avec HSE Academy.
>
> **HightCV** est le **nom officiel** du projet (oct. 2026).
> Le domaine n'est pas encore réservé : `hightcv.com` est la valeur provisoire de
> `DOMAIN` — à ajuster d'une seule constante si le domaine réservé diffère
> (voir [Rebranding](#-rebranding-en-2-minutes)).

Plateforme SaaS freemium de création de CV : l'utilisateur s'inscrit, remplit ses
informations dans un éditeur live, choisit un template et une couleur, puis obtient un
**lien public personnalisé** de type `https://domaine/@farid` — partageable, avec compteur
de vues, export PDF et badge « Créé avec ».

La particularité du produit : une **façade généraliste** qui cache une **architecture
sectorielle**. Chaque métier dispose de sa propre branche (`/hse`, `/medical`, `/btp`,
`/tech`…) avec ses landings SEO, son vocabulaire normatif, ses suggestions de compétences
et un assistant IA contextualisé — le tout sur **un seul codebase**.

---

## ✨ Fonctionnalités (MVP — QA validé)

| Domaine | Détail |
|---|---|
| **Templates** | 5 designs (Moderne sidebar, Classique serif, Minimal, Compact 2 colonnes, Élégant bannière) × 5 couleurs d'accent (Émeraude, Marine, Bordeaux, Violet, Ambre) |
| **Éditeur** | 2 volets (formulaire / aperçu A4 live), autosave 900 ms, sections complètes : perso, accroche, expériences, formations, compétences, langues CECRL |
| **IA rédaction** | Génération d'accroche, amélioration de résumé, puces d'expériences — prompts localisés en 5 langues, contexte sectoriel injecté, quota FREE 10 appels/mois |
| **Lien @pseudo** | URL virale `/@farid` (rewrite en SSR), compteur de vues (1×/h/session), boutons Copier / Partager (`navigator.share`) / PDF (print CSS A4), badge gratuit « Créé avec » |
| **Dashboard** | Stats (vues totales, CV, crédits IA), graphe 7 jours, toggle public/privé, badge LIVE, copie de lien, suppression |
| **Freemium** | FREE = 2 CV, 3 templates, 3 couleurs, 10 IA/mois, badge · PRO 3,99 €/mois ou 39,99 €/an = illimité sans badge — gating serveur + UI |
| **i18n** | 5 langues natives (FR, EN, ES, DE, IT) — switcher navbar, persistance, CV et IA dans la langue de l'utilisateur |
| **Branches métiers** | Landings SEO par secteur avec JSON-LD, hreflang, canonical ; dictionnaire de compétences normatif ; IA contextualisée ; `/hse` pilote actif |
| **Auth** | Inscription/connexion maison (scrypt + session cookie httpOnly), usernames réservés |

## 🏗️ Architecture sectorielle « façade + branches »

Le site généraliste (`/`) est la façade ; les métiers sont des **branches = données**, pas
des forks de code :

```
src/lib/sectors.ts        ← registre des branches (slug, actif, accent, pack fr/en)
src/app/[sector]/page.tsx ← landing sectorielle SSR générique (SEO, FAQ JSON-LD…)
```

Chaque branche est un `SectorPack` : nom, SEO, hero, bénéfices, **compétences par
catégories** (ex. HSE : ISO 9001/14001/45001/50001, MASE, Seveso, ICPE, ATEX, DUERP,
HAZOP, AMDEC, LOTO, CACES…), accroches par niveau d'expérience, FAQs, `aiContext`
(normatif, injecté dans le system prompt de l'IA) et un CV de démonstration.

**Ajouter une branche (ex. `/medical`) = remplir un `SectorPack` + `active: true` — zéro
ligne de code ailleurs.** Le routage, le SEO, l'éditeur, les suggestions de compétences et
l'IA sectorielle suivent automatiquement.

Traçabilité : `Resume.sector` est enregistré en base (indexé) pour savoir quelle branche
convertit — utile pour piloter l'expansion.

## 🚀 Démarrage rapide

Prérequis : Node 20+ ou [Bun](https://bun.sh), rien d'autre.

```bash
# 1. Dépendances
bun install          # ou npm install

# 2. Environnement
cp .env.example .env # DATABASE_URL SQLite par défaut

# 3. Base de données (crée db/custom.db)
bun run db:push      # ou: npm run db:push

# 4. Développement
bun run dev          # http://localhost:3000

# 5. Production
bun run build && bun run start
```

Test express : landing → inscription `@pseudo` → nouveau CV (choisir la branche QHSE
pour voir les suggestions sectorielles) → éditeur + IA → publier → `/@pseudo`.

## 📁 Structure

```
├── prisma/schema.prisma        # User, Session, Resume (data JSON, sector), ViewLog
├── src/
│   ├── proxy.ts                # rewrite /@pseudo → page publique (Next 16 remplace middleware)
│   ├── lib/
│   │   ├── brand.ts            # ★ MARQUE + DOMAINE (source unique)
│   │   ├── sectors.ts          # ★ registre des branches métiers
│   │   ├── templates.ts        # 5 templates × 5 accents + moteur A4
│   │   ├── i18n.ts             # 5 dictionnaires + rebrand() à la volée
│   │   ├── auth.ts             # scrypt + sessions httpOnly + usernames réservés
│   │   └── locales/            # fr, en, es, de, it (~170 clés chacun)
│   ├── app/
│   │   ├── [sector]/page.tsx   # landing sectorielle SSR (SEO complet)
│   │   └── api/
│   │       ├── auth/           # register, login, logout, me
│   │       ├── resumes/        # CRUD + gating freemium serveur
│   │       ├── public/[username]/  # CV public + compteur de vues
│   │       ├── ai/generate/    # IA localisée + contexte sectoriel + quota
│   │       └── billing/upgrade/# bascule PRO (mode démo, prêt pour Stripe)
│   └── components/             # landing, dashboard, editor, public, pricing…
└── docs/
    ├── Rapport_Viabilite_…pdf  # étude de faisabilité (26 p., chiffres marché)
    ├── research/               # 8 jeux de données concurrentiels (JSON)
    └── qa/                     # captures de la validation navigateur
```

## 💳 Brancher Stripe (Phase 3)

`src/app/api/billing/upgrade/route.ts` bascule déjà `plan = PRO` en mode démo avec les
points d'insertion commentés : créer la Checkout Session, échanger le webhook
`checkout.session.completed` / `customer.subscription.updated`, refléter le statut dans
`User.plan` + `currentPeriodEnd`. Les prix cibles sont dans le README stratégique :
**3,99 €/mois · 39,99 €/an** (règle « -1 € vs concurrents », free parity).

## 🤖 IA — provider

Le MVP utilise `z-ai-web-dev-sdk` (route `src/app/api/ai/generate/route.ts`) :
prompts localisés 5 langues, actions `summary` / `improve` / `bullets`, quota serveur,
et **injection du contexte normatif de la branche** (`pack.aiContext`) dans le system
prompt. Pour passer à votre propre provider, remplacez l'appel SDK dans cette route —
l'interface (entrée/sortie + quota) reste identique.

## 🎨 Rebranding en 2 minutes

1. `src/lib/brand.ts` → `BRAND = 'VotreNom'`, `DOMAIN = 'votredomaine.com'`
2. C'est tout : metadata, landing, footer, liens @pseudo d'exemple et les 5 dictionnaires
   sont rebrandés à la volée (`rebrand()` dans `i18n.ts`).

## 🚢 Déploiement

Le build est en mode `standalone` (`next.config.ts`) — idéal pour un VPS **Hostinger**
(Node/PM2 ou Docker) sans dépendance Vercel. Un **kit complet est fourni** :

| Fichier | Rôle |
|---|---|
| `docs/DEPLOIEMENT_HOSTINGER.md` | ⭐ Guide pas à pas (~30 min) : DNS → Node → PM2 → Nginx → HTTPS |
| `deploy/env.production` | Variables d'environnement production (à copier en `.env`) |
| `deploy/ecosystem.config.js` | PM2 (port 3000, autorestart, garde mémoire) |
| `deploy/deploy.sh` | Script unique install → db → build → restart |
| `deploy/nginx-hightcv.conf` | Reverse proxy (préserve les URL `/@pseudo`) + modèle HTTPS |
| `deploy/Dockerfile` | Option conteneur avec volume persistant |

Version courte :

```bash
cp deploy/env.production .env
bun install && npm run db:push && npm run build
pm2 start deploy/ecosystem.config.js
# puis Nginx + certbot → guide détaillé dans docs/DEPLOIEMENT_HOSTINGER.md
```

Le cookie de session passe automatiquement en `secure` en production
(`NODE_ENV=production`, géré dans `src/lib/auth.ts`). Le reverse proxy Nginx laisse
passer les URL `/@pseudo` telles quelles — le rewrite se fait dans l'app (`src/proxy.ts`).

Pour migrer SQLite → PostgreSQL/Supabase plus tard : changer le `provider` dans
`prisma/schema.prisma`, ajuster `DATABASE_URL`, `db:push` — le schéma ne contient rien
de spécifique SQLite.

## 📚 Documentation

- `docs/Rapport_Viabilite_SaaS_CV_Professionnels.pdf` — étude de faisabilité complète :
  marché (~8,9 Md$, CAGR 7,2 %), benchmark 10 acteurs, stratégie de suivi tarifaire,
  projections MRR, budget, plan d'acquisition (SEO + ADS), risques. *NB : rédigée avant
  la décision « projet autonome » ; certains exemples de marque y sont obsolètes.*
- `docs/research/*.json` — données brutes des 8 recherches concurrentielles
  (pricing, fonctionnalités, trafic, métriques SaaS).
- `docs/qa/*.png` — preuves de la validation navigateur (parcours complet FR/EN,
  mobile 390 px, quota IA, page publique).

## 🗺️ Roadmap

- **Phase 1 (fait)** — MVP complet : templates, éditeur, IA, @pseudo, stats, freemium, i18n ×5, branche `/hse`
- **Phase 2** — branches `/tech` + `/medical` (packs à remplir), lettres de motivation IA, migration PostgreSQL/Supabase
- **Phase 3** — Stripe en production, emails transactionnels (Resend), langue du CV vs interface découplées
- **Phase 4** — SEO programmatique multi-pays, hreflang, ADS disciplinés (CAC ≤ 8-10 €), analytics UTM
