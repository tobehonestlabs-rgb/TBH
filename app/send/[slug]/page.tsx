'use client'

import { FormEvent, useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabaseClient } from '@/lib/supabaseClient'

const SUGGESTIONS = [
  "Tell them something you've never had the courage to say 👀",
  "Send a genuine compliment — it might make their whole day 🌟",
  "Share an honest opinion they probably don't expect 🤫",
  "Ask them something you've always been curious about 🎯",
  "Tell them what you truly think of them 💬",
  "Be real — what's one thing they should know? 🔥",
]

const FLOATING_EMOJIS = [
  { src: '/assets/poop.svg',    size: 90,  x: 5,  y: 8,  rot: -15, dur: 7.2, delay: 0   },
  { src: '/assets/hot.svg',     size: 110, x: 75, y: 5,  rot: 12,  dur: 8.5, delay: 1.2 },
  { src: '/assets/nerd.svg',    size: 85,  x: 85, y: 35, rot: -8,  dur: 6.8, delay: 0.5 },
  { src: '/assets/Deamon.svg',  size: 120, x: 3,  y: 52, rot: 18,  dur: 9.1, delay: 2.1 },
  { src: '/assets/Excited.svg', size: 95,  x: 78, y: 65, rot: -20, dur: 7.6, delay: 0.8 },
  { src: '/assets/Skull.svg',   size: 80,  x: 12, y: 78, rot: 10,  dur: 8.0, delay: 1.7 },
  { src: '/assets/hot.svg',     size: 70,  x: 58, y: 88, rot: -12, dur: 6.5, delay: 3.0 },
  { src: '/assets/poop.svg',    size: 75,  x: 42, y: 2,  rot: 22,  dur: 7.9, delay: 2.5 },
]

const GLOBAL_STYLES = `
  .ios-arc {
    width: 24px; height: 24px; border-radius: 50%;
    border: 3px solid transparent;
    border-top: 3px solid #FFF; border-right: 3px solid #FFF;
    animation: ios-spin 0.8s cubic-bezier(0.4, 0, 0.2, 1) infinite;
  }
  @keyframes ios-spin {
    0%   { transform: rotate(0deg);   opacity: 0.3; }
    50%  { transform: rotate(180deg); opacity: 1;   }
    100% { transform: rotate(360deg); opacity: 0.3; }
  }
  @keyframes floaty {
    0%, 100% { transform: translateY(0px);   }
    50%       { transform: translateY(-18px); }
  }
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(30px); }
    to   { opacity: 1; transform: translateY(0);    }
  }
  @keyframes liftdance {
    0%   { transform: translateY(0px)   rotate(0deg);   }
    8%   { transform: translateY(-10px) rotate(-2deg);  }
    16%  { transform: translateY(-10px) rotate(2deg);   }
    24%  { transform: translateY(-10px) rotate(-2deg);  }
    32%  { transform: translateY(0px)   rotate(0deg);   }
    100% { transform: translateY(0px)   rotate(0deg);   }
  }
  @keyframes countpop {
    0%   { transform: scale(1);    opacity: 1; }
    30%  { transform: scale(1.18); opacity: 0; }
    31%  { transform: scale(0.85); opacity: 0; }
    60%  { transform: scale(1.08); opacity: 1; }
    100% { transform: scale(1);    opacity: 1; }
  }
  .liftdance { animation: liftdance 3s ease-in-out infinite; }
  .countpop  { animation: countpop 0.5s ease forwards; }
  textarea::placeholder { color: rgba(255,255,255,0.2); }
  * { -webkit-tap-highlight-color: transparent; }
`

type RecipientProfile = {
  username: string
  pfp: string | null
}

function FloatingEmojis() {
  return (
    <>
      {FLOATING_EMOJIS.map((e, i) => (
        <div key={i} style={{
          position: 'absolute', left: `${e.x}%`, top: `${e.y}%`,
          transform: `rotate(${e.rot}deg)`, pointerEvents: 'none', zIndex: 0,
        }}>
          <div style={{ animation: `floaty ${e.dur}s ease-in-out ${e.delay}s infinite` }}>
            <img src={e.src} alt="" style={{ width: `${e.size}px`, height: `${e.size}px`, display: 'block' }} />
          </div>
        </div>
      ))}
    </>
  )
}

export default function SendMessagePage() {
  const { slug } = useParams<{ slug: string }>()
  const router = useRouter()

  const [recipient, setRecipient] = useState<RecipientProfile | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [popupVisible, setPopupVisible] = useState(false)
  const [suggIndex, setSuggIndex] = useState(0)
  const [suggVisible, setSuggVisible] = useState(true)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [message, setMessage] = useState('')
  const [liveCount, setLiveCount] = useState(() => Math.floor(Math.random() * 3000) + 4000)
  const [countAnimKey, setCountAnimKey] = useState(0)
  const fileRef = useRef<HTMLInputElement>(null)

  const themeGradient = 'linear-gradient(180deg, #0D0D0D 45%, #ff431dcb 85%, #ff4a1d 100%)'
  const accentColor = '#ff3f1d'
  const font = "-apple-system, 'SF Pro Display', BlinkMacSystemFont, sans-serif"

  const btnPress   = (e: React.MouseEvent<HTMLButtonElement> | React.TouchEvent<HTMLButtonElement>) =>
    ((e.currentTarget as HTMLButtonElement).style.transform = 'scale(0.96)')
  const btnRelease = (e: React.MouseEvent<HTMLButtonElement> | React.TouchEvent<HTMLButtonElement>) =>
    ((e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)')

  useEffect(() => {
    if (!slug) return
    supabaseClient
      .from('users_table').select('username, pfp').eq('slug', slug).single()
      .then(({ data }) => { if (data) setRecipient(data) })
  }, [slug])

  useEffect(() => {
    const t = setTimeout(() => setPopupVisible(true), 60)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    if (!agreedToTerms) return
    const interval = setInterval(() => {
      setSuggVisible(false)
      setTimeout(() => { setSuggIndex(i => (i + 1) % SUGGESTIONS.length); setSuggVisible(true) }, 400)
    }, 5000)
    return () => clearInterval(interval)
  }, [agreedToTerms])

  // Live count ticker on success screen
  useEffect(() => {
    if (!success) return
    const interval = setInterval(() => {
      setLiveCount(Math.floor(Math.random() * 3000) + 4000)
      setCountAnimKey(k => k + 1)
    }, 3500)
    return () => clearInterval(interval)
  }, [success])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    setImagePreview(file ? URL.createObjectURL(file) : null)
  }

 const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
  e.preventDefault()
  if (!message.trim() || isSubmitting) return
  setIsSubmitting(true)
  setError(null)
  try {
    // Fetch IP non-blocking
    let ipAddress: string | null = null
    try {
      const ipRes = await fetch('https://api.ipify.org?format=json')
      const ipData = await ipRes.json()
      ipAddress = ipData.ip ?? null
    } catch {
      // silently skip if blocked
    }

    const formData = new FormData()
    formData.append('message', message)
    formData.append('slug', slug as string)
    if (fileRef.current?.files?.[0]) formData.append('image', fileRef.current.files[0])
    if (ipAddress) formData.append('ip_address', ipAddress)

    const response = await fetch('/api/messages', { method: 'POST', body: formData })
    if (!response.ok) throw new Error()
    setSuccess(true)
    setMessage('')
    setImagePreview(null)
  } catch {
    setError('Connection error. Please try again.')
  } finally {
    setIsSubmitting(false)
  }
}
  // ── Terms popup ──────────────────────────────────────────────────────────────
  if (!agreedToTerms) {
    return (
      <main style={{
        minHeight: '100svh', background: themeGradient,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '24px', fontFamily: font, position: 'relative', overflow: 'hidden',
      }}>
        <FloatingEmojis />
        <style>{GLOBAL_STYLES}</style>

        <div style={{
          position: 'relative', zIndex: 1, width: '100%', maxWidth: '360px',
          background: 'rgba(35,35,35,0.85)',
          backdropFilter: 'blur(40px)', WebkitBackdropFilter: 'blur(40px)',
          borderRadius: '32px', overflow: 'hidden',
          boxShadow: '0 40px 100px rgba(0,0,0,0.7)',
          transform: popupVisible ? 'translateY(0) scale(1)' : 'translateY(40px) scale(0.95)',
          opacity: popupVisible ? 1 : 0,
          transition: 'transform 0.6s cubic-bezier(0.23,1,0.32,1), opacity 0.4s ease',
        }}>
          <div style={{ padding: '32px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>

            {recipient && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <div style={{ width: '72px', height: '72px', borderRadius: '50%', overflow: 'hidden', border: `3px solid ${accentColor}`, background: '#333' }}>
                  {recipient.pfp
                    ? <img src={recipient.pfp} alt={recipient.username} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '28px', fontWeight: '800' }}>
                        {recipient.username[0]?.toUpperCase()}
                      </div>
                  }
                </div>
                <p style={{ fontSize: '15px', fontWeight: '700', color: 'rgba(255,255,255,0.8)', margin: 0 }}>@{recipient.username}</p>
              </div>
            )}

            <p style={{ fontSize: '22px', fontWeight: '800', color: '#FFFFFF', margin: 0 }}>Before you send</p>
            <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', margin: 0, textAlign: 'center' }}>
              These are strictly prohibited on TBH
            </p>

            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {[
                { emoji: '🚫', text: 'Harassment & bullying' },
                { emoji: '⚠️', text: 'Harmful content' },
                { emoji: '🚨', text: 'Inappropriate or sexual content involving children' },
                { emoji: '👺', text: 'No slurs, stay respectful' },
              ].map(item => (
                <div key={item.text} style={{
                  display: 'flex', alignItems: 'center', gap: '12px',
                  padding: '14px 16px', borderRadius: '18px', background: 'rgba(255,255,255,0.05)',
                }}>
                  <span style={{ fontSize: '18px' }}>{item.emoji}</span>
                  <p style={{ fontSize: '14px', fontWeight: '600', color: 'rgba(255,255,255,0.85)', margin: 0 }}>{item.text}</p>
                </div>
              ))}
            </div>

            <button
              onClick={() => setAgreedToTerms(true)}
              onMouseDown={btnPress} onMouseUp={btnRelease}
              onTouchStart={btnPress} onTouchEnd={btnRelease}
              style={{
                width: '100%', padding: '18px', borderRadius: '99px', border: 'none',
                background: accentColor, color: 'white', fontSize: '16px', fontWeight: '800',
                cursor: 'pointer', boxShadow: `0 8px 32px rgba(255,65,29,0.35)`,
                transition: 'transform 0.12s ease', fontFamily: font, marginTop: '8px',
              }}
            >
              I agree, continue →
            </button>

            <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.2)', textAlign: 'center', margin: 0 }}>
              Violations may result in permanent ban
            </p>
          </div>
        </div>
      </main>
    )
  }

  // ── Success screen ───────────────────────────────────────────────────────────
  if (success) {
    return (
      <main style={{
        minHeight: '100svh', background: themeGradient,
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', padding: '32px 24px', fontFamily: font, gap: '24px',
        position: 'relative', overflow: 'hidden',
      }}>
        <FloatingEmojis />
        <style>{GLOBAL_STYLES}</style>

        <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', width: '100%' }}>

          <img src="/assets/TBH_Title_Logo.svg" alt="TBH" style={{ height: '48px', filter: 'invert(1)' }} />

          {/* Sent card */}
          <div style={{
            width: '100%', maxWidth: '360px',
            background: 'rgba(35,35,35,0.85)',
            backdropFilter: 'blur(40px)', WebkitBackdropFilter: 'blur(40px)',
            borderRadius: '32px', padding: '36px 24px',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px',
            boxShadow: '0 40px 80px rgba(0,0,0,0.5)',
            animation: 'fadeUp 0.5s ease',
          }}>
            {recipient?.pfp && (
              <div style={{ width: '72px', height: '72px', borderRadius: '50%', overflow: 'hidden', border: `3px solid ${accentColor}`, marginBottom: '8px' }}>
                <img src={recipient.pfp} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            )}
           <img src="/assets/Party.svg" alt="" style={{ width: '56px', height: '56px' }} />
            <p style={{ fontSize: '24px', fontWeight: '800', color: '#fff', margin: '4px 0 0' }}>Sent!</p>
            <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.4)', textAlign: 'center', margin: 0 }}>
              Your anonymous message to{' '}
              <span style={{ color: accentColor, fontWeight: '700' }}>@{recipient?.username ?? slug}</span>{' '}
              was delivered.
            </p>

            {/* Live count */}
           <div style={{ marginTop: '16px', textAlign: 'center' }}>
  <p style={{ 
    fontSize: '14px', 
    color: 'rgba(255,255,255,0.6)', // Subtle white for the main text
    margin: 0,
    letterSpacing: '-0.01em'
  }}>
    <span
      key={countAnimKey}
      className="countpop"
      style={{ 
        fontWeight: '800', 
        color: '#FFFFFF', // Pure white and bold for the number
        display: 'inline-block' 
      }}
    >
      {liveCount.toLocaleString()}
    </span>
    {' '} people are receiving messages right now
  </p>

  <style>{`
    .countpop {
      animation: popIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }
    @keyframes popIn {
      0% { transform: scale(0.8); opacity: 0.5; }
      100% { transform: scale(1); opacity: 1; }
    }
  `}</style>
</div>
          </div>

          {/* Buttons */}
          <div style={{ width: '100%', maxWidth: '360px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <button
              onClick={() => setSuccess(false)}
              onMouseDown={btnPress} onMouseUp={btnRelease}
              onTouchStart={btnPress} onTouchEnd={btnRelease}
              style={{
                width: '100%', padding: '18px', borderRadius: '99px', border: 'none',
                background: '#0D0D0D', color: 'white', fontSize: '16px', fontWeight: '800',
                cursor: 'pointer', transition: 'transform 0.12s ease', fontFamily: font,
              }}
            >
              📩 Send another message
            </button>

            {/* Liftdance CTA */}
            <button
              onClick={() => router.push('/')}
              onMouseDown={btnPress} onMouseUp={btnRelease}
              onTouchStart={btnPress} onTouchEnd={btnRelease}
              className="liftdance"
              style={{
                width: '100%', padding: '18px', borderRadius: '99px', border: 'none',
                background: accentColor, color: 'white', fontSize: '16px', fontWeight: '800',
                cursor: 'pointer', boxShadow: `0 8px 32px rgba(255,65,29,0.45)`,
                transition: 'transform 0.12s ease', fontFamily: font,
              }}
            >
              ✨ Get my own anonymous messages
            </button>
          </div>
        </div>
      </main>
    )
  }

  // ── Main send screen ─────────────────────────────────────────────────────────
  return (
    <main style={{
      minHeight: '100svh', background: themeGradient,
      fontFamily: font, display: 'flex', flexDirection: 'column',
      alignItems: 'center', padding: '0 20px 48px',
      position: 'relative', overflow: 'hidden',
    }}>
      <FloatingEmojis />
      <style>{GLOBAL_STYLES}</style>

      <div style={{ position: 'relative', zIndex: 1, width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

        {/* Header */}
        <div style={{ paddingTop: '56px', paddingBottom: '32px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
          <img src="/assets/TBH_Simple_Logo.svg" alt="TBH" style={{ height: '44px', filter: 'invert(1)' }} />
          <p style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.55)', margin: 0 }}>send anything anonymously</p>
        </div>

        {/* Message card */}
        <form
          id="message-form"
          onSubmit={handleSubmit}
          style={{
            width: '100%', maxWidth: '400px',
            background: 'rgba(30,30,30,0.85)',
            backdropFilter: 'blur(50px)', WebkitBackdropFilter: 'blur(50px)',
            borderRadius: '32px', padding: '24px',
            boxShadow: '0 32px 100px rgba(0,0,0,0.5)',
            display: 'flex', flexDirection: 'column', gap: '20px',
          }}
        >
          {/* Recipient row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '44px', height: '44px', borderRadius: '50%',
              overflow: 'hidden', border: `2.5px solid ${accentColor}`,
              background: '#333', flexShrink: 0,
            }}>
              {recipient?.pfp
                ? <img src={recipient.pfp} alt={recipient.username} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '18px', fontWeight: '800' }}>
                    {(recipient?.username ?? slug as string)?.[0]?.toUpperCase() ?? '?'}
                  </div>
              }
            </div>
            <p style={{ fontSize: '16px', fontWeight: '700', color: '#fff', margin: 0 }}>
              Message for <span style={{ color: accentColor }}>@{recipient?.username ?? slug}</span>
            </p>
          </div>

          {/* Suggestion */}
          <p style={{
            fontSize: '13px', color: 'rgba(255,255,255,0.3)',
            minHeight: '38px', margin: 0,
            transition: 'opacity 0.4s ease', opacity: suggVisible ? 1 : 0,
          }}>
            {SUGGESTIONS[suggIndex]}
          </p>

          {/* Textarea */}
          <div style={{ position: 'relative' }}>
            <textarea
              required rows={5} maxLength={1000}
              value={message} onChange={e => setMessage(e.target.value)}
              placeholder="Write your message here..."
              style={{
                width: '100%', padding: '4px 4px 40px',
                fontSize: '18px', fontWeight: '600', color: '#FFF',
                background: 'transparent', border: 'none', outline: 'none',
                resize: 'none', lineHeight: '1.5', fontFamily: font, boxSizing: 'border-box',
              }}
            />
            <p style={{
              position: 'absolute', bottom: '0', left: '4px', fontSize: '12px', margin: 0,
              color: message.length > 900 ? accentColor : 'rgba(255,255,255,0.25)',
            }}>
              {message.length}/1000
            </p>
          </div>

          {/* Image picker */}
          <input ref={fileRef} type="file" accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} />
          {imagePreview ? (
            <div style={{ position: 'relative', width: '100%', height: '200px', borderRadius: '24px', overflow: 'hidden' }}>
              <img src={imagePreview} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <button
                type="button"
                onClick={() => { setImagePreview(null); if (fileRef.current) fileRef.current.value = '' }}
                style={{
                  position: 'absolute', top: '12px', right: '12px',
                  width: '32px', height: '32px', borderRadius: '50%',
                  background: 'rgba(0,0,0,0.6)', border: 'none', color: 'white',
                  cursor: 'pointer', fontSize: '14px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >✕</button>
            </div>
          ) : (
            <button
              type="button" onClick={() => fileRef.current?.click()}
              onMouseDown={btnPress} onMouseUp={btnRelease}
              onTouchStart={btnPress} onTouchEnd={btnRelease}
              style={{
                padding: '16px', borderRadius: '20px', border: 'none',
                background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.6)',
                fontSize: '14px', fontWeight: '600', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                fontFamily: font, transition: 'transform 0.12s ease',
              }}
            >
              📷 Add a photo
            </button>
          )}

          {error && <p style={{ color: '#ff6b6b', fontSize: '13px', margin: 0 }}>{error}</p>}
        </form>

        {/* Send button */}
        <div style={{ width: '100%', maxWidth: '400px', marginTop: '16px' }}>
          <button
            type="submit" form="message-form"
            disabled={isSubmitting || !message.trim()}
            onMouseDown={e => { if (message.trim()) btnPress(e) }}
            onMouseUp={btnRelease}
            onTouchStart={e => { if (message.trim()) btnPress(e) }}
            onTouchEnd={btnRelease}
            style={{
              width: '100%', padding: '20px', borderRadius: '99px', border: 'none',
              background: message.trim() ? '#0D0D0D' : 'rgba(255,255,255,0.1)',
              color: 'white', fontSize: '18px', fontWeight: '800',
              transition: 'transform 0.12s ease, background 0.2s ease',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: message.trim() ? 'pointer' : 'default', fontFamily: font,
            }}
          >
            {isSubmitting ? <div className="ios-arc" /> : 'Send anonymously'}
          </button>
        </div>

        {/* CTA */}
        <div style={{ marginTop: '32px', textAlign: 'center' }}>
          <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.35)', margin: '0 0 10px' }}>
            Want to receive anonymous messages too?
          </p>
          <button
            onClick={() => router.push('/')}
            onMouseDown={btnPress} onMouseUp={btnRelease}
            onTouchStart={btnPress} onTouchEnd={btnRelease}
            style={{
              padding: '12px 28px', borderRadius: '99px',
              background: 'rgba(255,255,255,0.1)', border: 'none',
              color: 'white', fontSize: '14px', fontWeight: '700',
              cursor: 'pointer', fontFamily: font, transition: 'transform 0.12s ease',
            }}
          >
            ✨ Get my own link
          </button>
        </div>

      </div>
    </main>
  )
}
/*
git add  .
 git commit -m "run "
git push -u origin main
*/ 