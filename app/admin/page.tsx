'use client'

import { useEffect, useMemo, useState } from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

type FeedbackEntry = {
  id?: string
  created_at?: string
  comprehension?: string
  onboarding?: string
  friction_moment?: string
  main_emotion?: string
  action_trigger?: string
  viral_loop?: string
  viral_reason?: string
  safety_comfort?: string
  safety_reason?: string
  sensitive_options?: string
  payment_intent?: string
  verdict?: string
  verdict_reason?: string
  open_note?: string
}

export default function AdminPage() {
  const [entries, setEntries] = useState<FeedbackEntry[]>([])
  const [selected, setSelected] = useState<FeedbackEntry | null>(null)
  const [downloads, setDownloads] = useState<number>(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/feedback')
        const data = await response.json()

        if (!response.ok) {
          const details =
            typeof data?.details === 'string' && data.details.trim() ? ` (${data.details})` : ''
          throw new Error((data.error || 'Impossible de récupérer les feedbacks') + details)
        }

        setEntries(data.feedback || [])
        setSelected((data.feedback || [])[0] || null)
        setDownloads(data.downloads || 0)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const orderedEntries = useMemo(
    () =>
      [...entries].sort((a, b) =>
        (a.created_at || '') < (b.created_at || '') ? 1 : -1
      ),
    [entries]
  )

  return (
    <main className="min-h-screen bg-black text-white">
      <Header />

      <section className="pt-24 pb-16 px-4 md:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-white/60">Admin</p>
              <h1 className="text-3xl md:text-4xl font-bold">Boîte de réception feedback</h1>
              <p className="text-white/60 mt-1">Consulte les réponses et l’expression libre.</p>
            </div>
            <div className="glass-card border border-white/10 px-5 py-4 flex items-center gap-3">
              <div className="text-2xl">⬇️</div>
              <div>
                <p className="text-sm text-white/60">Téléchargements version test</p>
                <p className="text-2xl font-semibold">{downloads}</p>
              </div>
            </div>
          </div>

          {loading && <div className="glass-card p-6">Chargement des réponses...</div>}
          {error && <div className="glass-card p-6 border border-red-500/30 text-red-300">{error}</div>}

          {!loading && !error && (
            <div className="grid lg:grid-cols-3 gap-4">
              <div className="glass-card border border-white/10 overflow-hidden">
                <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
                  <span className="text-sm text-white/70">Réponses</span>
                  <span className="text-xs text-white/50">{orderedEntries.length} reçues</span>
                </div>
                <div className="max-h-[70vh] overflow-y-auto divide-y divide-white/5">
                  {orderedEntries.map((entry, index) => (
                    <button
                      key={entry.id ?? index}
                      onClick={() => setSelected(entry)}
                      className={`w-full text-left px-4 py-3 hover:bg-white/5 transition ${
                        selected?.id === entry.id ? 'bg-white/10' : ''
                      }`}
                    >
                      <p className="text-sm font-semibold">Feedback #{index + 1}</p>
                      <p className="text-xs text-white/50">
                        {entry.created_at
                          ? new Date(entry.created_at).toLocaleString('fr-FR', {
                              dateStyle: 'short',
                              timeStyle: 'short',
                            })
                          : 'Date inconnue'}
                      </p>
                      <p className="text-sm text-white/70 line-clamp-2 mt-1">
                        {entry.open_note || entry.friction_moment || '—'}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="glass-card border border-white/10 lg:col-span-2 space-y-4 max-h-[80vh] overflow-y-auto p-6">
                {selected ? (
                  <FeedbackDetails entry={selected} />
                ) : (
                  <p className="text-white/60">Sélectionne une réponse pour afficher le détail.</p>
                )}
              </div>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </main>
  )
}

function DetailRow({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null

  return (
    <div className="space-y-1">
      <p className="text-xs uppercase tracking-[0.2em] text-white/40">{label}</p>
      <p className="text-base text-white/90 leading-relaxed">{value}</p>
    </div>
  )
}

function FeedbackDetails({ entry }: { entry: FeedbackEntry }) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
        <div>
          <p className="text-sm text-white/60">
            {entry.created_at
              ? new Date(entry.created_at).toLocaleString('fr-FR', {
                  dateStyle: 'medium',
                  timeStyle: 'short',
                })
              : 'Date inconnue'}
          </p>
          <h2 className="text-2xl font-semibold">Réponse détaillée</h2>
        </div>
        <div className="px-3 py-2 rounded-full bg-white/10 text-sm text-white/80">
          {entry.verdict || 'Verdict non précisé'}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <DetailRow label="Compréhension immédiate" value={entry.comprehension} />
        <DetailRow label="Onboarding utile" value={entry.onboarding} />
        <DetailRow label="Moment de friction" value={entry.friction_moment} />
        <DetailRow label="Émotion principale" value={entry.main_emotion} />
        <DetailRow label="Déclencheur d’action" value={entry.action_trigger} />
        <DetailRow label="Boucle virale" value={entry.viral_loop} />
        <DetailRow label="Pourquoi (viral)" value={entry.viral_reason} />
        <DetailRow label="Sécurité & confort" value={entry.safety_comfort} />
        <DetailRow label="Pourquoi (sécurité)" value={entry.safety_reason} />
        <DetailRow label="Options sensibles" value={entry.sensitive_options} />
        <DetailRow label="Intention de paiement" value={entry.payment_intent} />
        <DetailRow label="Verdict" value={entry.verdict} />
        <DetailRow label="Pourquoi (verdict)" value={entry.verdict_reason} />
      </div>

      <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
        <p className="text-xs uppercase tracking-[0.2em] text-white/40 mb-2">Expression libre</p>
        <p className="text-white/90 leading-relaxed whitespace-pre-wrap">
          {entry.open_note || 'Aucun commentaire libre.'}
        </p>
      </div>
    </div>
  )
}

