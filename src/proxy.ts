import { NextResponse, type NextRequest } from 'next/server'

// ─── Route virale /@pseudo (Next.js 16 : proxy remplace middleware) ─────────
// Réécrit domaine.tld/@farid vers la page unique avec le paramètre ?pub=farid.
// Le client affiche alors la vue publique. Le nom de domaine définitif est
// configurable dans src/lib/brand.ts (aucun impact sur ce mécanisme).
export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl
  const match = pathname.match(/^\/@([a-z0-9-]{3,20})\/?$/i)
  if (match) {
    const url = req.nextUrl.clone()
    url.pathname = '/'
    url.search = `?pub=${match[1].toLowerCase()}`
    return NextResponse.rewrite(url)
  }
  return NextResponse.next()
}
