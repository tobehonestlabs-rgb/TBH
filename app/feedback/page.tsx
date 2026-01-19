'use client'

import { FormEvent, useMemo, useState } from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

const cardClass =
  'glass-card p-6 md:p-8 space-y-4 transition hover:-translate-y-0.5 hover:shadow-xl border border-white/10'

const radioBase =
  'flex items-center justify-between rounded-xl bg-white/5 border border-white/10 px-4 py-3 hover:bg-white/10 transition'

type SubmitState = 'idle' | 'loading' | 'success' | 'error'

export default function FeedbackPage() {
  const [state, setState] = useState<SubmitState>('idle')
  const [error, setError] = useState<string | null>(null)

  const radioOptions = useMemo(
    () => ({
      comprehension: ['Oui', 'Non', 'Plus ou moins'],
      onboarding: ['Oui', 'Non', "Je n’en avais pas besoin"],
      viralLoop: ['Oui, clairement', 'Peut-être', 'Non'],
      safetyComfort: ['Oui', 'Moyennement', 'Non'],
      sensitiveOptions: ['Oui', 'Non', "Je n’ai pas fait attention"],
      verdict: ['Oui', 'Un peu', 'Pas du tout'],
    }),
    []
  )

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setState('loading')
    setError(null)

    const formData = new FormData(e.currentTarget)
    const payload = Object.fromEntries(formData.entries())

    const response = await fetch('/api/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      const data = await response.json().catch(() => ({}))
      setError(data.error || "Impossible d’envoyer le feedback.")
      setState('error')
      return
    }

    e.currentTarget.reset()
    setState('success')
  }

  return (
    <main className="min-h-screen bg-black text-white">
      <Header />

      <section className="relative pt-24 pb-16">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.08),_transparent_45%)] pointer-events-none" />

        <div className="container mx-auto px-4 md:px-8 relative">
          <div className="max-w-4xl mx-auto text-center mb-12 space-y-4">
            <p className="text-sm uppercase tracking-[0.2em] text-white/60">Feedback TBH</p>
            <h1 className="text-4xl md:text-5xl font-bold leading-tight">
              Dis-nous exactement ce que tu ressens.
            </h1>
            <p className="text-lg text-white/70">
              Pas de justification. Pas de défense. Juste un retour brut et honnête pour améliorer TBH.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl mx-auto">
            <div className={cardClass}>
              <div className="space-y-4">
                <Question
                  label="Après les premières secondes sur l’app, as-tu compris à quoi elle servait ?"
                  name="comprehension"
                  options={radioOptions.comprehension}
                  required
                />

                <Question
                  label="L’onboarding t’a-t-il aidé à comprendre quoi faire ensuite ?"
                  name="onboarding"
                  options={radioOptions.onboarding}
                  required
                />

                <TextQuestion
                  label="À quel moment as-tu hésité, été confus(e) ou voulu quitter l’app ?"
                  name="frictionMoment"
                  placeholder="Raconte le moment exact où tu as hésité..."
                />

                <TextQuestion
                  label="Quelle émotion as-tu ressentie en utilisant TBH pour la première fois ?"
                  name="mainEmotion"
                  placeholder="Curiosité, stress, excitation, indifférence, méfiance..."
                />

                <TextQuestion
                  label="Qu’est-ce qui t’a donné envie (ou non) d’envoyer / recevoir un message anonyme ?"
                  name="actionTrigger"
                  placeholder="Une feature, un écran, un détail qui t’a poussé ou freiné ?"
                />

                <Question
                  label="Aurais-tu envie de partager ton lien TBH pour recevoir des messages ?"
                  name="viralLoop"
                  options={radioOptions.viralLoop}
                  required
                />

                <TextQuestion
                  label="Pourquoi ?"
                  name="viralReason"
                  placeholder="Explique ce qui te motive ou te bloque."
                />

                <Question
                  label="Te sens-tu à l’aise et en sécurité en utilisant TBH ?"
                  name="safetyComfort"
                  options={radioOptions.safetyComfort}
                  required
                />

                <TextQuestion
                  label="Qu’est-ce qui t’a mis à l’aise ou mal à l’aise ?"
                  name="safetyReason"
                  placeholder="Parle des options, des textes, du ton, des protections..."
                />

                <Question
                  label="Les options (flou des images, blocage, signalement) te semblent-elles suffisantes ?"
                  name="sensitiveOptions"
                  options={radioOptions.sensitiveOptions}
                  required
                />

                <TextQuestion
                  label="Dans quel cas serais-tu prêt(e) à payer pour TBH ?"
                  name="paymentIntent"
                  placeholder="Voir plus de messages, débloquer des indices, recevoir des photos..."
                />

                <Question
                  label="Si TBH n’existait plus demain, est-ce que ça te manquerait ?"
                  name="verdict"
                  options={radioOptions.verdict}
                  required
                />

                <TextQuestion
                  label="Pourquoi ?"
                  name="verdictReason"
                  placeholder="Dis-le franchement, même si c’est brutal."
                />
              </div>
            </div>

            <div className={cardClass}>
              <h2 className="text-2xl font-semibold">Merci, dis-moi ce que tu ressens vraiment.</h2>
              <p className="text-white/60 mb-4">
                Zone libre pour partager ce qui t’a marqué, ce qui manque, ou ce qui doit changer en priorité.
              </p>
              <textarea
                name="openNote"
                rows={6}
                className="w-full rounded-2xl bg-white/5 border border-white/10 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-white/40 placeholder:text-white/40"
                placeholder="Exprime-toi librement sur l’expérience complète."
              />
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <p className="text-sm text-white/60">🔒 Tes réponses sont anonymes et ne seront pas utilisées pour te relancer.</p>
              <button
                type="submit"
                disabled={state === 'loading'}
                className="px-6 py-3 rounded-full bg-white text-black font-semibold hover:bg-white/90 transition disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {state === 'loading' ? 'Envoi en cours...' : 'Envoyer le feedback'}
              </button>
            </div>

            {state === 'success' && (
              <div className="glass-card border border-emerald-500/30 text-emerald-300 p-4">
                Merci ! Ton feedback est bien reçu.
              </div>
            )}

            {state === 'error' && error && (
              <div className="glass-card border border-red-500/30 text-red-300 p-4">
                {error}
              </div>
            )}
          </form>
        </div>
      </section>

      <Footer />
    </main>
  )
}

function Question({
  label,
  name,
  options,
  required,
}: {
  label: string
  name: string
  options: string[]
  required?: boolean
}) {
  return (
    <div className="space-y-3">
      <p className="text-lg font-semibold">{label}</p>
      <div className="grid md:grid-cols-3 gap-3">
        {options.map((option) => (
          <label key={option} className={radioBase}>
            <span className="text-white">{option}</span>
            <input
              type="radio"
              name={name}
              value={option}
              required={required}
              className="h-4 w-4 accent-white"
            />
          </label>
        ))}
      </div>
    </div>
  )
}

function TextQuestion({
  label,
  name,
  placeholder,
}: {
  label: string
  name: string
  placeholder?: string
}) {
  return (
    <div className="space-y-2">
      <p className="text-lg font-semibold">{label}</p>
      <textarea
        name={name}
        rows={4}
        className="w-full rounded-2xl bg-white/5 border border-white/10 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-white/40 placeholder:text-white/40"
        placeholder={placeholder}
      />
    </div>
  )
}

