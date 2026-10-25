import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  const token =
    process.env.NEXT_PUBLIC_MAPBOX_TOKEN ||
    process.env.MAPBOX_TOKEN ||
    process.env.NEXT_PUBLIC_MAPBOX_API_KEY ||
    process.env.MAPBOX_API_KEY ||
    null

  return NextResponse.json({ token })
}
