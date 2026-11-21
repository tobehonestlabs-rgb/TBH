'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabaseClient } from '@/lib/supabaseClient'

export default function AuthCallbackPage() {
  const router = useRouter()
  const [statusText, setStatusText] = useState('Signing you in...')

  useEffect(() => {
    const handleAuth = async () => {
      try {
        const code = new URLSearchParams(window.location.search).get('code')

        if (code) {
          await supabaseClient.auth.exchangeCodeForSession(code)
        }

        const { data: { session } } = await supabaseClient.auth.getSession()

        if (!session) {
          router.replace('/')
          return
        }

        // Check if user already has a profile in users_table
        const { data: existingProfile } = await supabaseClient
          .from('users_table')
          .select('user_id, username, is_profile_complete')
          .eq('user_id', session.user.id)
          .maybeSingle()

        // Check if user came from "Start conversation" ghost flow
        const isGhostAuth = typeof window !== 'undefined' && sessionStorage.getItem('tbh_is_ghost_auth') === 'true'
        const targetUserId = typeof window !== 'undefined' ? sessionStorage.getItem('tbh_ghost_chat_target_id') : null
        const targetSlug = typeof window !== 'undefined' ? sessionStorage.getItem('tbh_ghost_chat_target_slug') : null
        const draftMsg = typeof window !== 'undefined' ? sessionStorage.getItem('tbh_ghost_draft_msg') : null

        // If user has no record in users_table at all, create a Ghost User record
        if (!existingProfile) {
          setStatusText('Setting up your anonymous profile...')
          const now = new Date().toISOString()
          await supabaseClient.from('users_table').insert({
            user_id: session.user.id,
            email: session.user.email,
            is_profile_complete: false,
            username: null,
            slug: null,
            pfp: null,
            created_at: now,
            active_subscription: false,
          })
        }

        // Handle Ghost conversation initiation
        if (isGhostAuth && (targetUserId || targetSlug)) {
          setStatusText('Connecting to conversation...')
          // Clean up storage
          sessionStorage.removeItem('tbh_is_ghost_auth')
          sessionStorage.removeItem('tbh_ghost_chat_target_id')
          sessionStorage.removeItem('tbh_ghost_chat_target_slug')
          sessionStorage.removeItem('tbh_ghost_draft_msg')

          try {
            const convRes = await fetch('/api/conversations', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${session.access_token}`,
              },
              body: JSON.stringify({
                target_user_id: targetUserId || undefined,
                target_slug: targetSlug || undefined,
              }),
            })

            const convData = await convRes.json().catch(() => ({}))
            const convId = convData?.conversation?.id

            // If user had typed a draft message before auth, send it immediately
            if (convId && draftMsg?.trim()) {
              setStatusText('Sending message...')
              await fetch(`/api/conversations/${convId}/messages`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${session.access_token}`,
                },
                body: JSON.stringify({ content: draftMsg.trim() }),
              }).catch(() => {})
            }

            router.replace(convId ? `/chat?c=${convId}` : '/chat')
            return
          } catch (e) {
            console.error('[auth-callback] failed to initiate conversation:', e)
            router.replace('/chat')
            return
          }
        }

        // Standard redirect if not ghost chat initiation:
        if (existingProfile) {
          if (existingProfile.is_profile_complete === false || !existingProfile.username) {
            router.replace('/chat')
          } else {
            router.replace('/home')
          }
        } else {
          // If a new user signed in normally via Google without starting a chat
          router.replace('/onboarding')
        }
      } catch (err) {
        console.error('[auth-callback] unexpected error:', err)
        router.replace('/')
      }
    }

    handleAuth()
  }, [router])

  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center gap-4">
      <div className="w-9 h-9 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      <p className="text-sm text-white/50">{statusText}</p>
    </main>
  )
}
