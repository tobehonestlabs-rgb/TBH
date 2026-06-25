'use client'

import { useEffect, useState } from 'react'
import { supabaseClient } from '@/lib/supabaseClient'
import { firebaseConfig, getFirebaseMessaging, getToken } from '@/lib/firebase'

const VAPID_KEY = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY
const NOTIFICATION_PROMPT_CHOICE_KEY = 'tbh-notification-prompt-choice'

export default function NotificationSetup() {
  const [showPrompt, setShowPrompt] = useState(false)
  const [activating, setActivating] = useState(false)

  useEffect(() => {
    const checkAndPrompt = async () => {
      if (typeof window === 'undefined') return
      if (!('serviceWorker' in navigator) || !('Notification' in window)) return
      if (!VAPID_KEY) return

      // Check if user already has notifications enabled in DB
      const { data: { session } } = await supabaseClient.auth.getSession()
      if (session) {
        const { data: userData } = await supabaseClient
          .from('users_table')
          .select('web_notification_on')
          .eq('user_id', session.user.id)
          .maybeSingle()
        if (userData?.web_notification_on) {
          return
        }
      }

      if (Notification.permission !== 'default') {
        if (Notification.permission === 'granted') {
          setupPushNotifications(false)
        }
        return
      }

      const choice = window.localStorage.getItem(NOTIFICATION_PROMPT_CHOICE_KEY)
      if (choice === 'dismissed' || choice === 'activated') return

      const timeout = window.setTimeout(() => setShowPrompt(true), 900)
      return () => window.clearTimeout(timeout)
    }

    checkAndPrompt()
  }, [])

  const handleActivate = async () => {
    setActivating(true)
    try {
      const ok = await setupPushNotifications(true)
      if (ok) {
        window.localStorage.setItem(NOTIFICATION_PROMPT_CHOICE_KEY, 'activated')
        setShowPrompt(false)
      }
    } finally {
      setActivating(false)
    }
  }

  const handleDismiss = () => {
    window.localStorage.setItem(NOTIFICATION_PROMPT_CHOICE_KEY, 'dismissed')
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
              <path d="M18 8a6 6 0 1 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-3">
              <p className="m-0 text-[13px] font-extrabold text-[#0D0D0D]">TBH</p>
              <p className="m-0 text-[11px] font-semibold text-[#9B9B9B]">now</p>
            </div>
            <p className="m-0 mt-0.5 text-[15px] font-bold leading-snug text-[#0D0D0D]">
              Activate notifications
            </p>
            <p className="m-0 mt-1 text-[13px] leading-snug text-[#666]">
              Activate notifications to receive notifications when someone sends you a message.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 border-t border-black/[0.06]">
          <button
            type="button"
            onClick={handleDismiss}
            disabled={activating}
            className="h-12 text-[14px] font-bold text-[#777] active:bg-black/[0.04] disabled:opacity-50"
          >
            Not now
          </button>
          <button
            type="button"
            onClick={handleActivate}
            disabled={activating}
            className="h-12 border-l border-black/[0.06] text-[14px] font-extrabold text-[#0D0D0D] active:bg-black/[0.04] disabled:opacity-50"
          >
            {activating ? 'Activating...' : 'Yes'}
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

async function setupPushNotifications(askPermission: boolean) {
  try {
    const swReg = await navigator.serviceWorker.register('/sw.js', { scope: '/' })
    await navigator.serviceWorker.ready

    const sw = swReg.active ?? swReg.installing ?? swReg.waiting
    if (sw) {
      sw.postMessage({ type: 'FIREBASE_CONFIG', config: firebaseConfig })
    }

    if (Notification.permission === 'denied') return false
    if (Notification.permission === 'default') {
      if (!askPermission) return false
      const permission = await Notification.requestPermission()
      if (permission !== 'granted') return false
    }

    const messaging = getFirebaseMessaging()
    if (!messaging) return false

    const token = await getToken(messaging, {
      vapidKey: VAPID_KEY,
      serviceWorkerRegistration: swReg,
    })
    if (!token) return false

    const { data: { session } } = await supabaseClient.auth.getSession()
    if (!session) return false

    await supabaseClient
      .from('users_table')
      .update({ fcm_token: token, web_notification_on: true })
      .eq('user_id', session.user.id)

    return true
  } catch (err) {
    console.warn('[NotificationSetup]', err)
    return false
  }
}
