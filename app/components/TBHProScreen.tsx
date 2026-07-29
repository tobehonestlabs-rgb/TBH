'use client'

import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { supabaseClient } from '@/lib/supabaseClient'
import { shouldUsePaystack } from '@/lib/paymentRegion'

const PREMIUM_PRICE_XOF = 1800

const FEATURES = [
  { emoji: '👁️', label: 'Sender insights', sub: 'See who sent you a message' },
  { emoji: '💬', label: 'Private conversations', sub: 'Reply privately to any message' },
]

type Props = {
  onClose: () => void
  onSuccess: () => void
}

export default function TBHProScreen({ onClose, onSuccess }: Props) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null)
  const [paymentProvider, setPaymentProvider] = useState<'paystack' | 'paypal' | null>(null)
  const scriptRef = useRef(false)

  useEffect(() => {
    setPortalTarget(document.getElementById('app-shell'))

    fetch('/api/geo')
      .then(r => r.json())
      .then(geo => setPaymentProvider(shouldUsePaystack(geo.country) ? 'paystack' : 'paypal'))
      .catch(() => setPaymentProvider('paypal'))

    if (!scriptRef.current && !document.getElementById('paystack-js')) {
      const s = document.createElement('script')
      s.id = 'paystack-js'
      s.src = 'https://js.paystack.co/v1/inline.js'
      s.async = true
      document.head.appendChild(s)
      scriptRef.current = true
    }
  }, [])

  const verifyPayment = async (reference: string): Promise<boolean> => {
    const res = await fetch(`/api/paystack?reference=${reference}`)
    const data = await res.json()
    if (data.success && data.status === 'success') {
      return true
    }
    if (data.error) throw new Error(data.error)
    return false
  }

  const handlePaystack = async (email: string, userId: string) => {
    // ✅ Validate inputs before making the request
    if (!userId) {
      console.error('[TBHPro] ❌ userId is undefined or empty')
      throw new Error('User ID is missing. Please sign out and sign in again.')
    }

    if (!email) {
      console.error('[TBHPro] ❌ email is undefined or empty')
      throw new Error('Email is missing. Please sign out and sign in again.')
    }

    console.log('[TBHPro] 📩 Sending to API:', { email, userId })

    const res = await fetch('/api/paystack', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, userId }),
    })

    const data = await res.json()
    if (data.error) throw new Error(data.error)

    const { reference } = data

    const PaystackPop = (window as any).PaystackPop
    if (!PaystackPop) throw new Error('Paystack script not loaded')

    const handleCallback = (response: { reference: string }) => {
      setLoading(true)
      verifyPayment(response.reference)
        .then(ok => {
          if (ok) {
            return supabaseClient.auth.refreshSession()
          } else {
            throw new Error('Payment verification failed')
          }
        })
        .then(() => {
          onSuccess()
        })
        .catch((err: any) => {
          setError(err.message || 'Erreur lors de la vérification')
        })
        .finally(() => {
          setLoading(false)
        })
    }

    PaystackPop.setup({
      key: process.env.NEXT_PUBLIC_PAYSTACK_API?.trim() || '',
      email,
      amount: PREMIUM_PRICE_XOF,
      currency: 'XOF',
      ref: reference,
      onClose: () => setLoading(false),
      callback: handleCallback,
    }).openIframe()
  }

  const handlePayPal = async () => {
    const res = await fetch('/api/paypal/create-order', { method: 'POST' })
    const { approvalUrl, error: apiErr } = await res.json()
    if (apiErr || !approvalUrl) throw new Error(apiErr || 'PayPal error')
    window.location.href = approvalUrl
  }

  const handleUnlock = async () => {
    setLoading(true)
    setError(null)

    try {
      // ✅ Get fresh session
      const { data: { session }, error: sessionError } = await supabaseClient.auth.getSession()
      
      if (sessionError) {
        console.error('[TBHPro] ❌ Session error:', sessionError)
        setError('Erreur de session. Veuillez vous reconnecter.')
        setLoading(false)
        return
      }

      if (!session) {
        console.error('[TBHPro] ❌ No session found')
        setError('Vous devez être connecté')
        setLoading(false)
        return
      }

      const email = session.user?.email
      const userId = session.user?.id

      console.log('[TBHPro] 👤 Session user:', { email, userId })

      if (!email) {
        console.error('[TBHPro] ❌ No email in session')
        setError('Email utilisateur manquant. Veuillez vous reconnecter.')
        setLoading(false)
        return
      }

      if (!userId) {
        console.error('[TBHPro] ❌ No userId in session')
        setError('ID utilisateur manquant. Veuillez vous reconnecter.')
        setLoading(false)
        return
      }

      const provider = paymentProvider ?? 'paypal'
      if (provider === 'paystack') {
        await handlePaystack(email, userId)
      } else {
        await handlePayPal()
      }
    } catch (err: any) {
      console.error('[TBHPro] ❌ Unlock error:', err)
      setError(err.message || 'Une erreur est survenue')
      setLoading(false)
    }
  }

  if (!portalTarget) return null

  return createPortal(
    <div className="fixed inset-0 z-[70] flex flex-col justify-end" onTouchStart={e => e.stopPropagation()}>
      <div
        className="absolute inset-0 backdrop-enter"
        style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(14px)' }}
        onClick={onClose}
      />
      <div
        className="relative sheet-enter rounded-t-[36px] z-10 pb-10 px-5 pt-4 border-t border-white/[0.08] overflow-y-auto"
        style={{ background: '#0D0D0D', maxHeight: '80vh' }}
      >
        <div className="flex justify-center mb-5">
          <div className="w-10 h-1 rounded-full bg-white/20" />
        </div>
        <div className="text-center mb-6">
          <div
            className="w-14 h-14 rounded-full mx-auto mb-3 flex items-center justify-center text-[28px]"
            style={{ background: 'linear-gradient(135deg, #FF6B6B 0%, #FF8E3C 100%)' }}
          >
            👑
          </div>
          <p className="text-white font-black text-[24px] tracking-tight">TBH Pro</p>
          <p className="text-white/40 text-[13px] mt-1">One‑time unlock, forever</p>
        </div>
        <div className="flex flex-col gap-2.5 mb-7">
          {FEATURES.map(f => (
            <div
              key={f.label}
              className="flex items-center gap-4 px-4 py-3.5 rounded-[18px]"
              style={{ background: 'rgba(255,255,255,0.06)' }}
            >
              <span className="text-[22px] flex-shrink-0">{f.emoji}</span>
              <div>
                <p className="text-white font-bold text-[14px]">{f.label}</p>
                <p className="text-white/40 text-[11px] mt-0.5">{f.sub}</p>
              </div>
              <div
                className="ml-auto w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(255,107,107,0.2)' }}
              >
                <svg width="10" height="10" fill="none" viewBox="0 0 24 24">
                  <path d="M5 13l4 4L19 7" stroke="#FF6B6B" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </div>
          ))}
        </div>
        {error && <p className="text-[#FF6B6B] text-[13px] text-center mb-3">{error}</p>}
        <button
          onClick={handleUnlock}
          disabled={loading || paymentProvider === null}
          className="w-full py-[17px] rounded-full font-extrabold text-[17px] active:scale-95 transition-all flex items-center justify-center gap-2 mb-2 disabled:opacity-60"
          style={{ background: 'linear-gradient(135deg, #FF6B6B 0%, #FF8E3C 100%)', boxShadow: '0 8px 32px rgba(255,107,107,0.35)' }}
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            `Unlock TBH Pro — ${PREMIUM_PRICE_XOF.toLocaleString()} FCFA`
          )}
        </button>
        <p className="text-white/25 text-[11px] text-center mb-3">
          {paymentProvider === 'paystack'
            ? 'Pay with card or mobile money via Paystack'
            : paymentProvider === 'paypal'
            ? 'Pay with PayPal'
            : 'Detecting payment method…'}
        </p>
        <button
          onClick={onClose}
          className="w-full py-3 text-white/30 text-[13px] font-semibold active:opacity-70 transition-opacity"
        >
          Not now
        </button>
      </div>
    </div>,
    portalTarget,
  )
}