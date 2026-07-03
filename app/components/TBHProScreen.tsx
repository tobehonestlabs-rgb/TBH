'use client'

import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { supabaseClient } from '@/lib/supabaseClient'

type Props = {
  onClose: () => void
  onSuccess: () => void
}

const FEATURES = [
  { emoji: '👁️', label: 'Sender insights',        sub: 'See who sent you a message' },
  { emoji: '💬', label: 'Private conversations',  sub: 'Reply privately to any message' },
]

export default function TBHProScreen({ onClose, onSuccess }: Props) {
  const [loading, setLoading]               = useState(false)
  const [error, setError]                   = useState<string | null>(null)
  const [portalTarget, setPortalTarget]     = useState<HTMLElement | null>(null)
  const scriptRef = useRef(false)

  useEffect(() => {
    setPortalTarget(document.getElementById('app-shell'))
    // Load Paystack inline script once
    if (!scriptRef.current && !document.getElementById('paystack-js')) {
      const s = document.createElement('script')
      s.id  = 'paystack-js'
      s.src = 'https://js.paystack.co/v1/inline.js'
      s.async = true
      document.head.appendChild(s)
      scriptRef.current = true
    }
  }, [])

  const handleSubscribe = async () => {
    setLoading(true)
    setError(null)
    try {
      const { data: { session } } = await supabaseClient.auth.getSession()
      if (!session?.user.email) { setError('Not signed in'); setLoading(false); return }
      const email = session.user.email

      const res  = await fetch('/api/paystack/initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const { reference, authorization_url, error: apiErr } = await res.json()
      if (apiErr) { setError(apiErr); setLoading(false); return }

      // If authorization_url is available, redirect directly
      if (authorization_url) {
        window.location.href = authorization_url
        return
      }

      const PaystackPop = (window as any).PaystackPop
      if (!PaystackPop) { setError('Payment service unavailable'); setLoading(false); return }

      const popup = PaystackPop.setup({
        key:      (process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY ?? '').trim(),
        email,
        amount:   299 * 100,
        currency: 'USD',
        ref:      reference,
        onClose:  () => setLoading(false),
        callback: async (response: { reference: string }) => {
          const verifyRes = await fetch(`/api/paystack/verify?reference=${response.reference}`)
          const verifyData = await verifyRes.json()
          if (verifyData.ok) {
            onSuccess()
          } else {
            setError('Payment verification failed. Contact support.')
          }
          setLoading(false)
        },
      })
      popup.openIframe()
    } catch (e: any) {
      setError(e.message ?? 'Something went wrong')
      setLoading(false)
    }
  }

  if (!portalTarget) return null

  return createPortal(
    <div className="fixed inset-0 z-[70] flex flex-col justify-end" onTouchStart={e => e.stopPropagation()}>
      {/* Backdrop */}
      <div
        className="absolute inset-0 backdrop-enter"
        style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)' }}
        onClick={onClose}
      />

      <div
        className="relative sheet-enter rounded-t-[36px] z-10 pb-10 px-5 pt-4 border-t border-white/[0.08] overflow-y-auto"
        style={{ background: '#0D0D0D', maxHeight: '80vh' }}
      >
        {/* Handle */}
        <div className="flex justify-center mb-5">
          <div className="w-10 h-1 rounded-full bg-white/20" />
        </div>

        {/* Crown + title */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-full mx-auto mb-3 flex items-center justify-center text-[28px]"
               style={{ background: 'linear-gradient(135deg, #FF6B6B 0%, #FF8E3C 100%)' }}>
            👑
          </div>
          <p className="text-white font-black text-[24px] tracking-tight">TBH Pro</p>
          <p className="text-white/40 text-[13px] mt-1">Unlock the full experience</p>
        </div>

        {/* Feature list */}
        <div className="flex flex-col gap-2.5 mb-7">
          {FEATURES.map(f => (
            <div key={f.label} className="flex items-center gap-4 px-4 py-3.5 rounded-[18px]"
                 style={{ background: 'rgba(255,255,255,0.06)' }}>
              <span className="text-[22px] flex-shrink-0">{f.emoji}</span>
              <div>
                <p className="text-white font-bold text-[14px]">{f.label}</p>
                <p className="text-white/40 text-[11px] mt-0.5">{f.sub}</p>
              </div>
              {/* Checkmark */}
              <div className="ml-auto w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                   style={{ background: 'rgba(255,107,107,0.2)' }}>
                <svg width="10" height="10" fill="none" viewBox="0 0 24 24">
                  <path d="M5 13l4 4L19 7" stroke="#FF6B6B" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>
          ))}
        </div>

        {error && <p className="text-[#FF6B6B] text-[13px] text-center mb-3">{error}</p>}

        {/* CTA */}
        <button
          onClick={handleSubscribe}
          disabled={loading}
          className="w-full py-[17px] rounded-full font-extrabold text-[17px] active:scale-95 transition-all flex items-center justify-center gap-2 mb-3 disabled:opacity-60"
          style={{ background: 'linear-gradient(135deg, #FF6B6B 0%, #FF8E3C 100%)', boxShadow: '0 8px 32px rgba(255,107,107,0.35)' }}
        >
          {loading
      ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
      : 'Subscribe — $2.99 / week'
    }
        </button>

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
