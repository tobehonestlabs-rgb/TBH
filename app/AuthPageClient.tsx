'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { createBrowserClient } from '@supabase/ssr'

const CARD_ROWS = [
  [
    { text: 'Drop a hot take 🌶️', bg: '#FF3F1D', color: '#fff' },
    { text: 'Tell me a secret 🤐', bg: '#0D0D0D', color: '#fff' },
    { text: 'Ship me with someone 🛳️', bg: '#4D96FF', color: '#fff' },
    { text: 'Confess your crush 💖', bg: '#FF6B9D', color: '#fff' },
    { text: 'Show me your lockscreen 📱', bg: '#FFE66D', color: '#0D0D0D' },
    { text: 'Rate my fit 👕', bg: '#6BCB77', color: '#fff' },
    { text: 'Send me a wild pic 😏', bg: '#FF3F1D', color: '#fff' },
    { text: 'Make me laugh 😂', bg: '#9B5DE5', color: '#fff' },
  ],
  [
    { text: 'Worst photo in your roll? 📸', bg: '#FFE66D', color: '#0D0D0D' },
    { text: 'Truth or Dare? 🎲', bg: '#FF6B9D', color: '#fff' },
    { text: 'Give me a nickname 📛', bg: '#4D96FF', color: '#fff' },
    { text: 'Receive confessions 🔒', bg: '#0D0D0D', color: '#fff' },
    { text: 'Show me your room! 🛋️', bg: '#6BCB77', color: '#fff' },
    { text: 'Q&A anything 🎯', bg: '#FF3F1D', color: '#fff' },
    { text: 'Send me a meme 🐸', bg: '#9B5DE5', color: '#fff' },
    { text: 'Blow me up 💥', bg: '#FFE66D', color: '#0D0D0D' },
  ],
  [
    { text: 'Be honest with me 👀', bg: '#4D96FF', color: '#fff' },
    { text: 'What do you think of me? 🤔', bg: '#FF3F1D', color: '#fff' },
    { text: 'Send a voice note 🎙️', bg: '#6BCB77', color: '#fff' },
    { text: 'Roast me 🔥', bg: '#0D0D0D', color: '#fff' },
    { text: 'Guess my age 🎂', bg: '#FF6B9D', color: '#fff' },
    { text: 'Dare me anything 🎰', bg: '#9B5DE5', color: '#fff' },
    { text: 'Send a compliment ✨', bg: '#FFE66D', color: '#0D0D0D' },
    { text: 'Anonymous love letter 💌', bg: '#FF3F1D', color: '#fff' },
  ],
]

function InfiniteRow({ cards, reverse = false, speed = 28 }: {
  cards: { text: string; bg: string; color: string }[]
  reverse?: boolean
  speed?: number
}) {
  const doubled = [...cards, ...cards]
  return (
    <div className="overflow-hidden relative" style={{ maskImage: 'linear-gradient(90deg, transparent, black 12%, black 88%, transparent)', WebkitMaskImage: 'linear-gradient(90deg, transparent, black 12%, black 88%, transparent)' }}>
      <div
        style={{
          display: 'flex',
          gap: '10px',
          width: 'max-content',
          animation: `scroll${reverse ? 'Rev' : ''} ${speed}s linear infinite`,
        }}
      >
        {doubled.map((card, i) => (
          <div
            key={i}
            className="auth-card"
            style={{
              background: card.bg,
              color: card.color,
              borderRadius: '14px',
              padding: '10px 18px',
              fontSize: '13px',
              fontWeight: '700',
              whiteSpace: 'nowrap',
              flexShrink: 0,
              letterSpacing: '-0.01em',
              boxShadow: '0 2px 12px rgba(0,0,0,0.10)',
              transition: 'transform 0.18s ease, box-shadow 0.18s ease',
              cursor: 'default',
            }}
          >
            {card.text}
          </div>
        ))}
      </div>
    </div>
  )
}

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function AuthPageClient() {
  const [loading, setLoading] = useState(false)
  const [showEmailForm, setShowEmailForm] = useState(false)
  const [email, setEmail] = useState('')
  const [otpSent, setOtpSent] = useState(false)
  const [otp, setOtp] = useState('')
  const [emailError, setEmailError] = useState<string | null>(null)
  const [liveCount, setLiveCount] = useState(12473)

  useEffect(() => {
    const t = setInterval(() => setLiveCount(c => c + Math.floor(Math.random() * 4) + 1), 2800)
    return () => clearInterval(t)
  }, [])

  const font = "'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif"

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
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: { shouldCreateUser: true, emailRedirectTo: `https://tbhonest.net/auth/callback` },
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
      window.location.href = '/auth/callback'
    } catch (e: any) {
      setEmailError('Invalid code. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main
      className="min-h-screen bg-white flex flex-col items-center justify-center overflow-hidden"
      style={{ fontFamily: font }}
    >
      {/* Static ambient glow — no mouse tracking, no re-renders */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{ background: 'radial-gradient(ellipse 70% 50% at 50% 20%, rgba(255,107,157,0.12) 0%, rgba(77,150,255,0.08) 50%, transparent 70%)' }}
      />

      {/* ── Hero section ── */}
      <div className="flex flex-col items-center px-6 pt-16 pb-8 w-full max-w-sm relative z-10">

        {/* Live activity pill */}
        <div
          className="flex items-center gap-2 mb-5 px-3 py-1.5 rounded-full"
          style={{ animation: 'fadeSlideUp 0.5s ease forwards', opacity: 0, background: 'rgba(255,255,255,0.9)', boxShadow: '0 4px 18px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.05)' }}
        >
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full rounded-full bg-[#34C759] opacity-75 animate-ping" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#34C759]" />
          </span>
          <span style={{ fontSize: '12px', fontWeight: 700, color: '#0D0D0D', letterSpacing: '-0.01em' }}>
            {liveCount.toLocaleString()} messages sent today
          </span>
        </div>

        {/* Logo */}
        <div style={{ animation: 'fadeSlideUp 0.5s ease 0.08s forwards', opacity: 0 }}>
          <Image
            src="/assets/TBH_Title_Logo.svg"
            alt="TBH"
            width={110}
            height={46}
            priority
            className="select-none mb-5"
          />
        </div>

        {/* Headline */}
        <div style={{ animation: 'fadeSlideUp 0.5s ease 0.16s forwards', opacity: 0 }} className="text-center mb-8">
          <h1 style={{ fontSize: '32px', fontWeight: '900', color: '#0D0D0D', letterSpacing: '-0.035em', lineHeight: 1.05, margin: 0 }}>
            Join,<br />
            <span style={{ background: 'linear-gradient(135deg, #FF512F 0%, #F09819 50%, #FF6B9D 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              the fun.
            </span>
          </h1>
          <p style={{ fontSize: '14px', color: '#888', marginTop: '10px', fontWeight: '500' }}>
            Send & receive honest messages,<br />confessions, and more.
          </p>
        </div>

        {/* ── Auth ── */}
        <div
          className="w-full flex flex-col gap-2"
          style={{ animation: 'fadeSlideUp 0.5s ease 0.24s forwards', opacity: 0 }}
        >
          {!showEmailForm ? (
            <>
              <button
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-[#0D0D0D] text-white rounded-[14px] active:scale-95 transition-transform disabled:opacity-50"
                style={{ height: '48px' }}
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Image src="/assets/social_media_icons/google_icon.svg" alt="Google" width={17} height={17} />
                    <span style={{ fontWeight: '800', fontSize: '14px', letterSpacing: '-0.02em' }}>Continue with Google</span>
                  </>
                )}
              </button>

              <button
                onClick={() => setShowEmailForm(true)}
                className="w-full flex items-center justify-center gap-2 bg-[#F4F4F6] text-[#0D0D0D] rounded-[14px] active:scale-95 transition-transform"
                style={{ height: '48px' }}
              >
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" stroke="#0D0D0D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <polyline points="22,6 12,13 2,6" stroke="#0D0D0D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span style={{ fontWeight: '800', fontSize: '14px', letterSpacing: '-0.02em' }}>Continue with Email</span>
              </button>
            </>
          ) : !otpSent ? (
            <div className="w-full flex flex-col gap-2">
              <button
                onClick={() => { setShowEmailForm(false); setEmailError(null); setEmail('') }}
                className="flex items-center gap-1 text-[#888] text-[12px] mb-1 active:opacity-60"
              >
                <svg width="13" height="13" fill="none" viewBox="0 0 24 24">
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
              {emailError && <p className="text-[#FF3B30] text-[12px] text-center">{emailError}</p>}
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
              {emailError && <p className="text-[#FF3B30] text-[12px] text-center">{emailError}</p>}
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
      </div>

      {/* ── Sliding cards ── */}
      <div
        className="w-full flex flex-col gap-[10px] pb-10"
        style={{ animation: 'fadeSlideUp 0.5s ease 0.38s forwards', opacity: 0 }}
      >
        <InfiniteRow cards={CARD_ROWS[0]} speed={32} />
        <InfiniteRow cards={CARD_ROWS[1]} reverse speed={26} />
        <InfiniteRow cards={CARD_ROWS[2]} speed={38} />
      </div>

      <style jsx global>{`
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes scroll {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes scrollRev {
          0%   { transform: translateX(-50%); }
          100% { transform: translateX(0); }
        }
        .auth-card:hover {
          transform: translateY(-3px) scale(1.03);
          box-shadow: 0 8px 24px rgba(0,0,0,0.14) !important;
        }
      `}</style>
    </main>
  )
}
