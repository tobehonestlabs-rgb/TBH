import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

const FEEDBACK_TABLE = process.env.SUPABASE_FEEDBACK_TABLE || 'feedback'
const DOWNLOADS_TABLE = process.env.SUPABASE_DOWNLOADS_TABLE || 'downloads'

type FeedbackPayload = {
  comprehension?: string
  onboarding?: string
  frictionMoment?: string
  mainEmotion?: string
  actionTrigger?: string
  viralLoop?: string
  viralReason?: string
  safetyComfort?: string
  safetyReason?: string
  sensitiveOptions?: string
  paymentIntent?: string
  verdict?: string
  verdictReason?: string
  openNote?: string
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as FeedbackPayload

    if (!body) {
      return NextResponse.json({ error: 'Corps de requête manquant' }, { status: 400 })
    }

    const {
      comprehension,
      onboarding,
      frictionMoment,
      mainEmotion,
      actionTrigger,
      viralLoop,
      viralReason,
      safetyComfort,
      safetyReason,
      sensitiveOptions,
      paymentIntent,
      verdict,
      verdictReason,
      openNote,
    } = body

    if (!comprehension || !onboarding || !viralLoop || !safetyComfort || !sensitiveOptions || !verdict) {
      return NextResponse.json({ error: 'Merci de remplir les réponses obligatoires.' }, { status: 400 })
    }

    const { data, error } = await supabaseAdmin
      .from(FEEDBACK_TABLE)
      .insert({
        comprehension,
        onboarding,
        friction_moment: frictionMoment || '',
        main_emotion: mainEmotion || '',
        action_trigger: actionTrigger || '',
        viral_loop: viralLoop,
        viral_reason: viralReason || '',
        safety_comfort: safetyComfort,
        safety_reason: safetyReason || '',
        sensitive_options: sensitiveOptions,
        payment_intent: paymentIntent || '',
        verdict,
        verdict_reason: verdictReason || '',
        open_note: openNote || '',
        created_at: new Date().toISOString(),
        source: 'web-feedback',
      })
      .select('id')
      .single()

    if (error) {
      return NextResponse.json({ error: 'Sauvegarde impossible', details: error.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true, id: data?.id })
  } catch (error: any) {
    return NextResponse.json({ error: 'Erreur inattendue', details: error?.message }, { status: 500 })
  }
}

export async function GET() {
  try {
    const [{ data, error: fetchError }, { count, error: downloadsError }] = await Promise.all([
      supabaseAdmin
        .from(FEEDBACK_TABLE)
        .select('*')
        .order('created_at', { ascending: false })
        .limit(200),
      supabaseAdmin.from(DOWNLOADS_TABLE).select('*', { count: 'exact', head: true }),
    ])

    if (fetchError) {
      return NextResponse.json({ error: 'Lecture impossible', details: fetchError.message }, { status: 500 })
    }

    const downloads = downloadsError ? 0 : count ?? 0

    return NextResponse.json({
      feedback: data ?? [],
      downloads,
    })
  } catch (error: any) {
    return NextResponse.json({ error: 'Erreur inattendue', details: error?.message }, { status: 500 })
  }
}

