// app/api/paystack/route.ts
import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  console.log('✅ GET /api/paystack was called')
  return NextResponse.json({ message: 'Paystack route is alive!' })
}

export async function POST(request: NextRequest) {
  console.log('✅ POST /api/paystack was called')
  try {
    const body = await request.json()
    console.log('Body:', body)
    return NextResponse.json({ received: body })
  } catch (error) {
    console.error('Error parsing JSON:', error)
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }
}