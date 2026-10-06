// ─── Identité de marque — SOURCE UNIQUE DE VÉRITÉ ───────────────────────────
// Projet AUTONOME, sans lien avec HSE Academy.
// Le nom de domaine définitif n'est pas encore choisi : tout ce qui est
// défini ici est un PLACEHOLDER neutre. Pour rebrander tout le produit
// (interface, SEO, liens @pseudo, textes des 5 langues), il suffit de
// modifier les 2 constantes ci-dessous — rien d'autre.

export const BRAND = 'NovaCV' // ← remplacer par le nom définitif
export const DOMAIN = 'novacv.eu' // ← remplacer par le domaine définitif

// Domaine utilisé dans les exemples de liens @pseudo (landing, emails…)
export function vanityUrl(username: string): string {
  return `${DOMAIN}/@${username}`
}
