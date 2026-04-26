'use client'

import { FormEvent, useState, useEffect, useRef } from 'react'
import { useParams } from 'next/navigation'

const SUGGESTIONS = [
  "Tell them something you've never had the courage to say 👀",
  "Send a genuine compliment — it might make their whole day 🌟",
  "Share an honest opinion they probably don't expect 🤫",
  "Ask them something you've always been curious about 🎯",
  "Tell them what you truly think of them 💬",
  "Be real — what's one thing they should know? 🔥",
]

export default function SendMessagePage() {
  const { slug } = useParams<{ slug: string }>()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [popupVisible, setPopupVisible] = useState(false)
  const [suggIndex, setSuggIndex] = useState(0)
  const [suggVisible, setSuggVisible] = useState(true)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [message, setMessage] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const t = setTimeout(() => setPopupVisible(true), 60)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    if (!agreedToTerms) return
    const interval = setInterval(() => {
      setSuggVisible(false)
      setTimeout(() => {
        setSuggIndex(i => (i + 1) % SUGGESTIONS.length)
        setSuggVisible(true)
      }, 400)
    }, 5000)
    return () => clearInterval(interval)
  }, [agreedToTerms])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) setImagePreview(URL.createObjectURL(file))
    else setImagePreview(null)
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)
    try {
      const formData = new FormData(e.currentTarget)
      formData.append('slug', slug)
      const response = await fetch('/api/messages', { method: 'POST', body: formData })
      const data = await response.json().catch(() => ({ error: 'Invalid server response' }))
      if (!response.ok) {
        setError(data.error || 'Something went wrong. Please try again.')
      } else {
        setSuccess(true)
        setMessage('')
        setImagePreview(null)
        if (fileRef.current) fileRef.current.value = ''
      }
    } catch {
      setError('Network error. Check your connection and try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const font = "-apple-system, 'SF Pro Display', BlinkMacSystemFont, sans-serif"

  // ── Terms popup ──────────────────────────────────────────────────────────────
  if (!agreedToTerms) {
    return (
      <main style={{
        minHeight: '100svh',
        background: 'linear-gradient(180deg, #0D0D0D 45%, #FF3CAC 100%)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '24px', fontFamily: font,
      }}>
        <div style={{
          width: '100%', maxWidth: '360px',
          background: 'rgba(30,30,30,0.85)',
          backdropFilter: 'blur(32px)',
          WebkitBackdropFilter: 'blur(32px)',
          borderRadius: '28px',
          border: '1px solid rgba(255,255,255,0.08)',
          overflow: 'hidden',
          boxShadow: '0 40px 80px rgba(0,0,0,0.6)',
          transform: popupVisible ? 'translateY(0) scale(1)' : 'translateY(40px) scale(0.95)',
          opacity: popupVisible ? 1 : 0,
          transition: 'transform 0.5s cubic-bezier(0.34,1.56,0.64,1), opacity 0.3s ease',
        }}>
          <div style={{ padding: '32px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
            <p style={{ fontSize: '22px', fontWeight: '800', color: '#FFFFFF', margin: 0, letterSpacing: '-0.5px' }}>
              Before you send
            </p>
            <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.45)', margin: 0, textAlign: 'center', lineHeight: 1.5 }}>
              This platform has zero tolerance for:
            </p>

            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {[
                { emoji: '🚫', text: 'Harassment & bullying' },
                { emoji: '⚠️', text: 'Harmful or violent content' },
                { emoji: '🔞', text: 'Inappropriate sexual content' },
                { emoji: '👶', text: 'Any content involving minors' },
              ].map(item => (
                <div key={item.text} style={{
                  display: 'flex', alignItems: 'center', gap: '12px',
                  padding: '12px 14px', borderRadius: '14px',
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.07)',
                }}>
                  <span style={{ fontSize: '18px' }}>{item.emoji}</span>
                  <p style={{ fontSize: '14px', fontWeight: '600', color: 'rgba(255,255,255,0.85)', margin: 0 }}>{item.text}</p>
                </div>
              ))}
            </div>

            <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.25)', textAlign: 'center', lineHeight: 1.5, margin: 0 }}>
              Violations may be reported to authorities.
            </p>

            <button
              onClick={() => setAgreedToTerms(true)}
              style={{
                width: '100%', padding: '17px',
                borderRadius: '99px', border: 'none',
                background: '#FF3CAC',
                color: 'white', fontSize: '16px', fontWeight: '800',
                cursor: 'pointer', letterSpacing: '-0.2px',
                boxShadow: '0 8px 32px rgba(255,60,172,0.45)',
                transition: 'transform 0.12s ease',
                fontFamily: font,
              }}
              onMouseDown={e => (e.currentTarget.style.transform = 'scale(0.96)')}
              onMouseUp={e => (e.currentTarget.style.transform = 'scale(1)')}
              onTouchStart={e => (e.currentTarget.style.transform = 'scale(0.96)')}
              onTouchEnd={e => (e.currentTarget.style.transform = 'scale(1)')}
            >
              I agree, continue →
            </button>

            <button
              onClick={() => window.history.back()}
              style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.25)', fontSize: '13px', cursor: 'pointer', fontFamily: font }}
            >
              Leave
            </button>
          </div>
        </div>
      </main>
    )
  }

  // ── Success screen ───────────────────────────────────────────────────────────
  if (success) {
    return (
      <main style={{
        minHeight: '100svh',
        background: 'linear-gradient(180deg, #0D0D0D 45%, #FF3CAC 100%)',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '32px 24px', fontFamily: font, gap: '32px',
      }}>
        {/* Logo area */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
          <img src="/assets/TBH_Title_Logo.svg" alt="TBH" style={{ height: '48px', filter: 'invert(1)' }} />
        </div>

        <div style={{
          width: '100%', maxWidth: '360px',
          background: 'rgba(30,30,30,0.85)',
          backdropFilter: 'blur(32px)',
          WebkitBackdropFilter: 'blur(32px)',
          borderRadius: '28px',
          border: '1px solid rgba(255,255,255,0.08)',
          padding: '32px 24px',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px',
          boxShadow: '0 40px 80px rgba(0,0,0,0.5)',
          animation: 'fadeUp 0.4s ease',
        }}>
          <span style={{ fontSize: '48px', lineHeight: 1 }}>🎉</span>
          <p style={{ fontSize: '22px', fontWeight: '800', color: '#fff', margin: '8px 0 4px', letterSpacing: '-0.5px' }}>
            Sent!
          </p>
          <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.45)', textAlign: 'center', lineHeight: 1.5, margin: 0 }}>
            Your anonymous message is on its way to <span style={{ color: '#FF3CAC', fontWeight: '700' }}>@{slug}</span>
          </p>
        </div>

        <div style={{ width: '100%', maxWidth: '360px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <button
            onClick={() => { setSuccess(false); setMessage('') }}
            style={{
              width: '100%', padding: '18px',
              borderRadius: '99px', border: 'none',
              background: '#0D0D0D',
              color: 'white', fontSize: '16px', fontWeight: '800',
              cursor: 'pointer', fontFamily: font,
              transition: 'transform 0.12s ease',
            }}
            onMouseDown={e => (e.currentTarget.style.transform = 'scale(0.96)')}
            onMouseUp={e => (e.currentTarget.style.transform = 'scale(1)')}
            onTouchStart={e => (e.currentTarget.style.transform = 'scale(0.96)')}
            onTouchEnd={e => (e.currentTarget.style.transform = 'scale(1)')}
          >
            Send another message
          </button>

          <button
            onClick={() => window.location.href = '/'}
            style={{
              width: '100%', padding: '18px',
              borderRadius: '99px',
              background: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.12)',
              color: 'white', fontSize: '16px', fontWeight: '800',
              cursor: 'pointer', fontFamily: font,
              transition: 'transform 0.12s ease',
            }}
            onMouseDown={e => (e.currentTarget.style.transform = 'scale(0.96)')}
            onMouseUp={e => (e.currentTarget.style.transform = 'scale(1)')}
            onTouchStart={e => (e.currentTarget.style.transform = 'scale(0.96)')}
            onTouchEnd={e => (e.currentTarget.style.transform = 'scale(1)')}
          >
            ✨ Get my own messages
          </button>
        </div>

        <style>{`@keyframes fadeUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }`}</style>
      </main>
    )
  }

  // ── Main send screen ─────────────────────────────────────────────────────────
  return (
    <main style={{
      minHeight: '100svh',
      background: 'linear-gradient(180deg, #0D0D0D 45%, #FF3CAC 100%)',
      fontFamily: font,
      display: 'flex', flexDirection: 'column',
      alignItems: 'center',
      padding: '0 20px 48px',
    }}>

      {/* Logo */}
      <div style={{ paddingTop: '56px', paddingBottom: '32px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
        <img src="/assets/TBH_Title_Logo.svg" alt="TBH" style={{ height: '44px', filter: 'invert(1)' }} />
        <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', margin: 0, letterSpacing: '0.2px' }}>anything anonymously</p>
      </div>

      {/* Card */}
      <form
        onSubmit={handleSubmit}
        encType="multipart/form-data"
        style={{
          width: '100%', maxWidth: '400px',
          background: 'rgba(28,28,28,0.88)',
          backdropFilter: 'blur(40px)',
          WebkitBackdropFilter: 'blur(40px)',
          borderRadius: '28px',
          border: '1px solid rgba(255,255,255,0.07)',
          padding: '20px',
          boxShadow: '0 32px 80px rgba(0,0,0,0.5)',
          display: 'flex', flexDirection: 'column', gap: '16px',
        }}
      >
        {/* Card header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '40px', height: '40px', borderRadius: '50%',
            background: '#FF3CAC', flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '18px',
          }}>🤫</div>
          <p style={{ fontSize: '15px', fontWeight: '700', color: 'rgba(255,255,255,0.9)', margin: 0 }}>
            Message anonymes pour <span style={{ color: '#FF3CAC' }}>@{slug}</span>
          </p>
        </div>

        {/* Suggestion hint */}
        <p style={{
          fontSize: '12px', color: 'rgba(255,255,255,0.3)',
          margin: 0, lineHeight: 1.5, minHeight: '18px',
          transition: 'opacity 0.4s ease',
          opacity: suggVisible ? 1 : 0,
        }}>
          {SUGGESTIONS[suggIndex]}
        </p>

        {/* Textarea */}
        <div style={{ position: 'relative' }}>
          <textarea
            name="message"
            required
            rows={5}
            maxLength={1000}
            value={message}
            onChange={e => setMessage(e.target.value)}
            placeholder="Écris ton message ici..."
            style={{
              width: '100%', borderRadius: '16px',
              padding: '14px 14px 32px',
              fontSize: '17px', fontWeight: '600',
              color: '#FFFFFF',
              background: 'transparent',
              border: 'none',
              outline: 'none', resize: 'none',
              lineHeight: '1.5', boxSizing: 'border-box',
              fontFamily: font,
            }}
          />
          <p style={{
            position: 'absolute', bottom: '8px', left: '14px',
            fontSize: '12px', margin: 0,
            color: message.length > 900 ? '#FF3CAC' : 'rgba(255,255,255,0.25)',
          }}>
            {message.length}/1000
          </p>
        </div>

        {/* Image */}
        <input ref={fileRef} id="image" name="image" type="file" accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} />

        {imagePreview ? (
          <div style={{ position: 'relative', width: '100%', height: '180px', borderRadius: '16px', overflow: 'hidden' }}>
            <img src={imagePreview} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            <button
              type="button"
              onClick={() => { setImagePreview(null); if (fileRef.current) fileRef.current.value = '' }}
              style={{
                position: 'absolute', top: '10px', right: '10px',
                width: '30px', height: '30px', borderRadius: '50%',
                background: 'rgba(0,0,0,0.6)', border: 'none',
                color: 'white', fontSize: '13px', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: font,
              }}
            >✕</button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            style={{
              padding: '12px', borderRadius: '14px',
              border: '1px dashed rgba(255,255,255,0.15)',
              background: 'transparent',
              color: 'rgba(255,255,255,0.35)', fontSize: '14px',
              cursor: 'pointer', fontFamily: font,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              transition: 'transform 0.1s ease',
            }}
            onMouseDown={e => (e.currentTarget.style.transform = 'scale(0.97)')}
            onMouseUp={e => (e.currentTarget.style.transform = 'scale(1)')}
            onTouchStart={e => (e.currentTarget.style.transform = 'scale(0.97)')}
            onTouchEnd={e => (e.currentTarget.style.transform = 'scale(1)')}
          >
            📷 Add a photo
          </button>
        )}

        {error && (
          <p style={{ fontSize: '13px', color: '#FF3CAC', margin: 0 }}>{error}</p>
        )}
      </form>

      {/* Send button — outside card like the app */}
      <div style={{ width: '100%', maxWidth: '400px', marginTop: '20px' }}>
        <button
          form="send-form"
          onClick={(e) => {
            const form = document.querySelector('form')
            if (form) form.requestSubmit()
          }}
          disabled={isSubmitting || !message.trim()}
          style={{
            width: '100%', padding: '20px',
            borderRadius: '99px', border: 'none',
            background: message.trim() ? '#0D0D0D' : 'rgba(0,0,0,0.4)',
            color: 'white', fontSize: '18px', fontWeight: '800',
            cursor: message.trim() ? 'pointer' : 'default',
            letterSpacing: '-0.3px', fontFamily: font,
            transition: 'transform 0.12s ease',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
          }}
          onMouseDown={e => { if (message.trim()) e.currentTarget.style.transform = 'scale(0.96)' }}
          onMouseUp={e => (e.currentTarget.style.transform = 'scale(1)')}
          onTouchStart={e => { if (message.trim()) e.currentTarget.style.transform = 'scale(0.96)' }}
          onTouchEnd={e => (e.currentTarget.style.transform = 'scale(1)')}
        >
          {isSubmitting ? (
            <div style={{
              width: '20px', height: '20px', borderRadius: '50%',
              border: '2.5px solid rgba(255,255,255,0.3)',
              borderTopColor: 'white',
              animation: 'spin 0.7s linear infinite',
            }} />
          ) : 'Envoyer! 🚀'}
        </button>
      </div>

      {/* Bottom CTA */}
      <div style={{ marginTop: '32px', textAlign: 'center' }}>
        <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.35)', margin: '0 0 10px' }}>
          Want your own anonymous messages?
        </p>
        <button
          onClick={() => window.location.href = '/'}
          style={{
            padding: '12px 28px', borderRadius: '99px',
            background: 'rgba(255,255,255,0.1)',
            border: '1px solid rgba(255,255,255,0.15)',
            color: 'white', fontSize: '14px', fontWeight: '700',
            cursor: 'pointer', fontFamily: font,
            transition: 'transform 0.12s ease',
          }}
          onMouseDown={e => (e.currentTarget.style.transform = 'scale(0.95)')}
          onMouseUp={e => (e.currentTarget.style.transform = 'scale(1)')}
          onTouchStart={e => (e.currentTarget.style.transform = 'scale(0.95)')}
          onTouchEnd={e => (e.currentTarget.style.transform = 'scale(1)')}
        >
          ✨ Get my own link
        </button>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        * { -webkit-tap-highlight-color: transparent; }
        textarea::placeholder { color: rgba(255,255,255,0.2); }
      `}</style>
    </main>
  )
}