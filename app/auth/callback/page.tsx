'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'

export default function AuthCallbackPage() {
  const router = useRouter()
  const hasHandledAuth = useRef(false) // Prevents strict mode double-running

  useEffect(() => {
    if (hasHandledAuth.current) return
    hasHandledAuth.current = true

    const handleAuth = async () => {
      // Use the SSR-compatible browser client
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )

      const code = new URLSearchParams(window.location.search).get('code')

      try {
        if (code) {
          // 1. Exchange the code
          const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
          if (exchangeError) throw exchangeError
        }

        // 2. Double check session is now active
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        
        if (sessionError || !session) {
          router.replace('/?error=session_failed')
          return
        }

        // 3. Check for profile (Use your specific table name)
        const { data: profile } = await supabase
          .from('users_table')
          .select('user_id')
          .eq('user_id', session.user.id)
          .single()

        // 4. Final Redirect
        router.replace(profile ? '/home' : '/onboarding')
        router.refresh() // Forces the middleware to re-run and catch the new cookies
        
      } catch (error) {
        console.error('Auth error:', error)
        router.replace('/?error=auth_callback_error')
      }
    }

    handleAuth()
  }, [router])

  return (
    <main className="min-h-screen bg-white flex flex-col items-center justify-center gap-4">
      <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin" />
      <p className="text-sm font-medium text-black">Finalizing sign in...</p>
    </main>
  )
}