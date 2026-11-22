'use client'

import { useEffect, useState } from 'react'
import { supabaseClient } from '@/lib/supabaseClient'

export default function AuthCallbackPage() {
  const [statusText, setStatusText] = useState('Signing you in...')

  useEffect(() => {
    const handleAuth = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search)
        const code = urlParams.get('code')
        const authError = urlParams.get('error') || urlParams.get('error_description')

        if (authError) {
          console.error('[auth-callback] Provider error:', authError)
        }

        // Check ghost flags in URL params, localStorage, or sessionStorage
        const isGhostUrl = urlParams.get('ghost') === '1'
        const slugFromUrl = urlParams.get('slug') || urlParams.get('target_slug')
        const targetFromUrl = urlParams.get('target') || urlParams.get('target_id')

        let isGhost = isGhostUrl
        let targetSlug = slugFromUrl
        let targetId = targetFromUrl
        let draftMsg: string | null = null

        if (typeof window !== 'undefined') {
          if (!isGhost) {
            isGhost = localStorage.getItem('tbh_is_ghost_auth') === 'true' ||
                      sessionStorage.getItem('tbh_is_ghost_auth') === 'true'
          }
          if (!targetSlug) {
            targetSlug = localStorage.getItem('tbh_ghost_chat_target_slug') ||
                         sessionStorage.getItem('tbh_ghost_chat_target_slug')
          }
          if (!targetId) {
            targetId = localStorage.getItem('tbh_ghost_chat_target_id') ||
                       sessionStorage.getItem('tbh_ghost_chat_target_id')
          }
          draftMsg = localStorage.getItem('tbh_ghost_draft_msg') ||
                     sessionStorage.getItem('tbh_ghost_draft_msg')

          // Clean up storage
          localStorage.removeItem('tbh_is_ghost_auth')
          localStorage.removeItem('tbh_ghost_chat_target_slug')
          localStorage.removeItem('tbh_ghost_chat_target_id')
          localStorage.removeItem('tbh_ghost_draft_msg')
          sessionStorage.removeItem('tbh_is_ghost_auth')
          sessionStorage.removeItem('tbh_ghost_chat_target_slug')
          sessionStorage.removeItem('tbh_ghost_chat_target_id')
          sessionStorage.removeItem('tbh_ghost_draft_msg')
        }

        // 1. Session exchange
        let session = null

        if (code) {
          setStatusText('Verifying credentials...')
          const { data, error } = await supabaseClient.auth.exchangeCodeForSession(code)
          if (error) {
            console.warn('[auth-callback] exchangeCodeForSession warning:', error.message)
          }
          if (data?.session) {
            session = data.session
          }
        }

        // 2. Fallback to getSession()
        if (!session) {
          const { data } = await supabaseClient.auth.getSession()
          session = data?.session
        }

        // 3. Fallback: wait for onAuthStateChange
        if (!session) {
          session = await new Promise<any>((resolve) => {
            const { data: { subscription } } = supabaseClient.auth.onAuthStateChange((_, s) => {
              if (s) {
                subscription.unsubscribe()
                resolve(s)
              }
            })
            setTimeout(() => {
              subscription.unsubscribe()
              resolve(null)
            }, 3000)
          })
        }

        // If after all attempts there is still no session
        if (!session) {
          console.error('[auth-callback] No active session found')
          if (targetSlug) {
            window.location.href = `/send/${encodeURIComponent(targetSlug)}?error=auth_failed`
          } else {
            window.location.href = '/'
          }
          return
        }

        // 4. Ghost User Flow
        if (isGhost && (targetSlug || targetId)) {
          setStatusText('Setting up your conversation...')

          try {
            const ghostRes = await fetch('/api/user/ghost', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${session.access_token}`,
              },
              body: JSON.stringify({
                target_slug: targetSlug || undefined,
                target_user_id: targetId || undefined,
                draft_message: draftMsg || undefined,
              }),
            })

            const ghostData = await ghostRes.json().catch(() => ({}))
            const convId = ghostData?.conversation_id

            window.location.href = convId ? `/chat?c=${encodeURIComponent(convId)}` : '/chat'
            return
          } catch (e) {
            console.error('[auth-callback] ghost setup error:', e)
            window.location.href = '/chat'
            return
          }
        }

        // 5. Normal User Flow
        setStatusText('Loading profile...')
        const { data: profile } = await supabaseClient
          .from('users_table')
          .select('user_id, username, is_profile_complete')
          .eq('user_id', session.user.id)
          .maybeSingle()

        if (profile) {
          if (profile.is_profile_complete === false || !profile.username) {
            window.location.href = '/chat'
          } else {
            window.location.href = '/home'
          }
        } else {
          // In case a ghost user signs in normally without a target
          if (isGhost) {
            window.location.href = '/chat'
          } else {
            window.location.href = '/onboarding'
          }
        }
      } catch (err) {
        console.error('[auth-callback] unexpected error:', err)
        window.location.href = '/'
      }
    }

    handleAuth()
  }, [])

  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center gap-4">
      <div className="w-9 h-9 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      <p className="text-sm text-white/50">{statusText}</p>
    </main>
  )
}
