'use client'

import { useEffect } from 'react'
import { supabaseClient } from '@/lib/supabaseClient'
import { firebaseConfig, getFirebaseMessaging, getToken } from '@/lib/firebase'

const VAPID_KEY = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY

export default function NotificationSetup() {
  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!('serviceWorker' in navigator) || !('Notification' in window)) return
    if (!VAPID_KEY) return // skip if Firebase not configured

    setupPushNotifications()
  }, [])

  return null
}

async function setupPushNotifications() {
  try {
    // Register our combined SW (handles both PWA caching + FCM background messages)
    const swReg = await navigator.serviceWorker.register('/sw.js', { scope: '/' })
    await navigator.serviceWorker.ready

    // Send Firebase config to the service worker so it can init Firebase messaging
    const sw = swReg.active ?? swReg.installing ?? swReg.waiting
    if (sw) {
      sw.postMessage({ type: 'FIREBASE_CONFIG', config: firebaseConfig })
    }

    // Only ask for permission if not already granted/denied
    if (Notification.permission === 'denied') return
    if (Notification.permission === 'default') {
      const permission = await Notification.requestPermission()
      if (permission !== 'granted') return
    }

    // Get FCM token using our registered SW
    const messaging = getFirebaseMessaging()
    if (!messaging) return

    const token = await getToken(messaging, {
      vapidKey: VAPID_KEY,
      serviceWorkerRegistration: swReg,
    })
    if (!token) return

    // Store token in Supabase against the logged-in user
    const { data: { session } } = await supabaseClient.auth.getSession()
    if (!session) return

    await supabaseClient
      .from('users_table')
      .update({ fcm_token: token })
      .eq('user_id', session.user.id)
  } catch (err) {
    // Non-critical — silently ignore (e.g. blocked by browser, Safari partial support)
    console.warn('[NotificationSetup]', err)
  }
}
