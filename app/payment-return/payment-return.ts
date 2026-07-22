// app/payment-return/page.tsx
'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabaseClient } from '@/lib/supabaseClient'

// ── Component that uses search params ────────────────────────────
function PaymentReturnContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    const reference = searchParams.get('reference') || searchParams.get('trxref')

    if (!reference) {
      setStatus('error')
      setMessage('Aucune référence de paiement trouvée.')
      return
    }

    async function verifyPayment() {
      try {
        const res = await fetch(`/api/paystack?reference=${reference}`)
        const data = await res.json()

        if (data.success || data.status === 'success') {
          setStatus('success')
          setMessage('✅ Paiement réussi ! TBH Pro est maintenant actif.')
          await supabaseClient.auth.refreshSession()

          setTimeout(() => {
            router.push('/')
          }, 2000)
        } else {
          setStatus('error')
          setMessage(data.error || 'La vérification du paiement a échoué.')
        }
      } catch {
        setStatus('error')
        setMessage('Une erreur est survenue lors de la vérification.')
      }
    }

    verifyPayment()
  }, [searchParams, router])

  return (
    <div className="flex items-center justify-center min-h-screen bg-black px-4">
      <div className="text-center text-white max-w-md w-full">
        {status === 'loading' && (
          <div>
            <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <h2 className="text-xl font-semibold">Vérification en cours...</h2>
            <p className="text-white/40 text-sm mt-2">Veuillez patienter</p>
          </div>
        )}

        {status === 'success' && (
          <div>
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold">Paiement réussi !</h2>
            <p className="text-white/80 mt-2">{message}</p>
            <p className="text-white/40 text-sm mt-4">Redirection en cours...</p>
          </div>
        )}

        {status === 'error' && (
          <div>
            <div className="text-6xl mb-4">😕</div>
            <h2 className="text-2xl font-bold">Vérification échouée</h2>
            <p className="text-white/60 mt-2">{message}</p>
            <div className="mt-6 flex flex-col gap-3">
              <button
                onClick={() => router.push('/')}
                className="px-6 py-3 bg-white/10 rounded-full hover:bg-white/20 transition"
              >
                Retour à l'accueil
              </button>
              <button
                onClick={() => router.push('/pro')}
                className="px-6 py-3 bg-[#FF6B6B]/20 text-[#FF6B6B] rounded-full hover:bg-[#FF6B6B]/30 transition"
              >
                Réessayer
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Main export ──────────────────────────────────────────────────
export default function PaymentReturnPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen bg-black text-white">Chargement...</div>}>
      <PaymentReturnContent />
    </Suspense>
  )
}