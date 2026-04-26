'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabaseClient } from '@/lib/supabaseClient'

export default function AuthCallbackPage() {
  const router = useRouter()

  useEffect(() => {
    const handleAuth = async () => {
      // Give Supabase time to process the hash fragment
      await new Promise(r => setTimeout(r, 500))

      const { data: { session } } = await supabaseClient.auth.getSession()

      if (!session) {
        // Try refreshing the session from the URL hash manually
        const { data, error } = await supabaseClient.auth.refreshSession()
        if (error || !data.session) {
          router.replace('/')
          return
        }
      }

      const userId = session?.user.id ?? (await supabaseClient.auth.getSession()).data.session?.user.id

      if (!userId) { router.replace('/'); return }

      const { data: profile } = await supabaseClient
        .from('users_table')
        .select('user_id')
        .eq('user_id', userId)
        .single()

      router.replace(profile ? '/home' : '/onboarding')
    }

    handleAuth()
  }, [router])

  return (
    <main className="min-h-screen bg-white flex flex-col items-center justify-center gap-4">
      <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin" />
      <p className="text-sm text-gray-400"
        style={{ fontFamily: "'SF Pro Display', -apple-system, sans-serif" }}>
        Signing you in...
      </p>
    </main>
  )
}