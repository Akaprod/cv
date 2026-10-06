// ─── Identité de marque — SOURCE UNIQUE DE VÉRITÉ ───────────────────────────
// Projet AUTONOME, sans lien avec HSE Academy.
//
// ★ HIGHTCV — nom OFFICIEL du projet (défini par Farid, oct. 2026).
//
// Le nom de domaine n'est pas encore réservé : DOMAIN ci-dessous est
// PROVISOIRE (hightcv.com proposé). Dès que le domaine définitif est réservé,
// mettre à jour cette seule constante — tout le produit suit (interface, SEO,
// liens @pseudo, exemples des 5 langues, metadata, footer).

export const BRAND = 'HightCV' // nom officiel
export const DOMAIN = 'hightcv.com' // ← à ajuster si le domaine réservé diffère

// Domaine utilisé dans les exemples de liens @pseudo (landing, emails…)
export function vanityUrl(username: string): string {
  return `${DOMAIN}/@${username}`
}
