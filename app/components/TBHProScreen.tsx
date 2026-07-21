'use client'

import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { supabaseClient } from '@/lib/supabaseClient'
import { shouldUsePaystack } from '@/lib/paymentRegion'

type Props = {
  onClose: () => void
  onSuccess: () => void
}

// ── Config ──────────────────────────────────────────────────────────────
const PREMIUM_PRICE_XOF = 1800 // Fixed price in XOF

const FEATURES = [
  { emoji: '👁️', label: 'Sender insights', sub: 'See who sent you a message' },
  { emoji: '💬', label: 'Private conversations', sub: 'Reply privately to any message' },
]

export default function TBHProScreen({ onClose, onSuccess }: Props) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null)
  const [paymentProvider, setPaymentProvider] = useState<'paystack' | 'paypal' | null>(null)
  const scriptRef = useRef(false)

  // ── Load Paystack script and detect region ──────────────────────────
  useEffect(() => {
    setPortalTarget(document.getElementById('app-shell'))

    // Detect user's region for payment provider
    fetch('/api/geo')
      .then(r => r.json())
      .then(geo => setPaymentProvider(shouldUsePaystack(geo.country) ? 'paystack' : 'paypal'))
      .catch(() => setPaymentProvider('paypal'))

    // Load Paystack inline script (only once)
    if (!scriptRef.current && !document.getElementById('paystack-js')) {
      const s = document.createElement('script')
      s.id = 'paystack-js'
      s.src = 'https://js.paystack.co/v1/inline.js'
      s.async = true
      document.head.appendChild(s)
      scriptRef.current = true
    }
  }, [])

  // ── Verify payment (shared function) ──────────────────────────────────
  const verifyPayment = async (reference: string): Promise<boolean> => {
    console.log('[TBHPro] Verifying payment:', reference)

    try {
      const verifyRes = await fetch(`/api/paystack?reference=${reference}`)

      const contentType = verifyRes.headers.get('content-type')
      if (!contentType?.includes('application/json')) {
        throw new Error('Verification failed. Please contact support.')
      }

      const verifyData = await verifyRes.json()
      console.log('[TBHPro] Verification response:', verifyData)

      if (verifyData.success || verifyData.status === 'success') {
        // Refresh session to get updated user data
        await supabaseClient.auth.refreshSession()
        return true
      } else {
        throw new Error(verifyData.error || 'Payment verification failed.')
      }
    } catch (err: any) {
      console.error('[TBHPro] Verification error:', err)
      throw err
    }
  }

  // ── Handle Paystack Payment ───────────────────────────────────────────
  const handlePaystack = async (email: string, userId: string) => {
    console.log('[TBHPro] Initializing Paystack for:', { email, userId })

    // 1. Initialize payment on backend
    const res = await fetch('/api/paystack', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, userId }),
    })

    // Check if response is JSON
    const contentType = res.headers.get('content-type')
    if (!contentType?.includes('application/json')) {
      const text = await res.text()
      console.error('[TBHPro] Non-JSON response:', text.substring(0, 200))
      throw new Error('Server error. Please try again.')
    }

    const data = await res.json()
    console.log('[TBHPro] Paystack init response:', data)

    if (data.error) {
      throw new Error(data.error)
    }

    const { reference, authorization_url } = data

    // ── Option 1: Redirect (preferred, more reliable) ──────────────────
    if (authorization_url) {
      console.log('[TBHPro] 🔄 Redirecting to Paystack...')
      // Store reference in session storage for the return page
      sessionStorage.setItem('paystack_reference', reference)
      sessionStorage.setItem('paystack_user_id', userId)
      // Redirect to Paystack
      window.location.href = authorization_url
      return
    }

    // ── Option 2: Inline iframe (fallback) ─────────────────────────────
    console.log('[TBHPro] Using inline iframe fallback')

    const PaystackPop = (window as Window & {
      PaystackPop?: {
        setup: (opts: Record<string, unknown>) => { openIframe: () => void }
      }
    }).PaystackPop

    if (!PaystackPop) {
      throw new Error('Payment service unavailable. Please refresh and try again.')
    }

    PaystackPop.setup({
      key: (process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY ?? '').trim(),
      email,
      amount: PREMIUM_PRICE_XOF,
      currency: 'XOF',
      ref: reference,
      onClose: () => {
        console.log('[TBHPro] Paystack popup closed')
        setLoading(false)
      },
      callback: async (response: { reference: string }) => {
        console.log('[TBHPro] 📞 Payment callback:', response)
        setLoading(true)

        try {
          const success = await verifyPayment(response.reference)
          if (success) {
            onSuccess()
          }
        } catch (err: any) {
          console.error('[TBHPro] Callback error:', err)
          setError(err.message || 'Verification failed. Please contact support.')
        } finally {
          setLoading(false)
        }
      },
    }).openIframe()
  }

  // ── Handle PayPal Payment ─────────────────────────────────────────────
  const handlePayPal = async () => {
    const res = await fetch('/api/paypal/create-order', { method: 'POST' })
    const { approvalUrl, error: apiErr } = await res.json()
    if (apiErr || !approvalUrl) {
      throw new Error(apiErr ?? 'Could not start PayPal checkout')
    }
    window.location.href = approvalUrl
  }

  // ── Main Unlock Handler ──────────────────────────────────────────────
  const handleUnlock = async () => {
    setLoading(true)
    setError(null)

    try {
      const { data: { session } } = await supabaseClient.auth.getSession()

      if (!session?.user?.email) {
        setError('Please sign in first')
        setLoading(false)
        return
      }

      if (!session?.user?.id) {
        setError('User ID not found. Please sign out and sign in again.')
        setLoading(false)
        return
      }

      const provider = paymentProvider ?? 'paypal'

      if (provider === 'paystack') {
        await handlePaystack(session.user.email, session.user.id)
        // Note: If redirect happens, this function won't continue
        // The return page will handle verification
      } else {
        await handlePayPal()
      }
    } catch (e: unknown) {
      console.error('[TBHPro] Unlock error:', e)
      setError(e instanceof Error ? e.message : 'Something went wrong')
      setLoading(false)
    }
  }

  // ── Render ─────────────────────────────────────────────────────────────
  if (!portalTarget) return null

  const priceLabel = `Unlock TBH Pro — ${PREMIUM_PRICE_XOF.toLocaleString()} FCFA`

  const providerHint =
    paymentProvider === 'paystack'
      ? 'Pay with card or mobile money via Paystack'
      : paymentProvider === 'paypal'
        ? 'Pay with PayPal'
        : 'Detecting payment method…'

  return createPortal(
    <div className="fixed inset-0 z-[70] flex flex-col justify-end" onTouchStart={e => e.stopPropagation()}>
      {/* Backdrop */}
      <div
        className="absolute inset-0 backdrop-enter"
        style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)' }}
        onClick={onClose}
      />

      {/* Sheet */}
      <div
        className="relative sheet-enter rounded-t-[36px] z-10 pb-10 px-5 pt-4 border-t border-white/[0.08] overflow-y-auto"
        style={{ background: '#0D0D0D', maxHeight: '80vh' }}
      >
        {/* Handle */}
        <div className="flex justify-center mb-5">
          <div className="w-10 h-1 rounded-full bg-white/20" />
        </div>

        {/* Header */}
        <div className="text-center mb-6">
          <div
            className="w-14 h-14 rounded-full mx-auto mb-3 flex items-center justify-center text-[28px]"
            style={{ background: 'linear-gradient(135deg, #FF6B6B 0%, #FF8E3C 100%)' }}
          >
            👑
          </div>
          <p className="text-white font-black text-[24px] tracking-tight">TBH Pro</p>
          <p className="text-white/40 text-[13px] mt-1">One-time unlock. Yours forever.</p>
        </div>

        {/* Features */}
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

        {/* Error */}
        {error && <p className="text-[#FF6B6B] text-[13px] text-center mb-3">{error}</p>}

        {/* Unlock Button */}
        <button
          onClick={handleUnlock}
          disabled={loading || paymentProvider === null}
          className="w-full py-[17px] rounded-full font-extrabold text-[17px] active:scale-95 transition-all flex items-center justify-center gap-2 mb-2 disabled:opacity-60"
          style={{ background: 'linear-gradient(135deg, #FF6B6B 0%, #FF8E3C 100%)', boxShadow: '0 8px 32px rgba(255,107,107,0.35)' }}
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            priceLabel
          )}
        </button>

        {/* Provider Hint */}
        <p className="text-white/25 text-[11px] text-center mb-3">{providerHint}</p>

        {/* Close Button */}
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