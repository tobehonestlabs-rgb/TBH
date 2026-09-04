'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabaseClient } from '@/lib/supabaseClient'
import { apiFetch } from '@/lib/api'
import { useTranslation } from '@/lib/i18n'

export default function PaymentChoicePage() {
  const { t } = useTranslation()
  const router = useRouter()
  const [loading, setLoading] = useState<'card' | 'wave' | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [user, setUser] = useState<{ id: string; email: string } | null>(null)

  useEffect(() => {
    async function getSession() {
      const { data: { session } } = await supabaseClient.auth.getSession()
      if (!session?.user) {
        router.push('/login')
        return
      }
      setUser({ id: session.user.id, email: session.user.email! })
    }
    getSession()
  }, [router])

  const handleCardPayment = async () => {
    if (!user) return
    setLoading('card')
    setError(null)

    try {
      window.location.href = 'https://tally.so/r/PdQY70'
    } catch (err: any) {
      setError(err.message || 'Erreur lors du paiement par carte')
      setLoading(null)
    }
  }

  const handleWavePayment = async () => {
    if (!user) return
    setLoading('wave')
    setError(null)

    try {
      const res = await apiFetch('/api/paystack', {
        method: 'POST',
        body: JSON.stringify({ email: user.email, userId: user.id }),
      })
      const data = await res.json()
      if (!data.status || data.status !== 'success') {
        throw new Error(data.error || 'Impossible de démarrer le paiement Wave')
      }
      window.location.href = data.data.authorization_url
    } catch (err: any) {
      setError(err.message || 'Erreur lors du paiement Wave')
      setLoading(null)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-black px-4">
      <div className="text-center text-white max-w-md w-full">
        <div className="mb-6">
          <div className="w-14 h-14 rounded-full mx-auto mb-3 flex items-center justify-center text-[28px]" style={{ background: 'linear-gradient(135deg, #FF6B6B 0%, #FF8E3C 100%)' }}>
            👑
          </div>
          <h1 className="text-2xl font-bold">TBH Pro</h1>
          <p className="text-white/40 text-sm">{t.oneTimeUnlockForever || 'Déblocage unique, pour toujours'}</p>
          <p className="text-white/60 text-sm mt-2">Choisissez votre moyen de paiement</p>
        </div>

        <div className="flex flex-col gap-3">
          <button
            onClick={handleCardPayment}
            disabled={loading !== null}
            className="w-full py-4 rounded-full font-bold text-lg active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
          >
            {loading === 'card' ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              '💳 Payer par carte (Visa/Mastercard)'
            )}
          </button>

          <button
            onClick={handleWavePayment}
            disabled={loading !== null}
            className="w-full py-4 rounded-full font-bold text-lg active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            style={{ background: 'linear-gradient(135deg, #1DBF73 0%, #0f8b4c 100%)' }}
          >
            {loading === 'wave' ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              '📱 Payer par Wave (Mobile Money)'
            )}
          </button>
        </div>

        {error && <p className="text-red-400 text-sm mt-4">{error}</p>}

        <button
          onClick={() => router.push('/')}
          className="mt-6 text-white/30 text-sm hover:text-white/50 transition"
        >
          Annuler et revenir à l'accueil
        </button>

        <p className="text-white/20 text-xs mt-6">Paiements sécurisés via Creem & Paystack</p>
      </div>
    </div>
  )
}
