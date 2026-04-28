'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabaseClient } from '@/lib/supabaseClient'

export default function AuthCallbackPage() {
  const router = useRouter()

  useEffect(() => {
    const handleAuth = async () => {
      const code = new URLSearchParams(window.location.search).get('code')

      if (code) {
        await supabaseClient.auth.exchangeCodeForSession(code)
      }

      const { data: { session } } = await supabaseClient.auth.getSession()

      if (!session) { router.replace('/'); return }

      const { data: profile } = await supabaseClient
        .from('users_table')
        .select('user_id')
        .eq('user_id', session.user.id)
        .single()

      router.replace(profile ? '/home' : '/onboarding')
    }

    handleAuth()
  }, [router])

  return (
    <main className="min-h-screen bg-white flex flex-col items-center justify-center gap-4">
      <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin" />
      <p className="text-sm text-gray-400">Signing you in...</p>
    </main>
  )
}