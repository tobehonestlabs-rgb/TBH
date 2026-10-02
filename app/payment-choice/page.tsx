'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabaseClient } from '@/lib/supabaseClient'
import { apiFetch } from '@/lib/api'
import { useTranslation } from '@/lib/i18n'

export default function PaymentChoicePage() {
  const { t } = useTranslation()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const checkoutStarted = useRef(false)

  const startGeniusPayCheckout = async () => {
    if (checkoutStarted.current) return
    checkoutStarted.current = true
    setLoading(true)
    setError(null)

    try {
      const { data: { session } } = await supabaseClient.auth.getSession()
      if (!session?.user) {
        router.push('/login')
        return
      }

      const res = await apiFetch('/api/geniuspay/checkout', { method: 'POST' })
      const data = await res.json()
      if (!res.ok || !data.checkoutUrl) {
        throw new Error(data.error || 'Impossible de démarrer le paiement GeniusPay')
      }
      window.location.href = data.checkoutUrl
    } catch (err: any) {
      checkoutStarted.current = false
      setError(err.message || 'Erreur lors du paiement GeniusPay')
      setLoading(false)
    }
  }

  useEffect(() => { void startGeniusPayCheckout() }, [router])

  return (
    <div className="flex items-center justify-center min-h-screen bg-black px-4">
      <div className="text-center text-white max-w-md w-full">
        <div className="mb-6">
          <div className="w-14 h-14 rounded-full mx-auto mb-3 flex items-center justify-center text-[28px]" style={{ background: 'linear-gradient(135deg, #FF6B6B 0%, #FF8E3C 100%)' }}>
            👑
          </div>
          <h1 className="text-2xl font-bold">TBH Pro</h1>
          <p className="text-white/40 text-sm">{t.oneTimeUnlockForever || 'Déblocage unique, pour toujours'}</p>
          <p className="text-white/60 text-sm mt-2">Redirection sécurisée vers GeniusPay</p>
        </div>

        <div className="flex flex-col gap-3">
          {loading && <div className="flex items-center justify-center gap-3 text-white/70 text-sm">
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Préparation du paiement GeniusPay...
          </div>}
        </div>

        {error && <p className="text-red-400 text-sm mt-4">{error}</p>}
        {error && <button
          onClick={() => { checkoutStarted.current = false; void startGeniusPayCheckout() }}
          className="mt-4 w-full py-3 rounded-full bg-white text-black text-sm font-bold active:scale-95 transition-transform"
        >
          Réessayer avec GeniusPay
        </button>}

        <button
          onClick={() => router.push('/')}
          className="mt-6 text-white/30 text-sm hover:text-white/50 transition"
        >
          Annuler et revenir à l'accueil
        </button>

        <p className="text-white/20 text-xs mt-6">Paiement sécurisé par GeniusPay</p>
      </div>
    </div>
  )
}
