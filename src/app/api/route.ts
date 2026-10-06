import { NextResponse } from 'next/server'

// Health check (utilisé par la gateway)
export async function GET() {
  return NextResponse.json({ ok: true, service: 'hse-academy-cv', time: new Date().toISOString() })
}
