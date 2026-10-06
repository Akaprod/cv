# 🚀 Déploiement HightCV sur Hostinger (VPS)

Guide complet pour héberger la plateforme sur un **VPS Hostinger** (Ubuntu 22.04/24.04)
avec Nginx + PM2, en préservant les URL virales `/@pseudo`. Durée : **~30 minutes**.

> Alternative Docker en fin de guide. Le build est en mode `standalone`
> (autonome, sans dépendance Vercel).

---

## 1. Prérequis

| Élément | Détail |
|---|---|
| VPS Hostinger | KVM 1 minimum (1 vCPU / 4 Go RAM largement suffisant au lancement) |
| OS | Ubuntu 22.04 ou 24.04 |
| Domaine | Pointé vers le VPS (voir étape 2) |
| Accès | SSH root ou sudo (`ssh root@IP_DU_VPS`) |

## 2. DNS — pointer le domaine

Dans **hPanel → Domaines → DNS** (ou chez votre registrar) :

| Type | Nom | Valeur | TTL |
|---|---|---|---|
| A | `@` (ou `cv`) | `IP.PUBLIQUE.DU.VPS` | 3600 |

Vérifier la propagation : `dig +short votre-domaine.com` → doit renvoyer l'IP du VPS.

## 3. Préparer le serveur

```bash
apt update && apt upgrade -y
apt install -y git nginx curl ufw

# Firewall
ufw allow OpenSSH && ufw allow 80 && ufw allow 443
ufw --force enable

# Node.js 22 LTS
curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
apt install -y nodejs

# PM2 (gardien de processus)
npm i -g pm2

# (optionnel mais recommandé) Bun — builds plus rapides
curl -fsSL https://bun.sh/install | bash
```

## 4. Récupérer le projet

```bash
mkdir -p /var/www && cd /var/www

# Option A — HTTPS avec un Personal Access Token GitHub (simple)
git clone https://github.com/Akaprod/cv.git hightcv

# Option B — SSH avec VOTRE clé (ssh-keygen puis ajoutez-la au compte GitHub)
git clone git@github.com:Akaprod/cv.git hightcv

cd hightcv
```

## 5. Environnement + base de données + build

### 5a. Base MySQL (hPanel)

1. hPanel → **Bases de données → MySQL** → créer une base (ex. `u398373271_HightCV`)
2. Noter : nom de BD, utilisateur, mot de passe (hôte = `localhost`)
3. Encoder les caractères spéciaux du mot de passe pour l'URL :
   `+` → `%2B`, `@` → `%40`, `#` → `%23`, `:` → `%3A`

### 5b. Fichier .env + build

```bash
# Fichier .env à partir du modèle
cp deploy/env.production .env
nano .env
# → DATABASE_URL="mysql://UTILISATEUR:MOT_DE_PASSE_ENC0DÉ@localhost:3306/NOM_BD"

# Dépendances + schéma + build standalone
bun install        # ou: npm install
npm run db:push    # crée les tables dans la base MySQL distante
npm run build      # produit .next/standalone/
```

> Vérifier la connexion : `npm run db:push` doit se terminer par
> « Your database is now in sync with your schema ». Si le serveur refuse
> la connexion, vérifier que la BD est bien sur le MÊME compte/hosting
> (localhost ne fonctionne que depuis le serveur lui-même).

## 6. Lancer avec PM2

```bash
pm2 start deploy/ecosystem.config.js
pm2 save
pm2 startup          # suit les instructions affichées (auto-démarrage au reboot)

# Test immédiat
curl -s http://127.0.0.1:3000/api
# → {"status":"ok",...}
```

## 7. Nginx (reverse proxy + préservation des /@pseudo)

```bash
cp deploy/nginx-hightcv.conf /etc/nginx/sites-available/hightcv
nano /etc/nginx/sites-available/hightcv     # remplacer cv.example.com par VOTRE domaine
ln -s /etc/nginx/sites-available/hightcv /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx
```

> Les URL `/@farid` traversent le proxy sans configuration particulière :
> le rewrite se fait **dans l'app** (`src/proxy.ts`), pas dans Nginx.

## 8. HTTPS (obligatoire — cookies `secure` + partage social)

```bash
apt install -y certbot python3-certbot-nginx
certbot --nginx -d votre-domaine.com       # renouvellement automatique inclus
```

Le cookie de session passe automatiquement en `secure` en production
(`NODE_ENV=production`, géré dans `src/lib/auth.ts`).

## 9. Vérification complète

| Test | Attendu |
|---|---|
| `https://votre-domaine.com` | Landing s'affiche |
| Inscription `@votrepseudo` | Compte créé, dashboard visible |
| Création CV + IA | Texte généré, autosave OK |
| Toggle « Public » puis `https://votre-domaine.com/@votrepseudo` | CV public + compteur de vues |
| Export PDF | A4 propre |

> ⚠️ **IA sur votre serveur** : la route `src/app/api/ai/generate/route.ts` utilise le SDK
> du bac à sable. Sur Hostinger, remplacez l'appel `ZAI.create()` par votre provider
> (OpenAI, Mistral, vLLM…) et renseignez `AI_API_KEY` dans `.env`.
> Tout le reste (prompts localisés, contexte sectoriel, quota) fonctionne à l'identique.

## 10. Mises à jour (workflow quotidien)

Depuis votre machine locale :

```bash
git add -A && git commit -m "..." && git push origin main
```

Sur le VPS :

```bash
cd /var/www/hightcv && git pull && bash deploy/deploy.sh
```

## 11. Sauvegardes (recommandé)

```bash
# Cron quotidien de la base MySQL à 3h
crontab -e
0 3 * * * mysqldump -u UTILISATEUR -p'MOT_DE_PASSE' NOM_BD | gzip > /root/backups/cv-$(date +\%F).sql.gz
```

(Restaurer : `gunzip < fichier.sql.gz | mysql -u UTILISATEUR -p NOM_BD`.
Alternative SQLite VPS : remplacer `db/custom.db` + `pm2 restart hightcv`.)

## 12. Alternative Docker

```bash
docker build -t hightcv deploy/Dockerfile   # ou: docker build -t hightcv .
docker run -d -p 3000:3000 -v hightcv_db:/app/db --restart unless-stopped --name hightcv hightcv
```

Le volume `hightcv_db` préserve la base entre les redémarrages.

---

## Récapitulatif des fichiers du kit

| Fichier | Rôle |
|---|---|
| `deploy/env.production` | Variables d'environnement production (à copier en `.env`) |
| `deploy/ecosystem.config.js` | Configuration PM2 (port 3000, restart auto, garde mémoire) |
| `deploy/deploy.sh` | Script unique : install → db → build → restart |
| `deploy/nginx-hightcv.conf` | Reverse proxy + cache statiques + modèle HTTPS |
| `deploy/Dockerfile` | Option conteneur avec volume persistant |
