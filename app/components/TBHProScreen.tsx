'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { useRouter } from 'next/navigation'
import { supabaseClient } from '@/lib/supabaseClient'
import { apiFetch } from '@/lib/api'

const PREMIUM_PRICE_XOF = 525

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
  const router = useRouter()

  useEffect(() => {
    setPortalTarget(document.getElementById('app-shell'))
  }, [])

  const handleUnlock = async () => {
    setLoading(true)
    setError(null)

    try {
      const { data: { session } } = await supabaseClient.auth.getSession()
      if (!session?.user?.email || !session?.user?.id) {
        setError('Veuillez vous connecter d’abord')
        setLoading(false)
        return
      }

      // Initialize Paystack payment directly
      const res = await apiFetch('/api/paystack', {
        method: 'POST',
        body: JSON.stringify({ email: session.user.email, userId: session.user.id }),
      })
      const data = await res.json()
      if (!res.ok || data?.status !== 'success') {
        throw new Error(data?.error || 'Impossible de démarrer le paiement')
      }
      // Redirect to Paystack authorization URL
      window.location.href = data.data.authorization_url
      onClose()
    } catch (err: any) {
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
        <div className="text-white/60 text-[13px] text-center mb-4">
          <p><strong>Promo:</strong> Première 400 commandes — {525.toLocaleString()} FCFA au lieu de {625.toLocaleString()} FCFA.</p>
          <p>Paiement via Wave (mobile money) disponible.</p>
        </div>
        <button
          onClick={handleUnlock}
          disabled={loading}
          className="w-full py-[17px] rounded-full font-extrabold text-[17px] active:scale-95 transition-all flex items-center justify-center gap-2 mb-2 disabled:opacity-60"
          style={{ background: 'linear-gradient(135deg, #FF6B6B 0%, #FF8E3C 100%)', boxShadow: '0 8px 32px rgba(255,107,107,0.35)' }}
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            `Unlock TBH Pro — ${PREMIUM_PRICE_XOF.toLocaleString()} FCFA `
          )}
        </button>
        <p className="text-white/25 text-[11px] text-center mb-3">
          Vous serez redirigé vers Paystack pour finaliser le paiement (Wave disponible)
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
