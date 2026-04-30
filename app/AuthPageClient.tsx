'use client'

import { useState } from 'react'
import Image from 'next/image'
import { createBrowserClient } from '@supabase/ssr'

export default function AuthPageClient() {
  const [loading, setLoading] = useState(false)
  const [showEmailForm, setShowEmailForm] = useState(false)
  const [email, setEmail] = useState('')
  const [otpSent, setOtpSent] = useState(false)
  const [otp, setOtp] = useState('')
  const [emailError, setEmailError] = useState<string | null>(null)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const handleGoogleLogin = async () => {
    setLoading(true)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `https://tbhonest.net/auth/callback` },
    })
    if (error) { console.error('Google login error:', error.message); setLoading(false) }
  }

  const handleEmailSubmit = async () => {
    if (!email.trim()) return
    setLoading(true)
    setEmailError(null)
    try {
      // Check if user exists by attempting OTP — Supabase sends OTP for both new and existing users
      // We use signInWithOtp which works for both sign in and sign up
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: {
          shouldCreateUser: true, // creates if doesn't exist, signs in if exists
          emailRedirectTo: `https://tbhonest.net/auth/callback`,
        },
      })
      if (error) throw error
      setOtpSent(true)
    } catch (e: any) {
      setEmailError(e.message ?? 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  const handleOtpVerify = async () => {
    if (!otp.trim()) return
    setLoading(true)
    setEmailError(null)
    try {
      const { error } = await supabase.auth.verifyOtp({
        email: email.trim(),
        token: otp.trim(),
        type: 'email',
      })
      if (error) throw error
      // Session is now set — middleware/auth callback will redirect
      window.location.href = '/auth/callback'
    } catch (e: any) {
      setEmailError('Invalid code. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const font = "'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif"

  return (
    <main
      className="min-h-screen bg-white flex flex-col items-center justify-center px-6 gap-10"
      style={{ fontFamily: font }}
    >
      {/* Logo */}
      <div style={{ animation: 'fadeSlideUp 0.6s ease forwards', opacity: 0 }}>
        <Image
          src="/assets/TBH_Title_Logo.svg"
          alt="TBH"
          width={120}
          height={50}
          priority
          className="select-none"
        />
      </div>

      {/* Auth group */}
      <div
        className="w-full max-w-[320px] flex flex-col items-center gap-3"
        style={{ animation: 'fadeSlideUp 0.6s ease 0.2s forwards', opacity: 0 }}
      >
        {!showEmailForm ? (
          // ── Button group ──────────────────────────────────────────────────
          <>
            {/* Google */}
            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-[#0D0D0D] text-white rounded-[14px] active:scale-95 transition-transform disabled:opacity-50"
              style={{ height: '46px' }}
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Image src="/assets/social_media_icons/google_icon.svg" alt="Google" width={17} height={17} />
                  <span style={{ fontWeight: '800', fontSize: '14px', letterSpacing: '-0.02em' }}>
                    Continue with Google
                  </span>
                </>
              )}
            </button>

            {/* Email */}
            <button
              onClick={() => setShowEmailForm(true)}
              className="w-full flex items-center justify-center gap-2 bg-[#F2F2F2] text-[#0D0D0D] rounded-[14px] active:scale-95 transition-transform"
              style={{ height: '46px' }}
            >
              <svg width="17" height="17" fill="none" viewBox="0 0 24 24">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" stroke="#0D0D0D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <polyline points="22,6 12,13 2,6" stroke="#0D0D0D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span style={{ fontWeight: '800', fontSize: '14px', letterSpacing: '-0.02em' }}>
                Continue with Email
              </span>
            </button>
          </>
        ) : !otpSent ? (
          // ── Email input ───────────────────────────────────────────────────
          <div className="w-full flex flex-col gap-2">
            <button
              onClick={() => { setShowEmailForm(false); setEmailError(null); setEmail('') }}
              className="flex items-center gap-1 text-[#888] text-[12px] mb-1 active:opacity-60"
            >
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24">
                <path d="M19 12H5M12 5l-7 7 7 7" stroke="#888" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Back
            </button>

            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleEmailSubmit()}
              placeholder="your@email.com"
              autoFocus
              className="w-full bg-[#F2F2F2] rounded-[14px] px-4 text-[15px] text-[#0D0D0D] outline-none"
              style={{ height: '46px', fontFamily: font }}
            />

            {emailError && (
              <p className="text-[#FF3B30] text-[12px] text-center">{emailError}</p>
            )}

            <button
              onClick={handleEmailSubmit}
              disabled={loading || !email.trim()}
              className="w-full flex items-center justify-center bg-[#0D0D0D] text-white rounded-[14px] active:scale-95 transition-transform disabled:opacity-40"
              style={{ height: '46px' }}
            >
              {loading
                ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                : <span style={{ fontWeight: '800', fontSize: '14px', letterSpacing: '-0.02em' }}>Send code</span>
              }
            </button>
          </div>
        ) : (
          // ── OTP input ─────────────────────────────────────────────────────
          <div className="w-full flex flex-col gap-2">
            <p className="text-center text-[13px] text-[#555]">
              Code sent to <span className="font-bold text-[#0D0D0D]">{email}</span>
            </p>

            <input
              type="text"
              inputMode="numeric"
              value={otp}
              onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              onKeyDown={e => e.key === 'Enter' && handleOtpVerify()}
              placeholder="000000"
              autoFocus
              className="w-full bg-[#F2F2F2] rounded-[14px] px-4 text-[22px] font-bold text-[#0D0D0D] outline-none text-center tracking-[0.25em]"
              style={{ height: '54px', fontFamily: font }}
            />

            {emailError && (
              <p className="text-[#FF3B30] text-[12px] text-center">{emailError}</p>
            )}

            <button
              onClick={handleOtpVerify}
              disabled={loading || otp.length < 6}
              className="w-full flex items-center justify-center bg-[#0D0D0D] text-white rounded-[14px] active:scale-95 transition-transform disabled:opacity-40"
              style={{ height: '46px' }}
            >
              {loading
                ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                : <span style={{ fontWeight: '800', fontSize: '14px', letterSpacing: '-0.02em' }}>Verify & continue</span>
              }
            </button>

            <button
              onClick={() => { setOtpSent(false); setOtp(''); setEmailError(null) }}
              className="text-[12px] text-[#AAA] text-center active:opacity-60"
            >
              Resend code
            </button>
          </div>
        )}

        {/* Terms */}
        <p className="text-center text-[#AAA] text-[11px] leading-relaxed px-2 mt-1">
          By continuing, you agree to our{' '}
          <a href="/legal" className="underline text-[#888]">Terms</a>{' '}
          and{' '}
          <a href="/legal" className="underline text-[#888]">Privacy Policy</a>.
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