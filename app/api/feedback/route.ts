import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

const FEEDBACK_TABLE = process.env.SUPABASE_FEEDBACK_TABLE || 'feedback_answers'
const DOWNLOADS_TABLE = process.env.SUPABASE_DOWNLOADS_TABLE || 'downloads'
const FEEDBACK_COLUMN = process.env.SUPABASE_FEEDBACK_COLUMN || 'feedbacks'

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
        [FEEDBACK_COLUMN]: {
          comprehension,
          onboarding,
          frictionMoment: frictionMoment || '',
          mainEmotion: mainEmotion || '',
          actionTrigger: actionTrigger || '',
          viralLoop,
          viralReason: viralReason || '',
          safetyComfort,
          safetyReason: safetyReason || '',
          sensitiveOptions,
          paymentIntent: paymentIntent || '',
          verdict,
          verdictReason: verdictReason || '',
          openNote: openNote || '',
        },
      })
      .select('*')
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
        .limit(200),
      supabaseAdmin.from(DOWNLOADS_TABLE).select('*', { count: 'exact', head: true }),
    ])

    if (fetchError) {
      return NextResponse.json({ error: 'Lecture impossible', details: fetchError.message }, { status: 500 })
    }

    const downloads = downloadsError ? 0 : count ?? 0

    const feedback = (data ?? []).map((row: any) => {
      const payload = row?.[FEEDBACK_COLUMN] ?? {}
      return {
        id: row?.id ?? null,
        created_at: row?.created_at ?? null,
        comprehension: payload?.comprehension ?? '',
        onboarding: payload?.onboarding ?? '',
        friction_moment: payload?.frictionMoment ?? '',
        main_emotion: payload?.mainEmotion ?? '',
        action_trigger: payload?.actionTrigger ?? '',
        viral_loop: payload?.viralLoop ?? '',
        viral_reason: payload?.viralReason ?? '',
        safety_comfort: payload?.safetyComfort ?? '',
        safety_reason: payload?.safetyReason ?? '',
        sensitive_options: payload?.sensitiveOptions ?? '',
        payment_intent: payload?.paymentIntent ?? '',
        verdict: payload?.verdict ?? '',
        verdict_reason: payload?.verdictReason ?? '',
        open_note: payload?.openNote ?? '',
      }
    })

    return NextResponse.json({ feedback, downloads })
  } catch (error: any) {
    return NextResponse.json({ error: 'Erreur inattendue', details: error?.message }, { status: 500 })
  }
}

