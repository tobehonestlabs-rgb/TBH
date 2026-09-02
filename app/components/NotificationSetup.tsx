'use client'

import { useEffect, useState } from 'react'

const A2HS_PROMPT_CHOICE_KEY = 'tbh-a2hs-prompt-choice'

export default function NotificationSetup() {
  const [showPrompt, setShowPrompt] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)

  useEffect(() => {
    const checkAndPrompt = async () => {
      if (typeof window === 'undefined') return

      // Check if already installed
      if (window.matchMedia('(display-mode: standalone)').matches) {
        return
      }

      const choice = window.localStorage.getItem(A2HS_PROMPT_CHOICE_KEY)
      if (choice === 'dismissed') return

      // Listen for beforeinstallprompt event
      const handleBeforeInstallPrompt = (e: Event) => {
        e.preventDefault()
        setDeferredPrompt(e)
        const timeout = window.setTimeout(() => setShowPrompt(true), 900)
        return () => window.clearTimeout(timeout)
      }

      window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt as EventListener)

      // If event already fired, show prompt after a delay
      if (!deferredPrompt) {
        const timeout = window.setTimeout(() => setShowPrompt(true), 1500)
        return () => window.clearTimeout(timeout)
      }
    }

    checkAndPrompt()
  }, [])

  const handleAdd = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      if (outcome === 'accepted') {
        window.localStorage.setItem(A2HS_PROMPT_CHOICE_KEY, 'accepted')
      } else {
        window.localStorage.setItem(A2HS_PROMPT_CHOICE_KEY, 'dismissed')
      }
      setDeferredPrompt(null)
    }
    setShowPrompt(false)
  }

  const handleDismiss = () => {
    window.localStorage.setItem(A2HS_PROMPT_CHOICE_KEY, 'dismissed')
    setShowPrompt(false)
  }

  if (!showPrompt) return null

  return (
    <div
      className="fixed left-0 right-0 top-0 z-[60] flex justify-center px-4 pt-[max(14px,env(safe-area-inset-top))] pointer-events-none"
      aria-live="polite"
    >
      <div
        className="pointer-events-auto w-full max-w-[390px] overflow-hidden rounded-[22px] bg-white/95 shadow-[0_18px_60px_rgba(0,0,0,0.22)] ring-1 ring-black/5"
        style={{
          animation: 'notificationDrop 0.48s cubic-bezier(0.2, 0.9, 0.18, 1) both',
          backdropFilter: 'blur(22px)',
          WebkitBackdropFilter: 'blur(22px)',
        }}
      >
        <div className="flex items-start gap-3 px-4 pb-3 pt-4">
          <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] bg-[#0D0D0D]">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M12 2v14" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M5 9l7-7 7 7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M19 21H5" stroke="white" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-3">
              <p className="m-0 text-[13px] font-extrabold text-[#0D0D0D]">TBH</p>
              <p className="m-0 text-[11px] font-semibold text-[#9B9B9B]">now</p>
            </div>
            <p className="m-0 mt-0.5 text-[15px] font-bold leading-snug text-[#0D0D0D]">
              Add to Home Screen
            </p>
            <p className="m-0 mt-1 text-[13px] leading-snug text-[#666]">
              Add TBH to your home screen for easier access to messages.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 border-t border-black/[0.06]">
          <button
            type="button"
            onClick={handleDismiss}
            className="h-12 text-[14px] font-bold text-[#777] active:bg-black/[0.04]"
          >
            Not now
          </button>
          <button
            type="button"
            onClick={handleAdd}
            className="h-12 border-l border-black/[0.06] text-[14px] font-extrabold text-[#0D0D0D] active:bg-black/[0.04]"
          >
            Add
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes notificationDrop {
          from {
            opacity: 0;
            transform: translateY(-120%) scale(0.98);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </div>
  )
}
