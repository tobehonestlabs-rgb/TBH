// app/payment/creem/status/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabaseClient } from '@/lib/supabaseClient'

export default function CreemStatusPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    const sessionId = searchParams.get('session_id')
    const checkoutId = searchParams.get('checkout_id')

    console.log('[Creem Status] Session ID:', sessionId)
    console.log('[Creem Status] Checkout ID:', checkoutId)

    async function verifyPayment() {
      try {
        // Refresh session to get updated user data
        await supabaseClient.auth.refreshSession()

        // Check if user is now premium
        const { data: { session } } = await supabaseClient.auth.getSession()
        const userId = session?.user?.id

        if (userId) {
          const { data: userData } = await supabaseClient
            .from('users_table')
            .select('active_subscription')
            .eq('user_id', userId)
            .single()

          if (userData?.active_subscription === true) {
            setStatus('success')
            setMessage('🎉 Paiement réussi ! TBH Pro est maintenant actif.')
            setTimeout(() => {
              router.push('/')
            }, 3000)
            return
          }
        }

        // If we got here, something went wrong
        setStatus('error')
        setMessage('Le paiement a été effectué mais nous n\'avons pas pu activer votre abonnement. Contactez le support.')
      } catch (error) {
        console.error('[Creem Status] Error:', error)
        setStatus('error')
        setMessage('Erreur lors de la vérification du paiement.')
      }
    }

    if (checkoutId || sessionId) {
      verifyPayment()
    } else {
      setStatus('error')
      setMessage('Aucune information de paiement trouvée.')
    }
  }, [searchParams, router])

  return (
    <div className="flex items-center justify-center min-h-screen bg-black px-4">
      <div className="text-center text-white max-w-md w-full">
        {status === 'loading' && (
          <>
            <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <h1 className="text-2xl font-bold">Vérification en cours...</h1>
            <p className="text-white/40 mt-2">Veuillez patienter</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="text-6xl mb-4">🎉</div>
            <h1 className="text-2xl font-bold">Paiement réussi !</h1>
            <p className="text-white/80 mt-2">{message}</p>
            <p className="text-white/40 text-sm mt-4">Redirection en cours...</p>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="text-6xl mb-4">😕</div>
            <h1 className="text-2xl font-bold">Vérification échouée</h1>
            <p className="text-white/60 mt-2">{message}</p>
            <div className="mt-6 flex flex-col gap-3">
              <a
                href="/pro"
                className="px-6 py-3 bg-[#FF6B6B]/20 text-[#FF6B6B] rounded-full hover:bg-[#FF6B6B]/30 transition"
              >
                Réessayer
              </a>
              <a
                href="/"
                className="px-6 py-3 bg-white/10 rounded-full hover:bg-white/20 transition text-white"
              >
                Retour à l'accueil
              </a>
            </div>
          </>
        )}
      </div>
    </div>
  )
}