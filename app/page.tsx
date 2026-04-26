'use client'

import { useState } from 'react'
import Image from 'next/image'
import { supabaseClient } from '@/lib/supabaseClient'

export default function AuthPage() {
  const [loading, setLoading] = useState(false)

  const handleGoogleLogin = async () => {
    setLoading(true)
    const { error } = await supabaseClient.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `tbhonest.net/auth/callback`,
      },
    })
    if (error) {
      console.error('Google login error:', error.message)
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-white flex flex-col items-center justify-center px-6 gap-12">

      {/* Logo */}
      <div
        style={{ animation: 'fadeSlideUp 0.6s ease forwards', opacity: 0 }}
      >
        <Image
          src="/assets/TBH_Title_Logo.svg"
          alt="TBH"
          width={140}
          height={60}
          priority
          className="select-none"
        />
      </div>

      {/* Bottom group: button + terms */}
      <div
        className="w-full max-w-sm flex flex-col items-center gap-4"
        style={{ animation: 'fadeSlideUp 0.6s ease 0.2s forwards', opacity: 0 }}
      >
        {/* Google Button */}
        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 bg-black text-white rounded-2xl px-6 text-sm font-medium tracking-wide active:scale-95 transition-transform disabled:opacity-50"
          style={{
            fontFamily: "'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif",
            height: '54px',
          }}
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <Image
                src="/assets/social_media_icons/google_icon.svg"
                alt="Google"
                width={20}
                height={20}
              />
              <span>Continue with Google</span>
            </>
          )}
        </button>

        {/* Terms */}
        <p
          className="text-center text-gray-400 text-xs leading-relaxed px-4"
          style={{
            fontFamily: "'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif",
          }}
        >
          By continuing, you agree to our{' '}
          <a href="/terms" className="underline text-gray-500">Terms of Use</a>{' '}
          and{' '}
          <a href="/privacy" className="underline text-gray-500">Privacy Policy</a>.
        </p>
      </div>

      <style jsx global>{`
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0);    }
        }
      `}</style>
    </main>
  )
}